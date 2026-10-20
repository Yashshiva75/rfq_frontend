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
import { Badge } from "@/components/ui/badge";
import { AuthUser, UserRole } from "@/types/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Category, Quotation, RFQ, RfqComparisonData } from "@/types/rfq";
import { AdminRbacScreen } from "@/components/admin/admin-rbac-screen";
import { FullScreenBlurLoader } from "@/components/ui/fullscreen-blur-loader";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { CreateRfqTab } from "@/components/dashboard/create-rfq-tab";
import { QuotationsTab } from "@/components/dashboard/quotations-tab";
import { TendersTab } from "@/components/dashboard/tenders-tab";
import { QuotationSubmissionModal } from "@/components/dashboard/quotation-submission-modal";
import { RfqDetailsModal } from "@/components/dashboard/rfq-details-modal";
import { QuotationDetailsModal } from "@/components/dashboard/quotation-details-modal";
import { QuoteComparisonModal } from "@/components/dashboard/quote-comparison-modal";
import { ConfirmAwardModal } from "@/components/dashboard/confirm-award-modal";
import { useDashboardItems } from "@/hooks/use-dashboard-items";
import { useRfqForm } from "@/hooks/use-rfq-form";
import { useQuoteSubmission } from "@/hooks/use-quote-submission";

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

  // RFQ Creation / Edit Form Hook
  const rfqForm = useRfqForm({ loadData, setActiveTab });

  // Vendor Quotation Submission Hook
  const quoteSubmission = useQuoteSubmission({ rfqsList, loadData });

  // Dashboard Items, Filtering, Search & Sorting Hook
  const dashboardItems = useDashboardItems({
    rfqsList,
    quotationsList,
    user,
    loadData,
    setRfqsList,
  });

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

  // Load user session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("rfq_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const currentRole = (parsed?.role || "").toLowerCase();
        if ((activeTab === "roles" || activeTab === "users") && currentRole !== "admin") {
          setActiveTab("overview");
        } else if (activeTab === "create-rfq" && currentRole === "vendor") {
          setActiveTab("overview");
        }
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      const currentRole = (user.role || "").toLowerCase();
      if ((activeTab === "roles" || activeTab === "users") && currentRole !== "admin") {
        setActiveTab("overview");
      } else if (activeTab === "create-rfq" && currentRole === "vendor") {
        setActiveTab("overview");
      }
      loadData();
    }
  }, [user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("rfq_user");
    localStorage.removeItem("rfq_token");
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("user_role", { path: "/" });
    setActiveTab("overview");
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

  // BUYER & ADMIN: Open Comparison Studio
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

  // BUYER & ADMIN: Award Quotation API
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

      if (comparingRfqId) {
        await handleOpenCompareModal(comparingRfqId, comparisonSortBy, comparisonSortOrder);
      }
      if (selectedDetailRfq?.id === rfqId) {
        const refreshedRfq = await api.getRfqById(rfqId);
        setSelectedDetailRfq(refreshedRfq);
      }
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading workspace...</p>
      </div>
    );
  }

  const role = String(user.role).toLowerCase() as UserRole;

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Full-Screen Blur Loader for Form Submissions */}
      <FullScreenBlurLoader
        isOpen={rfqForm.isCreatingRfq}
        title={rfqForm.editingRfqId ? "Updating RFQ Tender..." : "Publishing RFQ Tender..."}
        description="Please wait while your procurement tender and line items are saved to the server."
      />
      <FullScreenBlurLoader
        isOpen={quoteSubmission.isSubmittingQuote}
        title={
          quoteSubmission.revisingQuoteId
            ? "Submitting Quotation Revision..."
            : "Submitting Quotation Proposal..."
        }
        description="Please wait while your prices and proposal documents are securely processed."
      />
      <FullScreenBlurLoader
        isOpen={isAwardingQuoteId !== null}
        title="Awarding Procurement Contract..."
        description="Please wait while the contract is finalized and status updated across suppliers."
      />

      <AppSidebar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        onSelectCategory={(catName) => {
          dashboardItems.setSearchQuery(catName);
          setActiveTab("overview");
        }}
      />

      {/* Main Content Area: h-screen overflow-y-auto so sidebar remains fixed and logout button is never hidden */}
      <SidebarInset className="bg-slate-50 dark:bg-slate-950 h-screen overflow-y-auto text-slate-900 dark:text-slate-100 flex flex-col w-full flex-1 min-w-0">
        {/* Full-Width App Header with Sidebar Trigger & Theme Toggler */}
        <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <SidebarTrigger />
            <div className="h-5 w-[1px] bg-slate-200 dark:border-slate-800" />

            {/* Breadcrumb / Section Name */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 min-w-0">
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
          <div className="flex items-center gap-2.5 shrink-0">
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
            <OverviewTab
              role={role}
              isLoadingData={isLoadingData}
              rfqsList={rfqsList}
              quotationsList={quotationsList}
              categoriesList={categoriesList}
              allDashboardItems={dashboardItems.allDashboardItems}
              inProcessQuotes={dashboardItems.inProcessQuotes}
              sortedDashboardItems={dashboardItems.sortedDashboardItems}
              availableLocations={dashboardItems.availableLocations}
              activeFiltersCount={dashboardItems.activeFiltersCount}
              searchQuery={dashboardItems.searchQuery}
              setSearchQuery={dashboardItems.setSearchQuery}
              filterLocation={dashboardItems.filterLocation}
              setFilterLocation={dashboardItems.setFilterLocation}
              filterCategory={dashboardItems.filterCategory}
              setFilterCategory={dashboardItems.setFilterCategory}
              filterOpenOnly={dashboardItems.filterOpenOnly}
              setFilterOpenOnly={dashboardItems.setFilterOpenOnly}
              filterMinBudget={dashboardItems.filterMinBudget}
              setFilterMinBudget={dashboardItems.setFilterMinBudget}
              filterMaxBudget={dashboardItems.filterMaxBudget}
              setFilterMaxBudget={dashboardItems.setFilterMaxBudget}
              isFiltersExpanded={dashboardItems.isFiltersExpanded}
              setIsFiltersExpanded={dashboardItems.setIsFiltersExpanded}
              isSearchingBackend={dashboardItems.isSearchingBackend}
              rfqStatusFilter={dashboardItems.rfqStatusFilter}
              setRfqStatusFilter={dashboardItems.setRfqStatusFilter}
              sortField={dashboardItems.sortField}
              sortOrder={dashboardItems.sortOrder}
              handleSort={dashboardItems.handleSort}
              handleResetFilters={dashboardItems.handleResetFilters}
              handleExportCsv={dashboardItems.handleExportCsv}
              handleOpenCreateRfq={rfqForm.handleOpenCreateRfq}
              handleStartEdit={rfqForm.handleStartEdit}
              handlePublishRfqDirect={handlePublishRfqDirect}
              handleDeleteRfq={handleDeleteRfq}
              handleOpenCompareModal={handleOpenCompareModal}
              handleOpenQuoteModal={quoteSubmission.handleOpenQuoteModal}
              handleOpenReviseModal={quoteSubmission.handleOpenReviseModal}
              setSelectedDetailQuote={setSelectedDetailQuote}
              setSelectedDetailRfq={setSelectedDetailRfq}
              setAwardConfirmQuote={setAwardConfirmQuote}
              handleUpdateQuoteStatus={handleUpdateQuoteStatus}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB: CREATE / EDIT RFQ (Buyer) */}
          {activeTab === "create-rfq" && (
            <CreateRfqTab
              editingRfqId={rfqForm.editingRfqId}
              rfqTitle={rfqForm.rfqTitle}
              setRfqTitle={rfqForm.setRfqTitle}
              rfqDescription={rfqForm.rfqDescription}
              setRfqDescription={rfqForm.setRfqDescription}
              rfqCategory={rfqForm.rfqCategory}
              setRfqCategory={rfqForm.setRfqCategory}
              rfqLocation={rfqForm.rfqLocation}
              setRfqLocation={rfqForm.setRfqLocation}
              rfqCurrency={rfqForm.rfqCurrency}
              setRfqCurrency={rfqForm.setRfqCurrency}
              rfqBudget={rfqForm.rfqBudget}
              setRfqBudget={rfqForm.setRfqBudget}
              rfqDeadline={rfqForm.rfqDeadline}
              setRfqDeadline={rfqForm.setRfqDeadline}
              rfqLineItems={rfqForm.rfqLineItems}
              categoriesList={categoriesList}
              isCreatingRfq={rfqForm.isCreatingRfq}
              handleAddLineItem={rfqForm.handleAddLineItem}
              handleRemoveLineItem={rfqForm.handleRemoveLineItem}
              handleLineItemChange={rfqForm.handleLineItemChange}
              handleSaveRfq={rfqForm.handleSaveRfq}
              handleCancelEdit={rfqForm.handleCancelEdit}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB: RECEIVED QUOTATIONS (Buyer) / MY BIDS (Vendor) */}
          {(activeTab === "quotations" || activeTab === "my-bids") && (
            <QuotationsTab
              role={role}
              quotationsList={quotationsList}
              isLoadingData={isLoadingData}
              handleOpenCompareModal={handleOpenCompareModal}
              handleUpdateQuoteStatus={handleUpdateQuoteStatus}
              setAwardConfirmQuote={setAwardConfirmQuote}
              setSelectedDetailQuote={setSelectedDetailQuote}
              handleOpenReviseModal={quoteSubmission.handleOpenReviseModal}
            />
          )}

          {/* TAB: OPEN TENDERS (Vendor) */}
          {activeTab === "tenders" && (
            <TendersTab
              role={role}
              rfqsList={rfqsList}
              isLoadingData={isLoadingData}
              setSelectedDetailRfq={setSelectedDetailRfq}
              handleOpenCompareModal={handleOpenCompareModal}
              handleOpenQuoteModal={quoteSubmission.handleOpenQuoteModal}
            />
          )}

          {/* TAB: USERS & ROLES (Admin only) - Live RBAC Management Screen */}
          {role === "admin" && (activeTab === "users" || activeTab === "roles") && (
            <div className="w-full">
              <AdminRbacScreen />
            </div>
          )}
        </div>

        {/* MODALS */}
        <QuotationSubmissionModal
          quoteModalRfq={quoteSubmission.quoteModalRfq}
          revisingQuoteId={quoteSubmission.revisingQuoteId}
          revisingQuoteNo={quoteSubmission.revisingQuoteNo}
          quoteCurrency={quoteSubmission.quoteCurrency}
          setQuoteCurrency={quoteSubmission.setQuoteCurrency}
          quoteDeliveryTime={quoteSubmission.quoteDeliveryTime}
          setQuoteDeliveryTime={quoteSubmission.setQuoteDeliveryTime}
          quoteLineItemPrices={quoteSubmission.quoteLineItemPrices}
          handleQuotePriceChange={quoteSubmission.handleQuotePriceChange}
          quotePendingFile={quoteSubmission.quotePendingFile}
          setQuotePendingFile={quoteSubmission.setQuotePendingFile}
          quoteFileError={quoteSubmission.quoteFileError}
          setQuoteFileError={quoteSubmission.setQuoteFileError}
          isSubmittingQuote={quoteSubmission.isSubmittingQuote}
          handleCreateQuote={quoteSubmission.handleCreateQuote}
          onClose={quoteSubmission.handleCloseQuoteModal}
        />

        <RfqDetailsModal
          selectedDetailRfq={selectedDetailRfq}
          role={role}
          onClose={() => setSelectedDetailRfq(null)}
          handleOpenQuoteModal={quoteSubmission.handleOpenQuoteModal}
          handleStartEdit={rfqForm.handleStartEdit}
          handlePublishRfqDirect={handlePublishRfqDirect}
          handleOpenCompareModal={handleOpenCompareModal}
          handleUpdateQuoteStatus={handleUpdateQuoteStatus}
          setAwardConfirmQuote={setAwardConfirmQuote}
        />

        <QuotationDetailsModal
          selectedDetailQuote={selectedDetailQuote}
          user={user}
          role={role}
          onClose={() => setSelectedDetailQuote(null)}
          handleOpenReviseModal={quoteSubmission.handleOpenReviseModal}
          handleOpenCompareModal={handleOpenCompareModal}
          handleUpdateQuoteStatus={handleUpdateQuoteStatus}
          setAwardConfirmQuote={setAwardConfirmQuote}
        />

        <QuoteComparisonModal
          comparingRfqId={comparingRfqId}
          comparisonData={comparisonData}
          isLoadingComparison={isLoadingComparison}
          comparisonSortBy={comparisonSortBy}
          comparisonSortOrder={comparisonSortOrder}
          isAwardingQuoteId={isAwardingQuoteId}
          role={role}
          onClose={() => {
            setComparingRfqId(null);
            setComparisonData(null);
          }}
          handleSortComparison={handleSortComparison}
          setComparisonSortOrder={setComparisonSortOrder}
          handleOpenCompareModal={handleOpenCompareModal}
          setAwardConfirmQuote={setAwardConfirmQuote}
        />

        <ConfirmAwardModal
          awardConfirmQuote={awardConfirmQuote}
          isAwardingQuoteId={isAwardingQuoteId}
          onClose={() => setAwardConfirmQuote(null)}
          handleAwardQuotation={handleAwardQuotation}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
