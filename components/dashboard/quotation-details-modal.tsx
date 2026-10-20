"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileAttachmentManager } from "@/components/file-attachment";
import { X, Trophy, Edit, ArrowUpDown } from "lucide-react";
import { UserRole, Quotation } from "@/types/rfq";
import { AuthUser } from "@/types/auth";

export interface QuotationDetailsModalProps {
  selectedDetailQuote: any | null;
  user: AuthUser | null;
  role: UserRole;
  onClose: () => void;
  handleOpenReviseModal: (quote: Quotation) => void;
  handleOpenCompareModal: (rfqId: number) => void;
  handleUpdateQuoteStatus: (quoteId: number, status: string) => Promise<void>;
  setAwardConfirmQuote: (info: any) => void;
}

export function QuotationDetailsModal({
  selectedDetailQuote,
  user,
  role,
  onClose,
  handleOpenReviseModal,
  handleOpenCompareModal,
  handleUpdateQuoteStatus,
  setAwardConfirmQuote,
}: QuotationDetailsModalProps) {
  if (!selectedDetailQuote) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">
                {selectedDetailQuote.quoteNo || `Quote #${selectedDetailQuote.id}`}
              </span>
              <Badge
                variant={
                  selectedDetailQuote.status === "ACCEPTED"
                    ? "vendor"
                    : selectedDetailQuote.status === "SHORTLISTED"
                    ? "secondary"
                    : "buyer"
                }
              >
                {selectedDetailQuote.status === "SUBMITTED"
                  ? "In Process"
                  : selectedDetailQuote.status}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {selectedDetailQuote.rfq?.title || "Supplier Quotation Proposal"}
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
          {/* Meta details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <span className="text-slate-500 block">Supplier</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedDetailQuote.vendor?.name || "Global Vendor Supplies"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Delivery Location</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedDetailQuote.rfq?.location || "Standard Delivery"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Delivery Timeline</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedDetailQuote.deliveryTime || "14 business days"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Quoted</span>
              <strong className="text-[#008779] font-bold text-sm block">
                {selectedDetailQuote.currency}{" "}
                {Number(selectedDetailQuote.totalPriceQuote).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Itemized Pricing Schedule ({selectedDetailQuote.lineItems?.length || 0})
            </h4>

            {selectedDetailQuote.lineItems && selectedDetailQuote.lineItems.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Price</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedDetailQuote.lineItems.map((li: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-slate-500">{i + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                          {li.rfqLineItem?.name || `Item #${li.rfqLineItemId}`}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {li.rfqLineItem?.quantity || "1"} {li.rfqLineItem?.unit || "pcs"}
                        </td>
                        <td className="p-3 font-mono text-right text-slate-800 dark:text-slate-200">
                          {selectedDetailQuote.currency} {Number(li.unitPrice).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                          {selectedDetailQuote.currency} {Number(li.totalPrice).toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {li.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 italic">No line item breakdown available.</p>
            )}
          </div>

          {/* Revision Audit History */}
          {selectedDetailQuote.revisions && selectedDetailQuote.revisions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Quotation Revisions History ({selectedDetailQuote.revisions.length})</span>
                <span className="text-[10px] text-slate-400 lowercase">tracked by server</span>
              </h4>
              <div className="space-y-2">
                {selectedDetailQuote.revisions.map((rev: any, rIdx: number) => (
                  <div
                    key={rev.id || rIdx}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Revision #{rev.revisionNo}
                      </span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        {rev.changedAt ? new Date(rev.changedAt).toLocaleString() : "—"}
                      </span>
                      {rev.snapshot?.previousTotalPrice !== undefined && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Previous: {selectedDetailQuote.currency} {Number(rev.snapshot.previousTotalPrice).toLocaleString()} → New: {selectedDetailQuote.currency} {Number(rev.snapshot.newTotalPrice ?? rev.totalPrice).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {selectedDetailQuote.currency} {Number(rev.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotation Documents & Technical Datasheets */}
          <FileAttachmentManager
            quotationId={selectedDetailQuote.id}
            title="Quotation Documents & Technical Datasheet"
            readOnly={
              (role !== "vendor" && role !== "admin") ||
              (role === "vendor" && !!user?.id && !!selectedDetailQuote.vendorId && selectedDetailQuote.vendorId !== user.id) ||
              selectedDetailQuote.status === "ACCEPTED" ||
              selectedDetailQuote.status === "REJECTED"
            }
          />

          {/* Footer Buttons for Buyer, Vendor & Admin */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 px-3 text-xs cursor-pointer"
            >
              Close
            </Button>
            {(role === "vendor" || role === "admin") && selectedDetailQuote.status !== "ACCEPTED" && selectedDetailQuote.status !== "REJECTED" && (
              <Button
                size="sm"
                onClick={() => {
                  const quoteToRevise = selectedDetailQuote;
                  onClose();
                  handleOpenReviseModal(quoteToRevise);
                }}
                className="h-8 px-4 text-xs font-bold uppercase bg-amber-600 hover:bg-amber-700 text-white cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Edit className="size-3.5" />
                <span>Revise Quotation</span>
              </Button>
            )}
            {(role === "buyer" || role === "admin") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rfqId = selectedDetailQuote.rfqId;
                  onClose();
                  handleOpenCompareModal(rfqId);
                }}
                className="h-8 px-3 text-xs font-bold border-[#008779]/40 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUpDown className="size-3.5" />
                <span>Compare All Quotes</span>
              </Button>
            )}
            {(role === "buyer" || role === "admin") && selectedDetailQuote.status === "SUBMITTED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await handleUpdateQuoteStatus(selectedDetailQuote.id, "SHORTLISTED");
                  onClose();
                }}
                className="h-8 px-3 text-xs border-[#008779]/40 dark:border-[#008779]/50 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 cursor-pointer"
              >
                Shortlist Quotation
              </Button>
            )}
            {(role === "buyer" || role === "admin") && selectedDetailQuote.status !== "ACCEPTED" && selectedDetailQuote.status !== "REJECTED" && (
              <Button
                size="sm"
                onClick={() => {
                  const quoteToAward = selectedDetailQuote;
                  onClose();
                  setAwardConfirmQuote({
                    id: quoteToAward.id,
                    quoteNo: quoteToAward.quoteNo,
                    vendorName: quoteToAward.vendor?.name || `Vendor #${quoteToAward.vendorId}`,
                    price: quoteToAward.totalPriceQuote,
                    currency: quoteToAward.currency,
                    rfqId: quoteToAward.rfqId,
                  });
                }}
                className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trophy className="size-3.5" />
                <span>Award Contract</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
