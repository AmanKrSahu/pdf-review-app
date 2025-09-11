"use client";

import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Download, Printer } from "lucide-react";

import { api } from "@/lib/api";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";

const PdfViewer = dynamic<{ src: string }>(() => import("../pdf/PdfViewer"), {
  ssr: false,
});

interface InvoiceViewerProps {
  invoice: Invoice;
}

export function InvoiceViewer({ invoice }: InvoiceViewerProps) {
  const handleDownload = async () => {
    try {
      console.log("Downloading invoice:", invoice.fileName);

      // If you have a download endpoint in your API
      // const blob = await api.downloadInvoice(invoice._id);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = invoice.fileName || 'invoice.pdf';
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);

      toast.info(
        "Download functionality will be implemented with file storage"
      );
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handlePrint = () => {
    console.log("Printing invoice:", invoice.fileName);
    window.print();
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{invoice.fileName}</h2>
          <p className="text-sm text-muted-foreground">
            Invoice ID: {invoice._id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="rounded-xl"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="bg-muted rounded-lg flex-1 flex items-center justify-center p-4">
        <div className="w-full h-full">
          <div className="bg-background border rounded-lg w-full h-full overflow-hidden">
            <PdfViewer src={api.getPDFUrl(invoice.fileId)} />
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            {invoice.updatedAt && (
              <p>Updated: {new Date(invoice.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
