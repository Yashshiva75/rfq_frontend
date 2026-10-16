"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Loader2,
  FileText,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  GlobalSearchResults,
  GlobalSearchRfqItem,
  GlobalSearchCategoryItem,
  GlobalSearchQuoteItem,
} from "@/types/rfq";

interface TableSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSelectRfq?: (rfq: GlobalSearchRfqItem) => void;
  onSelectQuote?: (quote: GlobalSearchQuoteItem) => void;
  onSelectCategory?: (categoryName: string) => void;
  placeholder?: string;
  className?: string;
}

export function TableSearchBar({
  value,
  onChange,
  onSelectRfq,
  onSelectQuote,
  onSelectCategory,
  placeholder = "SEARCH BY RFQ #, QUOTATION #, SUPPLIER, REQUIREMENT, CATEGORY, OR LOCATION...",
  className = "",
}: TableSearchBarProps) {
  const [suggestions, setSuggestions] = useState<GlobalSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query for autocomplete suggestions
  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchGlobal(trimmed, 6);
        setSuggestions(data);
        if (
          data &&
          (data.rfqs?.length > 0 ||
            data.categories?.length > 0 ||
            data.quotations?.length > 0)
        ) {
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Table search autocomplete error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  const hasSuggestions =
    suggestions &&
    ((suggestions.rfqs && suggestions.rfqs.length > 0) ||
      (suggestions.categories && suggestions.categories.length > 0) ||
      (suggestions.quotations && suggestions.quotations.length > 0));

  const handleSelectRfqItem = (rfq: GlobalSearchRfqItem) => {
    setIsOpen(false);
    onChange(rfq.title);
    if (onSelectRfq) {
      onSelectRfq(rfq);
    }
  };

  const handleSelectCategoryItem = (cat: GlobalSearchCategoryItem) => {
    setIsOpen(false);
    onChange(cat.name);
    if (onSelectCategory) {
      onSelectCategory(cat.name);
    }
  };

  const handleSelectQuoteItem = (quote: GlobalSearchQuoteItem) => {
    setIsOpen(false);
    onChange(quote.quoteNo || `Q-${quote.id}`);
    if (onSelectQuote) {
      onSelectQuote(quote);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (value.trim().length >= 2 && hasSuggestions) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-16 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:uppercase focus:outline-none focus:ring-2 focus:ring-[#008779]/40 focus:border-[#008779] transition-all uppercase"
        />

        {/* Clear & Loading Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="size-4 animate-spin text-[#008779]" />
          )}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setSuggestions(null);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Instant Autocomplete Suggestions Floating Dropdown */}
      {isOpen && hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[460px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header summary */}
          <div className="p-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#008779]" />
              Instant matches for &ldquo;
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {value}
              </strong>
              &rdquo;
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Click to filter or view
            </span>
          </div>

          {/* Section: RFQs */}
          {suggestions.rfqs && suggestions.rfqs.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="size-3 text-[#008779]" />
                RFQs & Requirements ({suggestions.rfqs.length})
              </div>
              <div className="space-y-1 mt-1">
                {suggestions.rfqs.map((rfq) => (
                  <div
                    key={rfq.id}
                    onClick={() => handleSelectRfqItem(rfq)}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          RFQ-{rfq.id}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#008779] transition-colors truncate">
                          {rfq.title}
                        </h4>
                        <Badge
                          variant={
                            rfq.status === "PUBLISHED"
                              ? "buyer"
                              : rfq.status === "AWARDED"
                              ? "teal"
                              : "secondary"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {rfq.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        {rfq.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {rfq.location}
                          </span>
                        )}
                        {rfq.currency && (
                          <span className="flex items-center gap-1 font-mono">
                            <DollarSign className="size-3" />
                            {rfq.currency}
                          </span>
                        )}
                        {rfq.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(rfq.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {rfq.lineItems && rfq.lineItems.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Items:
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {rfq.lineItems.map((li) => (
                              <span
                                key={li.id}
                                className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium"
                              >
                                {li.name} ({li.quantity} {li.unit})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="size-4 text-slate-300 dark:text-slate-600 group-hover:text-[#008779] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Categories */}
          {suggestions.categories && suggestions.categories.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="size-3 text-indigo-500" />
                Categories ({suggestions.categories.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {suggestions.categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategoryItem(cat)}
                    className="p-2 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 cursor-pointer transition-colors flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Tag className="size-3" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cat.name}
                      </span>
                    </div>
                    {cat.rfqCount !== undefined && (
                      <Badge variant="outline" className="text-[10px]">
                        {cat.rfqCount} RFQs
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Quotations */}
          {suggestions.quotations && suggestions.quotations.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="size-3 text-emerald-500" />
                Quotations ({suggestions.quotations.length})
              </div>
              <div className="space-y-1 mt-1">
                {suggestions.quotations.map((quote) => (
                  <div
                    key={quote.id}
                    onClick={() => handleSelectQuoteItem(quote)}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          {quote.quoteNo || `QUOTE-#${quote.id}`}
                        </span>
                        <Badge
                          variant={
                            quote.status === "ACCEPTED"
                              ? "teal"
                              : quote.status === "SHORTLISTED"
                              ? "buyer"
                              : "secondary"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {quote.status}
                        </Badge>
                      </div>
                      {quote.rfq?.title && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          RFQ: {quote.rfq.title}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {quote.totalPriceQuote
                          ? `₹ ${Number(quote.totalPriceQuote).toLocaleString()}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Footer: Quick apply */}
          <div className="p-2 px-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Press Enter to filter table for &ldquo;{value}&rdquo;</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#008779] hover:underline font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
