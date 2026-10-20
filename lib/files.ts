import Cookies from "js-cookie";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/api";

export interface FileAttachment {
  id: number;
  fileName: string;
  storageKey: string;
  mimeType: string;
  uploadedBy: number;
  rfqId?: number | null;
  quotationId?: number | null;
  createdAt: string;
  url: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

function getAuthToken(token?: string): string {
  if (token) return token;
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("rfq_token") ||
      localStorage.getItem("access_token") ||
      Cookies.get("auth_token") ||
      ""
    );
  }
  return "";
}

/**
 * Upload a PDF or XLSX specification/quotation file
 */
export async function uploadAttachment({
  file,
  rfqId,
  quotationId,
  token,
}: {
  file: File;
  rfqId?: number;
  quotationId?: number;
  token?: string;
}): Promise<FileAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  if (rfqId) formData.append("rfqId", rfqId.toString());
  if (quotationId) formData.append("quotationId", quotationId.toString());

  const authToken = getAuthToken(token);
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: "POST",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to upload file");
  }
  return data.data;
}

/**
 * List attachments for an RFQ or a Quotation
 */
export async function getAttachments({
  rfqId,
  quotationId,
  token,
}: {
  rfqId?: number;
  quotationId?: number;
  token?: string;
}): Promise<FileAttachment[]> {
  const params = new URLSearchParams();
  if (rfqId) params.append("rfqId", rfqId.toString());
  if (quotationId) params.append("quotationId", quotationId.toString());

  const authToken = getAuthToken(token);
  const response = await fetch(`${API_BASE_URL}/files?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  const data = await response.json();
  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to fetch attachments");
  }
  return data.data || [];
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(fileId: number, token?: string): Promise<void> {
  const authToken = getAuthToken(token);
  const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  const data = await response.json();
  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to delete file");
  }
}
