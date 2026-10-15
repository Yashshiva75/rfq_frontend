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
  Users,
  Shield,
  Layers,
  BarChart3,
  Building2,
  FileCheck2,
  History,
  Activity,
  LogOut,
  FolderOpen,
  Briefcase,
  Store,
} from "lucide-react";
import { AuthUser, UserRole } from "@/types/auth";
import { api } from "@/lib/api";

export interface SidebarBadgeCounts {
  openTenders?: number;
  submittedQuotes?: number;
  awardedContracts?: number;
  receivedQuotations?: number;
  activeRfqs?: number;
  totalUsers?: number;
  [key: string]: number | string | undefined;
}

interface AppSidebarProps {
  user: AuthUser;
  onLogout: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSwitchRole?: (newRole: UserRole) => void;
  badgeCounts?: SidebarBadgeCounts;
}

export function AppSidebar({
  user,
  onLogout,
  activeTab = "overview",
  onSelectTab,
  onSwitchRole,
  badgeCounts,
}: AppSidebarProps) {
  const { open } = useSidebar();
  const currentRole = (user.role || "buyer").toLowerCase() as UserRole;

  // Local fallback state to dynamically fetch counts if not provided via props
  const [internalCounts, setInternalCounts] = React.useState<SidebarBadgeCounts>({});

  React.useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [rfqsResult, quotesResult] = await Promise.allSettled([
          api.getRfqs(),
          api.getQuotations(),
        ]);
        if (!isMounted) return;

        const rfqs = rfqsResult.status === "fulfilled" ? rfqsResult.value : [];
        const quotes = quotesResult.status === "fulfilled" ? quotesResult.value : [];

        setInternalCounts({
          openTenders: rfqs.filter((r: any) => r.status === "PUBLISHED").length,
          submittedQuotes: quotes.length,
          awardedContracts: quotes.filter((q: any) => q.status === "ACCEPTED").length,
          receivedQuotations: quotes.length,
          activeRfqs: rfqs.length,
        });
      } catch {
        // Fallback gracefully
      }
    };

    fetchCounts();
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
          {
            label: "Supplier Management",
            items: [
              {
                id: "vendors",
                title: "Suppliers Directory",
                icon: Users,
                badge: undefined,
              },
              {
                id: "analytics",
                title: "Procurement Analytics",
                icon: BarChart3,
                badge: undefined,
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
              {
                id: "awarded",
                title: "Awarded Contracts",
                icon: FileCheck2,
                badge: String(effectiveCounts.awardedContracts ?? 0),
              },
            ],
          },
          {
            label: "Vendor Operations",
            items: [
              {
                id: "profile",
                title: "Supplier Profile",
                icon: Building2,
                badge: undefined,
              },
              {
                id: "compliance",
                title: "Compliance & Docs",
                icon: Shield,
                badge: undefined,
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
                id: "users",
                title: "User Management",
                icon: Users,
                badge:
                  effectiveCounts.totalUsers && effectiveCounts.totalUsers > 0
                    ? String(effectiveCounts.totalUsers)
                    : undefined,
              },
              {
                id: "roles",
                title: "Roles & RBAC Matrix",
                icon: Shield,
                badge: "3",
              },
            ],
          },
          {
            label: "Procurement Oversight",
            items: [
              {
                id: "all-rfqs",
                title: "Global RFQ Audits",
                icon: FileText,
                badge:
                  effectiveCounts.activeRfqs && effectiveCounts.activeRfqs > 0
                    ? String(effectiveCounts.activeRfqs)
                    : undefined,
              },
              {
                id: "all-quotes",
                title: "Global Quotations",
                icon: Inbox,
                badge:
                  effectiveCounts.receivedQuotations && effectiveCounts.receivedQuotations > 0
                    ? String(effectiveCounts.receivedQuotations)
                    : undefined,
              },
              {
                id: "audit-logs",
                title: "System Audit Trail",
                icon: History,
                badge: undefined,
              },
              {
                id: "health",
                title: "Database Health",
                icon: Activity,
                badge: "Live",
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
