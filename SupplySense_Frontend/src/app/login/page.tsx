"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApiError } from "@/types/common";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

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
      setSuccessMessage("Authentication successful! Redirecting to workspace...");
      // Redirect after brief delay for UX
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
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
      <div className="space-y-6">
        {/* Right Panel Header */}
        <div className="space-y-2">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-white">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">
              SupplySense
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Welcome Back
          </h2>
          <p className="text-sm text-[#6B7280]">
            Sign in to access your workspace.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 flex items-start gap-2.5 text-xs text-[#16A34A]">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Social Authentication */}
        <div className="space-y-3">
          <SocialAuthButtons isLoading={isLoading} />

          {/* Cal.com clean minimal divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="w-full border-t border-[#E5E7EB]" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              OR
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
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
              className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
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
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#4B5563] hover:text-[#111827]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]/20 cursor-pointer accent-[#111827]"
              />
              <span className="font-medium">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="pt-2 text-center text-xs text-[#6B7280]">
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
