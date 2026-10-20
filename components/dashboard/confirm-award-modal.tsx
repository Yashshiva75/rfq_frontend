"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2 } from "lucide-react";

export interface ConfirmAwardModalProps {
  awardConfirmQuote: {
    id: number;
    quoteNo: string;
    vendorName: string;
    price: number | string;
    currency: string;
    rfqId: number;
  } | null;
  isAwardingQuoteId: number | null;
  onClose: () => void;
  handleAwardQuotation: (
    quoteId: number,
    quoteNo: string,
    vendorName: string,
    price: number | string,
    currency: string,
    rfqId: number
  ) => Promise<void>;
}

export function ConfirmAwardModal({
  awardConfirmQuote,
  isAwardingQuoteId,
  onClose,
  handleAwardQuotation,
}: ConfirmAwardModalProps) {
  if (!awardConfirmQuote) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0">
            <Trophy className="size-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Confirm RFQ Contract Award
            </h4>
            <p className="text-xs text-slate-500">
              Award procurement contract to the selected supplier
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Selected Vendor:</span>
            <strong className="text-slate-900 dark:text-slate-100">{awardConfirmQuote.vendorName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Quotation Number:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{awardConfirmQuote.quoteNo}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Awarded Total:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              {awardConfirmQuote.currency} {Number(awardConfirmQuote.price).toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Important:</strong> In an atomic transaction, this action will mark Quote #{awardConfirmQuote.quoteNo} as{" "}
          <strong>ACCEPTED</strong>, automatically mark all competing quotes as <strong>REJECTED</strong>, and update RFQ #{awardConfirmQuote.rfqId} status to <strong>AWARDED</strong>.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isAwardingQuoteId !== null}
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isAwardingQuoteId !== null}
            onClick={() =>
              handleAwardQuotation(
                awardConfirmQuote.id,
                awardConfirmQuote.quoteNo,
                awardConfirmQuote.vendorName,
                awardConfirmQuote.price,
                awardConfirmQuote.currency,
                awardConfirmQuote.rfqId
              )
            }
            className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Trophy className="size-3.5" />
            <span>Confirm & Award Contract</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
