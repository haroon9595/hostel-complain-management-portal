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
  Search,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StaffPage() {
  const { requireAuth } = useAuth();
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

  const doOpenAddModal = () => {
    setEditingStaff(null);
    setFullName("");
    setWhatsapp("");
    setEmail("");
    setRoleId(1);
    setBlock("");
    if (hostels.length > 0) setHostelId(hostels[0].hostel_id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    requireAuth(
      () => doOpenAddModal(),
      "You must sign in with authorized Warden credentials to add new staff members."
    );
  };

  const doOpenEditModal = (s: Staff) => {
    setEditingStaff(s);
    setFullName(s.full_name);
    setWhatsapp(s.whatsapp_number);
    setEmail(s.email || "");
    setHostelId(s.hostel_id);
    setRoleId(s.role_id || 1);
    setBlock(s.block || "");
    setIsModalOpen(true);
  };

  const openEditModal = (s: Staff) => {
    requireAuth(
      () => doOpenEditModal(s),
      `You must sign in with authorized Warden credentials to edit staff member '${s.full_name}'.`
    );
  };

  const promptDeleteStaff = (s: Staff) => {
    requireAuth(
      () => setDeletingStaff(s),
      `You must sign in with authorized Warden credentials to delete staff member '${s.full_name}'.`
    );
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp || !hostelId) return;

    setSubmitting(true);
    try {
      if (editingStaff) {
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 w-full overflow-x-hidden">
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
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 max-w-[90vw]">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      <main className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-full lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Resident Tutors & Maintenance Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Assigned RT contacts, current ticket workloads, and direct communication channels
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] w-full sm:max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, RT id, hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{filteredStaff.length}</span> staff members
          </div>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading staff directory...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Staff Members Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &ldquo;Add Staff Member&rdquo; to register resident tutors and maintenance technicians.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStaff.map((s) => {
              const isSlack = s.whatsapp_number.startsWith("U") || s.whatsapp_number.startsWith("W");
              const whatsappUrl = `https://wa.me/${s.whatsapp_number.replace(/[^0-9]/g, "")}`;
              const slackUrl = `slack://user?team=T0BQ&id=${encodeURIComponent(s.whatsapp_number)}`;

              return (
                <div
                  key={s.staff_id}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white text-sm shadow-xs flex-shrink-0">
                          {s.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                            {s.full_name}
                          </h4>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-full">
                            {s.role_name || "Resident Tutor (RT)"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Workload
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-indigo-600">
                          {s.current_load} tickets
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-600 font-medium pt-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
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
                        <span className="truncate">{s.whatsapp_number}</span>
                      </div>
                      {s.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{s.email}</span>
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
                          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 font-semibold text-xs transition-colors border border-indigo-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Slack</span>
                        </a>
                      ) : (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-100"
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-colors min-h-[36px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => promptDeleteStaff(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-colors min-h-[36px]"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingStaff ? "Edit Staff Member" : "Add New Staff / RT"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Usama Khan"
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">
                    WhatsApp Number or Slack User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 03001234567 or U0BRUU72RQU"
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rt@hostel.edu.pk"
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Assigned Hostel *
                    </label>
                    <div className="relative">
                      <select
                        value={hostelId}
                        onChange={(e) => setHostelId(Number(e.target.value))}
                        required
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs appearance-none"
                      >
                        {hostels.map((h) => (
                          <option key={h.hostel_id} value={h.hostel_id}>
                            {h.hostel_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Block / Wing (Optional)
                    </label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="e.g. Block A"
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">
                    Role *
                  </label>
                  <div className="relative">
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(Number(e.target.value))}
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs appearance-none"
                    >
                      <option value={1}>Resident Tutor (RT)</option>
                      <option value={2}>Maintenance Staff</option>
                      <option value={3}>Hostel Admin</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 text-center my-auto">
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

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingStaff(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteStaff}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
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
