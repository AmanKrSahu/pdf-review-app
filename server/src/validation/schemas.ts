import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
});

export const invoiceSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  fileName: z.string().min(1, "File name is required"),
  vendor: z.object({
    name: z.string().min(1, "Vendor name is required"),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
  invoice: z.object({
    number: z.string().min(1, "Invoice number is required"),
    date: z.string().min(1, "Invoice date is required"),
    currency: z.string().optional().default("USD"),
    subtotal: z.number().min(0).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    total: z.number().min(0).optional(),
    poNumber: z.string().optional(),
    poDate: z.string().optional(),
    lineItems: z.array(lineItemSchema).default([]),
  }),
});

export const extractRequestSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  model: z.enum(["gemini", "groq"], {
    error: "Model must be either gemini or groq",
  }),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
});
