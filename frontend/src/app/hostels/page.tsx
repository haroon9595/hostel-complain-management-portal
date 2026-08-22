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
  Search,
  ArrowRight,
  ChevronDown,
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
      "You must sign in with authorized Warden credentials to rename residential halls."
    );
  };

  const executeDeleteHostel = async () => {
    if (!deletingHostel) return;
    setDeletingAction(true);
    try {
      await api.deleteHostel(deletingHostel.hostel_id);
      showToast(`Hostel "${deletingHostel.hostel_name}" deleted successfully!`);
      setDeletingHostel(null);
      await loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setDeletingAction(false);
    }
  };

  const handleDeleteHostel = () => {
    if (!deletingHostel) return;
    requireAuth(
      () => executeDeleteHostel(),
      `You must sign in with authorized Warden credentials to delete ${deletingHostel.hostel_name}.`
    );
  };

  const promptDeleteHostel = (h: Hostel) => {
    setDeletingHostel(h);
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
        showToast("Hostel updated successfully!");
      } else {
        await api.createHostel({
          hostel_name: hostelNameInput.trim(),
        });
        showToast("Hostel created successfully!");
      }
      setIsHostelModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`);
    } finally {
      setSubmittingHostel(false);
    }
  };

  // Quick switch tab to view rooms for a given hostel
  const viewHostelRooms = (hostelId: number) => {
    setSelectedHostelFilter(hostelId);
    setActiveTab("rooms");
  };

  // Room Handlers
  const doOpenAddRoomModal = () => {
    setEditingRoom(null);
    setRoomNumberInput("");
    setRoomBlockInput("");
    setRoomFloorInput("");
    if (hostels.length > 0) setRoomHostelIdInput(hostels[0].hostel_id);
    setIsRoomModalOpen(true);
  };

  const openAddRoomModal = () => {
    requireAuth(
      () => doOpenAddRoomModal(),
      "You must sign in with authorized Warden credentials to add new rooms."
    );
  };

  const doOpenEditRoomModal = (r: Room) => {
    setEditingRoom(r);
    setRoomNumberInput(r.room_number);
    setRoomHostelIdInput(r.hostel_id);
    setRoomBlockInput(r.block || "");
    setRoomFloorInput(r.floor || "");
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (r: Room) => {
    requireAuth(
      () => doOpenEditRoomModal(r),
      "You must sign in with authorized Warden credentials to edit room details."
    );
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumberInput.trim() || !roomHostelIdInput || !roomBlockInput.trim()) {
      showToast("Please fill all required room fields.");
      return;
    }

    setSubmittingRoom(true);
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.room_id, {
          hostel_id: Number(roomHostelIdInput),
          room_number: roomNumberInput.trim(),
          block: roomBlockInput.trim(),
          floor: roomFloorInput.trim() || undefined,
        });
        showToast("Room updated successfully!");
      } else {
        await api.createRoom({
          hostel_id: Number(roomHostelIdInput),
          room_number: roomNumberInput.trim(),
          block: roomBlockInput.trim(),
          floor: roomFloorInput.trim() || undefined,
        });
        showToast("Room created successfully!");
      }
      setIsRoomModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`);
    } finally {
      setSubmittingRoom(false);
    }
  };

  const promptDeleteRoom = (r: Room) => {
    setDeletingRoom(r);
  };

  const executeDeleteRoom = async () => {
    if (!deletingRoom) return;
    setDeletingAction(true);
    try {
      await api.deleteRoom(deletingRoom.room_id);
      showToast(`Room #${deletingRoom.room_number} deleted successfully!`);
      setDeletingRoom(null);
      await loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setDeletingAction(false);
    }
  };

  const handleDeleteRoom = () => {
    if (!deletingRoom) return;
    requireAuth(
      () => executeDeleteRoom(),
      `You must sign in with authorized Warden credentials to delete Room #${deletingRoom.room_number}.`
    );
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 w-full overflow-x-hidden">
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
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 max-w-[90vw]">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      <main className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("hostels")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                activeTab === "hostels"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hostels ({hostels.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                activeTab === "rooms"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Rooms ({rooms.length})</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {activeTab === "hostels" ? (
              <button
                onClick={openAddHostelModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hostel</span>
              </button>
            ) : (
              <button
                onClick={openAddRoomModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap min-h-[44px]"
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
              <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading hostels from database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {hostels.map((h) => (
                  <div
                    key={h.hostel_id}
                    className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                          ID #{h.hostel_id}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base truncate">
                          {h.hostel_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Residential Hall
                        </p>
                      </div>

                      {/* Live Counts: Rooms and Active Complaints */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div className="p-2 rounded-xl bg-slate-50 text-center border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Rooms
                          </span>
                          <span className="text-sm font-extrabold text-slate-800">
                            {h.room_count ?? 0}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 text-center border border-slate-100">
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
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors min-h-[38px]"
                      >
                        <span>View Rooms</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditHostelModal(h)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-colors min-h-[36px]"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => promptDeleteHostel(h)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-colors min-h-[36px]"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 flex-1 w-full">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search room number, block..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                {/* Filter by Hostel */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedHostelFilter === null ? "" : selectedHostelFilter}
                    onChange={(e) =>
                      setSelectedHostelFilter(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="w-full sm:w-auto min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer appearance-none"
                  >
                    <option value="">All Hostels</option>
                    {hostels.map((h) => (
                      <option key={h.hostel_id} value={h.hostel_id}>
                        {h.hostel_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {selectedHostelFilter !== null && (
                  <button
                    onClick={() => setSelectedHostelFilter(null)}
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 flex-shrink-0"
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
              <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading rooms directory...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Rooms Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Add Room&rdquo; to register resident rooms for students and complaints routing.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xs w-full">
                <div className="overflow-x-auto touch-scroll w-full">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold tracking-wider uppercase text-[11px]">
                      <tr>
                        <th className="px-4 sm:px-5 py-4">Room No</th>
                        <th className="px-4 sm:px-5 py-4">Hostel Name</th>
                        <th className="px-4 sm:px-5 py-4">Block</th>
                        <th className="px-4 sm:px-5 py-4">Floor</th>
                        <th className="px-4 sm:px-5 py-4">Created Date</th>
                        <th className="px-4 sm:px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredRooms.map((r) => (
                        <tr key={r.room_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 sm:px-5 py-4 font-bold font-mono text-slate-900 text-sm whitespace-nowrap">
                            {r.room_number}
                          </td>
                          <td className="px-4 sm:px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                            {r.hostel_name || `Hostel #${r.hostel_id}`}
                          </td>
                          <td className="px-4 sm:px-5 py-4 font-medium text-slate-600">
                            {r.block}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-slate-500">
                            {r.floor || "Ground"}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-slate-400 whitespace-nowrap font-medium text-[11px]">
                            {formatDate(r.created_at)}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openEditRoomModal(r)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                                title="Edit Room"
                                aria-label="Edit Room"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promptDeleteRoom(r)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                                title="Delete Room"
                                aria-label="Delete Room"
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
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Hostel Modal */}
        {isHostelModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingHostel ? "Rename Hostel" : "Add New Hostel"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsHostelModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHostel} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1.5">
                    Hostel / Hall Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={hostelNameInput}
                    onChange={(e) => setHostelNameInput(e.target.value)}
                    placeholder="e.g. Fatima Jinnah Hall"
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHostelModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingHostel}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingRoom ? "Edit Room Details" : "Add New Room"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRoomModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">
                    Assigned Hostel *
                  </label>
                  <div className="relative">
                    <select
                      value={roomHostelIdInput}
                      onChange={(e) => setRoomHostelIdInput(Number(e.target.value))}
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
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumberInput}
                    onChange={(e) => setRoomNumberInput(e.target.value)}
                    placeholder="e.g. 101, 204-B"
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Block / Wing *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomBlockInput}
                      onChange={(e) => setRoomBlockInput(e.target.value)}
                      placeholder="e.g. Block A"
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Floor (Optional)
                    </label>
                    <input
                      type="text"
                      value={roomFloorInput}
                      onChange={(e) => setRoomFloorInput(e.target.value)}
                      placeholder="e.g. 1st Floor"
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRoomModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRoom}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 text-center my-auto">
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

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingHostel(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAction}
                  onClick={handleDeleteHostel}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {deletingAction ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Modal */}
        {deletingRoom && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto touch-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 text-center my-auto">
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

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingRoom(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAction}
                  onClick={handleDeleteRoom}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
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
