"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UploadDialog } from "@/components/dialog";
import InvoiceTable from "@/components/invoice/invoice-table";
import { mockInvoices } from "@/data";

export default function Home() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpload = (file: File) => {
    const mockId = Date.now().toString();
    router.push(`/invoices/${mockId}`);
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
          <UploadDialog onUpload={handleUpload} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold">Recent Invoices</span>
        </div>
        <InvoiceTable invoices={mockInvoices} />
      </div>
    </div>
  );
}
