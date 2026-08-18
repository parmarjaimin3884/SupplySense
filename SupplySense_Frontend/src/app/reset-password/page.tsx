"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { AuthCenteredLayout } from "@/components/auth/auth-centered-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    // Simulate password update
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <AuthCenteredLayout>
      {!isSuccess ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] mb-2 border border-[#2563EB]/15">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Create New Password
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Choose a secure password for your account.
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
              <PasswordInput
                id="new-password"
                label="New Password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-1.5">
              <PasswordInput
                id="confirm-new-password"
                label="Confirm Password"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer pt-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update Password</span>
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
        /* Success Confirmation */
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-[#111827]">
              Password Updated Successfully
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              Your password has been securely updated. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-black transition-all"
            >
              Continue to Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthCenteredLayout>
  );
}
