import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api";
import { Invoice } from "@/types";

export function useInvoice(invoiceId?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await api.getInvoice(invoiceId);
      setInvoice(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch invoice";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  const updateInvoice = useCallback(
    async (updates: Partial<Invoice>) => {
      if (!invoiceId) throw new Error("No invoice ID provided");

      try {
        const result = await api.updateInvoice(invoiceId, updates);
        setInvoice(result);
        toast.success("Invoice updated successfully");
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update invoice";
        toast.error(errorMessage);
        throw err;
      }
    },
    [invoiceId]
  );

  const createInvoice = useCallback(
    async (newInvoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">) => {
      try {
        const result = await api.createInvoice(newInvoice);
        setInvoice(result);
        toast.success("Invoice created successfully");
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create invoice";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [fetchInvoice, invoiceId]);

  return {
    invoice,
    loading,
    error,
    updateInvoice,
    createInvoice,
    refresh: fetchInvoice,
  };
}
