"use client";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasLength, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthMeta = () => {
    switch (score) {
      case 1:
        return { label: "Weak", color: "bg-[#DC2626]", textColor: "text-[#DC2626]" };
      case 2:
        return { label: "Fair", color: "bg-[#F59E0B]", textColor: "text-[#D97706]" };
      case 3:
        return { label: "Good", color: "bg-[#2563EB]", textColor: "text-[#2563EB]" };
      case 4:
        return { label: "Strong", color: "bg-[#16A34A]", textColor: "text-[#16A34A]" };
      default:
        return { label: "Very Weak", color: "bg-[#E5E7EB]", textColor: "text-[#6B7280]" };
    }
  };

  const meta = getStrengthMeta();

  return (
    <div className="space-y-2 pt-1">
      {/* 4 segmented bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 1 ? meta.color : "bg-[#E5E7EB]"
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 2 ? meta.color : "bg-[#E5E7EB]"
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 3 ? meta.color : "bg-[#E5E7EB]"
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 4 ? meta.color : "bg-[#E5E7EB]"
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
        <span>Password strength: <strong className={`font-semibold ${meta.textColor}`}>{meta.label}</strong></span>
        <span className="text-[10px] text-[#9CA3AF]">Min 8 chars, 1 number & symbol</span>
      </div>
    </div>
  );
}
