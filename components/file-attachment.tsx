"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  UploadCloud,
  Trash2,
  Download,
  Loader2,
  Paperclip,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  FileAttachment,
  uploadAttachment,
  getAttachments,
  deleteAttachment,
} from "@/lib/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileAttachmentProps {
  rfqId?: number;
  quotationId?: number;
  readOnly?: boolean;
  onUploaded?: (file: FileAttachment) => void;
  title?: string;
}

export function FileAttachmentManager({
  rfqId,
  quotationId,
  readOnly = false,
  onUploaded,
  title = "Attachments (Specifications & Documents)",
}: FileAttachmentProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch existing files
  const loadFiles = async () => {
    if (!rfqId && !quotationId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAttachments({ rfqId, quotationId });
      setFiles(data);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [rfqId, quotationId]);

  // Handle upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Client-side extension validation
    const allowedExtensions = [".pdf", ".xlsx", ".xls"];
    const fileExt = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setError("Only PDF (.pdf) and Excel (.xlsx, .xls) files are permitted.");
      return;
    }

    // Size limit check (15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 15MB.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccessMsg(null);
      const uploaded = await uploadAttachment({
        file: selectedFile,
        rfqId,
        quotationId,
      });
      setFiles((prev) => [uploaded, ...prev]);
      setSuccessMsg(`"${uploaded.fileName}" uploaded successfully.`);
      if (onUploaded) onUploaded(uploaded);
      e.target.value = ""; // Reset input
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (fileId: number) => {
    if (!confirm("Are you sure you want to remove this attachment?")) return;
    try {
      await deleteAttachment(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setSuccessMsg("Attachment removed successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete file");
    }
  };

  const isExcel = (fileName: string) => {
    return (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".csv")
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-[#008779]" />
          <span>{title}</span>
          <Badge variant="outline" className="text-[10px] font-mono font-normal">
            {files.length}
          </Badge>
        </h3>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          PDF, XLSX (Max 15MB)
        </span>
      </div>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-2.5 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {!readOnly && (
        <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#008779] dark:hover:border-[#008779] transition-colors bg-slate-50/50 dark:bg-slate-800/40 hover:bg-[#008779]/5">
          <input
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#008779]" />
              <span>Uploading document securely to cloud storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="size-9 rounded-full bg-[#008779]/10 text-[#008779] flex items-center justify-center mb-0.5">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to attach specification or quotation file
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports PDF (.pdf) and Excel (.xlsx, .xls) up to 15MB
              </p>
            </div>
          )}
        </label>
      )}

      {/* Files List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        )}
        {!isLoading && files.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2">
            No files attached yet.
          </p>
        )}
        {files.map((file) => {
          const excelFile = isExcel(file.fileName);
          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    excelFile
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {excelFile ? (
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  ) : (
                    <FileText className="w-4.5 h-4.5" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                    {file.fileName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                    {file.user ? ` • by ${file.user.name}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.fileName}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Download / View"
                >
                  <Download className="w-4 h-4" />
                </a>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
