"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
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
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      const msg = "Please provide both email and password.";
      setError(msg);
      toast.error("Missing credentials", { description: msg });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login({ email, password });

      // Save user session
      localStorage.setItem("rfq_user", JSON.stringify(data.user));
      localStorage.setItem("rfq_token", data.access_token);
      Cookies.set("auth_token", data.access_token, { expires: 7, path: "/" });
      Cookies.set("user_role", String(data.user.role), { expires: 7, path: "/" });

      toast.success("Login successful!", {
        description: `Welcome back, ${data.user.name || "User"} (${String(data.user.role).toUpperCase()})`,
      });

      // Take user inside to the dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      setError(msg);
      toast.error("Login failed", { description: msg });
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
        {/* Shadcn Login Card */}
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl text-slate-900 dark:text-slate-100 transition-colors">
          <CardHeader className="space-y-1.5 p-6 sm:p-8 pb-4 sm:pb-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Login to your account
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              Enter your corporate email below to login to your workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-0 space-y-5 text-slate-900 dark:text-slate-100">
            {error && (
              <Alert variant="destructive" className="py-3 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-200">
                <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="space-y-0.5">
                  <AlertTitle className="text-sm font-semibold text-red-900 dark:text-red-300">
                    Authentication error
                  </AlertTitle>
                  <AlertDescription className="text-xs text-red-800 dark:text-red-300/90">
                    {error}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <Input
                    id="email"
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

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Password
                  </Label>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline-offset-4 hover:underline cursor-pointer transition-colors">
                    Forgot your password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="size-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-[#008779]/20 focus-visible:border-[#008779]"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
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
                    <span className="text-white">Signing in...</span>
                  </>
                ) : (
                  <span className="text-white">Login</span>
                )}
              </Button>
            </form>

          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-slate-900 dark:text-[#00a896] hover:text-[#008779] font-semibold underline-offset-4 hover:underline ml-1"
            >
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
