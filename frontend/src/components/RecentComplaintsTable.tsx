"use client";

import React from "react";
import Link from "next/link";
import { Complaint } from "@/lib/types";
import { ComplaintBadge } from "./ComplaintBadge";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, AlertCircle, Eye } from "lucide-react";

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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="inline-block w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading complaints data...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-slate-800">No Complaints Found</p>
        <p className="text-xs text-slate-500 mt-1">
          No complaints match the current filter or criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold tracking-wider uppercase text-[11px]">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Student</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Category & Issue</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Assigned RT</th>
              <th className="px-5 py-4">Reported</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {complaints.map((c) => (
              <tr
                key={c.complaint_id}
                className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                onClick={() => onSelectComplaint && onSelectComplaint(c)}
              >
                {/* ID */}
                <td className="px-5 py-4 font-mono font-bold text-indigo-600">
                  #{c.complaint_id}
                </td>

                {/* Student */}
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

                {/* Status */}
                <td className="px-5 py-4">
                  <ComplaintBadge type="status" value={c.status_name} />
                </td>

                {/* Assigned Staff */}
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

                {/* Action Link */}
                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/complaints?id=${c.complaint_id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Manage
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
