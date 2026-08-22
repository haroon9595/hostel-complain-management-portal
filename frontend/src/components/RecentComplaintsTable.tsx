"use client";

import React from "react";
import Link from "next/link";
import { Complaint } from "@/lib/types";
import { ComplaintBadge } from "./ComplaintBadge";
import { formatDate } from "@/lib/utils";
import { AlertCircle, Eye, Building, Calendar, User } from "lucide-react";

interface ComplaintsTableProps {
  complaints: Complaint[];
  loading?: boolean;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const RecentComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  loading = false,
  onSelectComplaint,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
        <div className="inline-block w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading complaints directory...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-slate-800">No Complaints Found</p>
        <p className="text-xs text-slate-500 mt-1">
          No complaints match the current filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden w-full">
      {/* Horizontally scrollable on small viewports with momentum touch scroll */}
      <div className="overflow-x-auto touch-scroll w-full">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold tracking-wider uppercase text-[11px]">
            <tr>
              <th className="px-4 sm:px-5 py-3.5">ID</th>
              <th className="px-4 sm:px-5 py-3.5">Student</th>
              <th className="px-4 sm:px-5 py-3.5">Location</th>
              <th className="px-4 sm:px-5 py-3.5">Category & Issue</th>
              <th className="px-4 sm:px-5 py-3.5">Priority</th>
              <th className="px-4 sm:px-5 py-3.5">Status</th>
              <th className="px-4 sm:px-5 py-3.5">Assigned RT</th>
              <th className="px-4 sm:px-5 py-3.5">Reported</th>
              <th className="px-4 sm:px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {complaints.map((c) => (
              <tr
                key={c.complaint_id}
                className="hover:bg-indigo-50/40 active:bg-indigo-50/70 transition-colors group cursor-pointer"
                onClick={() => onSelectComplaint && onSelectComplaint(c)}
              >
                {/* ID */}
                <td className="px-4 sm:px-5 py-3.5 font-mono font-bold text-indigo-600 whitespace-nowrap">
                  #{c.complaint_id}
                </td>

                {/* Student */}
                <td className="px-4 sm:px-5 py-3.5">
                  <div className="font-bold text-slate-900 truncate max-w-[150px]">
                    {c.student_name || "Unknown Student"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {c.student_roll_number || c.student_whatsapp || "N/A"}
                  </div>
                </td>

                {/* Location */}
                <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  <div className="font-semibold text-slate-800">
                    Room {c.room_number}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {c.hostel_name || `Hostel #${c.hostel_id}`}
                  </div>
                </td>

                {/* Category & Issue */}
                <td className="px-4 sm:px-5 py-3.5 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ComplaintBadge type="category" value={c.category_name} />
                  </div>
                  <p className="text-slate-600 font-medium line-clamp-1 text-xs">
                    {c.sub_issue || c.description}
                  </p>
                </td>

                {/* Priority */}
                <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  <ComplaintBadge type="priority" value={c.priority_name} />
                </td>

                {/* Status */}
                <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  <ComplaintBadge type="status" value={c.status_name} />
                </td>

                {/* Assigned Staff */}
                <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  {c.assigned_staff_name ? (
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                        {c.assigned_staff_name.charAt(0)}
                      </div>
                      <span className="truncate max-w-[120px]">{c.assigned_staff_name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>

                {/* Created Date */}
                <td className="px-4 sm:px-5 py-3.5 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                  {formatDate(c.created_at)}
                </td>

                {/* Action Link */}
                <td className="px-4 sm:px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/complaints?id=${c.complaint_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 active:bg-indigo-100 text-slate-700 hover:text-indigo-600 font-semibold text-xs transition-colors min-h-[36px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
