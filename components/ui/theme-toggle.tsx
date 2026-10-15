"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("rfq_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      applyTheme("dark");
    } else {
      setTheme("light");
      applyTheme("light");
    }
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("rfq_theme", newTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={
          className ||
          "h-9 px-3 gap-2 rounded-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs backdrop-blur-xs transition-colors"
        }
        aria-label="Toggle theme"
      >
        <Sun className="size-4 opacity-50 text-slate-500" />
        {showLabel && <span className="text-xs font-semibold">Theme</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={
        className ||
        "h-9 px-3 gap-2 rounded-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs backdrop-blur-xs transition-colors"
      }
      title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun className="size-4 text-amber-400" />
          {showLabel && <span className="text-xs font-semibold">Day Mode</span>}
        </>
      ) : (
        <>
          <Moon className="size-4 text-slate-600 dark:text-slate-300" />
          {showLabel && <span className="text-xs font-semibold">Night Mode</span>}
        </>
      )}
    </Button>
  );
}
