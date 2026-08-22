"use client";

import React, { useState } from "react";
import { ComplaintDetail, Staff } from "@/lib/types";
import {
  MessageSquare,
  Phone,
  MoreHorizontal,
  Send,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  Clock,
  User,
  Inbox,
} from "lucide-react";
import { api } from "@/lib/api";
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
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>("");
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  if (!complaint) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[420px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No Ticket Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Click any complaint row from the table below to inspect details, dispatch RTs, and manage notes.
        </p>
      </div>
    );
  }

  // Extract resolved labels cleanly
  const studentName =
    complaint.student?.full_name || complaint.student_name || "Unknown Student";
  const studentRoll =
    complaint.student?.roll_number || complaint.student_roll_number || "";
  const studentPhone =
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

  const handleAssignStaff = async (staffId: number) => {
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

  const handleStatusChange = async (statusId: number, statusLabel: string) => {
    setSubmittingAction(true);
    setShowMoreMenu(false);
    try {
      await api.updateComplaintStatus(
        complaint.complaint_id,
        statusId,
        "Management Admin",
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      await api.addComplaintNote(
        complaint.complaint_id,
        "Management Admin",
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

  const whatsappUrl = `https://wa.me/${studentPhone.replace(
    /[^0-9]/g,
    ""
  )}?text=Hi%20${encodeURIComponent(
    studentName
  )},%20we%20are%20looking%20into%20your%20hostel%20complaint%20%23${
    complaint.complaint_id
  }`;

  const slackUrl = `slack://user?team=T0BQ&id=${encodeURIComponent(slackId)}`;

  // Filter history entries with notes for the notes box
  const notesList = (complaint.status_history || []).filter((h) => h.note && h.note.trim());

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5 h-full relative">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
            Ticket #{complaint.complaint_id}
          </h3>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200 shadow-2xs">
              {priorityName} Priority
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
              {statusName}
            </span>
          </div>
        </div>

        {/* Student Context with full name and room details */}
        <p className="text-xs font-bold text-slate-800 leading-snug">
          Student:{" "}
          <span className="font-semibold text-slate-700">
            {studentName} (Room {complaint.room_number}, {hostelName})
          </span>
        </p>
        {studentRoll && (
          <p className="text-[11px] text-slate-500 font-mono">
            Roll: {studentRoll}
          </p>
        )}
        <p className="text-xs text-slate-600 font-medium mt-1">
          {complaint.description || complaint.sub_issue}
        </p>
      </div>

      {/* Quick Action Bar */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
        <a
          href={slackUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
        >
          <span>Contact Student (Slack)</span>
        </a>

        {studentPhone && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <span>Send WhatsApp</span>
          </a>
        )}

        {/* Assign Dropdown */}
        <div className="relative">
          <select
            value={complaint.assigned_staff_id || ""}
            onChange={(e) => {
              if (e.target.value) handleAssignStaff(Number(e.target.value));
            }}
            disabled={submittingAction}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer outline-none max-w-[130px] truncate"
          >
            <option value="">
              {assignedStaffName ? `RT: ${assignedStaffName}` : "Assign to ▾"}
            </option>
            {staffList.map((s) => (
              <option key={s.staff_id} value={s.staff_id}>
                {s.full_name} ({s.hostel_name || "RT"})
              </option>
            ))}
          </select>
        </div>

        {/* Context More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 p-1 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95">
              <button
                onClick={() => handleStatusChange(1, "Pending / On Hold")}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Put on Hold</span>
              </button>
              <button
                onClick={() => handleStatusChange(2, "Escalated")}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-rose-600"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Escalate</span>
              </button>
              <button
                onClick={() => handleStatusChange(3, "Resolved")}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mark Resolved</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Internal Private Notes Box */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-800">Internal Private Notes</h4>
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs text-slate-700 font-medium space-y-2 max-h-32 overflow-y-auto">
          {notesList.length === 0 ? (
            <p className="text-slate-400 italic text-[11px]">
              No notes recorded yet. Add an internal note below.
            </p>
          ) : (
            notesList.map((h) => (
              <div key={h.history_id} className="text-slate-800">
                <span className="font-semibold text-indigo-700">
                  [{h.changed_by}, {formatDate(h.changed_at)}]
                </span>{" "}
                <span>{h.note}</span>
              </div>
            ))
          )}
        </div>

        {/* Append Note Input */}
        <form onSubmit={handleAddNote} className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            placeholder="Add internal note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={submittingNote || !newNote.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Audit Trail / Timeline */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800">Audit Trail/Timeline</h4>

        <div className="relative pl-4 space-y-2.5 text-xs max-h-40 overflow-y-auto before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sky-200">
          {complaint.status_history && complaint.status_history.length > 0 ? (
            complaint.status_history.map((h, idx) => (
              <div key={h.history_id || idx} className="relative flex items-start gap-2">
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
                [System, {formatDate(complaint.created_at)}] Ticket Created
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
