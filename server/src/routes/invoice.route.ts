import { Router } from "express";
import { isValidObjectId } from "mongoose";

import Invoice from "../models/invoice";
import { ApiResponse } from "../common/types";
import { PDFService } from "../services/pdf.service";
import { invoiceSchema, searchQuerySchema } from "../validation/schemas";
import {
  validateBody,
  validateQuery,
} from "../middlewares/validation.middleware";

const invoiceRoutes = Router();
const pdfService = new PDFService();

/**
 * GET /invoices
 * List invoices with optional search
 */
invoiceRoutes.get("/", validateQuery(searchQuerySchema), async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query as any;
    const skip = (page - 1) * limit;

    let query = {};

    // Add text search if query provided
    if (q) {
      query = {
        $or: [
          { "vendor.name": { $regex: q, $options: "i" } },
          { "invoice.number": { $regex: q, $options: "i" } },
        ],
      };
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
    });
  }
});

/**
 * GET /invoice/:id
 * Get single invoice by ID
 */
invoiceRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params as any;
    const invoice = isValidObjectId(id)
      ? await Invoice.findById(id).lean()
      : await Invoice.findOne({ $or: [{ fileId: id }, { fileName: id }] }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
    });
  }
});

/**
 * POST /invoices
 * Create new invoice
 */
invoiceRoutes.post("/", validateBody(invoiceSchema), async (req, res) => {
  try {
    const invoiceData = req.body;

    // Check if file exists
    const fileExists = await pdfService.checkFileExists(invoiceData.fileId);
    if (!fileExists) {
      return res.status(400).json({
        success: false,
        error: "Referenced file does not exist",
      });
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice,
      message: "Invoice created successfully",
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create invoice",
    });
  }
});

/**
 * PUT /invoice/:id
 * Update existing invoice
 */
invoiceRoutes.put(
  "/:id",
  validateBody(invoiceSchema.partial()),
  async (req, res) => {
    try {
      const { id } = req.params as any;
      const filter = isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ fileId: id }, { fileName: id }] };
      const invoice = await Invoice.findOneAndUpdate(
        filter,
        { ...req.body, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: "Invoice not found",
        });
      }

      res.json({
        success: true,
        data: invoice,
        message: "Invoice updated successfully",
      });
    } catch (error) {
      console.error("Update invoice error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update invoice",
      });
    }
  }
);

/**
 * DELETE /invoice/:id
 * Delete invoice and associated file
 */
invoiceRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params as any;
    const invoice = isValidObjectId(id)
      ? await Invoice.findByIdAndDelete(id).lean()
      : await Invoice.findOneAndDelete({ $or: [{ fileId: id }, { fileName: id }] }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    try {
      await pdfService.deleteFile((invoice as any).fileId);
    } catch (error) {
      console.warn("Could not delete associated file:", error);
    }

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete invoice",
    });
  }
});

export default invoiceRoutes;
