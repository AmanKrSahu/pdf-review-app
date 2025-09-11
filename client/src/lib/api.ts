import {
  ApiResponse,
  Invoice,
  PaginatedInvoices,
  UploadResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error instanceof Error ? error : new Error("Unknown API error");
    }
  }

  // Upload PDF file
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data.data;
  }

  // Extract data from PDF using AI
  async extractData(
    fileId: string,
    model: "gemini" | "groq" = "gemini"
  ): Promise<Partial<Invoice>> {
    const response = await this.request<Partial<Invoice>>("/extract", {
      method: "POST",
      body: JSON.stringify({ fileId, model }),
    });

    return response.data || {};
  }

  // Get all invoices with optional search
  async getInvoices(params?: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedInvoices> {
    const searchParams = new URLSearchParams();

    if (params?.q) searchParams.append("q", params.q);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const endpoint = `/invoices${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await this.request<PaginatedInvoices>(endpoint);

    return (
      response.data || {
        invoices: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      }
    );
  }

  // Get single invoice by ID
  async getInvoice(id: string): Promise<Invoice> {
    const response = await this.request<Invoice>(`/invoices/${id}`);
    if (!response.data) {
      throw new Error("Invoice not found");
    }
    return response.data;
  }

  // Create new invoice
  async createInvoice(
    invoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">
  ): Promise<Invoice> {
    const response = await this.request<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    });

    if (!response.data) {
      throw new Error("Failed to create invoice");
    }

    return response.data;
  }

  // Update existing invoice
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await this.request<Invoice>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    });

    if (!response.data) {
      throw new Error("Failed to update invoice");
    }

    return response.data;
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    await this.request(`/invoices/${id}`, {
      method: "DELETE",
    });
  }

  // Get PDF file URL for viewing
  getPDFUrl(fileId: string): string {
    return `${this.baseURL}/files/${fileId}`;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for convenience
export const api = {
  uploadFile: (file: File) => apiClient.uploadFile(file),
  extractData: (fileId: string, model?: "gemini" | "groq") =>
    apiClient.extractData(fileId, model),
  getInvoices: (params?: { q?: string; page?: number; limit?: number }) =>
    apiClient.getInvoices(params),
  getInvoice: (id: string) => apiClient.getInvoice(id),
  createInvoice: (invoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">) =>
    apiClient.createInvoice(invoice),
  updateInvoice: (id: string, invoice: Partial<Invoice>) =>
    apiClient.updateInvoice(id, invoice),
  deleteInvoice: (id: string) => apiClient.deleteInvoice(id),
  getPDFUrl: (fileId: string) => apiClient.getPDFUrl(fileId),
};
