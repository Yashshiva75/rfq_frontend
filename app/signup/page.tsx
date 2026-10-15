"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Store,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      const msg = "Please provide your name or organization name.";
      setError(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    if (!email.trim()) {
      const msg = "Please provide a valid corporate email.";
      setError(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setError(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      // Save user session
      localStorage.setItem("rfq_user", JSON.stringify(data.user));
      localStorage.setItem("rfq_token", data.access_token);
      Cookies.set("auth_token", data.access_token, { expires: 7, path: "/" });
      Cookies.set("user_role", String(data.user.role), { expires: 7, path: "/" });

      toast.success("Account created successfully!", {
        description: `Welcome ${data.user.name} to Mini RFQ as ${role.toUpperCase()}.`,
      });

      // Navigate inside to the dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Failed to create account.";
      setError(msg);
      toast.error("Sign up failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 text-slate-900 dark:text-slate-100 relative transition-colors">
      {/* Top Bar with Day/Night Mode Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle showLabel />
      </div>

      <div className="w-full max-w-[540px] space-y-6">
        {/* Shadcn Signup Card */}
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl text-slate-900 dark:text-slate-100 transition-colors">
          <CardHeader className="space-y-1.5 p-6 sm:p-8 pb-4 sm:pb-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create an account
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              Enter your information below to register your procurement account
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-0 space-y-5 text-slate-900 dark:text-slate-100">
            {error && (
              <Alert variant="destructive" className="py-3 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-200">
                <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="space-y-0.5">
                  <AlertTitle className="text-sm font-semibold text-red-900 dark:text-red-300">
                    Registration error
                  </AlertTitle>
                  <AlertDescription className="text-xs text-red-800 dark:text-red-300/90">
                    {error}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Select your role
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      role === "buyer"
                        ? "border-[#008779] dark:border-[#00a896] bg-[#008779]/10 dark:bg-[#008779]/20 ring-2 ring-[#008779]/30 text-slate-900 dark:text-white shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Briefcase className="size-4 text-[#008779] dark:text-[#00a896]" />
                        Buyer
                      </span>
                      {role === "buyer" && (
                        <div className="size-4 rounded-full bg-[#008779] text-white flex items-center justify-center">
                          <Check className="size-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 leading-snug">
                      Create RFQs & evaluate quotations
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("vendor")}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      role === "vendor"
                        ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30 text-slate-900 dark:text-white shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Store className="size-4 text-emerald-600 dark:text-emerald-400" />
                        Vendor
                      </span>
                      {role === "vendor" && (
                        <div className="size-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="size-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 leading-snug">
                      Submit bids & supply contracts
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Full Name / Organization
                </Label>
                <div className="relative">
                  <UserIcon className="size-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jane Doe or Apex Procurement"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#008779]/20 focus-visible:border-[#008779]"
                    required
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Corporate Email
                </Label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#008779]/20 focus-visible:border-[#008779]"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="size-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#008779]/20 focus-visible:border-[#008779]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="size-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11 text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#008779]/20 focus-visible:border-[#008779]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-[#008779] hover:bg-[#007063] active:bg-[#005c52] text-white transition-colors mt-2 cursor-pointer shadow-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2 text-white" />
                    <span className="text-white">Creating account...</span>
                  </>
                ) : (
                  <span className="text-white">Create account</span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-slate-900 dark:text-[#00a896] hover:text-[#008779] font-semibold underline-offset-4 hover:underline ml-1"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
