"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileAttachmentManager } from "@/components/file-attachment";
import {
  X,
  Paperclip,
  UploadCloud,
  FileText,
  AlertCircle,
  Send,
} from "lucide-react";
import { RFQ } from "@/types/rfq";

export interface QuotationSubmissionModalProps {
  quoteModalRfq: RFQ | null;
  revisingQuoteId: number | null;
  revisingQuoteNo: string | null;
  quoteCurrency: string;
  setQuoteCurrency: (curr: string) => void;
  quoteDeliveryTime: string;
  setQuoteDeliveryTime: (time: string) => void;
  quoteLineItemPrices: Record<number, { unitPrice: string; notes: string }>;
  handleQuotePriceChange: (lineItemId: number, field: "unitPrice" | "notes", val: string) => void;
  quotePendingFile: File | null;
  setQuotePendingFile: (file: File | null) => void;
  quoteFileError: string | null;
  setQuoteFileError: (err: string | null) => void;
  isSubmittingQuote: boolean;
  handleCreateQuote: () => Promise<void>;
  onClose: () => void;
}

export function QuotationSubmissionModal({
  quoteModalRfq,
  revisingQuoteId,
  revisingQuoteNo,
  quoteCurrency,
  setQuoteCurrency,
  quoteDeliveryTime,
  setQuoteDeliveryTime,
  quoteLineItemPrices,
  handleQuotePriceChange,
  quotePendingFile,
  setQuotePendingFile,
  quoteFileError,
  setQuoteFileError,
  isSubmittingQuote,
  handleCreateQuote,
  onClose,
}: QuotationSubmissionModalProps) {
  if (!quoteModalRfq) return null;

  const calculateQuoteGrandTotal = () => {
    if (!quoteModalRfq?.lineItems) return 0;
    return quoteModalRfq.lineItems.reduce((acc, item) => {
      if (!item.id) return acc;
      const price = Number(quoteLineItemPrices[item.id]?.unitPrice) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>
                {revisingQuoteId
                  ? `Revise Quotation: ${revisingQuoteNo || `Quote #${revisingQuoteId}`}`
                  : `Submit Quotation: RFQ #${quoteModalRfq.id}`}
              </span>
              {revisingQuoteId && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Revision Mode
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {revisingQuoteId
                ? `Modifying pricing schedule and terms for RFQ #${quoteModalRfq.id} • ${quoteModalRfq.title}`
                : quoteModalRfq.title}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          {/* RFQ Sourcing Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Location</span>
              <strong className="text-slate-900 dark:text-slate-100">{quoteModalRfq.location}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Currency</span>
              <strong className="text-slate-900 dark:text-slate-100">{quoteModalRfq.currency}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Target Budget</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {quoteModalRfq.optionalBudget ? `${quoteModalRfq.currency} ${quoteModalRfq.optionalBudget}` : "Open"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Deadline</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {quoteModalRfq.deadline ? new Date(quoteModalRfq.deadline).toLocaleDateString() : "Open"}
              </strong>
            </div>
          </div>

          {/* Quote Currency & Delivery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quote-currency" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quote Currency
              </Label>
              <select
                id="quote-currency"
                value={quoteCurrency}
                onChange={(e) => setQuoteCurrency(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#008779]"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delivery-time" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lead Delivery Timeline
              </Label>
              <Input
                id="delivery-time"
                value={quoteDeliveryTime}
                onChange={(e) => setQuoteDeliveryTime(e.target.value)}
                placeholder="e.g. 14 business days upon PO receipt"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Line Items Pricing Table */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Itemized Pricing Schedule <span className="text-red-500">*</span>
            </Label>

            {quoteModalRfq.lineItems && quoteModalRfq.lineItems.length > 0 ? (
              <div className="space-y-3">
                {quoteModalRfq.lineItems.map((li, idx) => {
                  const lineId = li.id || idx;
                  const unitPrice = quoteLineItemPrices[lineId]?.unitPrice || "";
                  const itemNotes = quoteLineItemPrices[lineId]?.notes || "";
                  const lineTotal = (Number(unitPrice) || 0) * (Number(li.quantity) || 1);

                  return (
                    <div
                      key={lineId}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900 dark:text-slate-100">
                          {idx + 1}. {li.name}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          Required: {li.quantity} {li.unit}
                        </span>
                      </div>

                      {li.specifications && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Specs: {li.specifications}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                        <div className="sm:col-span-5 space-y-1">
                          <Label className="text-[11px] text-slate-600 dark:text-slate-400">
                            Unit Price ({quoteCurrency}) *
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g. 75.00"
                            value={unitPrice}
                            onChange={(e) =>
                              handleQuotePriceChange(lineId, "unitPrice", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-[11px] text-slate-600 dark:text-slate-400">
                            Notes / Terms
                          </Label>
                          <Input
                            placeholder="e.g. Includes 2y warranty"
                            value={itemNotes}
                            onChange={(e) =>
                              handleQuotePriceChange(lineId, "notes", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1 text-right sm:self-center">
                          <span className="text-[11px] text-slate-500 block">Subtotal</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {quoteCurrency} {lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No specific line items defined for this RFQ.</p>
            )}
          </div>

          {/* RFQ Specification Attachments (Buyer Specifications - Read-Only for Vendor) */}
          <FileAttachmentManager
            rfqId={quoteModalRfq.id}
            title="RFQ Specification Files & Drawings (Buyer Provided)"
            readOnly={true}
          />

          {/* If Revising an Existing Quote, show existing uploaded quotation files */}
          {revisingQuoteId && (
            <FileAttachmentManager
              quotationId={revisingQuoteId}
              title="Current Quotation Attachments & Technical Datasheets"
              readOnly={false}
            />
          )}

          {/* Vendor Quotation Proposal / Datasheet Uploader */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#008779]" />
                <span>{revisingQuoteId ? "Attach Additional Revised Document (PDF / XLSX)" : "Vendor Proposal / Quotation Document (PDF / XLSX)"}</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Optional • Max 15MB
              </span>
            </div>

            {quoteFileError && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-2.5 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-500" />
                <span>{quoteFileError}</span>
              </div>
            )}

            {quotePendingFile ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {quotePendingFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(quotePendingFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload upon submission
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuotePendingFile(null);
                    setQuoteFileError(null);
                  }}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 rounded-full cursor-pointer"
                  title="Remove file"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#008779] dark:hover:border-[#008779] transition-colors bg-slate-50/50 dark:bg-slate-800/40 hover:bg-[#008779]/5">
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const allowedExts = [".pdf", ".xlsx", ".xls"];
                    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
                    if (!allowedExts.includes(ext)) {
                      setQuoteFileError("Only PDF (.pdf) and Excel (.xlsx, .xls) files are permitted.");
                      return;
                    }
                    if (file.size > 15 * 1024 * 1024) {
                      setQuoteFileError("File exceeds maximum allowed size of 15MB.");
                      return;
                    }
                    setQuoteFileError(null);
                    setQuotePendingFile(file);
                  }}
                  className="hidden"
                />
                <div className="size-8 rounded-full bg-[#008779]/10 text-[#008779] flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select quotation PDF or technical specification
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Supports PDF (.pdf) or Excel (.xlsx) up to 15MB
                </p>
              </label>
            )}
          </div>

          {/* Grand Total Summary */}
          <div className="p-4 rounded-xl bg-[#008779]/10 dark:bg-[#008779]/20 border border-[#008779]/30 dark:border-[#008779]/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#008779] dark:text-[#00a896] block">
                Total Quotation Value
              </span>
              <span className="text-[11px] text-[#008779]/80 dark:text-[#00a896]/80">
                Calculated across all itemized unit rates
              </span>
            </div>
            <div className="text-xl font-extrabold text-[#008779] dark:text-[#00a896]">
              {quoteCurrency} {calculateQuoteGrandTotal().toFixed(2)}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmittingQuote}
            onClick={handleCreateQuote}
            className="h-9 text-xs bg-[#008779] text-white hover:bg-[#007063] active:bg-[#005c52] font-semibold cursor-pointer"
          >
            <Send className="size-3.5 mr-1.5 text-white" />
            <span className="text-white font-semibold">
              {revisingQuoteId ? "Update / Revise Quotation" : "Submit Quotation"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
