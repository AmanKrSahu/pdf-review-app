"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { UploadDialog } from "@/components/dialog";
import InvoiceTable from "@/components/invoice/invoice-table";
import { useInvoices } from "@/hooks/use-invoices";
import { useFileUpload } from "@/hooks/use-fileUpload";

export default function Home() {
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
    limit: 10,
  });

  const { uploadAndExtract, loading: uploadLoading } = useFileUpload();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadAndExtract(file);

      // Navigate to the invoice detail page
      router.push(`/invoice/${result.fileId}`);
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
      <div className="space-y-2">
        <span className="text-3xl font-bold tracking-tight">Dashboard</span>
        <p className="text-muted-foreground text-sm">
          Manage your PDF invoices and extract data efficiently
        </p>
      </div>

      <Card className="border-2 border-dashed shadow-none py-12">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Upload, Extract, and Review PDFs
          </CardTitle>
          <CardDescription className="text-sm">
            Get started by uploading your first invoice PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center rounded-2xl">
          <UploadDialog onUpload={handleUpload} disabled={uploadLoading} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold">Recent Invoices</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 max-w-sm">
              <Input
                placeholder="Search invoices..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="h-9"
              />
              <Button onClick={handleSearch} size="sm" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={refresh}
              size="sm"
              variant="outline"
              disabled={invoicesLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${invoicesLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <InvoiceTable
          invoices={invoices}
          onDelete={(invoiceId) => deleteInvoice(invoiceId)}
          loading={invoicesLoading}
        />

        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">
              Showing {invoices.length} of {pagination.total} invoices
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
