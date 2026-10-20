"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import {
  FileText,
  ArrowUpDown,
  Eye,
  Trophy,
  Edit,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { UserRole, RFQ, Quotation } from "@/types/rfq";

export interface OverviewTableProps {
  sortedDashboardItems: any[];
  isLoadingData: boolean;
  role: UserRole;
  handleSort: (field: string) => void;
  handleResetFilters: () => void;
  setSelectedDetailQuote: (quote: any) => void;
  setSelectedDetailRfq: (rfq: any) => void;
  handleOpenCompareModal: (rfqId: number) => void;
  handleUpdateQuoteStatus: (quoteId: number, status: string) => void;
  setAwardConfirmQuote: (info: any) => void;
  handleStartEdit: (rfq: any) => void;
  handleOpenQuoteModal: (rfq: RFQ) => void;
  handleOpenReviseModal: (quote: Quotation) => void;
}

export function OverviewTable({
  sortedDashboardItems,
  isLoadingData,
  role,
  handleSort,
  handleResetFilters,
  setSelectedDetailQuote,
  setSelectedDetailRfq,
  handleOpenCompareModal,
  handleUpdateQuoteStatus,
  setAwardConfirmQuote,
  handleStartEdit,
  handleOpenQuoteModal,
  handleOpenReviseModal,
}: OverviewTableProps) {
  // Pagination State: default 10 rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalItems = sortedDashboardItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalItems, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = sortedDashboardItems.slice(startIndex, endIndex);

  // Helper for generating page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full flex flex-col">
      {/* Table with Solid Teal Header `#008779` */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#008779] text-white text-xs sm:text-sm font-bold uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort("code")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>
                    {role === "vendor"
                      ? "REF / BID #"
                      : role === "admin"
                      ? "REF / QUOTATION #"
                      : "QUOTATION #"}
                  </span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("dateRaw")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>DATE</span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("product")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>RFQ REQUIREMENT</span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("location")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>LOCATION</span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("company")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>
                    {role === "vendor"
                      ? "BUYER / CLIENT"
                      : role === "admin"
                      ? "BUYER / SUPPLIER"
                      : "SUPPLIER / VENDOR"}
                  </span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("category")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>CATEGORY</span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("sumInsured")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {role === "vendor"
                      ? "MY BID / BUDGET"
                      : role === "admin"
                      ? "QUOTED / BUDGET"
                      : "QUOTED AMOUNT"}
                  </span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th
                onClick={() => handleSort("duration")}
                className="py-4 px-4 cursor-pointer hover:bg-[#00766a] transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>DELIVERY TIMELINE</span>
                  <ArrowUpDown className="size-3.5 opacity-80" />
                </div>
              </th>
              <th className="py-4 px-4 text-center whitespace-nowrap">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-[15px] uppercase">
            {isLoadingData ? (
              <tr>
                <td colSpan={9} className="p-0">
                  <TableSkeleton columns={9} rows={5} />
                </td>
              </tr>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                >
                  {/* QUOTATION / REF # */}
                  <td className="py-4.5 px-4 font-mono font-extrabold text-sm md:text-base text-slate-900 dark:text-slate-100 whitespace-nowrap uppercase tracking-tight">
                    {item.code.toUpperCase()}
                  </td>

                  {/* DATE */}
                  <td className="py-4.5 px-4 font-semibold text-sm md:text-[15px] text-slate-700 dark:text-slate-300 whitespace-nowrap uppercase">
                    {item.dateFormatted.toUpperCase()}
                  </td>

                  {/* RFQ REQUIREMENT */}
                  <td className="py-4.5 px-4 max-w-[280px]">
                    <div
                      className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 truncate uppercase"
                      title={item.product}
                    >
                      {item.product.toUpperCase()}
                    </div>
                    <div className="text-xs md:text-[13px] text-slate-500 dark:text-slate-400 mt-1 truncate uppercase font-semibold">
                      {item.type === "QUOTATION" ? (
                        <span>
                          RFQ #{item.rawQuote?.rfqId || item.rawRfq?.id} •{" "}
                          {item.rawQuote?.lineItems?.length || 1} LINE ITEM(S)
                        </span>
                      ) : (
                        <span>
                          RFQ #{item.rawRfq?.id} •{" "}
                          {item.rawRfq?.lineItems?.length || 1} LINE ITEM(S)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* LOCATION */}
                  <td className="py-4.5 px-4 font-semibold text-sm md:text-[15px] text-slate-700 dark:text-slate-300 whitespace-nowrap uppercase">
                    {item.location.toUpperCase()}
                  </td>

                  {/* SUPPLIER / VENDOR */}
                  <td className="py-4.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2 font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 uppercase">
                      <span
                        className={`text-base leading-none ${
                          item.status === "ACCEPTED"
                            ? "text-[#008779] dark:text-[#00a896]"
                            : item.status === "SHORTLISTED"
                            ? "text-[#008779] dark:text-[#00a896]"
                            : item.status === "SUBMITTED"
                            ? "text-amber-500"
                            : "text-slate-400"
                        }`}
                      >
                        ●
                      </span>
                      <span>{item.company.toUpperCase()}</span>
                    </span>
                  </td>

                  {/* CATEGORY */}
                  <td className="py-4.5 px-4 whitespace-nowrap">
                    <span className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs md:text-[13px] uppercase tracking-wide border border-slate-200/80 dark:border-slate-700">
                      {item.category.toUpperCase()}
                    </span>
                  </td>

                  {/* QUOTED AMOUNT */}
                  <td className="py-4.5 px-4 font-mono font-extrabold text-sm md:text-base text-slate-900 dark:text-slate-100 text-right whitespace-nowrap uppercase">
                    {item.sumInsured.toUpperCase()}
                  </td>

                  {/* DELIVERY TIMELINE */}
                  <td className="py-4.5 px-4 text-slate-800 dark:text-slate-200 text-center font-bold text-sm md:text-[15px] whitespace-nowrap uppercase">
                    {item.duration.toUpperCase()}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4.5 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {/* Status Pill Badge */}
                      {item.status === "ACCEPTED" ? (
                        <span className="bg-[#008779] text-white font-extrabold px-3.5 py-1.5 text-xs md:text-[13px] uppercase rounded-md shadow-2xs tracking-wider">
                          ACCEPTED
                        </span>
                      ) : item.status === "SHORTLISTED" ? (
                        <span className="border border-[#008779]/50 bg-[#008779]/10 text-[#008779] dark:bg-[#008779]/20 dark:text-[#00a896] font-extrabold px-3 py-1.5 text-xs md:text-[13px] uppercase rounded-md inline-flex items-center gap-1.5 shadow-2xs tracking-wider">
                          <span className="text-[#008779] dark:text-[#00a896] text-sm leading-none">●</span>
                          <span>SHORTLISTED</span>
                        </span>
                      ) : item.status === "SUBMITTED" ? (
                        <span className="border border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-extrabold px-3 py-1.5 text-xs md:text-[13px] uppercase rounded-md inline-flex items-center gap-1.5 shadow-2xs tracking-wider">
                          <span className="text-amber-500 text-sm leading-none">●</span>
                          <span>IN PROCESS</span>
                        </span>
                      ) : item.status === "PUBLISHED" ? (
                        <span className="border border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-extrabold px-3 py-1.5 text-xs md:text-[13px] uppercase rounded-md inline-flex items-center gap-1.5 shadow-2xs tracking-wider">
                          <span className="text-emerald-500 text-sm leading-none">●</span>
                          <span>OPEN FOR BIDS</span>
                        </span>
                      ) : (
                        <span className="border border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-extrabold px-3 py-1.5 text-xs md:text-[13px] uppercase rounded-md inline-flex items-center gap-1.5 shadow-2xs tracking-wider">
                          <span className="text-slate-400 text-sm leading-none">●</span>
                          <span>{item.statusLabel.toUpperCase()}</span>
                        </span>
                      )}

                      {/* Eye Action Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (item.type === "QUOTATION" && item.rawQuote) {
                            setSelectedDetailQuote(item.rawQuote);
                          } else {
                            setSelectedDetailRfq(
                              (item as any).rawRfq || {
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                location: item.location,
                                currency: item.currency,
                                optionalBudget: item.sumInsured,
                                deadline: item.dateRaw,
                                status: item.status,
                                lineItems: (item as any).lineItems || [],
                                quotations: (item as any).quotations || [],
                              }
                            );
                          }
                        }}
                        className="h-8 w-8 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="VIEW DETAILS"
                      >
                        <Eye className="size-4.5" />
                      </Button>

                      {/* Quick Actions for Buyer & Admin */}
                      {(role === "buyer" || role === "admin") && item.type === "QUOTATION" && item.rawQuote && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCompareModal(item.rawQuote!.rfqId)}
                          className="h-8 px-2.5 text-xs md:text-[13px] font-bold uppercase text-[#008779] dark:text-[#00a896] border-[#008779]/40 dark:border-[#008779]/50 hover:bg-[#008779]/10 cursor-pointer tracking-wider flex items-center gap-1 shadow-2xs"
                          title="COMPARE ALL QUOTES FOR THIS RFQ"
                        >
                          <ArrowUpDown className="size-3.5" />
                          <span>COMPARE</span>
                        </Button>
                      )}
                      {(role === "buyer" || role === "admin") && item.type === "RFQ" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCompareModal(item.id)}
                          className="h-8 px-2.5 text-xs md:text-[13px] font-bold uppercase text-[#008779] dark:text-[#00a896] border-[#008779]/40 dark:border-[#008779]/50 hover:bg-[#008779]/10 cursor-pointer tracking-wider flex items-center gap-1 shadow-2xs"
                          title="COMPARE QUOTATIONS SIDE-BY-SIDE"
                        >
                          <ArrowUpDown className="size-3.5" />
                          <span>COMPARE</span>
                        </Button>
                      )}
                      {(role === "buyer" || role === "admin") && item.type === "QUOTATION" && item.status === "SUBMITTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuoteStatus(item.id, "SHORTLISTED")}
                          className="h-8 px-3 text-xs md:text-[13px] font-bold uppercase text-[#008779] dark:text-[#00a896] border-[#008779]/40 dark:border-[#008779]/50 hover:bg-[#008779]/10 dark:hover:bg-[#008779]/20 cursor-pointer tracking-wider"
                          title="SHORTLIST QUOTE"
                        >
                          SHORTLIST
                        </Button>
                      )}
                      {(role === "buyer" || role === "admin") && item.type === "QUOTATION" && (item.status === "SHORTLISTED" || item.status === "SUBMITTED") && item.rawQuote && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setAwardConfirmQuote({
                              id: item.rawQuote!.id,
                              quoteNo: item.rawQuote!.quoteNo,
                              vendorName: item.rawQuote!.vendor?.name || item.contactName,
                              price: item.rawQuote!.totalPriceQuote,
                              currency: item.rawQuote!.currency,
                              rfqId: item.rawQuote!.rfqId,
                            });
                          }}
                          className="h-8 px-3 text-xs md:text-[13px] font-extrabold uppercase bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer tracking-wider shadow-2xs flex items-center gap-1"
                          title="ACCEPT & AWARD CONTRACT"
                        >
                          <Trophy className="size-3.5 text-white" />
                          <span>AWARD</span>
                        </Button>
                      )}
                      {(role === "buyer" || role === "admin") && item.type === "RFQ" && item.status === "DRAFT" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit((item as any).rawRfq)}
                          className="h-8 w-8 p-0 rounded-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                          title="EDIT DRAFT"
                        >
                          <Edit className="size-4" />
                        </Button>
                      )}

                      {/* Quick Actions for Vendor */}
                      {role === "vendor" && item.type === "RFQ" && item.status === "PUBLISHED" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenQuoteModal(item.rawRfq)}
                          className="h-8 px-3.5 text-xs md:text-[13px] font-extrabold uppercase bg-[#008779] hover:bg-[#007063] text-white cursor-pointer shadow-2xs flex items-center gap-1.5 tracking-wider"
                          title="SUBMIT QUOTATION FOR THIS TENDER"
                        >
                          <DollarSign className="size-3.5 text-white stroke-[2.5]" />
                          <span>QUOTE</span>
                        </Button>
                      )}

                      {/* Revise Quotation Action for Vendor & Admin */}
                      {(role === "vendor" || role === "admin") && item.type === "QUOTATION" && item.status !== "ACCEPTED" && item.status !== "REJECTED" && item.rawQuote && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReviseModal(item.rawQuote)}
                          className="h-8 px-3 text-xs md:text-[13px] font-bold uppercase text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer tracking-wider flex items-center gap-1 shadow-2xs"
                          title="REVISE QUOTATION PRICING / TERMS"
                        >
                          <Edit className="size-3.5" />
                          <span>REVISE</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-14 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <FileText className="size-9 text-slate-300 dark:text-slate-600" />
                    <p className="font-extrabold text-base uppercase text-slate-800 dark:text-slate-200">
                      NO IN-PROCESS QUOTATIONS FOUND
                    </p>
                    <p className="text-xs md:text-sm uppercase font-semibold text-slate-500 dark:text-slate-400">
                      TRY ADJUSTING YOUR SEARCH QUERY OR RESET FILTERS.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="mt-3 text-xs md:text-sm font-bold uppercase tracking-wider"
                    >
                      RESET FILTERS
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Bar */}
      {totalItems > 0 && (
        <div className="px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Rows per page selector + Showing range */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rows per page:
              </span>
              <div className="relative inline-block">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 pl-3 pr-8 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#008779] appearance-none cursor-pointer shadow-2xs transition-colors hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
                <ChevronDown className="size-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Showing{" "}
              <strong className="font-bold text-slate-900 dark:text-slate-100">
                {startIndex + 1}
              </strong>{" "}
              –{" "}
              <strong className="font-bold text-slate-900 dark:text-slate-100">
                {Math.min(endIndex, totalItems)}
              </strong>{" "}
              of{" "}
              <strong className="font-bold text-slate-900 dark:text-slate-100">
                {totalItems}
              </strong>
            </span>
          </div>

          {/* Right: Page Navigation Buttons with Numbered Pages */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-end w-full md:w-auto">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isLoadingData}
              className="h-8 w-8 p-0 rounded-md border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              title="First Page"
            >
              <ChevronsLeft className="size-4" />
            </Button>

            {/* Prev Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoadingData}
              className="h-8 px-2.5 rounded-md border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Numbered Page Buttons */}
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs font-bold text-slate-400 select-none"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${pageNum}`}
                  size="sm"
                  onClick={() => setCurrentPage(Number(pageNum))}
                  disabled={isLoadingData}
                  className={`h-8 min-w-[32px] px-2 text-xs font-extrabold rounded-md cursor-pointer transition-all ${
                    currentPage === pageNum
                      ? "bg-[#008779] text-white hover:bg-[#007063] shadow-2xs"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {pageNum}
                </Button>
              )
            )}

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoadingData}
              className="h-8 px-2.5 rounded-md border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-3.5" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isLoadingData}
              className="h-8 w-8 p-0 rounded-md border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Last Page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
