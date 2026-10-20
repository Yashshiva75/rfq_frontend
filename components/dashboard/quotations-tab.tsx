"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import {
  Inbox,
  ArrowUpDown,
  Trophy,
  Eye,
  Edit,
} from "lucide-react";
import { UserRole, Quotation } from "@/types/rfq";

export interface QuotationsTabProps {
  role: UserRole;
  quotationsList: Quotation[];
  isLoadingData: boolean;
  handleOpenCompareModal: (rfqId: number) => void;
  handleUpdateQuoteStatus: (quoteId: number, status: string) => void;
  setAwardConfirmQuote: (info: any) => void;
  setSelectedDetailQuote: (quote: any) => void;
  handleOpenReviseModal: (quote: Quotation) => void;
}

export function QuotationsTab({
  role,
  quotationsList,
  isLoadingData,
  handleOpenCompareModal,
  handleUpdateQuoteStatus,
  setAwardConfirmQuote,
  setSelectedDetailQuote,
  handleOpenReviseModal,
}: QuotationsTabProps) {
  return (
    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-xl overflow-hidden w-full">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {role === "buyer" ? "Received Quotations Evaluation" : "My Submitted Quotations"}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {role === "buyer"
            ? "Review, shortlist, and accept supplier quotations submitted for your RFQs"
            : "Track bids submitted to buyer procurement tenders"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
        {isLoadingData ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : quotationsList.length > 0 ? (
          quotationsList.map((quote: any) => (
            <div
              key={quote.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {quote.quoteNo || `QTE-${quote.id}`}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {quote.rfq?.title || "Procurement Quotation"}
                  </h4>
                  <Badge
                    variant={quote.status === "ACCEPTED" ? "vendor" : quote.status === "SHORTLISTED" ? "buyer" : "secondary"}
                    className="text-[10px]"
                  >
                    {quote.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Supplier: {quote.vendor?.name || quote.vendor?.email || "Supplier"} • Submitted:{" "}
                  {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "—"}
                  {quote.deliveryTime && ` • Timeline: ${quote.deliveryTime}`}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">
                    {quote.currency || "USD"} {Number(quote.totalPriceQuote || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Total Quoted
                  </span>
                </div>

                {/* Buyer & Admin Actions on Quote */}
                {(role === "buyer" || role === "admin") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenCompareModal(quote.rfqId)}
                    className="h-8 text-xs font-bold border-[#008779]/40 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 flex items-center gap-1 cursor-pointer"
                    title="Compare all quotes for this RFQ"
                  >
                    <ArrowUpDown className="size-3.5" />
                    <span>Compare</span>
                  </Button>
                )}
                {(role === "buyer" || role === "admin") && quote.status !== "ACCEPTED" && quote.status !== "REJECTED" && (
                  <div className="flex items-center gap-1.5">
                    {quote.status !== "SHORTLISTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuoteStatus(quote.id, "SHORTLISTED")}
                        className="h-8 text-xs border-[#008779]/40 dark:border-[#008779]/50 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 cursor-pointer"
                      >
                        Shortlist
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setAwardConfirmQuote({
                          id: quote.id,
                          quoteNo: quote.quoteNo,
                          vendorName: quote.vendor?.name || `Vendor #${quote.vendorId}`,
                          price: quote.totalPriceQuote,
                          currency: quote.currency,
                          rfqId: quote.rfqId,
                        });
                      }}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Trophy className="size-3.5" />
                      <span>Award</span>
                    </Button>
                  </div>
                )}

                {/* View Quotation Details & Documents */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDetailQuote(quote)}
                  className="h-8 px-3 text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                  title="View Quotation Details & Manage Attachments"
                >
                  <Eye className="size-3.5" />
                  <span>Details</span>
                </Button>

                {/* Revise Action for Vendor & Admin */}
                {(role === "vendor" || role === "admin") && quote.status !== "ACCEPTED" && quote.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReviseModal(quote)}
                    className="h-8 px-3 text-xs font-bold uppercase text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-1 cursor-pointer"
                    title="Revise Quotation"
                  >
                    <Edit className="size-3.5" />
                    <span>Revise</span>
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Inbox className="size-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-sm uppercase text-slate-800 dark:text-slate-200">No Quotations Found</p>
            <p className="text-xs uppercase text-slate-400 mt-1">Quotations received from suppliers will appear here from the live API.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
