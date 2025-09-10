import { Router } from "express";

import { PDFService } from "../services/pdf.service";
import { GeminiService } from "../services/gemini.service";
import { extractRequestSchema } from "../validation/schemas";
import { ExtractRequest, ExtractResponse } from "../common/types";
import { validateBody } from "../middlewares/validation.middleware";

const extractRoutes = Router();
const geminiService = new GeminiService();
const pdfService = new PDFService();

/**
 * POST /extract
 * Extract data from PDF using AI
 */
extractRoutes.post(
  "/",
  validateBody(extractRequestSchema),
  async (req, res) => {
    try {
      const { fileId, model }: ExtractRequest = req.body;

      // Check if file exists
      const fileExists = await pdfService.checkFileExists(fileId);
      if (!fileExists) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      // Extract text from PDF
      const pdfText = await pdfService.extractTextFromPDF(fileId);

      let extractedData;

      if (model === "gemini") {
        extractedData = await geminiService.extractInvoiceData(pdfText);
      } else if (model === "groq") {
        // Placeholder for Groq implementation
        throw new Error("Groq model not implemented yet");
      } else {
        throw new Error("Invalid model specified");
      }

      const response: ExtractResponse = {
        success: true,
        data: extractedData,
      };

      res.json(response);
    } catch (error) {
      console.error("Extract route error:", error);
      const response: ExtractResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }
);

export default extractRoutes;
