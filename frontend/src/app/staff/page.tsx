"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { Staff, Hostel } from "@/lib/types";
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Building,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  MessageSquare,
  ExternalLink,
  Shield,
  Search,
} from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Form modal state (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [hostelId, setHostelId] = useState<number | "">("");
  const [roleId, setRoleId] = useState<number>(1);
  const [block, setBlock] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete confirmation modal state
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [staffData, hostelData] = await Promise.all([
        api.getStaffMembers({
          hostel_id: selectedHostelId || undefined,
        }),
        api.getHostels(),
      ]);
      setStaff(staffData);
      setHostels(hostelData);
      if (hostelData.length > 0 && !hostelId) {
        setHostelId(hostelData[0].hostel_id);
      }
    } catch (err: any) {
      console.error("Failed to load staff:", err);
      showToast(`Load failed: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedHostelId, hostelId]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditingStaff(null);
    setFullName("");
    setWhatsapp("");
    setEmail("");
    setRoleId(1);
    setBlock("");
    if (hostels.length > 0) setHostelId(hostels[0].hostel_id);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Staff) => {
    setEditingStaff(s);
    setFullName(s.full_name);
    setWhatsapp(s.whatsapp_number);
    setEmail(s.email || "");
    setHostelId(s.hostel_id);
    setRoleId(s.role_id || 1);
    setBlock(s.block || "");
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp || !hostelId) return;

    setSubmitting(true);
    try {
      if (editingStaff) {
        // Edit existing staff
        await api.updateStaffMember(editingStaff.staff_id, {
          full_name: fullName.trim(),
          whatsapp_number: whatsapp.trim(),
          email: email.trim() || undefined,
          hostel_id: Number(hostelId),
          role_id: Number(roleId),
          block: block.trim() || undefined,
        });
        showToast(`Staff member '${fullName}' updated successfully!`);
      } else {
        // Add new staff
        await api.createStaffMember({
          full_name: fullName.trim(),
          whatsapp_number: whatsapp.trim(),
          email: email.trim() || undefined,
          hostel_id: Number(hostelId),
          role_id: Number(roleId),
          block: block.trim() || undefined,
        });
        showToast(`Staff member '${fullName}' added successfully!`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(`Operation failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    setDeleting(true);
    try {
      await api.deleteStaffMember(deletingStaff.staff_id);
      showToast(`Staff member '${deletingStaff.full_name}' deleted successfully.`);
      setDeletingStaff(null);
      await loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filteredStaff = staff.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.whatsapp_number.toLowerCase().includes(q) ||
        (s.hostel_name && s.hostel_name.toLowerCase().includes(q)) ||
        (s.role_name && s.role_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Staff & RT Management"
        selectedHostelId={selectedHostelId}
        onHostelChange={setSelectedHostelId}
        onRefresh={() => {
          setRefreshing(true);
          loadData();
        }}
        refreshing={refreshing}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <main className="p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Resident Tutors & Maintenance Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Assigned RT contacts, current ticket workloads, and direct communication channels
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-sky-400/20 whitespace-nowrap self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, RT id, hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{filteredStaff.length}</span> staff members
          </div>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading staff directory...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Staff Members Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &ldquo;Add Staff Member&rdquo; to register resident tutors and maintenance technicians.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((s) => {
              const isSlack = s.whatsapp_number.startsWith("U") || s.whatsapp_number.startsWith("W");
              const whatsappUrl = `https://wa.me/${s.whatsapp_number.replace(/[^0-9]/g, "")}`;
              const slackUrl = `slack://user?team=T0BQ&id=${encodeURIComponent(s.whatsapp_number)}`;

              return (
                <div
                  key={s.staff_id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white text-base shadow-xs">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {s.full_name}
                          </h4>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {s.role_name || "Resident Tutor (RT)"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Workload
                        </span>
                        <span className="text-sm font-extrabold text-indigo-600">
                          {s.current_load} tickets
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-600 font-medium pt-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {s.hostel_name || `Hostel #${s.hostel_id}`}{" "}
                          {s.block ? `(${s.block})` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-slate-700">
                        {isSlack ? (
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        ) : (
                          <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        )}
                        <span>{s.whatsapp_number}</span>
                      </div>
                      {s.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{s.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Direct Communication Links */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {isSlack ? (
                        <a
                          href={slackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors border border-indigo-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Slack</span>
                        </a>
                      ) : (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-100"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingStaff(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Staff Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingStaff ? "Edit Staff Member" : "Add New Staff / RT"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Usama Khan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    WhatsApp Number or Slack User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 03001234567 or U0BRUU72RQU"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rt@hostel.edu.pk"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 font-semibold block mb-1">
                      Assigned Hostel *
                    </label>
                    <select
                      value={hostelId}
                      onChange={(e) => setHostelId(Number(e.target.value))}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                    >
                      {hostels.map((h) => (
                        <option key={h.hostel_id} value={h.hostel_id}>
                          {h.hostel_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-semibold block mb-1">
                      Block (Optional)
                    </label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="e.g. Block A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Role
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value={1}>Resident Tutor (RT)</option>
                    <option value={2}>Maintenance Staff</option>
                    <option value={3}>Hostel Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : editingStaff
                      ? "Update Member"
                      : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingStaff && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Staff Member?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-bold text-slate-800">{deletingStaff.full_name}</span>? Active tickets assigned to them will be unassigned automatically.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteStaff}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
