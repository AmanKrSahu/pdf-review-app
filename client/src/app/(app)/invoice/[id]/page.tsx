"use client";

import { use } from "react";
import { InvoiceViewer } from "@/components/invoice/invoice-viewer";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { mockInvoices } from "@/data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoiceDetail({ params }: PageProps) {
  // Unwrap the params promise using React.use()
  const { id } = use(params);

  // Find the invoice by ID from the mock data
  const invoice = mockInvoices.find((inv) => inv.fileId === id);

  // Handle case where invoice is not found
  if (!invoice) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invoice Not Found</h1>
          <p className="text-muted-foreground">
            The requested invoice could not be found.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = (updatedInvoice: unknown) => {
    console.log("Saving invoice:", updatedInvoice);
  };

  const handleDelete = () => {
    console.log("Deleting invoice:", invoice.fileId);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-3 h-full">
        <div className="col-span-2 h-full">
          <InvoiceViewer invoice={invoice} />
        </div>
        <div className="col-span-1 border-l h-full overflow-auto">
          <InvoiceForm
            invoice={invoice}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}