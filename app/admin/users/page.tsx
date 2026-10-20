"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AdminRbacScreen } from "@/components/admin/admin-rbac-screen";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("rfq_user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const role = (
        Cookies.get("user_role") ||
        parsed?.role ||
        ""
      ).toLowerCase();
      const token =
        Cookies.get("auth_token") || localStorage.getItem("rfq_token");

      if (!token) {
        setIsAuthorized(false);
        router.replace("/login");
        return;
      }

      if (role !== "admin") {
        setIsAuthorized(false);
        router.replace("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch {
      setIsAuthorized(false);
      router.replace("/dashboard");
    }
  }, [router]);

  // Loading state while verifying role
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 gap-2">
        <Loader2 className="size-6 animate-spin text-[#008779]" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Verifying administrator credentials...
        </span>
      </div>
    );
  }

  // Denied state if non-admin
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="size-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-3">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Access Denied
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Administrative privileges required. Redirecting to your workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-[#008779]/10 text-[#008779] flex items-center justify-center">
              <Shield className="size-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">Mini RFQ Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AdminRbacScreen />
      </main>
    </div>
  );
}
