"use client";

import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";

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
      toast.info("Preparing download...");
      
      const response = await fetch(api.getPDFUrl(invoice.fileId));
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = invoice.fileName || `invoice-${invoice._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download completed");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download invoice");
    }
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
