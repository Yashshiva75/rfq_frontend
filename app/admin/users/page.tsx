"use client";

import React from "react";
import Link from "next/link";
import { AdminRbacScreen } from "@/components/admin/admin-rbac-screen";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
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
