import mongoose, { Schema, Document } from "mongoose";

import { Invoice as IInvoice, LineItem } from "../common/types/index";

const LineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>({
  fileId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  vendor: {
    name: { type: String, required: true, index: true },
    address: { type: String },
    taxId: { type: String },
  },
  invoice: {
    number: { type: String, required: true, index: true },
    date: { type: String, required: true },
    currency: { type: String, default: "USD" },
    subtotal: { type: Number },
    taxPercent: { type: Number },
    total: { type: Number },
    poNumber: { type: String },
    poDate: { type: String },
    lineItems: [LineItemSchema],
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String },
});

// Add text search index
InvoiceSchema.index({
  "vendor.name": "text",
  "invoice.number": "text",
});

// Update the updatedAt field before saving
InvoiceSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date().toISOString();
  }
  next();
});

export default mongoose.model<Document>("Invoice", InvoiceSchema);
