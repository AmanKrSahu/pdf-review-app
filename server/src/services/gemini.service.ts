import { GoogleGenerativeAI } from "@google/generative-ai";

import { Invoice } from "../common/types";
import { config } from "../common/config/app.config";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private readonly fallbackModels: string[] = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
  ];

  constructor() {
    const apiKey = config.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractInvoiceData(pdfText: string): Promise<Partial<Invoice>> {
    try {
      const prompt = `
        You are an AI assistant that extracts structured data from invoice text. 
        Please extract the following information from the provided invoice text and return it as JSON:

        {
          "vendor": {
            "name": "string",
            "address": "string (optional)",
            "taxId": "string (optional)"
          },
          "invoice": {
            "number": "string",
            "date": "string (YYYY-MM-DD format)",
            "currency": "string (optional, default USD)",
            "subtotal": "number (optional)",
            "taxPercent": "number (optional)",
            "total": "number (optional)",
            "poNumber": "string (optional)",
            "poDate": "string (optional, YYYY-MM-DD format)",
            "lineItems": [
              {
                "description": "string",
                "unitPrice": "number",
                "quantity": "number",
                "total": "number"
              }
            ]
          }
        }

        Important rules:
        1. Return ONLY valid JSON, no additional text or markdown
        2. Use null for missing optional fields
        3. Ensure all numbers are numeric, not strings
        4. If you can't find specific information, use reasonable defaults or null
        5. For dates, convert to YYYY-MM-DD format
        6. Extract all line items you can find

        Invoice text:
        ${pdfText}
      `;

      const text = await this.generateWithRetryAndFallback(prompt);

      // Clean up the response to ensure it's valid JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Gemini response");
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      // Validate and clean the extracted data
      return this.validateAndCleanExtractedData(extractedData);
    } catch (error) {
      console.error("Gemini extraction error:", error);
      throw new Error(
        `Failed to extract data with Gemini: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async generateWithRetryAndFallback(prompt: string): Promise<string> {
    const errors: string[] = [];

    for (const modelName of this.fallbackModels) {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      try {
        const text = await this.retry(async () => {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        }, {
          retries: 4,
          initialDelayMs: 500,
          maxDelayMs: 4000,
          backoffFactor: 2,
        });
        return text;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${modelName}: ${message}`);
        // Try next model in the list
      }
    }

    throw new Error(`All model attempts failed. Reasons: ${errors.join(" | ")}`);
  }

  private async retry<T>(fn: () => Promise<T>, opts: {
    retries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
  }): Promise<T> {
    let attempt = 0;
    let delayMs = opts.initialDelayMs;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt > opts.retries || !this.isRetryableError(error)) {
          throw error instanceof Error ? error : new Error(String(error));
        }
        const jitter = Math.floor(Math.random() * 150);
        await this.sleep(Math.min(delayMs, opts.maxDelayMs) + jitter);
        delayMs = Math.min(delayMs * opts.backoffFactor, opts.maxDelayMs);
      }
    }
  }

  private isRetryableError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    // Retry for transient server or rate limit issues
    return (
      message.includes("503") ||
      message.toLowerCase().includes("service unavailable") ||
      message.toLowerCase().includes("overloaded") ||
      message.includes("429") ||
      message.toLowerCase().includes("rate") ||
      message.toLowerCase().includes("timeout") ||
      message.toLowerCase().includes("network")
    );
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private validateAndCleanExtractedData(data: any): Partial<Invoice> {
    const cleaned: Partial<Invoice> = {};

    // Validate vendor
    if (data.vendor) {
      cleaned.vendor = {
        name: data.vendor.name || "Unknown Vendor",
        address: data.vendor.address || undefined,
        taxId: data.vendor.taxId || undefined,
      };
    }

    // Validate invoice
    if (data.invoice) {
      cleaned.invoice = {
        number: data.invoice.number || "INV-" + Date.now(),
        date: data.invoice.date || new Date().toISOString().split("T")[0],
        currency: data.invoice.currency || "USD",
        subtotal:
          typeof data.invoice.subtotal === "number"
            ? data.invoice.subtotal
            : undefined,
        taxPercent:
          typeof data.invoice.taxPercent === "number"
            ? data.invoice.taxPercent
            : undefined,
        total:
          typeof data.invoice.total === "number"
            ? data.invoice.total
            : undefined,
        poNumber: data.invoice.poNumber || undefined,
        poDate: data.invoice.poDate || undefined,
        lineItems: Array.isArray(data.invoice.lineItems)
          ? data.invoice.lineItems.map((item: any) => ({
              description: item.description || "Unknown Item",
              unitPrice:
                typeof item.unitPrice === "number" ? item.unitPrice : 0,
              quantity: typeof item.quantity === "number" ? item.quantity : 1,
              total: typeof item.total === "number" ? item.total : 0,
            }))
          : [],
      };
    }

    return cleaned;
  }
}
