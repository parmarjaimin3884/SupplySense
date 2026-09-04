"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApiError } from "@/types/common";
import { Logo } from "@/components/ui/logo";

function getLoginRedirect(): string {
  if (typeof window === "undefined") return "/dashboard";

  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect?.startsWith("/") && !redirect.startsWith("//")
    ? redirect
    : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both your work email / username and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Send email value as username (backend expects LoginRequest.username)
      await login(email, password);
      window.location.href = getLoginRedirect();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Authentication failed. Please check your credentials.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      headline="Supply Chain Intelligence for Modern Operations"
      description="Monitor inventory, predict stockouts, track supplier risks, and make smarter decisions with AI-powered insights."
      badge="Autonomous Inventory Intelligence"
      previewMode="login"
    >
      <div className="w-full max-w-sm mx-auto my-auto space-y-4">
        {/* Right Panel Header */}
        <div className="space-y-1.5">
          {/* Logo */}
          <div className="mb-2">
            <Logo size="sm" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            Welcome Back
          </h2>
          <p className="text-xs text-[#6B7280]">
            Sign in to access your workspace.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/20 flex items-start gap-2 text-xs text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 flex items-start gap-2 text-xs text-[#16A34A]">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Work Email Field */}
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#374151]"
            >
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="alex@enterprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <PasswordInput
              id="login-password"
              label="Password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Options: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#4B5563] hover:text-[#111827]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]/20 cursor-pointer accent-[#111827]"
              />
              <span className="text-[11px] font-medium">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-xl bg-[#111827] text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-1 text-center text-xs text-[#6B7280]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#111827] hover:text-[#2563EB] hover:underline transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
