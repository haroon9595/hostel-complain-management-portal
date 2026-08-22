"use client";

import React, { useState } from "react";
import {
  ComplaintDetail,
  Staff,
} from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Phone,
  MessageSquare,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  MoreVertical,
  RotateCcw,
  Check,
  ChevronDown,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TicketDetailPanelProps {
  complaint: ComplaintDetail | null;
  staffList: Staff[];
  onRefresh: () => void;
  onToast: (msg: string) => void;
}

export const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({
  complaint,
  staffList,
  onRefresh,
  onToast,
}) => {
  const { requireAuth, user } = useAuth();
  const [newNote, setNewNote] = useState<string>("");
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  if (!complaint) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[460px] shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Ticket Selected</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
          Click any complaint row from the table below to inspect details, dispatch RT, or update status.
        </p>
      </div>
    );
  }

  const studentName =
    complaint.student?.full_name || complaint.student_name || "Hostel Resident";
  const studentRoll =
    complaint.student?.roll_number || complaint.student_roll_number || "";
  const phone =
    complaint.student?.phone_number ||
    complaint.student?.whatsapp_number ||
    complaint.student_whatsapp ||
    "";
  const slackId =
    complaint.student?.whatsapp_number || complaint.student_whatsapp || "";
  const hostelName =
    complaint.hostel?.hostel_name || complaint.hostel_name || `Hostel #${complaint.hostel_id}`;
  const priorityName =
    complaint.priority?.priority_name || complaint.priority_name || "Normal";
  const statusName =
    complaint.status?.status_name || complaint.status_name || "Pending";
  const assignedStaffName =
    complaint.assigned_staff?.full_name || complaint.assigned_staff_name || null;

  const executeAssignStaff = async (staffId: number) => {
    setSubmittingAction(true);
    try {
      await api.assignComplaintStaff(complaint.complaint_id, staffId);
      onToast("Staff member assigned successfully!");
      onRefresh();
    } catch (err: any) {
      onToast(`Failed to assign: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAssignStaff = (staffId: number) => {
    requireAuth(
      () => executeAssignStaff(staffId),
      "You must sign in with authorized RT / Warden credentials to assign staff members."
    );
  };

  const executeStatusChange = async (statusId: number, statusLabel: string) => {
    setSubmittingAction(true);
    setShowMoreMenu(false);
    try {
      await api.updateComplaintStatus(
        complaint.complaint_id,
        statusId,
        user?.name || "Management Admin",
        `Status set to ${statusLabel}`
      );
      onToast(`Ticket marked as ${statusLabel}!`);
      onRefresh();
    } catch (err: any) {
      onToast(`Status change failed: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleStatusChange = (statusId: number, statusLabel: string) => {
    requireAuth(
      () => executeStatusChange(statusId, statusLabel),
      `You must sign in with authorized RT / Warden credentials to mark ticket #${complaint.complaint_id} as ${statusLabel}.`
    );
  };

  const executeAddNote = async () => {
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await api.addComplaintNote(
        complaint.complaint_id,
        user?.name || "Management Admin",
        newNote.trim()
      );
      setNewNote("");
      onToast("Internal note appended!");
      onRefresh();
    } catch (err: any) {
      onToast(`Note addition failed: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    requireAuth(
      () => executeAddNote(),
      "You must sign in with authorized RT / Warden credentials to append internal notes."
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
      {/* 1. Header & ID Badge */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-100">
                Ticket #{complaint.complaint_id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  priorityName.toLowerCase() === "high" ||
                  priorityName.toLowerCase() === "urgent"
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {priorityName} Priority
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
              {complaint.sub_issue || "Room Maintenance Issue"}
            </h3>
          </div>

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => handleStatusChange(1, "Pending")}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reopen / Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Resident Metadata Details */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{studentName}</span>
              {studentRoll && (
                <span className="text-slate-400 font-normal">({studentRoll})</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              {hostelName} - Room {complaint.room_number || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 font-mono text-[11px]">
            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
              >
                <Phone className="w-3 h-3" />
                <span>{phone}</span>
              </a>
            )}
            {slackId && (
              <span className="text-slate-400 inline-flex items-center gap-1 ml-auto">
                <MessageSquare className="w-3 h-3 text-indigo-400" />
                <span>{slackId}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Description & Student Message */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Issue Description
          </label>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            {complaint.description || complaint.raw_message || "No description provided."}
          </p>
        </div>

        {/* 4. Action Bar: Quick Status Updates */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Status Actions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusChange(2, "In Progress")}
              disabled={submittingAction || statusName.toLowerCase() === "in progress"}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                statusName.toLowerCase() === "in progress"
                  ? "bg-amber-100 text-amber-800 border border-amber-300 cursor-default"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </button>

            <button
              onClick={() => handleStatusChange(3, "Resolved")}
              disabled={submittingAction || statusName.toLowerCase() === "resolved"}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                statusName.toLowerCase() === "resolved"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve Ticket</span>
            </button>
          </div>
        </div>

        {/* 5. Assigned Staff Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Assigned RT / Staff
          </label>
          <div className="relative">
            <select
              value={complaint.assigned_staff_id || ""}
              onChange={(e) => handleAssignStaff(Number(e.target.value))}
              disabled={submittingAction}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none shadow-2xs"
            >
              <option value="" disabled>
                -- Select Staff Member --
              </option>
              {staffList.map((s) => (
                <option key={s.staff_id} value={s.staff_id}>
                  {s.full_name} ({s.current_load} active tickets)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 6. Timeline / Status History Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Audit Trail & History
          </label>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {complaint.status_history && complaint.status_history.length > 0 ? (
              complaint.status_history.map((hist) => (
                <div
                  key={hist.history_id}
                  className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="font-bold text-slate-700">{hist.changed_by}</span>
                    <span>{formatDate(hist.changed_at)}</span>
                  </div>
                  {hist.note && <p className="text-slate-600">{hist.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No notes or status history yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 7. Footer: Append Private Internal Note */}
      <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add internal private note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={submittingNote}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 transition-colors shadow-2xs"
          />
          <button
            type="submit"
            disabled={submittingNote || !newNote.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all shadow-xs"
            title="Append Note"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
