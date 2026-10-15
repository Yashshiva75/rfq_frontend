"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Plus,
  Send,
  Shield,
  Layers,
  Inbox,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Filter,
  Users,
  Search,
  Key,
  Database,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Building,
  Briefcase,
  Store,
  Trash2,
  Eye,
  Loader2,
  X,
  PlusCircle,
  Tag,
  Package,
  Edit,
  UploadCloud,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowUpDown,
  FolderOpen,
  Award,
  Trophy,
  Zap,
  Check,
  Sparkles,
} from "lucide-react";
import { AuthUser, UserRole } from "@/types/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Category, Quotation, RFQ, RFQLineItem, RfqComparisonData } from "@/types/rfq";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Real data from backend APIs
  const [rfqsList, setRfqsList] = useState<RFQ[]>([]);
  const [quotationsList, setQuotationsList] = useState<Quotation[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // RFQ Creation / Edit Form State
  const [editingRfqId, setEditingRfqId] = useState<number | null>(null);
  const [rfqTitle, setRfqTitle] = useState("");
  const [rfqDescription, setRfqDescription] = useState("");
  const [rfqCategory, setRfqCategory] = useState("Industrial Automation");
  const [rfqLocation, setRfqLocation] = useState("");
  const [rfqCurrency, setRfqCurrency] = useState("INR");
  const [rfqBudget, setRfqBudget] = useState("");
  const [rfqDeadline, setRfqDeadline] = useState("");
  const [rfqLineItems, setRfqLineItems] = useState<
    Array<{
      name: string;
      description?: string;
      quantity: number | string;
      unit: string;
      specifications?: string;
    }>
  >([
    {
      name: "High Precision Optical Sensor (PNP)",
      quantity: 100,
      unit: "pcs",
      specifications: "IP67 rated, 10-30V DC, M12 connector",
    },
  ]);
  const [isCreatingRfq, setIsCreatingRfq] = useState(false);
  const [rfqStatusFilter, setRfqStatusFilter] = useState<string>("ALL");

  // Search & Sorting state for Quotation Dashboard
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("dateRaw");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Vendor Quotation Submission Modal State
  const [quoteModalRfq, setQuoteModalRfq] = useState<RFQ | null>(null);
  const [revisingQuoteId, setRevisingQuoteId] = useState<number | null>(null);
  const [revisingQuoteNo, setRevisingQuoteNo] = useState<string | null>(null);
  const [quoteCurrency, setQuoteCurrency] = useState("INR");
  const [quoteDeliveryTime, setQuoteDeliveryTime] = useState("14 business days");
  const [quoteLineItemPrices, setQuoteLineItemPrices] = useState<
    Record<number, { unitPrice: string; notes: string }>
  >({});
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // View RFQ Detail Modal State
  const [selectedDetailRfq, setSelectedDetailRfq] = useState<any | null>(null);
  // View Quotation Detail Modal State
  const [selectedDetailQuote, setSelectedDetailQuote] = useState<any | null>(null);

  // Side-by-Side RFQ Quotation Comparison Studio State
  const [comparingRfqId, setComparingRfqId] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<RfqComparisonData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [comparisonSortBy, setComparisonSortBy] = useState<"totalPrice" | "deliveryTime" | "date">("totalPrice");
  const [comparisonSortOrder, setComparisonSortOrder] = useState<"asc" | "desc">("asc");
  const [isAwardingQuoteId, setIsAwardingQuoteId] = useState<number | null>(null);
  const [awardConfirmQuote, setAwardConfirmQuote] = useState<{
    id: number;
    quoteNo: string;
    vendorName: string;
    price: number | string;
    currency: string;
    rfqId: number;
  } | null>(null);

  // Helper to open Create RFQ
  const handleOpenCreateRfq = () => {
    setEditingRfqId(null);
    setRfqTitle("");
    setRfqDescription("");
    setRfqLocation("");
    setRfqCurrency("INR");
    setRfqBudget("");
    setRfqDeadline("");
    setRfqLineItems([
      {
        name: "High Precision Optical Sensor (PNP)",
        quantity: 100,
        unit: "pcs",
        specifications: "IP67 rated, 10-30V DC, M12 connector",
      },
    ]);
    setActiveTab("create-rfq");
  };

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
    setSortField("dateRaw");
    setSortOrder("desc");
    toast.info("Filters reset to default", {
      description: "Displaying all quotation and RFQ records.",
    });
  };

  // Load user session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("rfq_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Load live data from backend APIs
  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [rfqsResult, quotesResult, catsResult] = await Promise.allSettled([
        api.getRfqs(),
        api.getQuotations(),
        api.getCategories(),
      ]);

      if (rfqsResult.status === "fulfilled") {
        setRfqsList(rfqsResult.value);
      }
      if (quotesResult.status === "fulfilled") {
        setQuotationsList(quotesResult.value);
      }
      if (catsResult.status === "fulfilled") {
        setCategoriesList(catsResult.value);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("rfq_user");
    localStorage.removeItem("rfq_token");
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("user_role", { path: "/" });
    toast.success("Signed out successfully", {
      description: "You have been logged out of your session.",
    });
    router.push("/login");
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    if (!user) return;
    const updatedUser: AuthUser = {
      ...user,
      role: newRole,
      name:
        newRole === "buyer"
          ? "Procurement Buyer"
          : newRole === "vendor"
          ? "Global Vendor Supplies"
          : "System Administrator",
      email: `${newRole}@rfq.com`,
    };
    setUser(updatedUser);
    localStorage.setItem("rfq_user", JSON.stringify(updatedUser));
    Cookies.set("user_role", newRole, { path: "/" });

    // Authenticate token for the switched role
    try {
      const authData = await api.login({
        email: `${newRole}@rfq.com`,
        password: "Password@123",
      });
      if (authData.access_token) {
        localStorage.setItem("rfq_token", authData.access_token);
        Cookies.set("auth_token", authData.access_token, { path: "/" });
      }
    } catch {
      // Fallback gracefully
    }

    setActiveTab("overview");
  };

  // RFQ Line Item Handlers
  const handleAddLineItem = () => {
    setRfqLineItems((prev) => [
      ...prev,
      { name: "", quantity: 1, unit: "pcs", specifications: "" },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (rfqLineItems.length <= 1) {
      toast.error("At least one line item is required");
      return;
    }
    setRfqLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setRfqLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // BUYER: Start Editing an RFQ
  const handleStartEdit = (rfq: any) => {
    setEditingRfqId(rfq.id);
    setRfqTitle(rfq.title || "");
    setRfqDescription(rfq.description || "");
    setRfqCategory(rfq.categories?.[0]?.category?.name || "Industrial Automation");
    setRfqLocation(rfq.location || "");
    setRfqCurrency(rfq.currency || "INR");
    setRfqBudget(rfq.optionalBudget ? String(rfq.optionalBudget) : "");
    setRfqDeadline(rfq.deadline ? rfq.deadline.split("T")[0] : "");

    if (rfq.lineItems && rfq.lineItems.length > 0) {
      setRfqLineItems(
        rfq.lineItems.map((li: any) => ({
          name: li.name,
          description: li.description || "",
          quantity: Number(li.quantity),
          unit: li.unit || "pcs",
          specifications: li.specifications || "",
        }))
      );
    } else {
      setRfqLineItems([{ name: "", quantity: 1, unit: "pcs", specifications: "" }]);
    }

    setActiveTab("create-rfq");
    toast.info(`Loaded RFQ #${rfq.id} for editing`, {
      description: "Modify scope or line items and click 'Update RFQ'.",
    });
  };

  const handleCancelEdit = () => {
    setEditingRfqId(null);
    setRfqTitle("");
    setRfqDescription("");
    setRfqLocation("");
    setRfqBudget("");
    setRfqDeadline("");
    setRfqLineItems([
      { name: "Precision Industrial Component", quantity: 100, unit: "pcs", specifications: "" },
    ]);
    setActiveTab("overview");
  };

  // BUYER: Create / Update RFQ API INTEGRATION
  const handleSaveRfq = async (status: "DRAFT" | "PUBLISHED" = "PUBLISHED") => {
    if (!rfqTitle.trim()) {
      toast.error("RFQ Title is required");
      return;
    }
    if (!rfqDescription.trim()) {
      toast.error("RFQ Description is required");
      return;
    }
    if (!rfqLocation.trim()) {
      toast.error("Delivery Location is required");
      return;
    }
    if (!rfqDeadline) {
      toast.error("Submission Deadline is required");
      return;
    }

    // Validate line items
    for (let i = 0; i < rfqLineItems.length; i++) {
      const item = rfqLineItems[i];
      if (!item.name.trim()) {
        toast.error(`Line item #${i + 1} must have a name`);
        return;
      }
      if (Number(item.quantity) <= 0 || isNaN(Number(item.quantity))) {
        toast.error(`Line item #${i + 1} must have a valid positive quantity`);
        return;
      }
    }

    setIsCreatingRfq(true);
    try {
      const payload = {
        title: rfqTitle.trim(),
        description: rfqDescription.trim(),
        category: rfqCategory,
        location: rfqLocation.trim(),
        currency: rfqCurrency,
        optionalBudget: rfqBudget ? Number(rfqBudget) : null,
        deadline: new Date(rfqDeadline).toISOString(),
        status: status,
        lineItems: rfqLineItems.map((item) => ({
          name: item.name.trim(),
          description: item.description?.trim() || undefined,
          quantity: Number(item.quantity),
          unit: item.unit.trim() || "pcs",
          specifications: item.specifications?.trim() || undefined,
        })),
      };

      if (editingRfqId) {
        const updated = await api.updateRfq(editingRfqId, payload);
        toast.success("RFQ Updated Successfully!", {
          description: `RFQ #${updated.id} "${updated.title}" changes have been saved.`,
        });
      } else {
        const newRfq = await api.createRfq(payload);
        toast.success(
          status === "PUBLISHED"
            ? "RFQ Created & Published Successfully!"
            : "RFQ Draft Saved Successfully!",
          {
            description: `RFQ #${newRfq.id} "${newRfq.title}" with ${newRfq.lineItems.length} line items is saved.`,
          }
        );
      }

      // Reset form
      setEditingRfqId(null);
      setRfqTitle("");
      setRfqDescription("");
      setRfqLocation("");
      setRfqBudget("");
      setRfqDeadline("");
      setRfqLineItems([
        { name: "Precision Industrial Component", quantity: 100, unit: "pcs", specifications: "" },
      ]);

      // Refresh RFQs list and navigate to overview tab
      await loadData();
      setActiveTab("overview");
    } catch (err: any) {
      toast.error(editingRfqId ? "Failed to update RFQ" : "Failed to create RFQ", {
        description: err.message || "An error occurred while communicating with the backend.",
      });
    } finally {
      setIsCreatingRfq(false);
    }
  };

  // BUYER: One-click Publish Draft RFQ
  const handlePublishRfqDirect = async (rfqId: number) => {
    try {
      const published = await api.publishRfq(rfqId);
      toast.success("RFQ Published Successfully!", {
        description: `RFQ #${published.id} "${published.title}" is now open for supplier bidding.`,
      });
      await loadData();
      if (selectedDetailRfq && selectedDetailRfq.id === rfqId) {
        setSelectedDetailRfq(published);
      }
    } catch (err: any) {
      toast.error("Failed to publish RFQ", {
        description: err.message || "An error occurred while publishing.",
      });
    }
  };

  // BUYER: Delete or cancel RFQ
  const handleDeleteRfq = async (rfqId: number) => {
    if (!confirm("Are you sure you want to delete / cancel this RFQ?")) return;
    try {
      await api.deleteRfq(rfqId);
      toast.success("RFQ Removed", {
        description: `RFQ #${rfqId} has been deleted or cancelled.`,
      });
      if (selectedDetailRfq?.id === rfqId) {
        setSelectedDetailRfq(null);
      }
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete RFQ", {
        description: err.message || "An error occurred.",
      });
    }
  };

  // BUYER: Shortlist or Accept/Reject Quotations
  const handleUpdateQuoteStatus = async (quoteId: number, newStatus: string) => {
    try {
      const updated = await api.updateQuotationStatus(quoteId, newStatus);
      toast.success(`Quotation marked as ${newStatus}`, {
        description: `Quote ${updated.quoteNo} is now ${newStatus}.`,
      });
      await loadData();
      if (selectedDetailRfq) {
        const refreshed = await api.getRfqById(selectedDetailRfq.id);
        setSelectedDetailRfq(refreshed);
      }
    } catch (err: any) {
      toast.error("Failed to update quotation status", {
        description: err.message || "An error occurred.",
      });
    }
  };

  // BUYER & ADMIN: OPEN RFQ QUOTATION COMPARISON STUDIO
  const handleOpenCompareModal = async (
    rfqId: number,
    sortBy: "totalPrice" | "deliveryTime" | "date" = comparisonSortBy,
    sortOrder: "asc" | "desc" = comparisonSortOrder
  ) => {
    try {
      setComparingRfqId(rfqId);
      setIsLoadingComparison(true);
      const data = await api.getRfqComparison(rfqId, { sortBy, sortOrder });
      setComparisonData(data);
    } catch (err: any) {
      toast.error("Failed to load quotation comparison", {
        description: err.message || "Could not retrieve side-by-side comparison data.",
      });
      setComparingRfqId(null);
      setComparisonData(null);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  // BUYER & ADMIN: SORT COMPARISON
  const handleSortComparison = (newSortBy: "totalPrice" | "deliveryTime" | "date") => {
    let newOrder: "asc" | "desc" = "asc";
    if (comparisonSortBy === newSortBy) {
      newOrder = comparisonSortOrder === "asc" ? "desc" : "asc";
    }
    setComparisonSortBy(newSortBy);
    setComparisonSortOrder(newOrder);
    if (comparingRfqId) {
      handleOpenCompareModal(comparingRfqId, newSortBy, newOrder);
    }
  };

  // BUYER & ADMIN: AWARD QUOTATION API INTEGRATION
  const handleAwardQuotation = async (
    quoteId: number,
    quoteNo: string,
    vendorName: string,
    price: number | string,
    currency: string,
    rfqId: number
  ) => {
    setIsAwardingQuoteId(quoteId);
    try {
      await api.awardQuotation(quoteId);
      toast.success(`Quotation #${quoteNo} Awarded Successfully!`, {
        description: `Contract awarded to ${vendorName} (${currency} ${Number(price).toLocaleString()}). Competing quotes marked as REJECTED and RFQ set to AWARDED.`,
      });
      setAwardConfirmQuote(null);

      // Refresh comparison modal if currently open
      if (comparingRfqId) {
        await handleOpenCompareModal(comparingRfqId, comparisonSortBy, comparisonSortOrder);
      }
      // Refresh RFQ detail if open
      if (selectedDetailRfq?.id === rfqId) {
        const refreshedRfq = await api.getRfqById(rfqId);
        setSelectedDetailRfq(refreshedRfq);
      }
      // Refresh Quotation detail if open
      if (selectedDetailQuote?.id === quoteId) {
        setSelectedDetailQuote((prev: any) => ({
          ...prev,
          status: "ACCEPTED",
          rfq: { ...(prev?.rfq || {}), status: "AWARDED" },
        }));
      }

      await loadData();
    } catch (err: any) {
      toast.error("Failed to award quotation", {
        description: err.message || "An error occurred while awarding contract.",
      });
    } finally {
      setIsAwardingQuoteId(null);
    }
  };

  // VENDOR: CREATE QUOTE MODAL & API INTEGRATION
  const handleOpenQuoteModal = (rfq: RFQ) => {
    setRevisingQuoteId(null);
    setRevisingQuoteNo(null);
    setQuoteModalRfq(rfq);
    setQuoteCurrency(rfq.currency || "INR");
    setQuoteDeliveryTime("14 business days");

    // Initialize line item prices
    const initialPrices: Record<number, { unitPrice: string; notes: string }> = {};
    if (rfq.lineItems && rfq.lineItems.length > 0) {
      rfq.lineItems.forEach((item) => {
        if (item.id) {
          initialPrices[item.id] = { unitPrice: "", notes: "" };
        }
      });
    }
    setQuoteLineItemPrices(initialPrices);
  };

  // VENDOR & ADMIN: REVISE QUOTATION MODAL
  const handleOpenReviseModal = (quote: Quotation) => {
    // Check if RFQ deadline has passed
    const rfq = quote.rfq || rfqsList.find((r) => r.id === quote.rfqId);
    if (rfq?.deadline && new Date(rfq.deadline).getTime() < Date.now()) {
      toast.error("RFQ bidding deadline has passed. Quotation revisions are closed.");
      return;
    }
    if (quote.status === "ACCEPTED") {
      toast.error("Accepted/awarded quotations cannot be revised.");
      return;
    }
    if (quote.status === "REJECTED") {
      toast.error("Rejected quotations cannot be revised.");
      return;
    }

    setRevisingQuoteId(quote.id);
    setRevisingQuoteNo(quote.quoteNo);

    // Locate or construct target RFQ
    const fullRfq = rfqsList.find((r) => r.id === quote.rfqId);
    const targetRfq: RFQ = fullRfq && fullRfq.lineItems?.length ? fullRfq : {
      id: quote.rfqId,
      title: quote.rfq?.title || "RFQ Tender",
      description: "",
      location: quote.rfq?.location || "—",
      currency: quote.currency || "INR",
      deadline: quote.rfq?.deadline || "",
      status: quote.rfq?.status || "PUBLISHED",
      createdById: 0,
      createdAt: "",
      updatedAt: "",
      lineItems: (quote.lineItems || []).map((li: any) => ({
        id: li.rfqLineItemId,
        rfqId: quote.rfqId,
        name: li.rfqLineItem?.name || `Item #${li.rfqLineItemId}`,
        quantity: li.rfqLineItem?.quantity || 1,
        unit: li.rfqLineItem?.unit || "pcs",
        specifications: li.rfqLineItem?.specifications || "",
      })),
    };

    setQuoteModalRfq(targetRfq);
    setQuoteCurrency(quote.currency || targetRfq.currency || "INR");
    setQuoteDeliveryTime(quote.deliveryTime || "14 business days");

    // Pre-populate line item prices from existing quote
    const initialPrices: Record<number, { unitPrice: string; notes: string }> = {};
    if (quote.lineItems && quote.lineItems.length > 0) {
      quote.lineItems.forEach((li) => {
        initialPrices[li.rfqLineItemId] = {
          unitPrice: String(li.unitPrice ?? ""),
          notes: li.notes || "",
        };
      });
    }
    setQuoteLineItemPrices(initialPrices);
  };

  const handleQuotePriceChange = (lineItemId: number, field: "unitPrice" | "notes", val: string) => {
    setQuoteLineItemPrices((prev) => ({
      ...prev,
      [lineItemId]: {
        ...(prev[lineItemId] || { unitPrice: "", notes: "" }),
        [field]: val,
      },
    }));
  };

  const calculateQuoteGrandTotal = () => {
    if (!quoteModalRfq?.lineItems) return 0;
    return quoteModalRfq.lineItems.reduce((acc, item) => {
      if (!item.id) return acc;
      const price = Number(quoteLineItemPrices[item.id]?.unitPrice) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);
  };

  const handleCreateQuote = async () => {
    if (!quoteModalRfq) return;

    const lineItemsToSubmit: Array<{ rfqLineItemId: number; unitPrice: number; notes?: string }> = [];

    for (const item of quoteModalRfq.lineItems || []) {
      if (!item.id) continue;
      const entry = quoteLineItemPrices[item.id];
      const priceNum = entry ? Number(entry.unitPrice) : 0;
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error(`Please enter a valid positive unit price for "${item.name}"`);
        return;
      }
      lineItemsToSubmit.push({
        rfqLineItemId: item.id,
        unitPrice: priceNum,
        notes: entry.notes || undefined,
      });
    }

    if (lineItemsToSubmit.length === 0) {
      toast.error("At least one line item quotation price is required");
      return;
    }

    setIsSubmittingQuote(true);
    try {
      if (revisingQuoteId) {
        const revisedQuote = await api.reviseQuotation(revisingQuoteId, {
          currency: quoteCurrency || quoteModalRfq.currency || "INR",
          deliveryTime: quoteDeliveryTime,
          lineItems: lineItemsToSubmit,
        });

        const revNumber = revisedQuote.revisions?.[0]?.revisionNo || 2;
        toast.success(`Quotation Revised Successfully! (Revision #${revNumber})`, {
          description: `Quote ${revisedQuote.quoteNo} updated with total: ${revisedQuote.currency} ${Number(revisedQuote.totalPriceQuote).toLocaleString()}`,
        });
      } else {
        const quote = await api.createQuotation({
          rfqId: quoteModalRfq.id,
          currency: quoteCurrency || quoteModalRfq.currency || "INR",
          deliveryTime: quoteDeliveryTime,
          status: "SUBMITTED",
          lineItems: lineItemsToSubmit,
        });

        toast.success("Quotation Submitted Successfully!", {
          description: `Quote ${quote.quoteNo} (${quote.currency} ${quote.totalPriceQuote}) has been submitted for RFQ #${quoteModalRfq.id}.`,
        });
      }

      setQuoteModalRfq(null);
      setRevisingQuoteId(null);
      setRevisingQuoteNo(null);
      await loadData();
    } catch (err: any) {
      toast.error(revisingQuoteId ? "Failed to revise quotation" : "Failed to submit quotation", {
        description: err.message || "An error occurred while processing quotation.",
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading workspace...</p>
      </div>
    );
  }

  const role = String(user.role).toLowerCase() as UserRole;

  // Filtered RFQs for Buyer
  const displayedBuyerRfqs = (rfqsList.length > 0 ? rfqsList : []).filter((r) => {
    if (rfqStatusFilter === "ALL") return true;
    return r.status === rfqStatusFilter;
  });

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
      mobile: (q.rfq as any)?.mobile || location,
      product,
      category,
      company,
      companyColor: q.status === "ACCEPTED" ? "green" : q.status === "SHORTLISTED" ? "blue" : "amber",
      sumInsured,
      amountRaw: Number(q.totalPriceQuote) || 0,
      duration,
      status,
      statusLabel,
      statusType:
        q.status === "ACCEPTED"
          ? "accepted"
          : q.status === "SHORTLISTED"
          ? "shortlisted"
          : "in_process",
      title: q.rfq?.title || "Procurement Quotation",
      description: (q.rfq as any)?.description || "",
      currency: q.currency,
      lineItems: q.lineItems || [],
      quotations: [],
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
      mobile: location,
      product,
      category,
      company,
      companyColor: rfq.status === "PUBLISHED" ? "teal" : "amber",
      sumInsured,
      amountRaw: Number(rfq.optionalBudget) || 0,
      duration,
      status,
      statusLabel,
      statusType: rfq.status === "PUBLISHED" ? "open" : "draft",
      title: rfq.title,
      description: rfq.description,
      currency: rfq.currency,
      lineItems: rfq.lineItems || [],
      quotations: (rfq as any).quotations || [],
      rawQuote: null,
      rawRfq: rfq,
    };
  });

  // Purely live dynamic items from backend API (quotations and RFQs) - No static fallback
  const allDashboardItems = [...inProcessQuotes, ...inProcessRfqs];

  const filteredDashboardItems = allDashboardItems.filter((item) => {
    if (rfqStatusFilter !== "ALL") {
      if (rfqStatusFilter === "PUBLISHED" && item.status !== "PUBLISHED") return false;
      if (rfqStatusFilter === "DRAFT" && item.status !== "DRAFT") return false;
      if (rfqStatusFilter === "SUBMITTED" && item.status !== "SUBMITTED") return false;
      if (rfqStatusFilter === "SHORTLISTED" && item.status !== "SHORTLISTED") return false;
      if (rfqStatusFilter === "ACCEPTED" && item.status !== "ACCEPTED") return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.code.toLowerCase().includes(q) ||
      item.contactName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.sumInsured.toLowerCase().includes(q) ||
      item.statusLabel.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
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


  const seededUsers = [
    { id: 1, name: "System Administrator", email: "admin@rfq.com", role: "admin", status: "Active", permissions: 8 },
    { id: 2, name: "Procurement Buyer", email: "buyer@rfq.com", role: "buyer", status: "Active", permissions: 4 },
    { id: 3, name: "Global Vendor Supplies", email: "vendor@rfq.com", role: "vendor", status: "Active", permissions: 4 },
  ];

  const permissions = [
    "rfq:create",
    "rfq:read",
    "rfq:update",
    "rfq:delete",
    "quotation:create",
    "quotation:read",
    "quotation:update",
    "user:manage",
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        badgeCounts={{
          openTenders: rfqsList.filter((r) => r.status === "PUBLISHED").length,
          submittedQuotes: quotationsList.length,
          awardedContracts: quotationsList.filter((q) => q.status === "ACCEPTED").length,
          receivedQuotations: quotationsList.length,
          activeRfqs: rfqsList.length,
          totalUsers: seededUsers.length,
        }}
      />

      <SidebarInset className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 flex flex-col w-full flex-1">
        {/* Full-Width App Header with Sidebar Trigger & Dark Theme Toggler */}
        <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-6 md:px-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="h-5 w-[1px] bg-slate-200 dark:border-slate-800" />

            {/* Breadcrumb / Section Name */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 min-w-0">
              <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                {role} Workspace
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 capitalize truncate font-medium">
                {activeTab.replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            <Badge
              variant={role === "admin" ? "admin" : role === "vendor" ? "vendor" : "buyer"}
              className="capitalize text-xs font-semibold px-2.5 py-1"
            >
              {role} View
            </Badge>

            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full flex-1">
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
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
                          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                            {allDashboardItems.length}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Count: {allDashboardItems.length}
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
                          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                            {inProcessQuotes.filter((q) => q.status === "SUBMITTED").length}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Count: {inProcessQuotes.filter((q) => q.status === "SUBMITTED").length}
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
                          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                            {inProcessQuotes.filter((q) => q.status === "SHORTLISTED").length}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Count: {inProcessQuotes.filter((q) => q.status === "SHORTLISTED").length}
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
                          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                            {inProcessQuotes.filter((q) => q.status === "ACCEPTED").length}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Count: {inProcessQuotes.filter((q) => q.status === "ACCEPTED").length}
                      </div>
                    </div>
                  </div>

                  {/* Main Container Card: Search Input, Action Buttons, and Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    {/* Search & Actions Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
                      {/* Left Search Input */}
                      <div className="relative w-full sm:max-w-md">
                        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="SEARCH BY QUOTATION #, SUPPLIER, REQUIREMENT, CATEGORY, OR LOCATION..."
                          className="w-full h-11 pl-10 pr-8 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:uppercase focus:outline-none focus:ring-1 focus:ring-[#008779] focus:border-[#008779] transition-all uppercase"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
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
                                <span>{role === "vendor" ? "REF / BID #" : role === "admin" ? "REF / QUOTATION #" : "QUOTATION #"}</span>
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
                                <span>{role === "vendor" ? "BUYER / CLIENT" : role === "admin" ? "BUYER / SUPPLIER" : "SUPPLIER / VENDOR"}</span>
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
                                <span>{role === "vendor" ? "MY BID / BUDGET" : role === "admin" ? "QUOTED / BUDGET" : "QUOTED AMOUNT"}</span>
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
                          {sortedDashboardItems.length > 0 ? (
                            sortedDashboardItems.map((item) => (
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
                                  <div className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 truncate uppercase" title={item.product}>
                                    {item.product.toUpperCase()}
                                  </div>
                                  <div className="text-xs md:text-[13px] text-slate-500 dark:text-slate-400 mt-1 truncate uppercase font-semibold">
                                    {item.type === "QUOTATION" ? (
                                      <span>RFQ #{item.rawQuote?.rfqId || item.rawRfq?.id} • {item.rawQuote?.lineItems?.length || 1} LINE ITEM(S)</span>
                                    ) : (
                                      <span>RFQ #{item.rawRfq?.id} • {item.rawRfq?.lineItems?.length || 1} LINE ITEM(S)</span>
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
                  </div>

                  {/* Procurement Footer */}
                  <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 py-3 font-medium">
                    © 2026 Enterprise RFQ Procurement System - Real-Time Bidding & Sourcing Engine
                  </div>
            </div>
          )}

          {/* TAB: CREATE / EDIT RFQ (Buyer) - Full Width Form with Dynamic Line Items */}
          {activeTab === "create-rfq" && (
            <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 w-full shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="p-6 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {editingRfqId ? `Edit Request for Quotation (RFQ #${editingRfqId})` : "Create Request for Quotation (RFQ)"}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {editingRfqId
                        ? "Update procurement specifications, quantities, or submission deadline"
                        : "Author an itemized procurement request conforming to database specifications"}
                    </CardDescription>
                  </div>
                  {editingRfqId ? (
                    <Badge variant="warning" className="text-xs font-semibold px-2.5 py-1">
                      Draft Edit Mode
                    </Badge>
                  ) : (
                    <Badge variant="buyer" className="text-xs font-semibold px-2.5 py-1">
                      Buyer Sourcing
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* 1. Title */}
                <div className="space-y-2">
                  <Label htmlFor="rfq-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    RFQ Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rfq-title"
                    value={rfqTitle}
                    onChange={(e) => setRfqTitle(e.target.value)}
                    placeholder="e.g. Precision CNC Machined Aluminum Enclosures"
                    className="h-11"
                  />
                </div>

                {/* 2. Description */}
                <div className="space-y-2">
                  <Label htmlFor="rfq-desc" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Detailed Procurement Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="rfq-desc"
                    value={rfqDescription}
                    onChange={(e) => setRfqDescription(e.target.value)}
                    placeholder="Describe technical standards, tolerance requirements, surface treatment, quality testing, and delivery conditions..."
                    rows={3}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* 3. Category, Location, Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rfq-category" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="rfq-category"
                      value={rfqCategory}
                      onChange={(e) => setRfqCategory(e.target.value)}
                      className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {categoriesList.length > 0 ? (
                        categoriesList.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Industrial Automation">Industrial Automation</option>
                          <option value="Metals & Mining">Metals & Mining</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Mechanical Components">Mechanical Components</option>
                          <option value="Electrical & Electronics">Electrical & Electronics</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rfq-location" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Delivery Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rfq-location"
                      value={rfqLocation}
                      onChange={(e) => setRfqLocation(e.target.value)}
                      placeholder="e.g. Frankfurt, Germany / Chicago, IL"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rfq-currency" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Currency
                    </Label>
                    <select
                      id="rfq-currency"
                      value={rfqCurrency}
                      onChange={(e) => setRfqCurrency(e.target.value)}
                      className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Target Budget & Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rfq-budget" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Optional Target Budget ({rfqCurrency})
                    </Label>
                    <Input
                      id="rfq-budget"
                      type="number"
                      value={rfqBudget}
                      onChange={(e) => setRfqBudget(e.target.value)}
                      placeholder="e.g. 45000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rfq-deadline" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Submission Deadline <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rfq-deadline"
                      type="date"
                      value={rfqDeadline}
                      onChange={(e) => setRfqDeadline(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* 5. Itemized Line Items Builder */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Package className="size-4 text-[#008779] dark:text-[#00a896]" />
                        Itemized Line Items ({rfqLineItems.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Define product specifications, units, and quantities for vendor quote itemization
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddLineItem}
                      className="border-[#008779]/40 dark:border-[#008779]/50 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 dark:hover:bg-[#008779]/20 text-xs h-8"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add Line Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {rfqLineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Item #{idx + 1}
                          </span>
                          {rfqLineItems.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 w-7 p-0"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-6 space-y-1">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Item Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={item.name}
                              onChange={(e) => handleLineItemChange(idx, "name", e.target.value)}
                              placeholder="e.g. Optical Proximity Sensor"
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="md:col-span-3 space-y-1">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Quantity <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                              placeholder="100"
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="md:col-span-3 space-y-1">
                            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Unit <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={item.unit}
                              onChange={(e) => handleLineItemChange(idx, "unit", e.target.value)}
                              placeholder="pcs, kg, meters"
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Technical Specifications / Notes
                          </Label>
                          <Input
                            value={item.specifications || ""}
                            onChange={(e) => handleLineItemChange(idx, "specifications", e.target.value)}
                            placeholder="e.g. IP67 rated, 10-30V DC, M12 connector, RoHS certified"
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={editingRfqId ? handleCancelEdit : () => setActiveTab("overview")}
                    className="h-10 px-5 cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCreatingRfq}
                    onClick={() => handleSaveRfq("DRAFT")}
                    className="h-10 px-5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold cursor-pointer"
                  >
                    {editingRfqId ? "Update as Draft" : "Save as Draft"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isCreatingRfq}
                    onClick={() => handleSaveRfq("PUBLISHED")}
                    className="h-10 px-6 bg-[#008779] text-white hover:bg-[#007063] active:bg-[#005c52] font-semibold cursor-pointer shadow-xs"
                  >
                    {isCreatingRfq ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin text-white" />
                        <span className="text-white">Processing...</span>
                      </>
                    ) : (
                      <span className="text-white font-semibold">
                        {editingRfqId ? "Update & Publish RFQ" : "Publish RFQ"}
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


          {/* TAB: RECEIVED QUOTATIONS (Buyer) / MY BIDS (Vendor) - Full Width Table */}
          {(activeTab === "quotations" || activeTab === "my-bids") && (
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
                {quotationsList.length > 0 ? (
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
                                className="h-8 text-xs border-[#008779]/40 dark:border-[#008779]/50 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10"
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
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <Trophy className="size-3.5" />
                              <span>Award</span>
                            </Button>
                          </div>
                        )}

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
          )}

          {/* TAB: OPEN TENDERS (Vendor) - Full Width Grid with 1-Click Quote API */}
          {activeTab === "tenders" && (
            <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-xl overflow-hidden w-full">
              <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Open RFQ Tenders Marketplace
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Submit itemized quotations for published procurement tenders
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                {rfqsList.filter((r) => r.status === "PUBLISHED").length > 0 ? (
                  rfqsList.filter((r) => r.status === "PUBLISHED").map((rfq: any) => (
                    <div
                      key={rfq.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            RFQ-{rfq.id}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {rfq.title}
                          </h4>
                          <Badge variant="buyer" className="text-[10px]">
                            OPEN FOR BIDS
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Location: {rfq.location || "—"} • Target Budget: {rfq.currency}{" "}
                          {rfq.optionalBudget ? Number(rfq.optionalBudget).toLocaleString() : "Undisclosed"} • Deadline:{" "}
                          {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "Open"}
                        </p>
                        {rfq.lineItems && rfq.lineItems.length > 0 && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Requirements: {rfq.lineItems.map((li: any) => `${li.name} (${li.quantity} ${li.unit})`).join("; ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetailRfq(rfq)}
                          className="h-9 text-xs cursor-pointer border-slate-300 dark:border-slate-700"
                        >
                          <Eye className="size-3.5 mr-1" />
                          Details
                        </Button>
                        {(role === "buyer" || role === "admin") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCompareModal(rfq.id)}
                            className="h-9 text-xs font-bold border-[#008779]/40 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <ArrowUpDown className="size-3.5" />
                            <span>Compare Quotes</span>
                          </Button>
                        )}
                        {role === "vendor" && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenQuoteModal(rfq)}
                            className="bg-[#008779] text-white hover:bg-[#007063] active:bg-[#005c52] font-semibold cursor-pointer shadow-xs h-9 text-xs"
                          >
                            <DollarSign className="size-3.5 mr-1 text-white" />
                            <span className="text-white font-semibold">Submit Quote</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <FolderOpen className="size-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-bold text-sm uppercase text-slate-800 dark:text-slate-200">No Open RFQ Tenders</p>
                    <p className="text-xs uppercase text-slate-400 mt-1">Published procurement tenders will appear here from the live API.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB: USERS & ROLES (Admin) - Full Width Tables */}
          {(activeTab === "users" || activeTab === "roles") && (
            <div className="space-y-6 w-full">
              <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-xl overflow-hidden w-full">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-6">Name</th>
                          <th className="py-3 px-6">Role</th>
                          <th className="py-3 px-6">Email</th>
                          <th className="py-3 px-6">Permissions</th>
                          <th className="py-3 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {seededUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                            <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                              {u.name}
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant={u.role as any} className="capitalize text-[10px]">
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400 font-medium">
                              {u.email}
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                              {u.permissions} Granted
                            </td>
                            <td className="py-4 px-6 text-emerald-700 dark:text-emerald-400 font-semibold">
                              {u.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-xl overflow-hidden w-full">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    RBAC Permissions Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                    {permissions.map((p) => (
                      <div
                        key={p}
                        className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 font-mono text-xs flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-950/40 transition-colors"
                      >
                        <Key className="size-4 text-purple-700 dark:text-purple-400 shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* VENDOR QUOTATION SUBMISSION & REVISION MODAL */}
        {quoteModalRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>
                      {revisingQuoteId
                        ? `Revise Quotation: ${revisingQuoteNo || `Quote #${revisingQuoteId}`}`
                        : `Submit Quotation: RFQ #${quoteModalRfq.id}`}
                    </span>
                    {revisingQuoteId && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Revision Mode
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {revisingQuoteId
                      ? `Modifying pricing schedule and terms for RFQ #${quoteModalRfq.id} • ${quoteModalRfq.title}`
                      : quoteModalRfq.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuoteModalRfq(null);
                    setRevisingQuoteId(null);
                    setRevisingQuoteNo(null);
                  }}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-6 space-y-5">
                {/* RFQ Sourcing Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium">Location</span>
                    <strong className="text-slate-900 dark:text-slate-100">{quoteModalRfq.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium">Currency</span>
                    <strong className="text-slate-900 dark:text-slate-100">{quoteModalRfq.currency}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium">Target Budget</span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {quoteModalRfq.optionalBudget ? `${quoteModalRfq.currency} ${quoteModalRfq.optionalBudget}` : "Open"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium">Deadline</span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {quoteModalRfq.deadline ? new Date(quoteModalRfq.deadline).toLocaleDateString() : "Open"}
                    </strong>
                  </div>
                </div>

                {/* Quote Currency & Delivery Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-currency" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Quote Currency
                    </Label>
                    <select
                      id="quote-currency"
                      value={quoteCurrency}
                      onChange={(e) => setQuoteCurrency(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#008779]"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="delivery-time" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Lead Delivery Timeline
                    </Label>
                    <Input
                      id="delivery-time"
                      value={quoteDeliveryTime}
                      onChange={(e) => setQuoteDeliveryTime(e.target.value)}
                      placeholder="e.g. 14 business days upon PO receipt"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Line Items Pricing Table */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Itemized Pricing Schedule <span className="text-red-500">*</span>
                  </Label>

                  {quoteModalRfq.lineItems && quoteModalRfq.lineItems.length > 0 ? (
                    <div className="space-y-3">
                      {quoteModalRfq.lineItems.map((li, idx) => {
                        const lineId = li.id || idx;
                        const unitPrice = quoteLineItemPrices[lineId]?.unitPrice || "";
                        const itemNotes = quoteLineItemPrices[lineId]?.notes || "";
                        const lineTotal = (Number(unitPrice) || 0) * (Number(li.quantity) || 1);

                        return (
                          <div
                            key={lineId}
                            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-900 dark:text-slate-100">
                                {idx + 1}. {li.name}
                              </span>
                              <span className="text-slate-600 dark:text-slate-300">
                                Required: {li.quantity} {li.unit}
                              </span>
                            </div>

                            {li.specifications && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Specs: {li.specifications}
                              </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                              <div className="sm:col-span-5 space-y-1">
                                <Label className="text-[11px] text-slate-600 dark:text-slate-400">
                                  Unit Price ({quoteCurrency}) *
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="e.g. 75.00"
                                  value={unitPrice}
                                  onChange={(e) =>
                                    handleQuotePriceChange(lineId, "unitPrice", e.target.value)
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>

                              <div className="sm:col-span-4 space-y-1">
                                <Label className="text-[11px] text-slate-600 dark:text-slate-400">
                                  Notes / Terms
                                </Label>
                                <Input
                                  placeholder="e.g. Includes 2y warranty"
                                  value={itemNotes}
                                  onChange={(e) =>
                                    handleQuotePriceChange(lineId, "notes", e.target.value)
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>

                              <div className="sm:col-span-3 space-y-1 text-right sm:self-center">
                                <span className="text-[11px] text-slate-500 block">Subtotal</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {quoteCurrency} {lineTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No specific line items defined for this RFQ.</p>
                  )}
                </div>

                {/* Grand Total Summary */}
                <div className="p-4 rounded-xl bg-[#008779]/10 dark:bg-[#008779]/20 border border-[#008779]/30 dark:border-[#008779]/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#008779] dark:text-[#00a896] block">
                      Total Quotation Value
                    </span>
                    <span className="text-[11px] text-[#008779]/80 dark:text-[#00a896]/80">
                      Calculated across all itemized unit rates
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-[#008779] dark:text-[#00a896]">
                    {quoteCurrency} {calculateQuoteGrandTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuoteModalRfq(null);
                    setRevisingQuoteId(null);
                    setRevisingQuoteNo(null);
                  }}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmittingQuote}
                  onClick={handleCreateQuote}
                  className="h-9 text-xs bg-[#008779] text-white hover:bg-[#007063] active:bg-[#005c52] font-semibold"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin text-white" />
                      <span className="text-white">
                        {revisingQuoteId ? "Revising Quotation..." : "Submitting Quote..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 mr-1.5 text-white" />
                      <span className="text-white font-semibold">
                        {revisingQuoteId ? "Update / Revise Quotation" : "Submit Quotation"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW IN-PROCESS QUOTATION DETAILS REVIEW MODAL */}
        {selectedDetailQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
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
                  onClick={() => setSelectedDetailQuote(null)}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
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

                {/* Footer Buttons for Buyer, Vendor & Admin */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDetailQuote(null)}
                    className="h-8 px-3 text-xs"
                  >
                    Close
                  </Button>
                  {(role === "vendor" || role === "admin") && selectedDetailQuote.status !== "ACCEPTED" && selectedDetailQuote.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const quoteToRevise = selectedDetailQuote;
                        setSelectedDetailQuote(null);
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
                        setSelectedDetailQuote(null);
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
                        setSelectedDetailQuote(null);
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
                        setSelectedDetailQuote(null);
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
        )}

        {/* VIEW RFQ DETAIL & QUOTATIONS REVIEW MODAL */}
        {selectedDetailRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
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
                  onClick={() => setSelectedDetailRfq(null)}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
                          setSelectedDetailRfq(null);
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
                      setSelectedDetailRfq(null);
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
                        setSelectedDetailRfq(null);
                        handleStartEdit(rfqToEdit);
                      }}
                      variant="outline"
                      className="h-9 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                    >
                      <Edit className="size-3.5 mr-1" />
                      Edit RFQ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePublishRfqDirect(selectedDetailRfq.id)}
                      className="h-9 text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
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
                  onClick={() => setSelectedDetailRfq(null)}
                  className="h-9 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SIDE-BY-SIDE RFQ QUOTATION COMPARISON & AWARD MODAL */}
        {comparingRfqId && (
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
                  onClick={() => {
                    setComparingRfqId(null);
                    setComparisonData(null);
                  }}
                  className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                                    {isAwardingQuoteId === q.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Trophy className="size-3.5" />
                                    )}
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
                                // Find lowest unit price across vendors for this item
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
                  onClick={() => {
                    setComparingRfqId(null);
                    setComparisonData(null);
                  }}
                  className="h-9 px-4 text-xs font-semibold cursor-pointer"
                >
                  Close Studio
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CONTRACT AWARD CONFIRMATION DIALOG */}
        {awardConfirmQuote && (
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
                  onClick={() => setAwardConfirmQuote(null)}
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
                  {isAwardingQuoteId !== null ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trophy className="size-3.5" />
                  )}
                  <span>Confirm & Award Contract</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
