"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { AuthCenteredLayout } from "@/components/auth/auth-centered-layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid work email address.");
      return;
    }

    setIsLoading(true);

    // Simulate sending password reset email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <AuthCenteredLayout>
      {!isSubmitted ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] mb-2 border border-[#2563EB]/15">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Forgot Password?
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Enter your email address and we&apos;ll send a reset link.
            </p>
          </div>

          {/* Error feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/20 text-xs text-[#DC2626]">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
              >
                Work Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                placeholder="alex@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          {/* Secondary Action */}
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Success State */
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
            <Mail className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-[#111827]">
              Check Your Inbox
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              We&apos;ve sent a password reset link to{" "}
              <strong className="text-[#111827] font-semibold">{email}</strong>. Please click the link within 15 minutes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#6B7280]">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="font-semibold text-[#2563EB] hover:underline"
            >
              try another email
            </button>
            .
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB] transition-all"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthCenteredLayout>
  );
}
