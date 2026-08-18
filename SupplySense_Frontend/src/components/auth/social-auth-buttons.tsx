"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void;
  onMicrosoftClick?: () => void;
  isLoading?: boolean;
}

export function SocialAuthButtons({
  onGoogleClick,
  onMicrosoftClick,
  isLoading = false,
}: SocialAuthButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<"google" | "microsoft" | null>(null);

  const handleGoogle = () => {
    if (isLoading) return;
    setActiveProvider("google");
    onGoogleClick?.();
    setTimeout(() => setActiveProvider(null), 1500);
  };

  const handleMicrosoft = () => {
    if (isLoading) return;
    setActiveProvider("microsoft");
    onMicrosoftClick?.();
    setTimeout(() => setActiveProvider(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isLoading || activeProvider !== null}
        aria-label="Continue with Google"
        className="flex items-center justify-center gap-2.5 w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {activeProvider === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#6B7280]" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span className="truncate">Google</span>
      </button>

      {/* Microsoft Button */}
      <button
        type="button"
        onClick={handleMicrosoft}
        disabled={isLoading || activeProvider !== null}
        aria-label="Continue with Microsoft"
        className="flex items-center justify-center gap-2.5 w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {activeProvider === "microsoft" ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#6B7280]" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 23 23" aria-hidden="true">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        )}
        <span className="truncate">Microsoft</span>
      </button>
    </div>
  );
}
