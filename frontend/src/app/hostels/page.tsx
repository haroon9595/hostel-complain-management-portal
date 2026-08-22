"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { Hostel, Room } from "@/lib/types";
import {
  Building2,
  DoorOpen,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Calendar,
  Layers,
  Search,
  Building,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function HostelsPage() {
  const { requireAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<"hostels" | "rooms">("hostels");
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHostelFilter, setSelectedHostelFilter] = useState<number | null>(null);
  const [roomSearch, setRoomSearch] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Hostel Modal state (Add / Edit)
  const [isHostelModalOpen, setIsHostelModalOpen] = useState<boolean>(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [hostelNameInput, setHostelNameInput] = useState<string>("");
  const [submittingHostel, setSubmittingHostel] = useState<boolean>(false);

  // Room Modal state (Add / Edit)
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState<string>("");
  const [roomHostelIdInput, setRoomHostelIdInput] = useState<number | "">("");
  const [roomBlockInput, setRoomBlockInput] = useState<string>("");
  const [roomFloorInput, setRoomFloorInput] = useState<string>("");
  const [submittingRoom, setSubmittingRoom] = useState<boolean>(false);

  // Delete modals
  const [deletingHostel, setDeletingHostel] = useState<Hostel | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [deletingAction, setDeletingAction] = useState<boolean>(false);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [hostelData, roomData] = await Promise.all([
        api.getHostels(),
        api.getRooms(selectedHostelFilter || undefined),
      ]);
      setHostels(hostelData);
      setRooms(roomData);
      if (hostelData.length > 0 && !roomHostelIdInput) {
        setRoomHostelIdInput(hostelData[0].hostel_id);
      }
    } catch (err: any) {
      console.error("Failed to load hostels/rooms:", err);
      showToast(`Load failed: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedHostelFilter, roomHostelIdInput]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  // Hostel Handlers
  const doOpenAddHostelModal = () => {
    setEditingHostel(null);
    setHostelNameInput("");
    setIsHostelModalOpen(true);
  };

  const openAddHostelModal = () => {
    requireAuth(
      () => doOpenAddHostelModal(),
      "You must sign in with authorized Warden credentials to add residential halls."
    );
  };

  const doOpenEditHostelModal = (h: Hostel) => {
    setEditingHostel(h);
    setHostelNameInput(h.hostel_name);
    setIsHostelModalOpen(true);
  };

  const openEditHostelModal = (h: Hostel) => {
    requireAuth(
      () => doOpenEditHostelModal(h),
      `You must sign in with authorized Warden credentials to rename '${h.hostel_name}'.`
    );
  };

  const promptDeleteHostel = (h: Hostel) => {
    requireAuth(
      () => setDeletingHostel(h),
      `You must sign in with authorized Warden credentials to delete '${h.hostel_name}'.`
    );
  };

  const handleSaveHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelNameInput.trim()) return;

    setSubmittingHostel(true);
    try {
      if (editingHostel) {
        await api.updateHostel(editingHostel.hostel_id, {
          hostel_name: hostelNameInput.trim(),
        });
        showToast(`Hostel updated to '${hostelNameInput.trim()}' successfully!`);
      } else {
        await api.createHostel({
          hostel_name: hostelNameInput.trim(),
        });
        showToast(`Hostel '${hostelNameInput.trim()}' added successfully!`);
      }
      setIsHostelModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(`Hostel operation failed: ${err.message}`);
    } finally {
      setSubmittingHostel(false);
    }
  };

  const handleDeleteHostel = async () => {
    if (!deletingHostel) return;
    setDeletingAction(true);
    try {
      await api.deleteHostel(deletingHostel.hostel_id);
      showToast(`Hostel '${deletingHostel.hostel_name}' deleted successfully.`);
      setDeletingHostel(null);
      await loadData();
    } catch (err: any) {
      showToast(`Cannot delete: ${err.message}`);
    } finally {
      setDeletingAction(false);
    }
  };

  // Switch to rooms tab filtered by this hostel
  const viewHostelRooms = (hostelId: number) => {
    setSelectedHostelFilter(hostelId);
    setActiveTab("rooms");
  };

  // Room Handlers
  const doOpenAddRoomModal = () => {
    setEditingRoom(null);
    setRoomNumberInput("");
    setRoomBlockInput("Block A");
    setRoomFloorInput("1st Floor");
    if (hostels.length > 0) setRoomHostelIdInput(selectedHostelFilter || hostels[0].hostel_id);
    setIsRoomModalOpen(true);
  };

  const openAddRoomModal = () => {
    requireAuth(
      () => doOpenAddRoomModal(),
      "You must sign in with authorized Warden credentials to register resident rooms."
    );
  };

  const doOpenEditRoomModal = (r: Room) => {
    setEditingRoom(r);
    setRoomNumberInput(r.room_number);
    setRoomHostelIdInput(r.hostel_id);
    setRoomBlockInput(r.block);
    setRoomFloorInput(r.floor || "");
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (r: Room) => {
    requireAuth(
      () => doOpenEditRoomModal(r),
      `You must sign in with authorized Warden credentials to edit Room ${r.room_number}.`
    );
  };

  const promptDeleteRoom = (r: Room) => {
    requireAuth(
      () => setDeletingRoom(r),
      `You must sign in with authorized Warden credentials to delete Room ${r.room_number}.`
    );
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumberInput.trim() || !roomHostelIdInput || !roomBlockInput.trim()) return;

    setSubmittingRoom(true);
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.room_id, {
          hostel_id: Number(roomHostelIdInput),
          room_number: roomNumberInput.trim(),
          block: roomBlockInput.trim(),
          floor: roomFloorInput.trim() || undefined,
        });
        showToast(`Room ${roomNumberInput.trim()} updated successfully!`);
      } else {
        await api.createRoom({
          hostel_id: Number(roomHostelIdInput),
          room_number: roomNumberInput.trim(),
          block: roomBlockInput.trim(),
          floor: roomFloorInput.trim() || undefined,
        });
        showToast(`Room ${roomNumberInput.trim()} created successfully!`);
      }
      setIsRoomModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(`Room operation failed: ${err.message}`);
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;
    setDeletingAction(true);
    try {
      await api.deleteRoom(deletingRoom.room_id);
      showToast(`Room ${deletingRoom.room_number} deleted successfully.`);
      setDeletingRoom(null);
      await loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setDeletingAction(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (roomSearch.trim()) {
      const q = roomSearch.toLowerCase();
      return (
        r.room_number.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q) ||
        (r.hostel_name && r.hostel_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Hostels & Rooms Directory"
        selectedHostelId={selectedHostelFilter}
        onHostelChange={setSelectedHostelFilter}
        onRefresh={() => {
          setRefreshing(true);
          loadData();
        }}
        refreshing={refreshing}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <main className="p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("hostels")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "hostels"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hostels Directory ({hostels.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "rooms"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Rooms Directory ({rooms.length})</span>
            </button>
          </div>

          <div>
            {activeTab === "hostels" ? (
              <button
                onClick={openAddHostelModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-sky-400/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hostel</span>
              </button>
            ) : (
              <button
                onClick={openAddRoomModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-sky-400/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: Hostels */}
        {activeTab === "hostels" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Registered university residential buildings connected to ticket routing, room allocation, and complaint dispatch
            </p>

            {loading ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading hostels from database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {hostels.map((h) => (
                  <div
                    key={h.hostel_id}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                          ID #{h.hostel_id}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {h.hostel_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Residential Hall
                        </p>
                      </div>

                      {/* Live Counts: Rooms and Active Complaints */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div className="p-2.5 rounded-xl bg-slate-50 text-center border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Rooms
                          </span>
                          <span className="text-sm font-extrabold text-slate-800">
                            {h.room_count ?? 0}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 text-center border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Active Tickets
                          </span>
                          <span
                            className={`text-sm font-extrabold ${
                              (h.active_complaints_count ?? 0) > 0
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {h.active_complaints_count ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Quick link to view rooms of this hostel */}
                      <button
                        onClick={() => viewHostelRooms(h.hostel_id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        <span>View Rooms</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditHostelModal(h)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => promptDeleteHostel(h)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Rooms */}
        {activeTab === "rooms" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search room number, block..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                {/* Filter by Hostel */}
                <select
                  value={selectedHostelFilter === null ? "" : selectedHostelFilter}
                  onChange={(e) =>
                    setSelectedHostelFilter(
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

                {selectedHostelFilter !== null && (
                  <button
                    onClick={() => setSelectedHostelFilter(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-900 font-bold">{filteredRooms.length}</span> registered rooms
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading rooms directory...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Rooms Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Add Room&rdquo; to register resident rooms for students and complaints routing.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold tracking-wider uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-4">Room No</th>
                      <th className="px-5 py-4">Hostel Name</th>
                      <th className="px-5 py-4">Block</th>
                      <th className="px-5 py-4">Floor</th>
                      <th className="px-5 py-4">Created Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRooms.map((r) => (
                      <tr key={r.room_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-bold font-mono text-slate-900 text-sm">
                          {r.room_number}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {r.hostel_name || `Hostel #${r.hostel_id}`}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-600">
                          {r.block}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {r.floor || "Ground"}
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap font-medium">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditRoomModal(r)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                              title="Edit Room"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => promptDeleteRoom(r)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Hostel Modal */}
        {isHostelModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingHostel ? "Rename Hostel" : "Add New Hostel"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsHostelModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHostel} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Hostel / Hall Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={hostelNameInput}
                    onChange={(e) => setHostelNameInput(e.target.value)}
                    placeholder="e.g. Fatima Jinnah Hall"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHostelModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingHostel}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    {submittingHostel
                      ? "Saving..."
                      : editingHostel
                      ? "Save Changes"
                      : "Create Hostel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add / Edit Room Modal */}
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingRoom ? "Edit Room Details" : "Add New Room"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRoomModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Assigned Hostel *
                  </label>
                  <select
                    value={roomHostelIdInput}
                    onChange={(e) => setRoomHostelIdInput(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
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
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumberInput}
                    onChange={(e) => setRoomNumberInput(e.target.value)}
                    placeholder="e.g. 101, 204-B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 font-semibold block mb-1">
                      Block *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomBlockInput}
                      onChange={(e) => setRoomBlockInput(e.target.value)}
                      placeholder="e.g. Block A, Wing 1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-semibold block mb-1">
                      Floor (Optional)
                    </label>
                    <input
                      type="text"
                      value={roomFloorInput}
                      onChange={(e) => setRoomFloorInput(e.target.value)}
                      placeholder="e.g. Ground, 1st Floor"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRoomModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRoom}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    {submittingRoom
                      ? "Saving..."
                      : editingRoom
                      ? "Update Room"
                      : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Hostel Modal */}
        {deletingHostel && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Hostel?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{deletingHostel.hostel_name}</span>? Hostels with registered rooms or active complaints cannot be deleted.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingHostel(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAction}
                  onClick={handleDeleteHostel}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {deletingAction ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Modal */}
        {deletingRoom && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Room {deletingRoom.room_number}?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove Room <span className="font-bold text-slate-800">{deletingRoom.room_number}</span> from {deletingRoom.hostel_name}?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingRoom(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAction}
                  onClick={handleDeleteRoom}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {deletingAction ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
