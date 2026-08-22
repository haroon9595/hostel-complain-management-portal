"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { WeeklyTrendChart } from "@/components/dashboard/WeeklyTrendChart";
import { CategoriesPieChart } from "@/components/dashboard/CategoriesPieChart";
import { HostelHeatmapGrid } from "@/components/dashboard/HostelHeatmapGrid";
import { StaffLoadChart } from "@/components/dashboard/StaffLoadChart";
import { TicketDetailPanel } from "@/components/dashboard/TicketDetailPanel";
import { RecentComplaintsTable } from "@/components/RecentComplaintsTable";
import { api } from "@/lib/api";
import {
  Complaint,
  ComplaintDetail,
  AnalyticsOverview,
  Staff,
  Hostel,
} from "@/lib/types";
import { Check, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);

  // Selected complaint detail for Right Panel / Drawer
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [analyticsData, complaintsData, staffData, hostelData] =
        await Promise.all([
          api.getAnalyticsOverview(selectedHostelId || undefined),
          api.getComplaints({
            hostel_id: selectedHostelId || undefined,
            search: searchQuery || undefined,
          }),
          api.getStaffMembers({ hostel_id: selectedHostelId || undefined }),
          api.getHostels(),
        ]);

      setAnalytics(analyticsData);
      setComplaints(complaintsData);
      setStaffList(staffData);
      setHostels(hostelData);

      // If we currently have a selected complaint, refresh its detail; otherwise select first
      if (selectedComplaint) {
        try {
          const freshDetail = await api.getComplaintById(selectedComplaint.complaint_id);
          setSelectedComplaint(freshDetail);
        } catch {
          if (complaintsData.length > 0) {
            const firstDetail = await api.getComplaintById(complaintsData[0].complaint_id);
            setSelectedComplaint(firstDetail);
          } else {
            setSelectedComplaint(null);
          }
        }
      } else if (complaintsData.length > 0) {
        try {
          const firstDetail = await api.getComplaintById(complaintsData[0].complaint_id);
          setSelectedComplaint(firstDetail);
        } catch {
          setSelectedComplaint(complaintsData[0] as ComplaintDetail);
        }
      } else {
        setSelectedComplaint(null);
      }
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      showToast(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedHostelId, searchQuery]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleSelectComplaintFromTable = async (c: Complaint) => {
    try {
      const detail = await api.getComplaintById(c.complaint_id);
      setSelectedComplaint(detail);
      showToast(`Viewing Ticket #${c.complaint_id}`);
      // On mobile viewports, scroll smoothly to the ticket detail panel
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        const panel = document.getElementById("ticket-detail-panel-section");
        if (panel) {
          panel.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch {
      setSelectedComplaint(c as ComplaintDetail);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <Header
        title="Resident Tutors & Maintenance Staff"
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
        {/* Top Header Banner */}
        <div className="flex flex-col gap-1 pb-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Resident Tutors & Maintenance Staff
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Assigned RT contacts, current ticket load, and dispatch directory
          </p>
        </div>

        {/* Core Layout Grid: Desktop 12-col split (Middle Charts 7-8 cols, Right Drawer 5-4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
          {/* Middle Analytics Section (2x2 Grid) */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            {/* 1. Total Complaints Card */}
            <WeeklyTrendChart
              totalCount={analytics?.total_complaints_count ?? 0}
              data={analytics?.weekly_trend ?? []}
              loading={loading}
            />

            {/* 2. Categories Breakdown Card */}
            <CategoriesPieChart
              data={analytics?.category_breakdown ?? []}
              loading={loading}
            />

            {/* 3. Hostel Heatmap Card */}
            <HostelHeatmapGrid
              data={analytics?.hostel_heatmap ?? []}
              loading={loading}
            />

            {/* 4. Staff Load Balancer Card */}
            <StaffLoadChart
              data={analytics?.staff_load ?? []}
              stats={analytics?.rt_stats}
              loading={loading}
            />
          </div>

          {/* Right Detail Panel: Ticket Drawer */}
          <div
            id="ticket-detail-panel-section"
            className="col-span-12 lg:col-span-5 xl:col-span-4 h-full w-full min-w-0 lg:sticky lg:top-20"
          >
            <TicketDetailPanel
              complaint={selectedComplaint}
              staffList={staffList}
              onRefresh={loadData}
              onToast={showToast}
            />
          </div>
        </div>

        {/* Bottom Section: Recent Complaints Directory */}
        <div className="space-y-4 pt-4 border-t border-slate-200 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Live Complaints Directory
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Tap any ticket to inspect details and dispatch staff
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60 bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs min-h-[40px]"
                />
              </div>

              <Link
                href="/complaints"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-bold border border-indigo-200/80 transition-colors shadow-2xs whitespace-nowrap min-h-[40px]"
              >
                <span>Full Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <RecentComplaintsTable
            complaints={complaints}
            loading={loading}
            onSelectComplaint={handleSelectComplaintFromTable}
          />
        </div>
      </main>
    </div>
  );
}
