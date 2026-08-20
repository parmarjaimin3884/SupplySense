"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Shield,
  Lock,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useRole } from "@/context/role-context";
import { MOCK_USERS, UserItem } from "@/data/mock-data";

export default function UserManagementPage() {
  const { isAdmin } = useRole();
  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"Admin" | "Inventory Manager">("Inventory Manager");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      department: "Operations",
      status: "Invited",
      lastActive: "Pending Invite",
      mfaEnabled: false,
    };

    setUsers((prev) => [...prev, newUser]);
    setNewName("");
    setNewEmail("");
    setShowInviteModal(false);
  };

  const handleRemove = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // If user is not admin, show RBAC restricted access view
  if (!isAdmin) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md w-full rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#111827]">Access Restricted</h2>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                User Management and RBAC provisioning require Administrator privileges. Your current role is <strong className="text-[#111827]">Inventory Manager</strong>.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className="w-full h-10 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all"
              >
                Switch to Admin Profile (Demo)
              </button>
              <Link
                href="/dashboard"
                className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] flex items-center justify-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                User Management & RBAC Permissions
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Provision enterprise team members, enforce SAML SSO/MFA policies, and configure access scopes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="h-9 px-4 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Invite User</span>
            </button>
          </div>
        </div>

        {/* User List Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">Active Workspace Users ({users.length})</h2>
            <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" /> SAML/Okta Enforced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">NAME & EMAIL</th>
                  <th className="py-3 px-4">ASSIGNED ROLE</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">MFA STATUS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{u.name}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          u.role === "Admin"
                            ? "bg-[#111827] text-white"
                            : "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20"
                        }`}
                      >
                        <Shield className="h-2.5 w-2.5" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4B5563]">{u.department}</td>
                    <td className="py-3 px-4">
                      {u.mfaEnabled ? (
                        <span className="text-[#16A34A] font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Enforced
                        </span>
                      ) : (
                        <span className="text-[#9CA3AF] text-[11px]">Pending Setup</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === "Active"
                            ? "bg-[#F0FDF4] text-[#16A34A]"
                            : "bg-[#FFFBEB] text-[#D97706]"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== "Admin" && (
                        <button
                          type="button"
                          onClick={() => handleRemove(u.id)}
                          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                          aria-label="Remove User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-[#111827]">Invite Workspace Team Member</h3>
              <p className="text-xs text-[#6B7280]">
                Send an invitation link with pre-configured access boundaries.
              </p>

              <form onSubmit={handleInvite} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jordan Miller"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.miller@enterprise.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Role Boundary</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "Admin" | "Inventory Manager")}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:outline-none"
                  >
                    <option value="Inventory Manager">Inventory Manager (Operations & SKU Radar)</option>
                    <option value="Admin">Admin (Full Access & Workspace Settings)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
