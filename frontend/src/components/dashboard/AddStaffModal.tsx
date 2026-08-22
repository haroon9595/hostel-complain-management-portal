"use client";

import React, { useState } from "react";
import { Hostel } from "@/lib/types";
import { api } from "@/lib/api";
import { X, UserPlus, ChevronDown } from "lucide-react";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostels: Hostel[];
  onStaffAdded: () => void;
  onToast: (msg: string) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  hostels,
  onStaffAdded,
  onToast,
}) => {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [hostelId, setHostelId] = useState<number | "">(
    hostels.length > 0 ? hostels[0].hostel_id : ""
  );
  const [block, setBlock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp || !hostelId) return;

    setSubmitting(true);
    try {
      await api.createStaffMember({
        full_name: fullName.trim(),
        whatsapp_number: whatsapp.trim(),
        email: email.trim() || undefined,
        hostel_id: Number(hostelId),
        role_id: 1, // RT
        block: block.trim() || undefined,
      });
      onToast(`Staff member '${fullName}' added successfully!`);
      onStaffAdded();
      onClose();
    } catch (err: any) {
      onToast(`Failed to add staff: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Add Staff Member</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              WhatsApp / RT Identifier *
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 03001234567 or Slack User ID"
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
              placeholder="e.g. staff@hostel.edu.pk"
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

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
