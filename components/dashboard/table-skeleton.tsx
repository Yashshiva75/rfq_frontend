"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 7, rows = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          className="flex items-center gap-4 px-4 py-4 sm:px-6 animate-pulse"
        >
          {/* Ref / Code Badge skeleton */}
          <div className="w-24 shrink-0">
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>

          {/* Date skeleton */}
          <div className="w-24 shrink-0 hidden md:block">
            <Skeleton className="h-4 w-16 rounded" />
          </div>

          {/* Title / Requirement skeleton */}
          <div className="flex-1 min-w-[140px] space-y-1.5">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>

          {/* Location skeleton */}
          <div className="w-28 shrink-0 hidden lg:block">
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          {/* Supplier / Company skeleton */}
          <div className="w-32 shrink-0 hidden sm:block">
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          {/* Amount / Budget skeleton */}
          <div className="w-28 shrink-0 text-right">
            <Skeleton className="h-5 w-20 ml-auto rounded" />
          </div>

          {/* Status pill & Action buttons skeleton */}
          <div className="w-28 shrink-0 flex items-center justify-end gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
