"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Loader2,
  FileText,
  Tag,
  DollarSign,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  GlobalSearchResults,
  GlobalSearchRfqItem,
  GlobalSearchCategoryItem,
  GlobalSearchQuoteItem,
} from "@/types/rfq";

interface GlobalSearchBarProps {
  onSelectRfq?: (rfqId: number) => void;
  onSelectQuote?: (quoteId: number) => void;
  onSelectCategory?: (categoryName: string) => void;
  placeholder?: string;
  className?: string;
}

export function GlobalSearchBar({
  onSelectRfq,
  onSelectQuote,
  onSelectCategory,
  placeholder = "Search RFQs, Line Items, Categories, or Quotes... (⌘K)",
  className = "",
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to dismiss results popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search call to /v1/search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchGlobal(query.trim(), 8);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results &&
    (results.rfqs.length > 0 ||
      results.categories.length > 0 ||
      results.quotations.length > 0);

  return (
    <div ref={searchContainerRef} className={`relative w-full max-w-xl ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-20 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/30 focus:border-[#008779] transition-all"
        />

        {/* Right Icons: Spinner / Clear & Keyboard Hint */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && <Loader2 className="size-3.5 animate-spin text-[#008779]" />}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                setIsOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 select-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Instant Dropdown Autocomplete Menu */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[480px] overflow-y-auto">
          {isLoading && !results && (
            <div className="flex items-center justify-center p-8 text-xs text-slate-500 gap-2">
              <Loader2 className="size-4 animate-spin text-[#008779]" />
              <span>Searching multi-entity database...</span>
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="size-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No matches found for &quot;{query}&quot;
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching by tender requirement, quotation #, supplier, or location.
              </p>
            </div>
          )}

          {hasResults && (
            <div className="p-3 space-y-4">
              {/* Category 1: RFQ Tenders */}
              {results.rfqs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3 text-[#008779]" />
                      <span>RFQ Tenders ({results.rfqs.length})</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {results.rfqs.map((rfq) => (
                      <button
                        key={rfq.id}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          if (onSelectRfq) onSelectRfq(rfq.id);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              RFQ-{rfq.id}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#008779] transition-colors">
                              {rfq.title}
                            </span>
                            <Badge
                              variant={
                                rfq.status === "PUBLISHED"
                                  ? "buyer"
                                  : rfq.status === "AWARDED"
                                  ? "vendor"
                                  : "secondary"
                              }
                              className="text-[9px] px-1.5 py-0"
                            >
                              {rfq.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {rfq.location && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="size-2.5" />
                                {rfq.location}
                              </span>
                            )}
                            {rfq.categories && rfq.categories.length > 0 && (
                              <span>• {rfq.categories.join(", ")}</span>
                            )}
                            {rfq.lineItems && rfq.lineItems.length > 0 && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                • Match: {rfq.lineItems.map((li) => li.name).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="size-4 text-slate-300 dark:text-slate-600 group-hover:text-[#008779] shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Quotations & Bids */}
              {results.quotations.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="size-3 text-emerald-600" />
                      <span>Quotations & Bids ({results.quotations.length})</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {results.quotations.map((quote) => (
                      <button
                        key={quote.id}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          if (onSelectQuote) onSelectQuote(quote.id);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                              {quote.quoteNo}
                            </span>
                            <Badge
                              variant={
                                quote.status === "ACCEPTED"
                                  ? "vendor"
                                  : quote.status === "SHORTLISTED"
                                  ? "buyer"
                                  : "secondary"
                              }
                              className="text-[9px] px-1.5 py-0"
                            >
                              {quote.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            For: {quote.rfq?.title || `RFQ #${quote.rfq?.id}`} • Total:{" "}
                            {Number(quote.totalPriceQuote).toLocaleString()}
                          </p>
                        </div>

                        <ChevronRight className="size-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Categories & Sectors */}
              {results.categories.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Tag className="size-3 text-purple-600" />
                      <span>Categories ({results.categories.length})</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 px-2">
                    {results.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          if (onSelectCategory) onSelectCategory(cat.name);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#008779]/10 hover:text-[#008779] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          {cat.rfqCount} tenders
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Footer hint */}
          <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between select-none">
            <span>Press ESC to exit</span>
            <span className="font-mono text-[#008779]">Live API Instant Search</span>
          </div>
        </div>
      )}
    </div>
  );
}
