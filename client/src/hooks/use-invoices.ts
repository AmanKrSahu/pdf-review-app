import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api";
import { PaginatedInvoices } from "@/types";

interface UseInvoicesOptions {
  page?: number;
  limit?: number;
  search?: string;
  autoFetch?: boolean;
}

export function useInvoices({
  page = 1,
  limit = 10,
  search,
  autoFetch = true,
}: UseInvoicesOptions = {}) {
  const [data, setData] = useState<PaginatedInvoices>({
    invoices: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.getInvoices({
        page,
        limit,
        q: search,
      });

      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch invoices";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const deleteInvoice = useCallback(
    async (invoiceId: string) => {
      try {
        await api.deleteInvoice(invoiceId);
        toast.success("Invoice deleted successfully");

        // Refresh the list
        await fetchInvoices();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete invoice";
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchInvoices]
  );

  const refresh = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (autoFetch) {
      fetchInvoices();
    }
  }, [fetchInvoices, autoFetch]);

  return {
    invoices: data.invoices,
    pagination: data.pagination,
    loading,
    error,
    refresh,
    deleteInvoice,
    fetchInvoices,
  };
}
