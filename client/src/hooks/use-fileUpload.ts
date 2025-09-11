import { toast } from "sonner";
import { useState } from "react";

import { api } from "@/lib/api";
import { Invoice } from "@/types";

interface UploadProgress {
  stage: "uploading" | "extracting" | "complete" | "idle";
  message: string;
}

export function useFileUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAndExtract = async (
    file: File
  ): Promise<{
    invoiceId: string;
    fileId: string;
    fileName: string;
    extractedData?: Partial<Invoice>;
  }> => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Upload file
      setProgress({
        stage: "uploading",
        message: "Uploading PDF file...",
      });

      const uploadResult = await api.uploadFile(file);

      // Step 2: Extract data
      setProgress({
        stage: "extracting",
        message: "Extracting invoice data with AI...",
      });

      let extractedData: Partial<Invoice> | undefined;
      try {
        extractedData = await api.extractData(uploadResult.fileId, "gemini");
      } catch (extractError) {
        console.warn("Data extraction failed:", extractError);
        toast.warning(
          "File uploaded but data extraction failed. You can extract manually."
        );
      }

      setProgress({
        stage: "complete",
        message: "Upload and extraction complete!",
      });

      toast.success("File uploaded successfully!");

      // Step 3: Create invoice record in DB
      const baseNow = new Date().toISOString().split("T")[0];
      const invoiceToCreate: Omit<Invoice, "_id" | "createdAt" | "updatedAt"> =
        {
          fileId: uploadResult.fileId,
          fileName: uploadResult.fileName,
          vendor: {
            name: extractedData?.vendor?.name || "Unknown Vendor",
            address: extractedData?.vendor?.address,
            taxId: extractedData?.vendor?.taxId,
          },
          invoice: {
            number: extractedData?.invoice?.number || `INV-${Date.now()}`,
            date: extractedData?.invoice?.date || baseNow,
            currency: extractedData?.invoice?.currency || "USD",
            subtotal: extractedData?.invoice?.subtotal,
            taxPercent: extractedData?.invoice?.taxPercent,
            total: extractedData?.invoice?.total,
            poNumber: extractedData?.invoice?.poNumber,
            poDate: extractedData?.invoice?.poDate,
            lineItems: extractedData?.invoice?.lineItems || [],
          },
        };

      const created = await api.createInvoice(invoiceToCreate);

      return {
        invoiceId: created._id!,
        fileId: uploadResult.fileId,
        fileName: uploadResult.fileName,
        extractedData,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setProgress({ stage: "idle", message: "" });
      }, 2000);
    }
  };

  const reset = () => {
    setProgress({ stage: "idle", message: "" });
    setLoading(false);
    setError(null);
  };

  return {
    uploadAndExtract,
    progress,
    loading,
    error,
    reset,
  };
}
