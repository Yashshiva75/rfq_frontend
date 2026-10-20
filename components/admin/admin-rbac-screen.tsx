"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Users,
  Search,
  Key,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface RolePermission {
  id: number;
  name: string;
  permissions?: Array<{ permission: { id: number; name: string } }> | string[];
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: {
    id: number;
    name: string;
    permissions?: Array<{ permission: { id: number; name: string } }> | string[];
  };
}

export function AdminRbacScreen() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [allPermissions, setAllPermissions] = useState<{ id: number; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API_URL = "/api";

  const getAuthToken = (): string => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("rfq_token") ||
      localStorage.getItem("access_token") ||
      Cookies.get("auth_token") ||
      ""
    );
  };

  // 1. Load users, roles, and permissions from live APIs
  const loadData = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const token = getAuthToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [usersRes, rolesRes, permsRes] = await Promise.all([
        fetch(`${API_URL}/user?limit=100`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/role`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/permission`, { headers }).then((r) => r.json()),
      ]);

      if (usersRes?.data) setUsers(usersRes.data);
      if (rolesRes?.data) {
        setRoles(rolesRes.data);
        if (rolesRes.data.length > 0) {
          const currentRole = selectedRole
            ? rolesRes.data.find((r: any) => r.id === selectedRole) || rolesRes.data[0]
            : rolesRes.data[0];
          setSelectedRole(currentRole.id);
          const activePerms = (currentRole.permissions || []).map((p: any) => p.permission?.name || p.name || p);
          setRolePermissions(activePerms);
        }
      }
      if (permsRes?.data) setAllPermissions(permsRes.data);
    } catch (err: any) {
      const errText = err.message || "Failed to load RBAC data";
      setMessage({ type: "error", text: errText });
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (
      Cookies.get("user_role") ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("rfq_user") || "{}")?.role
        : "") ||
      ""
    ).toLowerCase();

    if (role === "admin") {
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Handle User Role Assignment
  const handleAssignRole = async (userId: number, newRoleId: number) => {
    try {
      setUpdatingUserId(userId);
      setMessage(null);
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/user/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleId: newRoleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign role");

      const successText = data?.data?.message || data?.message || "User role updated successfully!";
      setMessage({ type: "success", text: successText });
      toast.success(successText);

      // Optimistically update local user state
      const targetRoleObj = roles.find((r) => r.id === newRoleId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                roleId: newRoleId,
                role: targetRoleObj ? { id: targetRoleObj.id, name: targetRoleObj.name } : u.role,
              }
            : u
        )
      );

      // Re-sync full data
      loadData();
    } catch (err: any) {
      const errText = err.message || "Failed to assign role";
      setMessage({ type: "error", text: errText });
      toast.error(errText);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // 3. Handle Permission Matrix Toggle
  const togglePermission = (permName: string) => {
    setRolePermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  // 4. Save Role Permissions
  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      setMessage(null);
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/role/${selectedRole}/permissions`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions: rolePermissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update permissions");

      const successText = data?.data?.message || data?.message || "Role permissions saved successfully!";
      setMessage({ type: "success", text: successText });
      toast.success(successText);
      loadData();
    } catch (err: any) {
      const errText = err.message || "Failed to update permissions";
      setMessage({ type: "error", text: errText });
      toast.error(errText);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role?.name?.toLowerCase().includes(q)
    );
  });

  const currentUserRole = (
    Cookies.get("user_role") ||
    (typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("rfq_user") || "{}")?.role
      : "") ||
    ""
  ).toLowerCase();

  if (currentUserRole && currentUserRole !== "admin") {
    return (
      <div className="p-8 text-center border border-red-200 dark:border-red-900/60 rounded-xl bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300">
        <h3 className="font-bold text-sm">Access Denied</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This console is restricted to Administrator accounts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#008779]" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Access Control & RBAC Data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#008779]" />
            User Access & Role Management (RBAC)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assign user roles and configure actions & permissions according to system policy.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh Data"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="size-4" />
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#008779] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Assign User Roles
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                activeTab === "roles"
                  ? "bg-[#008779] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Configure Role Actions
            </button>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: User Roles Table */}
      {activeTab === "users" && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#008779]" />
              Registered Users & Assigned Roles ({filteredUsers.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#008779]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Current Role</th>
                  <th className="py-3 px-5">Assigned Permissions</th>
                  <th className="py-3 px-5 text-right">Assign New Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const roleName = (u.role?.name || "user").toLowerCase();
                    const perms = (u.role?.permissions || []).map((p: any) => p.permission?.name || p.name || p);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100">
                          {u.name}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              roleName === "admin"
                                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                : roleName === "buyer"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : roleName === "vendor"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {roleName}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {perms.length > 0 ? (
                              perms.slice(0, 3).map((pName: string) => (
                                <span
                                  key={pName}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                                >
                                  {pName}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No specific permissions</span>
                            )}
                            {perms.length > 3 && (
                              <span className="text-[10px] font-mono text-slate-400">
                                +{perms.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {updatingUserId === u.id && (
                              <Loader2 className="size-3.5 animate-spin text-[#008779]" />
                            )}
                            <select
                              value={u.roleId || roles.find((r) => r.name.toLowerCase() === roleName)?.id || ""}
                              onChange={(e) => handleAssignRole(u.id, Number(e.target.value))}
                              disabled={updatingUserId === u.id}
                              className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#008779] cursor-pointer"
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No users match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Role Permissions Matrix */}
      {activeTab === "roles" && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <UserCheck className="w-5 h-5 text-[#008779]" />
                Assign Actions / Permissions to Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select a system role and toggle which actions users with this role can execute.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase text-[#008779] bg-[#008779]/10 px-2.5 py-1 rounded-md">
                Active: {rolePermissions.length} Granted
              </span>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-4">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRole(r.id);
                    const active = (r.permissions || []).map((p: any) => p.permission?.name || p.name || p);
                    setRolePermissions(active);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#008779] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Shield className="size-3.5" />
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>

          {/* Action Checkboxes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="size-3.5 text-[#008779]" />
              <span>System Permissions Matrix</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allPermissions.map((perm) => {
                const isChecked = rolePermissions.includes(perm.name);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#008779] bg-[#008779]/5 dark:bg-[#008779]/10 shadow-2xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm.name)}
                      className="w-4 h-4 mt-0.5 rounded text-[#008779] focus:ring-[#008779] cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                        {perm.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {perm.name.startsWith("rfq")
                          ? "Procurement RFQ Management"
                          : perm.name.startsWith("quotation")
                          ? "Vendor Quote Operations"
                          : perm.name.startsWith("user")
                          ? "User & Account Controls"
                          : "System Administration"}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleSaveRolePermissions}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#008779] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#007063] active:bg-[#005c52] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span>Save Role Permissions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
