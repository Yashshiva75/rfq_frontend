"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { FolderOpen, Eye, ArrowUpDown, DollarSign } from "lucide-react";
import { UserRole, RFQ } from "@/types/rfq";

export interface TendersTabProps {
  role: UserRole;
  rfqsList: RFQ[];
  isLoadingData: boolean;
  setSelectedDetailRfq: (rfq: any) => void;
  handleOpenCompareModal: (rfqId: number) => void;
  handleOpenQuoteModal: (rfq: RFQ) => void;
}

export function TendersTab({
  role,
  rfqsList,
  isLoadingData,
  setSelectedDetailRfq,
  handleOpenCompareModal,
  handleOpenQuoteModal,
}: TendersTabProps) {
  const publishedRfqs = rfqsList.filter((r) => r.status === "PUBLISHED");

  return (
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
        {isLoadingData ? (
          <div className="p-4">
            <TableSkeleton rows={4} columns={6} />
          </div>
        ) : publishedRfqs.length > 0 ? (
          publishedRfqs.map((rfq: any) => (
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
  );
}
