"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Invoice } from "@/types";
import { useInvoice } from "@/hooks/use-invoice";
import { useInvoices } from "@/hooks/use-invoices";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { InvoiceViewer } from "@/components/invoice/invoice-viewer";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoiceDetail({ params }: PageProps) {
  // Unwrap the params promise using React.use()
  const { id } = use(params);
  const router = useRouter();

  // Use the custom hook to fetch and manage invoice data
  const { invoice, loading, error, updateInvoice } = useInvoice(id);
  const { deleteInvoice } = useInvoices();

  // Handle loading state
  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center px-4">
        <Card className="border-dashed border-2 shadow-none max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="rounded-full bg-destructive/10 p-6">
              <AlertTriangle size={48} className="text-destructive" />
            </div>
            <h3 className="text-2xl font-bold">Something went wrong</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              {error || "An unexpected error occurred. Please try again."}
            </p>
            <button
              onClick={() => router.back()}
              className="text-primary hover:underline"
            >
              Go back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where invoice is not found
  if (!invoice) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invoice Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested invoice could not be found.
          </p>
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (updatedInvoice: Invoice) => {
    try {
      await updateInvoice(updatedInvoice);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      // Error handling is done in the hook with toast notifications
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice(id);
      // After successful deletion, navigate back to invoices list
      router.push("/invoice");
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      // Error handling is done in the hook with toast notifications
    }
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
