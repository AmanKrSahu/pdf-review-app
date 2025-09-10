"use client";

import InvoiceTable from "@/components/invoice/invoice-table";
import { mockInvoices } from "@/data";

export default function Home() {
  return (
    <div className="h-full p-6 space-y-6">
      <div className="space-y-2">
        <span className="text-3xl font-bold tracking-tight">My Invoices</span>
        <p className="text-muted-foreground text-sm">
          Browse and manage all your invoice PDFs in one place
        </p>
      </div>
      <InvoiceTable invoices={mockInvoices} />
    </div>
  );
}
