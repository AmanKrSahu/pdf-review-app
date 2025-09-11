"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CalendarIcon,
  CloudUpload,
  BotMessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Invoice, LineItem as LineItemType } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { api } from "@/lib/api";

interface InvoiceFormProps {
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
  onDelete: () => void;
}

export function InvoiceForm({
  invoice: initialInvoice,
  onSave,
  onDelete,
}: InvoiceFormProps) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [lineItems, setLineItems] = useState<LineItemType[]>(
    initialInvoice.invoice.lineItems || []
  );
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    invoice: true,
    summary: true,
    lineItems: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const [poDate, setPoDate] = useState<Date | undefined>(
    initialInvoice.invoice.poDate
      ? new Date(initialInvoice.invoice.poDate)
      : undefined
  );

  // Update local state when initialInvoice changes
  useEffect(() => {
    setInvoice(initialInvoice);
    setLineItems(initialInvoice.invoice.lineItems || []);
    setPoDate(
      initialInvoice.invoice.poDate
        ? new Date(initialInvoice.invoice.poDate)
        : undefined
    );
  }, [initialInvoice]);

  // Calculate totals whenever line items change
  useEffect(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    setInvoice((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        lineItems,
        subtotal,
        total: subtotal, // You can add tax calculations here if needed
      },
    }));
  }, [lineItems]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const addLineItem = () => {
    const newItem: LineItemType = {
      description: "",
      unitPrice: 0,
      quantity: 1,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItemType,
    value: string | number
  ) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "unitPrice" || field === "quantity") {
      const unitPrice =
        field === "unitPrice" ? Number(value) : updatedItems[index].unitPrice;
      const quantity =
        field === "quantity" ? Number(value) : updatedItems[index].quantity;
      updatedItems[index].total = unitPrice * quantity;
    }

    setLineItems(updatedItems);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Call the parent onSave function which uses the API hook
      await onSave(invoice);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      // Error handling is done in the parent component/hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      )
    ) {
      try {
        // Call the parent onDelete function
        await onDelete();
      } catch (error) {
        console.error("Failed to delete invoice:", error);
        // Error handling is done in the parent component
      }
    }
  };

  const handleExtract = async () => {
  try {
    setIsExtracting(true);
    toast.info("Extracting data with AI...");

    // Check if we have a file ID
    if (!invoice.fileId) {
      toast.error("Missing fileId for this invoice");
      return;
    }

    // Call the AI extraction API using fileId
    const extractedData = await api.extractData(invoice.fileId);

    // Update the form with extracted data
    if (extractedData) {
      setInvoice({
        ...invoice,
        ...extractedData,
        vendor: { ...invoice.vendor, ...extractedData.vendor },
        invoice: { ...invoice.invoice, ...extractedData.invoice },
        fileId: extractedData.fileId ?? invoice.fileId, // fallback to existing fileId if undefined
        _id: extractedData._id ?? invoice._id, // fallback to existing _id if undefined
      });
      setLineItems(extractedData.invoice?.lineItems || []);
      setPoDate(
        extractedData.invoice && extractedData.invoice.poDate
          ? new Date(extractedData.invoice.poDate)
          : undefined
      );
      toast.success("Data extracted successfully!");
    }
  } catch (error) {
    console.error("Failed to extract data:", error);
    toast.error("Failed to extract data with AI");
  } finally {
    setIsExtracting(false);
  }
};

  return (
    <div className="space-y-2">
      <div className="p-4">
        <span className="text-xl font-bold">Invoice Review</span>
        <p className="text-muted-foreground text-xs">
          Review and edit extracted invoice data
        </p>
      </div>

      {/* Customer Information */}
      <div className="rounded-lg">
        <div
          className="flex items-center bg-green-50 border-b cursor-pointer"
          onClick={() => toggleSection("customer")}
        >
          <div className="w-1.5 h-8 bg-green-500 mr-3"></div>
          {expandedSections.customer ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <span className="font-bold text-md">Customer Information</span>
        </div>

        {expandedSections.customer && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Customer Name</Label>
              <Input
                value={invoice.vendor.name || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    vendor: { ...invoice.vendor, name: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Address</Label>
              <Input
                value={invoice.vendor.address || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    vendor: { ...invoice.vendor, address: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Tax ID</Label>
              <Input
                value={invoice.vendor.taxId || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    vendor: { ...invoice.vendor, taxId: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Invoice Information */}
      <div className="rounded-lg">
        <div
          className="flex items-center bg-blue-50 border-b cursor-pointer"
          onClick={() => toggleSection("invoice")}
        >
          <div className="w-1.5 h-8 bg-blue-500 mr-3"></div>
          {expandedSections.invoice ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <span className="font-bold text-md">Invoice Details</span>
        </div>

        {expandedSections.invoice && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Invoice Number</Label>
              <Input
                value={invoice.invoice.number || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    invoice: { ...invoice.invoice, number: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Invoice Date</Label>
              <Input
                value={invoice.invoice.date || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    invoice: { ...invoice.invoice, date: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">PO Number</Label>
              <Input
                value={invoice.invoice.poNumber || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    invoice: { ...invoice.invoice, poNumber: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">PO Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="col-span-3 h-8 text-sm justify-start text-left font-normal"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {poDate ? (
                      format(poDate, "dd.MM.yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={poDate}
                    onSelect={(date) => {
                      setPoDate(date);
                      setInvoice({
                        ...invoice,
                        invoice: {
                          ...invoice.invoice,
                          poDate: date ? format(date, "yyyy-MM-dd") : "",
                        },
                      });
                    }}
                    captionLayout="dropdown"
                    className="rounded-md border shadow-sm"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg">
        <div
          className="flex items-center bg-pink-50 border-b cursor-pointer"
          onClick={() => toggleSection("summary")}
        >
          <div className="w-1.5 h-8 bg-pink-500 mr-3"></div>
          {expandedSections.summary ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <span className="font-bold text-md">Summary</span>
        </div>

        {expandedSections.summary && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Currency</Label>
              <Input
                value={invoice.invoice.currency || ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    invoice: { ...invoice.invoice, currency: e.target.value },
                  })
                }
                className="col-span-3 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Sub Total</Label>
              <Input
                type="number"
                value={invoice.invoice.subtotal || 0}
                readOnly
                className="col-span-3 h-8 text-xs bg-muted"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-sm col-span-1">Total</Label>
              <Input
                type="number"
                value={invoice.invoice.total || 0}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    invoice: {
                      ...invoice.invoice,
                      total: Number(e.target.value),
                    },
                  })
                }
                className="col-span-3 h-8 text-xs font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="rounded-lg">
        <div
          className="flex items-center bg-yellow-50 border-b cursor-pointer"
          onClick={() => toggleSection("lineItems")}
        >
          <div className="w-1.5 h-8 bg-yellow-500 mr-3"></div>
          {expandedSections.lineItems ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <span className="font-bold text-md">
            Line Items ({lineItems.length})
          </span>
        </div>

        {expandedSections.lineItems && (
          <div className="p-4 space-y-3">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-sm font-semibold">
                      Description
                    </TableHead>
                    <TableHead className="h-8 text-sm font-semibold text-right">
                      Unit Price
                    </TableHead>
                    <TableHead className="h-8 text-sm font-semibold text-right">
                      Quantity
                    </TableHead>
                    <TableHead className="h-8 text-sm font-semibold text-right">
                      Total
                    </TableHead>
                    <TableHead className="h-8 text-sm font-semibold w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index} className="h-10">
                      <TableCell className="p-1">
                        <Input
                          value={item.description || ""}
                          onChange={(e) =>
                            updateLineItem(index, "description", e.target.value)
                          }
                          placeholder="Description"
                          className="border-0 h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          value={item.unitPrice || 0}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                          className="border-0 h-8 text-xs text-right"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          className="border-0 h-8 text-xs text-right"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          value={item.total || 0}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "total",
                              Number(e.target.value)
                            )
                          }
                          className="border-0 h-8 text-xs text-right font-medium"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={addLineItem}
                className="h-8 text-sm rounded-xl flex-1"
              >
                <Plus className="h-3 w-3" />
                New
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between p-4 border-t">
        <Button
          variant="outline"
          onClick={handleExtract}
          disabled={isExtracting}
          className="h-8 text-sm rounded-xl"
        >
          {isExtracting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BotMessageSquare className="h-4 w-4" />
          )}
          Extract
        </Button>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="h-8 text-sm rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-sm rounded-xl"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
