export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
  };
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  message: string;
}

export interface ExtractRequest {
  fileId: string;
  model: "gemini" | "groq";
}

export interface ExtractResponse {
  success: boolean;
  data?: Partial<Invoice>;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
