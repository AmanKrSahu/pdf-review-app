import { GoogleGenerativeAI } from "@google/generative-ai";

import { Invoice } from "../common/types";
import { config } from "../common/config/app.config";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = config.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractInvoiceData(pdfText: string): Promise<Partial<Invoice>> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
