"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RFQ, Quotation } from "@/types/rfq";
import { AuthUser } from "@/types/auth";

interface UseDashboardItemsParams {
  rfqsList: RFQ[];
  quotationsList: Quotation[];
  user: AuthUser | null;
  loadData: () => Promise<void>;
  setRfqsList: React.Dispatch<React.SetStateAction<RFQ[]>>;
}

export function useDashboardItems({
  rfqsList,
  quotationsList,
  user,
  loadData,
  setRfqsList,
}: UseDashboardItemsParams) {
  // Search, Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterOpenOnly, setFilterOpenOnly] = useState<boolean>(false);
  const [filterMinBudget, setFilterMinBudget] = useState<string>("");
  const [filterMaxBudget, setFilterMaxBudget] = useState<string>("");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);
  const [isSearchingBackend, setIsSearchingBackend] = useState<boolean>(false);
  const [rfqStatusFilter, setRfqStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<string>("dateRaw");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Helper to sort table
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Helper to reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRfqStatusFilter("ALL");
    setFilterLocation("ALL");
    setFilterCategory("ALL");
    setFilterOpenOnly(false);
    setFilterMinBudget("");
    setFilterMaxBudget("");
    setSortField("dateRaw");
    setSortOrder("desc");
    loadData();
    toast.info("Filters reset to default", {
      description: "Displaying all quotation and RFQ records.",
    });
  };

  // Debounced backend synchronization for search & filters
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        setIsSearchingBackend(true);
        const data = await api.getRfqs({
          search: searchQuery.trim() || undefined,
          keyword: searchQuery.trim() || undefined,
          location: filterLocation !== "ALL" ? filterLocation : undefined,
          category: filterCategory !== "ALL" ? filterCategory : undefined,
          status: ["DRAFT", "PUBLISHED", "CLOSED", "AWARDED"].includes(rfqStatusFilter)
            ? (rfqStatusFilter as any)
            : undefined,
          openOnly: filterOpenOnly ? true : undefined,
          minBudget: filterMinBudget ? Number(filterMinBudget) : undefined,
          maxBudget: filterMaxBudget ? Number(filterMaxBudget) : undefined,
          sortBy:
            sortField === "dateRaw"
              ? "createdAt"
              : sortField === "sumInsured"
              ? "budget"
              : sortField === "product"
              ? "title"
              : undefined,
          sortOrder: sortOrder,
        });
        if (data && Array.isArray(data)) {
          setRfqsList(data);
        }
      } catch (err) {
        console.error("Backend RFQ search error:", err);
      } finally {
        setIsSearchingBackend(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    filterLocation,
    filterCategory,
    rfqStatusFilter,
    filterOpenOnly,
    filterMinBudget,
    filterMaxBudget,
    sortField,
    sortOrder,
    user?.role,
    setRfqsList,
  ]);

  // Map actual in-process quotations submitted by vendors
  const inProcessQuotes = quotationsList.map((q) => {
    const code = q.quoteNo || `QTE-${String(q.id)}`;
    const dateFormatted = q.createdAt
      ? new Date(q.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
    const contactName = q.vendor?.name || q.vendor?.email || "Supplier";
    const location = q.rfq?.location || "—";
    const product = q.rfq?.title || "Quotation Requirement";
    const category = (q.rfq as any)?.categories?.[0]?.category?.name || "General";
    const company = q.vendor?.name || q.vendor?.email || "Supplier";
    const sumInsured = q.totalPriceQuote
      ? `${q.currency || "USD"} ${Number(q.totalPriceQuote).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";
    const duration = q.deliveryTime || "—";
    const status = q.status;
    const statusLabel =
      q.status === "SUBMITTED"
        ? "In Process"
        : q.status === "SHORTLISTED"
        ? "Shortlisted"
        : q.status === "ACCEPTED"
        ? "Accepted"
        : q.status === "REJECTED"
        ? "Rejected"
        : "Draft";

    return {
      id: q.id,
      code,
      type: "QUOTATION" as const,
      dateFormatted,
      dateRaw: q.createdAt || "",
      contactName,
      location,
      product,
      category,
      company,
      sumInsured,
      amountRaw: Number(q.totalPriceQuote) || 0,
      duration,
      status,
      statusLabel,
      title: q.rfq?.title || "Procurement Quotation",
      description: (q.rfq as any)?.description || "",
      currency: q.currency,
      lineItems: q.lineItems || [],
      rawQuote: q,
      rawRfq: q.rfq,
    };
  });

  // Map active RFQs in process (open tenders or drafts awaiting quotations)
  const inProcessRfqs = rfqsList.map((rfq) => {
    const code = (rfq as any).rfqNo || `RFQ-${String(rfq.id)}`;
    const dateFormatted = rfq.createdAt
      ? new Date(rfq.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
    const contactName =
      (rfq as any).createdBy?.name?.toUpperCase() ||
      (rfq as any).createdBy?.email?.toUpperCase() ||
      user?.name?.toUpperCase() ||
      "—";
    const location = rfq.location || "—";
    const product = rfq.title;
    const category = rfq.categories?.[0]?.category?.name || "General";
    const company = rfq.status === "DRAFT" ? "Draft Tender" : "Open for Bids";
    const sumInsured = rfq.optionalBudget
      ? `${rfq.currency} ${Number(rfq.optionalBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "Budget Open";
    const duration = rfq.deadline
      ? new Date(rfq.deadline).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Open Deadline";
    const status = rfq.status;
    const statusLabel = rfq.status === "DRAFT" ? "Draft Tender" : "Open for Bids";

    return {
      id: rfq.id * 10000,
      code,
      type: "RFQ" as const,
      dateFormatted,
      dateRaw: rfq.createdAt || "",
      contactName,
      location,
      product,
      category,
      company,
      sumInsured,
      amountRaw: Number(rfq.optionalBudget) || 0,
      duration,
      status,
      statusLabel,
      title: rfq.title,
      description: rfq.description,
      currency: rfq.currency,
      lineItems: rfq.lineItems || [],
      rawQuote: null,
      rawRfq: rfq,
    };
  });

  const allDashboardItems = [...inProcessQuotes, ...inProcessRfqs];

  const availableLocations = Array.from(
    new Set(
      allDashboardItems
        .map((i) => i.location)
        .filter((loc) => loc && loc !== "—" && loc.trim() !== "")
    )
  ).sort();

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (rfqStatusFilter !== "ALL" ? 1 : 0) +
    (filterLocation !== "ALL" ? 1 : 0) +
    (filterCategory !== "ALL" ? 1 : 0) +
    (filterOpenOnly ? 1 : 0) +
    (filterMinBudget.trim() ? 1 : 0) +
    (filterMaxBudget.trim() ? 1 : 0);

  const filteredDashboardItems = allDashboardItems.filter((item) => {
    if (rfqStatusFilter !== "ALL") {
      if (rfqStatusFilter === "PUBLISHED" && item.status !== "PUBLISHED") return false;
      if (rfqStatusFilter === "DRAFT" && item.status !== "DRAFT") return false;
      if (rfqStatusFilter === "SUBMITTED" && item.status !== "SUBMITTED") return false;
      if (rfqStatusFilter === "SHORTLISTED" && item.status !== "SHORTLISTED") return false;
      if (rfqStatusFilter === "ACCEPTED" && item.status !== "ACCEPTED") return false;
      if (rfqStatusFilter === "CLOSED" && item.status !== "CLOSED") return false;
      if (rfqStatusFilter === "AWARDED" && item.status !== "AWARDED") return false;
    }

    if (filterLocation && filterLocation !== "ALL") {
      if (!item.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
    }

    if (filterCategory && filterCategory !== "ALL") {
      if (!item.category?.toLowerCase().includes(filterCategory.toLowerCase())) return false;
    }

    if (filterOpenOnly) {
      if (item.status !== "PUBLISHED") return false;
    }

    if (filterMinBudget) {
      const min = Number(filterMinBudget);
      if (!isNaN(min) && (item.amountRaw || 0) < min) return false;
    }

    if (filterMaxBudget) {
      const max = Number(filterMaxBudget);
      if (!isNaN(max) && (item.amountRaw || 0) > max) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const hasMatchingLineItem = item.lineItems?.some(
      (li: any) =>
        li.name?.toLowerCase().includes(q) ||
        li.specifications?.toLowerCase().includes(q)
    );

    return (
      item.code.toLowerCase().includes(q) ||
      item.contactName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.sumInsured.toLowerCase().includes(q) ||
      item.statusLabel.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      hasMatchingLineItem
    );
  });

  const sortedDashboardItems = [...filteredDashboardItems].sort((a, b) => {
    let valA: any = a[sortField as keyof typeof a] || "";
    let valB: any = b[sortField as keyof typeof b] || "";

    if (sortField === "sumInsured") {
      valA = Number((a as any).amountRaw) || 0;
      valB = Number((b as any).amountRaw) || 0;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleExportCsv = () => {
    const headers = [
      "QUOTATION / RFQ #",
      "DATE",
      "REQUIREMENT",
      "LOCATION",
      "SUPPLIER / VENDOR",
      "CATEGORY",
      "QUOTED / TARGET AMOUNT",
      "DELIVERY / DEADLINE",
      "STATUS",
    ];

    const rows = sortedDashboardItems.map((item) => [
      item.code,
      item.dateFormatted,
      item.product,
      item.location,
      item.company,
      item.category,
      item.sumInsured,
      item.duration,
      item.statusLabel,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `in_process_quotations_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("In-Process Quotations Exported", {
      description: `Exported ${sortedDashboardItems.length} records to CSV successfully.`,
    });
  };

  return {
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
    allDashboardItems,
    inProcessQuotes,
    inProcessRfqs,
    availableLocations,
    activeFiltersCount,
    sortedDashboardItems,
  };
}
