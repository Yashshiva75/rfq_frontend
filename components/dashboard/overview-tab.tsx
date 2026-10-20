"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { TableSearchBar } from "@/components/search/table-search-bar";
import { OverviewTable } from "@/components/dashboard/overview-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Tag,
  Shield,
  DollarSign,
  Filter,
  RotateCcw,
  X,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { UserRole, RFQ, Quotation } from "@/types/rfq";

export interface OverviewTabProps {
  role: UserRole;
  isLoadingData: boolean;
  rfqsList: RFQ[];
  quotationsList: Quotation[];
  categoriesList: Array<{ id: number; name: string }>;
  allDashboardItems: any[];
  inProcessQuotes: any[];
  sortedDashboardItems: any[];
  availableLocations: string[];
  activeFiltersCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterLocation: string;
  setFilterLocation: (loc: string) => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  filterOpenOnly: boolean;
  setFilterOpenOnly: (open: boolean) => void;
  filterMinBudget: string;
  setFilterMinBudget: (b: string) => void;
  filterMaxBudget: string;
  setFilterMaxBudget: (b: string) => void;
  isFiltersExpanded: boolean;
  setIsFiltersExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchingBackend: boolean;
  rfqStatusFilter: string;
  setRfqStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  sortField: string;
  sortOrder: "asc" | "desc";
  handleSort: (field: string) => void;
  handleResetFilters: () => void;
  handleExportCsv: () => void;
  handleOpenCreateRfq: () => void;
  handleStartEdit: (rfq: any) => void;
  handlePublishRfqDirect: (id: number) => void;
  handleDeleteRfq: (id: number) => void;
  handleOpenCompareModal: (rfqId: number) => void;
  handleOpenQuoteModal: (rfq: RFQ) => void;
  handleOpenReviseModal: (quote: Quotation) => void;
  setSelectedDetailQuote: (quote: any) => void;
  setSelectedDetailRfq: (rfq: any) => void;
  setAwardConfirmQuote: (info: any) => void;
  handleUpdateQuoteStatus: (quoteId: number, status: string) => void;
  setActiveTab: (tab: string) => void;
}

export function OverviewTab({
  role,
  isLoadingData,
  rfqsList,
  quotationsList,
  categoriesList,
  allDashboardItems,
  inProcessQuotes,
  sortedDashboardItems,
  availableLocations,
  activeFiltersCount,
  searchQuery,
  setSearchQuery,
  filterLocation,
  setFilterLocation,
  filterCategory,
  setFilterCategory,
  filterOpenOnly,
  setFilterOpenOnly,
  filterMinBudget,
  setFilterMinBudget,
  filterMaxBudget,
  setFilterMaxBudget,
  isFiltersExpanded,
  setIsFiltersExpanded,
  isSearchingBackend,
  rfqStatusFilter,
  setRfqStatusFilter,
  sortField,
  sortOrder,
  handleSort,
  handleResetFilters,
  handleExportCsv,
  handleOpenCreateRfq,
  handleStartEdit,
  handlePublishRfqDirect,
  handleDeleteRfq,
  handleOpenCompareModal,
  handleOpenQuoteModal,
  handleOpenReviseModal,
  setSelectedDetailQuote,
  setSelectedDetailRfq,
  setAwardConfirmQuote,
  handleUpdateQuoteStatus,
  setActiveTab,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Header: Title, Subtitle, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {role === "vendor"
              ? "Vendor Quotation Dashboard"
              : role === "admin"
              ? "Admin Quotation Dashboard"
              : "Quotation Dashboard"}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {role === "vendor"
              ? "View all in-process bids, awarded contracts & open procurement tenders"
              : role === "admin"
              ? "Oversee all in-process quotations, procurement tenders & awarded contracts"
              : "View all in-process quotations & procurement tenders"}
          </p>
        </div>
        {role === "buyer" ? (
          <Button
            onClick={handleOpenCreateRfq}
            className="bg-[#008779] hover:bg-[#007063] text-white font-bold text-xs uppercase px-4 py-2.5 rounded-md flex items-center gap-1.5 shadow-sm tracking-wider cursor-pointer transition-colors shrink-0"
          >
            <Plus className="size-4 text-white stroke-[2.5]" />
            <span>NEW RFQ</span>
          </Button>
        ) : role === "admin" ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleOpenCreateRfq}
              className="bg-[#008779] hover:bg-[#007063] text-white font-bold text-xs uppercase px-4 py-2.5 rounded-md flex items-center gap-1.5 shadow-sm tracking-wider cursor-pointer transition-colors shrink-0"
            >
              <Plus className="size-4 text-white stroke-[2.5]" />
              <span>NEW RFQ</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRfqStatusFilter((prev) => (prev === "PUBLISHED" ? "ALL" : "PUBLISHED"));
              }}
              className="border-[#008779]/40 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 font-bold text-xs uppercase px-3 py-2.5 rounded-md flex items-center gap-1.5 shadow-2xs tracking-wider cursor-pointer transition-colors shrink-0"
            >
              <FolderOpen className="size-4" />
              <span>OPEN TENDERS ({rfqsList.filter((r) => r.status === "PUBLISHED").length})</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => {
                const firstPublished = rfqsList.find((r) => r.status === "PUBLISHED");
                if (firstPublished) {
                  handleOpenQuoteModal(firstPublished);
                } else {
                  setActiveTab("tenders");
                }
              }}
              className="bg-[#008779] hover:bg-[#007063] text-white font-bold text-xs uppercase px-4 py-2.5 rounded-md flex items-center gap-1.5 shadow-sm tracking-wider cursor-pointer transition-colors shrink-0"
            >
              <Plus className="size-4 text-white stroke-[2.5]" />
              <span>SUBMIT QUOTE</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRfqStatusFilter((prev) => (prev === "PUBLISHED" ? "ALL" : "PUBLISHED"));
              }}
              className="border-[#008779]/40 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 font-bold text-xs uppercase px-3 py-2.5 rounded-md flex items-center gap-1.5 shadow-2xs tracking-wider cursor-pointer transition-colors shrink-0"
            >
              <FolderOpen className="size-4" />
              <span>OPEN TENDERS ({rfqsList.filter((r) => r.status === "PUBLISHED").length})</span>
            </Button>
          </div>
        )}
      </div>

      {/* 4 Top KPI Metric Cards matching reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
        {/* Card 1: ALL IN-PROCESS */}
        <div
          onClick={() => setRfqStatusFilter("ALL")}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition-all hover:shadow-sm cursor-pointer ${
            rfqStatusFilter === "ALL"
              ? "border-[#008779] ring-1 ring-[#008779]"
              : "border-slate-200/90 dark:border-slate-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start gap-3">
              <span className="size-2 rounded-full bg-emerald-500 inline-block" />
              <div className="size-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                <FileText className="size-5" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {role === "vendor" ? "ALL BIDS & TENDERS" : role === "admin" ? "ALL RFQS & BIDS" : "ALL IN-PROCESS"}
              </span>
              {isLoadingData ? (
                <div className="flex justify-end py-1">
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              ) : (
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                  {allDashboardItems.length}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isLoadingData ? (
              <Skeleton className="h-3.5 w-16 rounded" />
            ) : (
              <span>Count: {allDashboardItems.length}</span>
            )}
          </div>
        </div>

        {/* Card 2: IN PROGRESS / SUBMITTED BIDS */}
        <div
          onClick={() => setRfqStatusFilter("SUBMITTED")}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition-all hover:shadow-sm cursor-pointer ${
            rfqStatusFilter === "SUBMITTED"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-slate-200/90 dark:border-slate-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="size-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50 mt-5">
              <Clock className="size-5" />
            </div>
            <div className="text-right space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {role === "vendor" ? "SUBMITTED BIDS" : role === "admin" ? "SUBMITTED BIDS" : "IN PROGRESS"}
              </span>
              {isLoadingData ? (
                <div className="flex justify-end py-1">
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              ) : (
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                  {inProcessQuotes.filter((q) => q.status === "SUBMITTED").length}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isLoadingData ? (
              <Skeleton className="h-3.5 w-16 rounded" />
            ) : (
              <span>Count: {inProcessQuotes.filter((q) => q.status === "SUBMITTED").length}</span>
            )}
          </div>
        </div>

        {/* Card 3: SHORTLISTED */}
        <div
          onClick={() => setRfqStatusFilter("SHORTLISTED")}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition-all hover:shadow-sm cursor-pointer ${
            rfqStatusFilter === "SHORTLISTED"
              ? "border-[#008779] ring-1 ring-[#008779]"
              : "border-slate-200/90 dark:border-slate-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="size-11 rounded-lg bg-[#008779]/10 dark:bg-[#008779]/20 text-[#008779] dark:text-[#00a896] flex items-center justify-center border border-[#008779]/20 dark:border-[#008779]/40 mt-5">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="text-right space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {role === "vendor" ? "SHORTLISTED BIDS" : "SHORTLISTED"}
              </span>
              {isLoadingData ? (
                <div className="flex justify-end py-1">
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              ) : (
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                  {inProcessQuotes.filter((q) => q.status === "SHORTLISTED").length}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isLoadingData ? (
              <Skeleton className="h-3.5 w-16 rounded" />
            ) : (
              <span>Count: {inProcessQuotes.filter((q) => q.status === "SHORTLISTED").length}</span>
            )}
          </div>
        </div>

        {/* Card 4: ACCEPTED */}
        <div
          onClick={() => setRfqStatusFilter("ACCEPTED")}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition-all hover:shadow-sm cursor-pointer ${
            rfqStatusFilter === "ACCEPTED"
              ? "border-[#008779] ring-1 ring-[#008779]"
              : "border-slate-200/90 dark:border-slate-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="size-11 rounded-lg bg-[#008779]/10 text-[#008779] flex items-center justify-center border border-[#008779]/20 mt-5">
              <TrendingUp className="size-5" />
            </div>
            <div className="text-right space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {role === "vendor" ? "AWARDED CONTRACTS" : "ACCEPTED"}
              </span>
              {isLoadingData ? (
                <div className="flex justify-end py-1">
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              ) : (
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                  {inProcessQuotes.filter((q) => q.status === "ACCEPTED").length}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isLoadingData ? (
              <Skeleton className="h-3.5 w-16 rounded" />
            ) : (
              <span>Count: {inProcessQuotes.filter((q) => q.status === "ACCEPTED").length}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Card: Search Input, Action Buttons, and Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Actions Bar with Instant Autocomplete & Comprehensive Filters */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Table Search Input with Instant Autocomplete Suggestions */}
            <div className="w-full sm:max-w-xl">
              <TableSearchBar
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                onSelectRfq={(rfq) => {
                  const targetRfq = rfqsList.find((r) => r.id === rfq.id);
                  if (targetRfq) {
                    setSelectedDetailRfq(targetRfq);
                  }
                }}
                onSelectCategory={(catName) => {
                  setFilterCategory(catName);
                }}
                onSelectQuote={(quote) => {
                  const targetQuote = quotationsList.find((q) => q.id === quote.id);
                  if (targetQuote) {
                    setSelectedDetailQuote(targetQuote);
                  }
                }}
                placeholder="SEARCH BY RFQ #, QUOTATION #, SUPPLIER, REQUIREMENT, CATEGORY, OR LOCATION..."
              />
            </div>

            {/* Action Buttons: Filters Toggle & Reset */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              <Button
                variant={isFiltersExpanded ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className={`h-11 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-2 transition-all ${
                  isFiltersExpanded
                    ? "bg-[#008779] text-white hover:bg-[#00766a]"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Filter className="size-4" />
                <span>FILTERS</span>
                {activeFiltersCount > 0 && (
                  <span className="size-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-11 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <RotateCcw className="size-4 text-slate-500" />
                <span>RESET FILTERS</span>
              </Button>
            </div>
          </div>

          {/* Expandable Comprehensive Filters Panel */}
          {isFiltersExpanded && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Location Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="size-3 text-[#008779]" />
                  Location
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#008779]"
                >
                  <option value="ALL">All Locations</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="size-3 text-[#008779]" />
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#008779]"
                >
                  <option value="ALL">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="size-3 text-[#008779]" />
                  Status
                </label>
                <select
                  value={rfqStatusFilter}
                  onChange={(e) => setRfqStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#008779]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published / Open</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted Quotes</option>
                  <option value="SHORTLISTED">Shortlisted Quotes</option>
                  <option value="ACCEPTED">Accepted / Awarded</option>
                  <option value="CLOSED">Closed</option>
                  <option value="AWARDED">Awarded</option>
                </select>
              </div>

              {/* Budget Range (Min Budget) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="size-3 text-[#008779]" />
                  Min Budget
                </label>
                <input
                  type="number"
                  value={filterMinBudget}
                  onChange={(e) => setFilterMinBudget(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#008779]"
                />
              </div>

              {/* Open RFQs Only Toggle */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setFilterOpenOnly(!filterOpenOnly)}
                  className={`h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    filterOpenOnly
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <CheckCircle2
                    className={`size-3.5 ${
                      filterOpenOnly ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  <span>Open RFQs Only</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Chips & Results Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Showing{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {sortedDashboardItems.length}
                </strong>{" "}
                of {allDashboardItems.length} records
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#008779]/10 text-[#008779] dark:bg-[#008779]/20 border border-[#008779]/30">
                  Keyword: &ldquo;{searchQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {filterLocation !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Location: {filterLocation}
                  <button
                    type="button"
                    onClick={() => setFilterLocation("ALL")}
                    className="cursor-pointer hover:text-blue-950 dark:hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {filterCategory !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Category: {filterCategory}
                  <button
                    type="button"
                    onClick={() => setFilterCategory("ALL")}
                    className="cursor-pointer hover:text-indigo-950 dark:hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {rfqStatusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Status: {rfqStatusFilter}
                  <button
                    type="button"
                    onClick={() => setRfqStatusFilter("ALL")}
                    className="cursor-pointer hover:text-amber-950 dark:hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {filterOpenOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Open RFQs Only
                  <button
                    type="button"
                    onClick={() => setFilterOpenOnly(false)}
                    className="cursor-pointer hover:text-emerald-950 dark:hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {filterMinBudget && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Min Budget: {filterMinBudget}
                  <button
                    type="button"
                    onClick={() => setFilterMinBudget("")}
                    className="cursor-pointer hover:text-purple-950 dark:hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer ml-1"
                >
                  Clear all
                </button>
              )}
            </div>

            {isSearchingBackend && (
              <div className="flex items-center gap-1 text-[11px] text-[#008779] font-medium animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                <span>Syncing backend...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quotations & RFQs Table */}
        <OverviewTable
          sortedDashboardItems={sortedDashboardItems}
          isLoadingData={isLoadingData}
          role={role}
          handleSort={handleSort}
          handleResetFilters={handleResetFilters}
          setSelectedDetailQuote={setSelectedDetailQuote}
          setSelectedDetailRfq={setSelectedDetailRfq}
          handleOpenCompareModal={handleOpenCompareModal}
          handleUpdateQuoteStatus={handleUpdateQuoteStatus}
          setAwardConfirmQuote={setAwardConfirmQuote}
          handleStartEdit={handleStartEdit}
          handleOpenQuoteModal={handleOpenQuoteModal}
          handleOpenReviseModal={handleOpenReviseModal}
        />
      </div>

      {/* Procurement Footer */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 py-3 font-medium">
        © 2026 Enterprise RFQ Procurement System - Real-Time Bidding & Sourcing Engine
      </div>
    </div>
  );
}
