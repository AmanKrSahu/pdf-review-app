import Link from "next/link";
import { Search, Edit, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Invoice } from "@/types";

interface InvoiceTableProps {
  invoices: Invoice[];
  onDelete?: (fileId: string) => void;
}

export default function InvoiceTable({
  invoices,
  onDelete,
}: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <Card className="border-dashed border-2 shadow-none">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="rounded-full bg-primary/10 p-6">
            <Search size={48} className="text-neutral-400" />
          </div>
          <h3 className="text-2xl font-bold">No Invoices Found</h3>
          <p className="mt-2 text-center text-muted-foreground max-w-md">
            Try uploading a PDF invoice to get started with your financial
            management.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (
    amount: number | undefined,
    currency: string = "USD"
  ) => {
    if (amount === undefined) return "-";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Table className="border">
      <TableHeader className="bg-muted/80">
        <TableRow>
          <TableHead className="py-3 font-semibold">Invoice Number</TableHead>
          <TableHead className="py-3 font-semibold">Vendor Name</TableHead>
          <TableHead className="py-3 font-semibold">Date</TableHead>
          <TableHead className="py-3 font-semibold">Updated</TableHead>
          <TableHead className="py-3 font-semibold text-right">Total</TableHead>
          <TableHead className="py-3 font-semibold text-center">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          return (
            <TableRow
              key={invoice.fileId}
              className="group hover:bg-muted/30 transition-colors"
            >
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="font-medium">{invoice.invoice.number}</span>
                  <span className="text-xs text-muted-foreground">
                    {invoice.fileName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <span className="text-foreground">{invoice.vendor.name}</span>
              </TableCell>
              <TableCell className="py-4">
                <span className="text-sm">
                  {formatDate(invoice.invoice.date)}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <span className="text-sm text-muted-foreground">
                  {invoice.updatedAt
                    ? formatDate(invoice.updatedAt)
                    : formatDate(invoice.createdAt)}
                </span>
              </TableCell>
              <TableCell className="py-4 text-right font-medium">
                {formatCurrency(
                  invoice.invoice.total,
                  invoice.invoice.currency
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/invoice/${invoice.fileId}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete && onDelete(invoice.fileId)}
                    className="text-destructive hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
