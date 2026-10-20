"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface FullScreenBlurLoaderProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export function FullScreenBlurLoader({
  isOpen,
  title = "Processing Request...",
  description = "Please wait while we save your changes to the server.",
}: FullScreenBlurLoaderProps) {
  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="flex flex-col items-center max-w-sm w-full mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center space-y-4">
        {/* Animated Glowing Spinner Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-14 rounded-full bg-[#008779]/20 animate-ping" />
          <div className="size-14 rounded-full bg-[#008779]/10 flex items-center justify-center border border-[#008779]/30">
            <Loader2 className="size-7 text-[#008779] animate-spin" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Sleek Progress Indeterminate Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-[#008779] rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}
