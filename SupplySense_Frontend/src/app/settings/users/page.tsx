"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Shield,
  Lock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useRole } from "@/context/role-context";
import { TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { fetchWorkspaceUsers, createWorkspaceUser, deleteWorkspaceUser } from "@/lib/api/users";
import { UserListItem } from "@/types/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function UserManagementPage() {
  const { isAdmin } = useRole();
  const authUser = useAuthStore((state) => state.user);
  const isUserAdmin = authUser?.role ? authUser.role.toLowerCase() === "admin" : isAdmin;

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"Admin" | "Manager">("Manager");

  if (!isUserAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-20 p-8 rounded-3xl border border-[#E5E7EB] bg-white text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/20 flex items-center justify-center mx-auto text-[#DC2626]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Access Restricted</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            User Management and Role-Based Access Controls (RBAC) are restricted to <strong>Administrator</strong> accounts only.
            Your current assigned role is <strong>Manager</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchWorkspaceUsers();
      setUsers(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || "Failed to fetch workspace users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdUser = await createWorkspaceUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        department: newRole === "Admin" ? "Supply Chain Operations" : "Warehouse & Procurement",
      });

      setUsers((prev) => [createdUser, ...prev]);
      setSuccessMessage(`User '${newName}' provisioned in PostgreSQL successfully.`);
      setNewName("");
      setNewEmail("");
      setShowInviteModal(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create workspace user."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}" from the database?`)) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    try {
      await deleteWorkspaceUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccessMessage(`User "${name}" successfully removed.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || "Failed to remove user.");
    } finally {
      setDeletingId(null);
    }
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
                User Management and RBAC provisioning require Administrator privileges. Your current role is <strong className="text-[#111827]">Manager</strong>.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
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
              Live PostgreSQL database users, role assignments, and workspace access scopes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
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

        {/* User List Table */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">
              Active Workspace Users ({users.length})
            </h2>
            <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" /> PostgreSQL DB Synced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold bg-[#FAFAFA]">
                  <th className="py-3 px-4">NAME & EMAIL</th>
                  <th className="py-3 px-4">ASSIGNED ROLE</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">ASSIGNED WAREHOUSE</th>
                  <th className="py-3 px-4">MFA STATUS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {isLoading ? (
                  <TableRowSkeleton rows={5} cols={7} />
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#6B7280]">
                      No workspace users found. Click &quot;Invite User&quot; to provision team accounts.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
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
                      <td className="py-3 px-4 text-[#4B5563] font-medium">
                        {u.warehouse_name || "Surat Central Warehouse"}
                      </td>
                      <td className="py-3 px-4">
                        {u.mfa_enabled ? (
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
                        <button
                          type="button"
                          onClick={() => handleRemove(u.id, u.name)}
                          disabled={deletingId === u.id}
                          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer disabled:opacity-50"
                          title="Remove user from PostgreSQL database"
                          aria-label={`Remove user ${u.name}`}
                        >
                          {deletingId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[#DC2626]" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
                Provisions a real user account in PostgreSQL database with assigned access boundaries.
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
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:border-[#111827] focus:outline-none"
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
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:border-[#111827] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Role Boundary</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "Admin" | "Manager")}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] focus:border-[#111827] focus:outline-none bg-white"
                  >
                    <option value="Manager">Manager (Operations & SKU Radar)</option>
                    <option value="Admin">Admin (Full Access & Workspace Settings)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Provisioning...</span>
                      </>
                    ) : (
                      <span>Save & Provision</span>
                    )}
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
