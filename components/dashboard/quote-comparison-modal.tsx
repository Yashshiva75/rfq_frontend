"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileAttachmentManager } from "@/components/file-attachment";
import {
  X,
  Loader2,
  Inbox,
  DollarSign,
  Zap,
  Trophy,
  ArrowUpDown,
  Building,
  Clock,
  CheckCircle,
  Layers,
} from "lucide-react";
import { UserRole, RfqComparisonData } from "@/types/rfq";

export interface QuoteComparisonModalProps {
  comparingRfqId: number | null;
  comparisonData: RfqComparisonData | null;
  isLoadingComparison: boolean;
  comparisonSortBy: "totalPrice" | "deliveryTime" | "date";
  comparisonSortOrder: "asc" | "desc";
  isAwardingQuoteId: number | null;
  role: UserRole;
  onClose: () => void;
  handleSortComparison: (sortBy: "totalPrice" | "deliveryTime" | "date") => void;
  setComparisonSortOrder: (order: "asc" | "desc" | ((prev: "asc" | "desc") => "asc" | "desc")) => void;
  handleOpenCompareModal: (rfqId: number, sortBy?: any, sortOrder?: any) => void;
  setAwardConfirmQuote: (info: any) => void;
}

export function QuoteComparisonModal({
  comparingRfqId,
  comparisonData,
  isLoadingComparison,
  comparisonSortBy,
  comparisonSortOrder,
  isAwardingQuoteId,
  role,
  onClose,
  handleSortComparison,
  setComparisonSortOrder,
  handleOpenCompareModal,
  setAwardConfirmQuote,
}: QuoteComparisonModalProps) {
  if (!comparingRfqId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                RFQ #{comparingRfqId} • COMPARISON & AWARD STUDIO
              </span>
              {comparisonData?.rfq?.status && (
                <Badge
                  variant={
                    comparisonData.rfq.status === "AWARDED"
                      ? "vendor"
                      : comparisonData.rfq.status === "PUBLISHED"
                      ? "buyer"
                      : "secondary"
                  }
                  className="text-[11px] font-bold uppercase tracking-wider"
                >
                  {comparisonData.rfq.status === "AWARDED" ? "CONTRACT AWARDED" : comparisonData.rfq.status}
                </Badge>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {comparisonData?.rfq?.title || "RFQ Quotations Side-by-Side Comparison"}
            </h3>
            {comparisonData?.rfq && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Currency: <strong className="text-slate-800 dark:text-slate-200">{comparisonData.rfq.currency}</strong> • Budget:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {comparisonData.rfq.optionalBudget
                    ? `${comparisonData.rfq.currency} ${Number(comparisonData.rfq.optionalBudget).toLocaleString()}`
                    : "Open"}
                </strong>{" "}
                • Location: <strong className="text-slate-800 dark:text-slate-200">{comparisonData.rfq.location || "Standard"}</strong> • Deadline:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {comparisonData.rfq.deadline ? new Date(comparisonData.rfq.deadline).toLocaleDateString() : "Open"}
                </strong>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {isLoadingComparison ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 text-[#008779] animate-spin" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Generating side-by-side quotations analysis and metrics...
              </p>
            </div>
          ) : !comparisonData || comparisonData.quotations.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Inbox className="size-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200 uppercase">
                No Quotations Submitted Yet
              </h4>
              <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
                Suppliers have not submitted quotes for RFQ #{comparingRfqId}. Once proposals are received, you will be able to compare prices, delivery times, and award contracts here.
              </p>
            </div>
          ) : (
            <>
              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Quotes */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <span>Quotes Received</span>
                    <Inbox className="size-4 text-[#008779]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                    {comparisonData.metrics.quotesCount}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Supplier proposals evaluated
                  </p>
                </div>

                {/* Lowest Price Bid */}
                <div className="p-4 rounded-xl border border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <span>Lowest Price Bid</span>
                    <DollarSign className="size-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                    {comparisonData.metrics.lowestPrice ? (
                      `${comparisonData.rfq.currency} ${Number(comparisonData.metrics.lowestPrice.price).toLocaleString()}`
                    ) : (
                      "—"
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    {comparisonData.metrics.lowestPrice ? (
                      `${comparisonData.metrics.lowestPrice.vendor} (${comparisonData.metrics.lowestPrice.quoteNo})`
                    ) : (
                      "No bids yet"
                    )}
                  </p>
                </div>

                {/* Fastest Delivery */}
                <div className="p-4 rounded-xl border border-sky-500/30 dark:border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20">
                  <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <span>Fastest Delivery</span>
                    <Zap className="size-4" />
                  </div>
                  <div className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-2 truncate">
                    {comparisonData.metrics.fastestDelivery ? (
                      comparisonData.metrics.fastestDelivery.deliveryTime
                    ) : (
                      "—"
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    {comparisonData.metrics.fastestDelivery ? (
                      `${comparisonData.metrics.fastestDelivery.vendor} (${comparisonData.metrics.fastestDelivery.quoteNo})`
                    ) : (
                      "No delivery data"
                    )}
                  </p>
                </div>

                {/* Awarded Winner */}
                <div
                  className={`p-4 rounded-xl border ${
                    comparisonData.metrics.awardedQuote
                      ? "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span>Contract Status</span>
                    <Trophy className="size-4" />
                  </div>
                  <div className="text-lg font-black mt-2 truncate">
                    {comparisonData.metrics.awardedQuote ? "AWARDED" : "OPEN FOR AWARD"}
                  </div>
                  <p className="text-[11px] truncate mt-0.5">
                    {comparisonData.metrics.awardedQuote
                      ? `Won by ${comparisonData.metrics.awardedQuote.vendor} (${comparisonData.rfq.currency} ${Number(
                          comparisonData.metrics.awardedQuote.price
                        ).toLocaleString()})`
                      : "Pending buyer decision"}
                  </p>
                </div>
              </div>

              {/* RFQ Tender Specification Documents */}
              <FileAttachmentManager
                rfqId={comparisonData.rfq.id}
                title="RFQ Specification Files & BOM Documents"
                readOnly={role !== "buyer" && role !== "admin"}
              />

              {/* Sorting Toolbar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <ArrowUpDown className="size-3.5 text-[#008779]" />
                  <span className="uppercase tracking-wider">Rank Quotes By:</span>
                  <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => handleSortComparison("totalPrice")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        comparisonSortBy === "totalPrice"
                          ? "bg-[#008779] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Lowest Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortComparison("deliveryTime")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        comparisonSortBy === "deliveryTime"
                          ? "bg-[#008779] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Delivery Speed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortComparison("date")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        comparisonSortBy === "date"
                          ? "bg-[#008779] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Submission Date
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOrder = comparisonSortOrder === "asc" ? "desc" : "asc";
                      setComparisonSortOrder(newOrder);
                      if (comparingRfqId) {
                        handleOpenCompareModal(comparingRfqId, comparisonSortBy, newOrder);
                      }
                    }}
                    className="h-8 text-xs font-semibold cursor-pointer border-slate-200 dark:border-slate-700"
                  >
                    <ArrowUpDown className="size-3 mr-1" />
                    <span>Order: {comparisonSortOrder.toUpperCase()}</span>
                  </Button>
                </div>
              </div>

              {/* Side-by-Side Quotation Proposal Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Vendor Quotation Proposals ({comparisonData.quotations.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Ranked by {comparisonSortBy === "totalPrice" ? "Price" : comparisonSortBy === "deliveryTime" ? "Delivery Time" : "Date"} ({comparisonSortOrder})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonData.quotations.map((q) => {
                    const isAwardedWinner = q.status === "ACCEPTED";
                    const isLowestPrice = comparisonData.metrics.lowestPrice?.id === q.id;
                    const isFastest = comparisonData.metrics.fastestDelivery?.id === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                          isAwardedWinner
                            ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-md"
                            : isLowestPrice
                            ? "border-[#008779] bg-teal-50/20 dark:bg-teal-950/20 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isAwardedWinner && (
                                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                                  <Trophy className="size-3" />
                                  <span>WINNING VENDOR</span>
                                </Badge>
                              )}
                              {isLowestPrice && (
                                <Badge className="bg-[#008779] text-white text-[10px] font-bold flex items-center gap-0.5">
                                  <DollarSign className="size-3" />
                                  <span>LOWEST PRICE</span>
                                </Badge>
                              )}
                              {isFastest && (
                                <Badge className="bg-sky-600 text-white text-[10px] font-bold flex items-center gap-0.5">
                                  <Zap className="size-3" />
                                  <span>FASTEST</span>
                                </Badge>
                              )}
                            </div>
                            <Badge
                              variant={
                                q.status === "ACCEPTED"
                                  ? "vendor"
                                  : q.status === "REJECTED"
                                  ? "destructive"
                                  : "buyer"
                              }
                              className="text-[10px] font-bold uppercase"
                            >
                              {q.status}
                            </Badge>
                          </div>

                          {/* Vendor Profile Header */}
                          <div>
                            <h5 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <Building className="size-4 text-slate-400" />
                              <span>{q.vendor?.name || `Vendor #${q.vendorId}`}</span>
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {q.vendor?.email}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-1">
                              <span>{q.quoteNo}</span>
                              {q.revisions && q.revisions.length > 0 && (
                                <span className="text-amber-600 dark:text-amber-400 font-sans font-bold">
                                  • Rev #{q.revisions[0].revisionNo}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price & Delivery Highlights */}
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                Total Quoted Price
                              </span>
                              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                                {q.currency}{" "}
                                {Number(q.totalPriceQuote).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                              <span className="text-slate-500 flex items-center gap-1">
                                <Clock className="size-3" /> Delivery Time:
                              </span>
                              <strong className="text-slate-800 dark:text-slate-200">
                                {q.deliveryTime || "Standard"}
                              </strong>
                            </div>
                          </div>

                          {/* Line items preview */}
                          {q.lineItems && q.lineItems.length > 0 && (
                            <div className="text-[11px] text-slate-500 space-y-1">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                                Itemized Rates ({q.lineItems.length} items):
                              </span>
                              <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                                {q.lineItems.map((li) => (
                                  <div
                                    key={li.id}
                                    className="flex items-center justify-between text-slate-600 dark:text-slate-400"
                                  >
                                    <span className="truncate max-w-[140px]">
                                      {li.rfqLineItem?.name || `Item #${li.rfqLineItemId}`}
                                    </span>
                                    <span className="font-semibold">
                                      {q.currency} {Number(li.unitPrice).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quotation Attachments & Datasheets */}
                          <div className="pt-2">
                            <FileAttachmentManager
                              quotationId={q.id}
                              title="Attached Proposal Documents"
                              readOnly={true}
                            />
                          </div>
                        </div>

                        {/* Card Action: Award Button */}
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                          {isAwardedWinner ? (
                            <div className="w-full py-2 px-3 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                              <CheckCircle className="size-4" />
                              <span>Awarded & Accepted</span>
                            </div>
                          ) : comparisonData.rfq.status === "AWARDED" ? (
                            <div className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-xs text-center">
                              Competing Quote (Closed)
                            </div>
                          ) : role === "buyer" || role === "admin" ? (
                            <Button
                              size="sm"
                              disabled={isAwardingQuoteId === q.id}
                              onClick={() => {
                                setAwardConfirmQuote({
                                  id: q.id,
                                  quoteNo: q.quoteNo,
                                  vendorName: q.vendor?.name || `Vendor #${q.vendorId}`,
                                  price: q.totalPriceQuote,
                                  currency: q.currency,
                                  rfqId: comparisonData.rfq.id,
                                });
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-9 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Trophy className="size-3.5" />
                              <span>Award RFQ Contract</span>
                            </Button>
                          ) : (
                            <div className="w-full py-1.5 text-center text-xs text-slate-400 font-medium">
                              Awaiting Evaluation
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side-by-Side Line Item Pricing Matrix */}
              {comparisonData.lineItemsMatrix && comparisonData.lineItemsMatrix.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Layers className="size-4 text-[#008779]" />
                      <span>Line-by-Line Pricing Matrix</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Side-by-side unit and total cost comparison per item requirement
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900 shadow-xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-3.5 min-w-[200px]">Item Requirement</th>
                          <th className="p-3.5 text-center min-w-[90px]">Qty & Unit</th>
                          {comparisonData.quotations.map((q) => (
                            <th key={q.id} className="p-3.5 min-w-[160px] text-right">
                              <div className="font-extrabold truncate text-slate-900 dark:text-slate-100">
                                {q.vendor?.name || `Vendor #${q.vendorId}`}
                              </div>
                              <div className="text-[10px] font-mono font-normal text-slate-400 lowercase">
                                {q.quoteNo}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {comparisonData.lineItemsMatrix.map((row) => {
                          const prices = Object.values(row.vendorPrices || {})
                            .map((v: any) => Number(v.unitPrice))
                            .filter((p) => !isNaN(p) && p > 0);
                          const minPrice = prices.length ? Math.min(...prices) : null;

                          return (
                            <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                                <div>{row.name}</div>
                                {row.specifications && (
                                  <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                                    {row.specifications}
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5 text-center font-mono text-slate-700 dark:text-slate-300">
                                {Number(row.quantity).toLocaleString()} {row.unit}
                              </td>
                              {comparisonData.quotations.map((q) => {
                                const vp = row.vendorPrices ? (row.vendorPrices as any)[q.vendorId] : null;
                                const isMin = vp && Number(vp.unitPrice) === minPrice;

                                return (
                                  <td key={q.id} className="p-3.5 text-right font-mono">
                                    {vp ? (
                                      <div>
                                        <div
                                          className={`font-bold ${
                                            isMin
                                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-sm inline-block"
                                              : "text-slate-800 dark:text-slate-200"
                                          }`}
                                        >
                                          {q.currency} {Number(vp.unitPrice).toLocaleString()} / {row.unit}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                          Total: {q.currency} {Number(vp.totalPrice).toLocaleString()}
                                        </div>
                                        {vp.notes && (
                                          <div
                                            className="text-[10px] font-sans italic text-slate-500 mt-0.5 max-w-[150px] ml-auto truncate"
                                            title={vp.notes}
                                          >
                                            &ldquo;{vp.notes}&rdquo;
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic font-sans">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            Close Studio
          </Button>
        </div>
      </div>
    </div>
  );
}
