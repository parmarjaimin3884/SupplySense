"use client";

import { useState } from "react";
import Link from "next/link";
import { Boxes, Loader2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { RoleSelector } from "@/components/auth/role-selector";
import { SignupSuccess } from "@/components/auth/signup-success";
import { UserRole } from "@/data/roles-data";

export default function SignupPage() {
  const [step, setStep] = useState<"credentials" | "role" | "success">("credentials");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>("admin");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !companyName.trim() || !password || !confirmPassword) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please provide a valid work email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-check.");
      return;
    }

    // Proceed to Step 2: Role Selection
    setStep("role");
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedRole) {
      setErrorMessage("Please select a workspace role to proceed.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    // Simulate enterprise provisioning
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1200);
  };

  return (
    <AuthSplitLayout
      badge="AI-Powered Supply Chain Intelligence"
      headline="Prevent Stockouts Before They Happen."
      description="Monitor inventory, detect supply chain risks, and receive AI-powered recommendations before disruptions impact operations."
      previewMode="signup"
    >
      {step === "success" && selectedRole ? (
        <SignupSuccess
          fullName={fullName}
          companyName={companyName}
          role={selectedRole}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Step Header */}
          <div className="space-y-1.5">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] border border-[#2563EB]/15 px-2.5 py-0.5 rounded-md">
                {step === "credentials" ? "Step 1 of 2" : "Step 2 of 2"}
              </span>

              <div className="flex items-center gap-1">
                <span
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    step === "credentials" || step === "role"
                      ? "bg-[#111827]"
                      : "bg-[#E5E7EB]"
                  }`}
                />
                <span
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    step === "role" ? "bg-[#111827]" : "bg-[#E5E7EB]"
                  }`}
                />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              {step === "credentials"
                ? "Create Your Workspace"
                : "Choose Your Workspace Role"}
            </h2>

            <p className="text-xs sm:text-sm text-[#6B7280]">
              {step === "credentials"
                ? "Start managing inventory and risks smarter."
                : "Select how you will primarily use SupplySense."}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#DC2626]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "credentials" ? (
            /* STEP 1: Basic Information + Credentials */
            <>
              {/* Social Authentication */}
              <div className="space-y-2.5">
                <SocialAuthButtons isLoading={isLoading} />

                {/* Cal.com clean minimal divider */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full border-t border-[#E5E7EB]" />
                  <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    OR
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                {/* Row: Full Name & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signup-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                    >
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Sarah Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="signup-company"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                    >
                      Company Name
                    </label>
                    <input
                      id="signup-company"
                      type="text"
                      autoComplete="organization"
                      required
                      placeholder="Apex Logistics Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Work Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                  >
                    Work Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="sarah.chen@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <PasswordInput
                    id="signup-password"
                    label="Password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <PasswordInput
                    id="signup-confirm-password"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Continue to Role Selection Button */}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Continue to Role Selection</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: Choose Your Workspace Role (Large 2-Card Selection) */
            <form onSubmit={handleCompleteSetup} className="space-y-5">
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={(role) => setSelectedRole(role)}
              />

              {/* Terms and Privacy Policy */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#4B5563]">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]/20 cursor-pointer accent-[#111827]"
                  />
                  <span className="leading-snug">
                    I agree to the{" "}
                    <Link href="#terms" className="font-semibold text-[#111827] underline hover:text-[#2563EB]">
                      Terms of Service
                    </Link>{" "}
                    and acknowledge the{" "}
                    <Link href="#privacy" className="font-semibold text-[#111827] underline hover:text-[#2563EB]">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Action Buttons: Back & Complete Setup */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="h-12 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                {/* Primary CTA: Complete Setup */}
                <button
                  type="submit"
                  disabled={!selectedRole || isLoading}
                  className="flex-1 h-12 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Provisioning Workspace...</span>
                    </>
                  ) : (
                    <span>Complete Setup</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="pt-2 text-center text-xs text-[#6B7280]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#111827] hover:text-[#2563EB] hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthSplitLayout>
  );
}
