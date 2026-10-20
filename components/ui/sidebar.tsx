"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft, PanelLeftClose, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SIDEBAR_COOKIE_NAME = "sidebar_open";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContext = {
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);

    const open = openProp !== undefined ? openProp : _open;

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const nextState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(nextState);
        } else {
          _setOpen(nextState);
        }
        try {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        } catch {}
      },
      [setOpenProp, open]
    );

    const toggleSidebar = React.useCallback(() => {
      setOpen((prev) => !prev);
    }, [setOpen]);

    // Responsive check
    React.useEffect(() => {
      const handleResize = () => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        if (mobile) {
          _setOpen(false);
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Keyboard shortcut (Cmd+B or Ctrl+B)
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key.toLowerCase() === "b" &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    return (
      <SidebarContext.Provider
        value={{
          open,
          setOpen,
          toggleSidebar,
          isMobile,
        }}
      >
        <div
          ref={ref}
          className={cn("flex h-screen w-full bg-white dark:bg-slate-950 overflow-hidden relative", className)}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"aside">
>(({ className, children, ...props }, ref) => {
  const { open, setOpen, isMobile } = useSidebar();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        ref={ref}
        data-state={open ? "open" : "closed"}
        aria-label="Application Navigation"
        className={cn(
          "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-40 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden",
          // Desktop positioning: w-64 when open, w-16 icon bar when collapsed
          !isMobile && (open ? "w-64" : "w-16"),
          // Mobile positioning
          isMobile && [
            "fixed inset-y-0 left-0 w-72 shadow-xl",
            open ? "translate-x-0" : "-translate-x-full",
          ],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-300 overflow-x-hidden",
            open ? "w-64" : "w-16"
          )}
        >
          {children}
        </div>
      </aside>
    </>
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onClick?.(e as any);
        toggleSidebar();
      }}
      className={cn(
        "inline-flex items-center justify-center size-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer",
        className
      )}
      title={open ? "Collapse Sidebar (Ctrl+B)" : "Expand Sidebar (Ctrl+B)"}
      aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
    >
      <PanelLeft className="size-4" />
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn("flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950", className)}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all overflow-hidden shrink-0",
        open ? "p-3.5" : "p-3 justify-center",
        className
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto shrink-0 transition-all overflow-hidden",
        open ? "p-3" : "p-2",
        className
      )}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto space-y-4 bg-white dark:bg-slate-900 transition-all overflow-x-hidden min-h-0",
        open ? "p-3" : "px-2 py-3",
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1", className)} {...props} />;
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  if (!open) {
    return <div className="h-[1px] w-6 mx-auto my-2 bg-slate-200 dark:bg-slate-800" />;
  }
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none truncate",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full text-sm", className)}
    {...props}
  />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn("space-y-1 list-none p-0 m-0", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("list-none", className)} {...props} />;
});
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left",
  {
    variants: {
      variant: {
        default:
          "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
        active:
          "bg-[#008779]/10 dark:bg-[#008779]/20 text-[#008779] dark:text-[#00a896] font-semibold border border-[#008779]/30 dark:border-[#008779]/40 shadow-2xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    isActive?: boolean;
    asChild?: boolean;
    tooltip?: string;
  }
>(({ className, isActive = false, asChild = false, tooltip, ...props }, ref) => {
  const { open } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type="button"
      title={tooltip || (typeof props.children === "string" ? props.children : undefined)}
      className={cn(
        sidebarMenuButtonVariants({ variant: isActive ? "active" : "default" }),
        !open && "justify-center px-0 size-10 mx-auto",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "ml-auto inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuBadge.displayName = "SidebarMenuBadge";
