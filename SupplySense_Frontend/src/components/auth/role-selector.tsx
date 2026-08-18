"use client";

import { Check, CheckCircle2, Shield, Boxes } from "lucide-react";
import { ENTERPRISE_ROLES, UserRole, RoleDefinition } from "@/data/roles-data";

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  const getRoleIcon = (roleId: UserRole) => {
    switch (roleId) {
      case "admin":
        return Shield;
      case "inventory_manager":
        return Boxes;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const roles = ENTERPRISE_ROLES.map((r) => r.id);
    let nextIndex = index;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (index + 1) % roles.length;
      onSelectRole(roles[nextIndex]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (index - 1 + roles.length) % roles.length;
      onSelectRole(roles[nextIndex]);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelectRole(roles[index]);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Choose Your Workspace Role"
      className="flex flex-col gap-4 w-full"
    >
      {ENTERPRISE_ROLES.map((role: RoleDefinition, index: number) => {
        const isSelected = selectedRole === role.id;
        const IconComponent = getRoleIcon(role.id);

        return (
          <div
            key={role.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : 0}
            onClick={() => onSelectRole(role.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`group relative rounded-2xl border p-5 sm:p-6 text-left transition-all duration-200 cursor-pointer select-none focus:outline-none active:scale-[0.99] ${
              isSelected
                ? "border-[#2563EB] bg-[#F8FAFC] ring-2 ring-[#2563EB]/25 shadow-[0_4px_16px_rgba(37,99,235,0.08)]"
                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAFA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* Header: Icon, Role Title & Selection Radio Badge */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-[#F3F4F6] text-[#4B5563] group-hover:bg-[#E5E7EB] group-hover:text-[#111827]"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
                    {role.title}
                  </h3>
                  <span className="text-xs font-mono font-medium text-[#6B7280]">
                    {role.badge}
                  </span>
                </div>
              </div>

              {/* Selection Check Circle */}
              <div className="pt-1">
                {isSelected ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF] transition-colors" />
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-4">
              {role.description}
            </p>

            {/* Capabilities List */}
            <div className="pt-3 border-t border-[#E5E7EB]/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {role.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-2 font-medium text-[#374151]"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isSelected
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </span>
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
