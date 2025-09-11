"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/dialog";
import { useInvoices } from "@/hooks/use-invoices";
import { useFileUpload } from "@/hooks/use-fileUpload";
import InvoiceTable from "@/components/invoice/invoice-table";

export default function InvoicesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const {
    invoices,
    pagination,
    loading: invoicesLoading,
    deleteInvoice,
    refresh,
  } = useInvoices({
    search: searchQuery,
    limit: 20, // Show more invoices on dedicated page
  });

  const { uploadAndExtract, loading: uploadLoading } = useFileUpload();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadAndExtract(file);

      // Navigate to the invoice detail page using created invoice id
      router.push(`/invoice/${result.invoiceId}`);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-3xl font-bold tracking-tight">My Invoices</span>
          <p className="text-muted-foreground text-sm">
            Browse and manage all your invoice PDFs in one place
          </p>
        </div>
        <UploadDialog
          onUpload={handleUpload}
          disabled={uploadLoading}
          buttonStyle="default"
        />
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Input
          placeholder="Search by vendor name or invoice number..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
        <Button onClick={refresh} variant="outline" disabled={invoicesLoading}>
          <RefreshCw
            className={`h-4 w-4 ${invoicesLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <InvoiceTable
        invoices={invoices}
        onDelete={(invoiceId) => deleteInvoice(invoiceId)}
        loading={invoicesLoading}
      />

      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            total invoices)
          </span>
        </div>
      )}
    </div>
  );
}
