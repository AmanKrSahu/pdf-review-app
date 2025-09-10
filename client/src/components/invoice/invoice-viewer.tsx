"use client";

import { Invoice } from "@/types";
import { FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceViewerProps {
  invoice: Invoice;
}

export function InvoiceViewer({ invoice }: InvoiceViewerProps) {
  const handleDownload = () => {
    console.log("Downloading invoice:", invoice.fileName);
  };

  const handlePrint = () => {
    console.log("Printing invoice:", invoice.fileName);
    window.print();
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{invoice.fileName}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* PDF viewer placeholder with invoice info */}
      <div className="bg-muted rounded-lg flex-1 flex items-center justify-center p-4">
        <div className="text-center p-8 w-full max-w-2xl">
          <div className="bg-background border rounded-lg p-8 mx-auto">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2 text-lg">{invoice.fileName}</h3>

            {/* Basic invoice information */}
            <div className="text-left mt-6 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Invoice Number:</p>
                  <p className="font-medium">{invoice.invoice.number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date:</p>
                  <p className="font-medium">{invoice.invoice.date}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-muted-foreground">Vendor:</p>
                <p className="font-medium">{invoice.vendor.name}</p>
                {invoice.vendor.address && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.vendor.address}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <p className="text-muted-foreground">Total Amount:</p>
                <p className="font-medium text-lg">
                  {invoice.invoice.currency}{" "}
                  {invoice.invoice.total?.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground text-xs mt-6">
              PDF content will be displayed here in the actual application
            </p>
          </div>
        </div>
      </div>

      {/* Footer with metadata */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Uploaded: {new Date(invoice.createdAt).toLocaleDateString()}</p>
        {invoice.updatedAt && (
          <p>
            Last updated: {new Date(invoice.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
