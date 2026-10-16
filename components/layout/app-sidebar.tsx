"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  FileText,
  PlusCircle,
  Inbox,
  Send,
  Shield,
  Layers,
  LogOut,
  FolderOpen,
  Briefcase,
  Store,
  Tag,
} from "lucide-react";
import { AuthUser, UserRole } from "@/types/auth";
import { api } from "@/lib/api";
import { NavigationCategorySummary } from "@/types/rfq";

export interface SidebarBadgeCounts {
  openTenders?: number;
  submittedQuotes?: number;
  awardedContracts?: number;
  receivedQuotations?: number;
  activeRfqs?: number;
  totalUsers?: number;
  draftRfqs?: number;
  publishedRfqs?: number;
  awardedRfqs?: number;
  [key: string]: number | string | undefined;
}

interface AppSidebarProps {
  user: AuthUser;
  onLogout: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSwitchRole?: (newRole: UserRole) => void;
  onSelectCategory?: (categoryName: string) => void;
  badgeCounts?: SidebarBadgeCounts;
}

export function AppSidebar({
  user,
  onLogout,
  activeTab = "overview",
  onSelectTab,
  onSwitchRole,
  onSelectCategory,
  badgeCounts,
}: AppSidebarProps) {
  const { open } = useSidebar();
  const currentRole = (user.role || "buyer").toLowerCase() as UserRole;

  // Real-time navigation badges and category counters from live backend API
  const [internalCounts, setInternalCounts] = React.useState<SidebarBadgeCounts>({});
  const [activeCategories, setActiveCategories] = React.useState<NavigationCategorySummary[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const summary = await api.getNavigationSummary();
        if (!isMounted) return;

        const b = summary.badges || {};
        if (summary.role === "vendor") {
          setInternalCounts({
            openTenders: b.openRfqs ?? 0,
            submittedQuotes: b.myQuotes ?? b.submittedQuotes ?? 0,
            awardedContracts: b.acceptedQuotes ?? 0,
            receivedQuotations: b.myQuotes ?? 0,
            activeRfqs: b.openRfqs ?? 0,
          });
        } else if (summary.role === "admin") {
          setInternalCounts({
            openTenders: b.publishedRfqs ?? 0,
            submittedQuotes: b.totalQuotes ?? 0,
            awardedContracts: b.awardedRfqs ?? 0,
            receivedQuotations: b.totalQuotes ?? 0,
            activeRfqs: b.totalRfqs ?? 0,
            totalUsers: b.totalUsers ?? 0,
            draftRfqs: b.draftRfqs ?? 0,
            publishedRfqs: b.publishedRfqs ?? 0,
          });
        } else {
          // Buyer
          setInternalCounts({
            openTenders: b.publishedRfqs ?? 0,
            submittedQuotes: b.totalQuotesReceived ?? 0,
            awardedContracts: b.awardedRfqs ?? 0,
            receivedQuotations: b.totalQuotesReceived ?? 0,
            activeRfqs: b.totalRfqs ?? 0,
            draftRfqs: b.draftRfqs ?? 0,
            publishedRfqs: b.publishedRfqs ?? 0,
          });
        }

        if (summary.categories) {
          setActiveCategories(summary.categories);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  const effectiveCounts: SidebarBadgeCounts = {
    openTenders: badgeCounts?.openTenders ?? internalCounts.openTenders ?? 0,
    submittedQuotes: badgeCounts?.submittedQuotes ?? internalCounts.submittedQuotes ?? 0,
    awardedContracts: badgeCounts?.awardedContracts ?? internalCounts.awardedContracts ?? 0,
    receivedQuotations: badgeCounts?.receivedQuotations ?? internalCounts.receivedQuotations ?? 0,
    activeRfqs: badgeCounts?.activeRfqs ?? internalCounts.activeRfqs ?? 0,
    totalUsers: badgeCounts?.totalUsers ?? internalCounts.totalUsers ?? 0,
  };

  const getNavSections = () => {
    switch (currentRole) {
      case "buyer":
        return [
          {
            label: "Procurement Workspace",
            items: [
              {
                id: "overview",
                title: "Quotation Dashboard",
                icon: Layers,
                badge: undefined,
              },
              {
                id: "create-rfq",
                title: "Create New RFQ",
                icon: PlusCircle,
                badge: "New",
              },
              {
                id: "quotations",
                title: "Received Quotations",
                icon: Inbox,
                badge:
                  effectiveCounts.receivedQuotations && effectiveCounts.receivedQuotations > 0
                    ? String(effectiveCounts.receivedQuotations)
                    : undefined,
              },
            ],
          },
        ];

      case "vendor":
        return [
          {
            label: "Supplier Workspace",
            items: [
              {
                id: "overview",
                title: "Quotation Dashboard",
                icon: Layers,
                badge: undefined,
              },
              {
                id: "tenders",
                title: "Open RFQ Tenders",
                icon: FolderOpen,
                badge: String(effectiveCounts.openTenders ?? 0),
              },
              {
                id: "my-bids",
                title: "My Submitted Quotes",
                icon: Send,
                badge: String(effectiveCounts.submittedQuotes ?? 0),
              },
            ],
          },
        ];

      case "admin":
        return [
          {
            label: "Administration",
            items: [
              {
                id: "overview",
                title: "Quotation Dashboard",
                icon: Layers,
                badge: undefined,
              },
              {
                id: "roles",
                title: "Roles & RBAC Matrix",
                icon: Shield,
                badge: undefined,
              },
            ],
          },
        ];

      default:
        return [
          {
            label: "Workspace",
            items: [
              {
                id: "overview",
                title: "Overview",
                icon: Layers,
                badge: undefined,
              },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <Sidebar>
      {/* Brand Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#008779] hover:bg-[#007063] text-white shadow-xs font-bold transition-colors"
            title="Mini RFQ"
          >
            <FileText className="size-4.5 text-white" />
          </div>
          {open && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate">
                Mini RFQ
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize flex items-center gap-1 truncate">
                {currentRole === "buyer" && <Briefcase className="size-3 text-[#008779] dark:text-[#00a896]" />}
                {currentRole === "vendor" && <Store className="size-3 text-emerald-600 dark:text-emerald-400" />}
                {currentRole === "admin" && <Shield className="size-3 text-purple-600 dark:text-purple-400" />}
                {currentRole} Portal
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => onSelectTab?.(item.id)}
                        tooltip={item.title}
                        className={
                          isActive
                            ? "bg-[#008779]/10 dark:bg-[#008779]/20 text-[#008779] dark:text-[#00a896] font-semibold border border-[#008779]/30 dark:border-[#008779]/40 shadow-2xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium"
                        }
                      >
                        <Icon className={`size-4 shrink-0 ${isActive ? "text-[#008779] dark:text-[#00a896]" : "text-slate-400 dark:text-slate-500"}`} />
                        {open && (
                          <span className={`truncate ${isActive ? "text-[#008779] dark:text-[#00a896] font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
                            {item.title}
                          </span>
                        )}
                        {open && item.badge && (
                          <SidebarMenuBadge
                            className={
                              isActive
                                ? "text-[#008779] dark:text-[#00a896] bg-[#008779]/15 dark:bg-[#008779]/25 border-[#008779]/30 dark:border-[#008779]/40"
                                : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }
                          >
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Active Categories from Navigation Summary API */}
        {activeCategories.length > 0 && open && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Active Sectors</span>
              <Tag className="size-3 text-[#008779]" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {activeCategories.slice(0, 6).map((cat) => (
                  <SidebarMenuItem key={cat.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectCategory?.(cat.name)}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer"
                    >
                      <Tag className="size-3 text-slate-400 shrink-0" />
                      <span className="truncate">{cat.name}</span>
                      {cat.activeRfqCount > 0 && (
                        <SidebarMenuBadge className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800">
                          {cat.activeRfqCount}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer Profile & Logout */}
      <SidebarFooter>
        {open ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="size-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-800 flex items-center justify-center cursor-pointer transition-colors"
              title="Sign out of account"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700"
              title={`${user.name} (${user.email})`}
            >
              {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="size-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-800 flex items-center justify-center cursor-pointer transition-colors"
              title="Sign out of account"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
