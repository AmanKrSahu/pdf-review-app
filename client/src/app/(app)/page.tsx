"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/dialog";
import { useInvoices } from "@/hooks/use-invoices";
import { useFileUpload } from "@/hooks/use-fileUpload";
import InvoiceTable from "@/components/invoice/invoice-table";

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
        </div>
        <div className="flex items-center gap-2 mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vendor name or invoice number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="h-9 pl-9 rounded-xl w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={refresh}
              size="sm"
              variant="outline"
              disabled={invoicesLoading}
              className="h-9 w-9 rounded-xl"
            >
              <RefreshCw
                className={`h-4 w-4 text-muted-foreground ${invoicesLoading ? "animate-spin" : ""}`}
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
