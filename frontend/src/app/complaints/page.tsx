"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { ComplaintBadge } from "@/components/ComplaintBadge";
import { api } from "@/lib/api";
import {
  Complaint,
  ComplaintDetail,
  Hostel,
  Category,
  Status,
  Priority,
  Staff,
} from "@/lib/types";
import {
  Search,
  Filter,
  X,
  Check,
  Building,
  User,
  Phone,
  MessageSquare,
  AlertCircle,
  History,
  MoreHorizontal,
  Send,
  PauseCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Filter states
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedPriorityId, setSelectedPriorityId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Selected complaint detail for modal / drawer
  const [detailModal, setDetailModal] = useState<ComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Modal actions state
  const [updateStatusId, setUpdateStatusId] = useState<number>(1);
  const [statusNote, setStatusNote] = useState<string>("");
  const [assignStaffId, setAssignStaffId] = useState<number | "">("");
  const [newInternalNote, setNewInternalNote] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [compData, hData, catData, stData, prioData, staffData] =
        await Promise.all([
          api.getComplaints({
            hostel_id: selectedHostelId || undefined,
            status_id: selectedStatusId || undefined,
            category_id: selectedCategoryId || undefined,
            priority_id: selectedPriorityId || undefined,
            search: search || undefined,
          }),
          api.getHostels(),
          api.getCategories(),
          api.getStatuses(),
          api.getPriorities(),
          api.getStaffMembers(),
        ]);
      setComplaints(compData);
      setHostels(hData);
      setCategories(catData);
      setStatuses(stData);
      setPriorities(prioData);
      setStaffList(staffData);
    } catch (err: any) {
      console.error("Failed to load complaints page data:", err);
      showToast(`Load failed: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    selectedHostelId,
    selectedStatusId,
    selectedCategoryId,
    selectedPriorityId,
    search,
  ]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const openComplaintModal = async (c: Complaint) => {
    setDetailLoading(true);
    setDetailModal(null);
    try {
      const detail = await api.getComplaintById(c.complaint_id);
      setDetailModal(detail);
      setUpdateStatusId(detail.status_id);
      setAssignStaffId(detail.assigned_staff_id || "");
    } catch (err: any) {
      showToast(`Error opening complaint: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleInlineStatusChange = async (
    complaintId: number,
    statusId: number
  ) => {
    try {
      await api.updateComplaintStatus(
        complaintId,
        statusId,
        "Management Admin",
        "Quick inline status update"
      );
      showToast(`Ticket #${complaintId} status updated!`);
      await loadData();
      if (detailModal && detailModal.complaint_id === complaintId) {
        const fresh = await api.getComplaintById(complaintId);
        setDetailModal(fresh);
      }
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`);
    }
  };

  const handleUpdateStatusInModal = async () => {
    if (!detailModal) return;
    setSubmittingAction(true);
    try {
      const updated = await api.updateComplaintStatus(
        detailModal.complaint_id,
        updateStatusId,
        "Management Admin",
        statusNote || undefined
      );
      setDetailModal(updated);
      setStatusNote("");
      showToast("Complaint status updated successfully!");
      await loadData();
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAssignStaffInModal = async (staffId: number) => {
    if (!detailModal) return;
    setSubmittingAction(true);
    try {
      const updated = await api.assignComplaintStaff(
        detailModal.complaint_id,
        staffId
      );
      setDetailModal(updated);
      setAssignStaffId(staffId);
      showToast("Staff member assigned successfully!");
      await loadData();
    } catch (err: any) {
      showToast(`Failed to assign staff: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModal || !newInternalNote.trim()) return;

    setSubmittingAction(true);
    try {
      await api.addComplaintNote(
        detailModal.complaint_id,
        "Management Admin",
        newInternalNote.trim()
      );
      setNewInternalNote("");
      showToast("Internal note recorded!");
      const fresh = await api.getComplaintById(detailModal.complaint_id);
      setDetailModal(fresh);
      await loadData();
    } catch (err: any) {
      showToast(`Note failed: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedHostelId(null);
    setSelectedStatusId(null);
    setSelectedCategoryId(null);
    setSelectedPriorityId(null);
    setSearch("");
  };

  const hasActiveFilters =
    selectedHostelId !== null ||
    selectedStatusId !== null ||
    selectedCategoryId !== null ||
    selectedPriorityId !== null ||
    search.trim() !== "";

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Complaints Management"
        selectedHostelId={selectedHostelId}
        onHostelChange={setSelectedHostelId}
        onRefresh={() => {
          setRefreshing(true);
          loadData();
        }}
        refreshing={refreshing}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Page Title & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Hostel Complaints Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Live resident tickets, status workflows, and RT assignments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              Total: <span className="text-indigo-600 font-extrabold">{complaints.length}</span> tickets
            </span>
          </div>
        </div>

        {/* Multi-Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, roll #, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition-all"
              />
            </div>

            {/* Hostel Filter */}
            <select
              value={selectedHostelId === null ? "" : selectedHostelId}
              onChange={(e) =>
                setSelectedHostelId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="">All Hostels</option>
              {hostels.map((h) => (
                <option key={h.hostel_id} value={h.hostel_id}>
                  {h.hostel_name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusId === null ? "" : selectedStatusId}
              onChange={(e) =>
                setSelectedStatusId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.status_id} value={s.status_id}>
                  {s.status_name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryId === null ? "" : selectedCategoryId}
              onChange={(e) =>
                setSelectedCategoryId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriorityId === null ? "" : selectedPriorityId}
              onChange={(e) =>
                setSelectedPriorityId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="">All Priorities</option>
              {priorities.map((p) => (
                <option key={p.priority_id} value={p.priority_id}>
                  {p.priority_name}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Complaints Full-Page Data Table */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading complaints from database...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Complaints Match Criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your filters or search terms to inspect recorded tickets.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold tracking-wider uppercase text-[11px]">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Student Info</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Category & Issue</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status (Live Update)</th>
                    <th className="px-5 py-4">Assigned RT</th>
                    <th className="px-5 py-4">Reported</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints.map((c) => (
                    <tr
                      key={c.complaint_id}
                      onClick={() => openComplaintModal(c)}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* ID */}
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600 text-sm">
                        #{c.complaint_id}
                      </td>

                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {c.student_name || "Unknown Student"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {c.student_roll_number || c.student_whatsapp || "N/A"}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          Room {c.room_number}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {c.hostel_name || `Hostel #${c.hostel_id}`}
                        </div>
                      </td>

                      {/* Category & Issue */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ComplaintBadge type="category" value={c.category_name} />
                        </div>
                        <p className="text-slate-600 font-medium line-clamp-1 text-xs">
                          {c.sub_issue || c.description}
                        </p>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <ComplaintBadge type="priority" value={c.priority_name} />
                      </td>

                      {/* Status Dropdown with Instant Update */}
                      <td
                        className="px-5 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={c.status_id}
                          onChange={(e) =>
                            handleInlineStatusChange(
                              c.complaint_id,
                              Number(e.target.value)
                            )
                          }
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                        >
                          {statuses.map((st) => (
                            <option key={st.status_id} value={st.status_id}>
                              {st.status_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Assigned RT */}
                      <td className="px-5 py-4">
                        {c.assigned_staff_name ? (
                          <div className="flex items-center gap-2 text-slate-800 font-medium">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                              {c.assigned_staff_name.charAt(0)}
                            </div>
                            <span>{c.assigned_staff_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap font-medium">
                        {formatDate(c.created_at)}
                      </td>

                      {/* Action */}
                      <td
                        className="px-5 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openComplaintModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold text-xs transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Drawer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Ticket Drawer / Modal */}
        {(detailModal || detailLoading) && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-in zoom-in-95">
              {detailLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Loading complaint details...</p>
                </div>
              ) : detailModal ? (
                <>
                  {/* Modal Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-base font-extrabold text-indigo-600">
                          Ticket #{detailModal.complaint_id}
                        </span>
                        <ComplaintBadge
                          type="status"
                          value={detailModal.status?.status_name || detailModal.status_name}
                        />
                        <ComplaintBadge
                          type="priority"
                          value={detailModal.priority?.priority_name || detailModal.priority_name}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {detailModal.sub_issue || "General Complaint"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Reported on {formatDate(detailModal.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => setDetailModal(null)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Student & Location Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Resident Student
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {detailModal.student?.full_name || detailModal.student_name || "Unknown"}
                      </p>
                      <p className="text-slate-600 font-mono mt-0.5">
                        Roll: {detailModal.student?.roll_number || detailModal.student_roll_number || "N/A"}
                      </p>
                      <p className="text-slate-600 font-mono">
                        Phone / WhatsApp: {detailModal.student?.phone_number || detailModal.student?.whatsapp_number || detailModal.student_whatsapp || "N/A"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Hostel Location
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {detailModal.hostel?.hostel_name || detailModal.hostel_name}
                      </p>
                      <p className="text-slate-600 font-medium mt-0.5">
                        Room: {detailModal.room_number}
                      </p>
                      <p className="text-slate-600">
                        Category: {detailModal.category?.category_name || detailModal.category_name}
                      </p>
                    </div>
                  </div>

                  {/* Description & Raw WhatsApp Message */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Description
                    </span>
                    <p className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                      {detailModal.description}
                    </p>
                    {detailModal.raw_message && (
                      <details className="text-xs text-slate-500">
                        <summary className="cursor-pointer font-semibold text-slate-600 hover:text-indigo-600">
                          View Raw Student Message
                        </summary>
                        <p className="mt-1 p-2.5 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px]">
                          {detailModal.raw_message}
                        </p>
                      </details>
                    )}
                  </div>

                  {/* Quick Action Bar */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                    {detailModal.student?.whatsapp_number && (
                      <a
                        href={`slack://user?team=T0BQ&id=${encodeURIComponent(
                          detailModal.student.whatsapp_number
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Contact Student (Slack)</span>
                      </a>
                    )}

                    {(detailModal.student?.phone_number || detailModal.student?.whatsapp_number) && (
                      <a
                        href={`https://wa.me/${(
                          detailModal.student.phone_number ||
                          detailModal.student.whatsapp_number ||
                          ""
                        ).replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(
                          detailModal.student.full_name || "Resident"
                        )},%20we%20are%20looking%20into%20your%20hostel%20complaint%20%23${
                          detailModal.complaint_id
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send WhatsApp</span>
                      </a>
                    )}

                    {/* RT Assignment */}
                    <select
                      value={detailModal.assigned_staff_id || ""}
                      onChange={(e) => {
                        if (e.target.value)
                          handleAssignStaffInModal(Number(e.target.value));
                      }}
                      disabled={submittingAction}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer outline-none"
                    >
                      <option value="">
                        {detailModal.assigned_staff?.full_name || detailModal.assigned_staff_name
                          ? `RT: ${detailModal.assigned_staff?.full_name || detailModal.assigned_staff_name}`
                          : "Assign to RT ▾"}
                      </option>
                      {staffList.map((s) => (
                        <option key={s.staff_id} value={s.staff_id}>
                          {s.full_name} ({s.hostel_name || "RT"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dispatch / Update Status Form */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">
                      Update Ticket Status & Resolution Note
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={updateStatusId}
                        onChange={(e) => setUpdateStatusId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        {statuses.map((s) => (
                          <option key={s.status_id} value={s.status_id}>
                            {s.status_name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Resolution / status note..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleUpdateStatusInModal}
                      disabled={submittingAction}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
                    >
                      {submittingAction ? "Updating..." : "Save Status"}
                    </button>
                  </div>

                  {/* Internal Private Notes Box */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Internal Private Notes
                    </span>
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 font-medium space-y-2 max-h-32 overflow-y-auto">
                      {(detailModal.status_history || []).filter((h) => h.note)
                        .length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">
                          No notes recorded yet.
                        </p>
                      ) : (
                        (detailModal.status_history || [])
                          .filter((h) => h.note)
                          .map((h) => (
                            <div key={h.history_id} className="text-slate-800">
                              <span className="font-semibold text-indigo-700">
                                [{h.changed_by}, {formatDate(h.changed_at)}]
                              </span>{" "}
                              <span>{h.note}</span>
                            </div>
                          ))
                      )}
                    </div>

                    <form
                      onSubmit={handleAddInternalNote}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        placeholder="Add private management note..."
                        value={newInternalNote}
                        onChange={(e) => setNewInternalNote(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={submittingAction || !newInternalNote.trim()}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Audit Trail / Timeline */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <History className="w-4 h-4 text-slate-500" />
                      <span>Chronological Audit Timeline</span>
                    </div>

                    <div className="relative pl-4 space-y-2.5 text-xs max-h-40 overflow-y-auto before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sky-200">
                      {detailModal.status_history &&
                      detailModal.status_history.length > 0 ? (
                        detailModal.status_history.map((h, idx) => (
                          <div
                            key={h.history_id || idx}
                            className="relative flex items-start gap-2"
                          >
                            <span className="w-3 h-3 rounded-full bg-sky-400 border-2 border-white ring-1 ring-sky-300 flex-shrink-0 -ml-4 mt-0.5" />
                            <div>
                              <span className="text-slate-700 font-medium">
                                [{h.changed_by}, {formatDate(h.changed_at)}]
                              </span>
                              <span className="font-semibold text-slate-900 block">
                                {h.status_name || `Status #${h.status_id}`}
                              </span>
                              {h.note && (
                                <p className="text-[11px] text-slate-500 italic mt-0.5">
                                  &ldquo;{h.note}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="relative flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-sky-400 border-2 border-white ring-1 ring-sky-300 flex-shrink-0 -ml-4" />
                          <span className="text-slate-700 font-medium">
                            [System, {formatDate(detailModal.created_at)}] Ticket Created
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
