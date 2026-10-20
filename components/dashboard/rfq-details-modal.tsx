"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileAttachmentManager } from "@/components/file-attachment";
import {
  X,
  DollarSign,
  Edit,
  UploadCloud,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import { UserRole, RFQ } from "@/types/rfq";

export interface RfqDetailsModalProps {
  selectedDetailRfq: any | null;
  role: UserRole;
  onClose: () => void;
  handleOpenQuoteModal: (rfq: RFQ) => void;
  handleStartEdit: (rfq: any) => void;
  handlePublishRfqDirect: (id: number) => Promise<void>;
  handleOpenCompareModal: (rfqId: number) => void;
  handleUpdateQuoteStatus: (quoteId: number, status: string) => Promise<void>;
  setAwardConfirmQuote: (info: any) => void;
}

export function RfqDetailsModal({
  selectedDetailRfq,
  role,
  onClose,
  handleOpenQuoteModal,
  handleStartEdit,
  handlePublishRfqDirect,
  handleOpenCompareModal,
  handleUpdateQuoteStatus,
  setAwardConfirmQuote,
}: RfqDetailsModalProps) {
  if (!selectedDetailRfq) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">
                RFQ #{selectedDetailRfq.id}
              </span>
              <Badge variant={selectedDetailRfq.status === "PUBLISHED" ? "buyer" : "secondary"}>
                {selectedDetailRfq.status}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {selectedDetailRfq.title}
            </h3>
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

        <div className="p-6 space-y-5 text-xs">
          {/* Description */}
          {selectedDetailRfq.description && (
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <strong className="block mb-1 text-slate-900 dark:text-slate-100 font-semibold">
                Procurement Scope:
              </strong>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {selectedDetailRfq.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <div>
              <span className="text-slate-500 block">Location</span>
              <strong className="text-slate-900 dark:text-slate-100">{selectedDetailRfq.location}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Currency</span>
              <strong className="text-slate-900 dark:text-slate-100">{selectedDetailRfq.currency}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Budget</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedDetailRfq.optionalBudget ? `${selectedDetailRfq.currency} ${selectedDetailRfq.optionalBudget}` : "Open"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Deadline</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedDetailRfq.deadline ? new Date(selectedDetailRfq.deadline).toLocaleDateString() : "Open"}
              </strong>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Itemized Line Items Schedule ({selectedDetailRfq.lineItems?.length || 0})
            </h4>

            {selectedDetailRfq.lineItems && selectedDetailRfq.lineItems.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Specifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedDetailRfq.lineItems.map((li: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-slate-500">{i + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{li.name}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {li.quantity} {li.unit}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {li.specifications || "Standard OEM"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 italic">No itemized line items recorded.</p>
            )}
          </div>

          {/* RFQ Specification Attachments & Drawings */}
          <FileAttachmentManager
            rfqId={selectedDetailRfq.id}
            title="RFQ Specification Files & Drawings (Buyer Provided)"
            readOnly={role !== "buyer" && role !== "admin"}
          />

          {role === "vendor" && (
            <div className="p-3 rounded-lg bg-[#008779]/10 dark:bg-[#008779]/20 border border-[#008779]/20 text-xs text-[#008779] dark:text-[#00a896] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                📌 <strong>Vendor Notice:</strong> You can download buyer specifications above. To submit your own quotation with proposal documents & technical PDFs, click <strong>"Submit Quotation"</strong>.
              </span>
              {selectedDetailRfq.status === "PUBLISHED" && (
                <Button
                  size="sm"
                  onClick={() => {
                    const rfqToQuote = selectedDetailRfq;
                    onClose();
                    handleOpenQuoteModal(rfqToQuote);
                  }}
                  className="h-7 text-xs bg-[#008779] hover:bg-[#007063] text-white shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Submit Quotation
                </Button>
              )}
            </div>
          )}

          {/* Received Quotations for this RFQ (Buyer & Admin Evaluation) */}
          {(role === "buyer" || role === "admin") && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  Received Quotations ({selectedDetailRfq.quotations?.length || 0})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const rfqId = selectedDetailRfq.id;
                    onClose();
                    handleOpenCompareModal(rfqId);
                  }}
                  className="h-7 text-xs font-bold border-[#008779]/40 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowUpDown className="size-3" />
                  <span>Compare Side-by-Side</span>
                </Button>
              </div>

              {selectedDetailRfq.quotations && selectedDetailRfq.quotations.length > 0 ? (
                <div className="space-y-2">
                  {selectedDetailRfq.quotations.map((q: any) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        q.status === "ACCEPTED"
                          ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {q.vendor?.name || `Vendor #${q.vendorId}`}
                          </span>
                          <Badge
                            variant={
                              q.status === "ACCEPTED"
                                ? "vendor"
                                : q.status === "REJECTED"
                                ? "destructive"
                                : "buyer"
                            }
                            className="text-[10px]"
                          >
                            {q.status}
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Quote #{q.quoteNo} • {q.currency} {Number(q.totalPriceQuote).toLocaleString()} • Timeline: {q.deliveryTime || "Standard"}
                        </p>
                      </div>

                      {q.status !== "ACCEPTED" && selectedDetailRfq.status !== "AWARDED" && (
                        <div className="flex items-center gap-1.5">
                          {q.status !== "SHORTLISTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuoteStatus(q.id, "SHORTLISTED")}
                              className="h-7 text-xs border-[#008779]/40 dark:border-[#008779]/50 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 cursor-pointer"
                            >
                              Shortlist
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              setAwardConfirmQuote({
                                id: q.id,
                                quoteNo: q.quoteNo,
                                vendorName: q.vendor?.name || `Vendor #${q.vendorId}`,
                                price: q.totalPriceQuote,
                                currency: q.currency,
                                rfqId: selectedDetailRfq.id,
                              });
                            }}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Trophy className="size-3" />
                            <span>Award Contract</span>
                          </Button>
                        </div>
                      )}

                      {q.status === "ACCEPTED" && (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                          <Trophy className="size-3" />
                          <span>WINNING CONTRACT</span>
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No supplier quotations submitted for this RFQ yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          {selectedDetailRfq.status === "PUBLISHED" && role === "vendor" ? (
            <Button
              size="sm"
              onClick={() => {
                const rfqToQuote = selectedDetailRfq;
                onClose();
                handleOpenQuoteModal(rfqToQuote);
              }}
              className="h-9 text-xs bg-[#008779] hover:bg-[#007063] text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DollarSign className="size-3.5 text-white" />
              <span>Submit Quotation</span>
            </Button>
          ) : selectedDetailRfq.status === "DRAFT" && role === "buyer" ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const rfqToEdit = selectedDetailRfq;
                  onClose();
                  handleStartEdit(rfqToEdit);
                }}
                variant="outline"
                className="h-9 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 cursor-pointer"
              >
                <Edit className="size-3.5 mr-1" />
                Edit RFQ
              </Button>
              <Button
                size="sm"
                onClick={() => handlePublishRfqDirect(selectedDetailRfq.id)}
                className="h-9 text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-semibold cursor-pointer"
              >
                <UploadCloud className="size-3.5 mr-1 text-white" />
                Publish Now
              </Button>
            </div>
          ) : (
            <div />
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
