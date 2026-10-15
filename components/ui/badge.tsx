import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
        secondary:
          "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        destructive:
          "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60",
        outline: "text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900",
        buyer:
          "border-[#008779]/30 dark:border-[#008779]/40 bg-[#008779]/10 dark:bg-[#008779]/20 text-[#008779] dark:text-[#00a896] shadow-2xs font-semibold",
        teal:
          "border-[#008779] bg-[#008779] text-white shadow-2xs font-bold",
        vendor:
          "border-emerald-200 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs",
        admin:
          "border-purple-200 dark:border-purple-800 bg-purple-50/90 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-2xs",
        success:
          "border-emerald-200 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs",
        warning:
          "border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-2xs",
        info:
          "border-sky-200 dark:border-sky-800 bg-sky-50/90 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-2xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
