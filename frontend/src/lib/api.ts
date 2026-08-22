import {
  Complaint,
  ComplaintDetail,
  DashboardStats,
  AnalyticsOverview,
  Hostel,
  HostelCreatePayload,
  HostelUpdatePayload,
  Room,
  RoomCreatePayload,
  RoomUpdatePayload,
  Category,
  Status,
  Priority,
  Staff,
  StaffCreatePayload,
  StaffUpdatePayload,
} from "./types";

/**
 * Base URL for FastAPI Backend routed through Vercel Serverless Function (/api/py)
 * Defaults to '/api/py' for seamless serverless execution alongside Next.js.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/py";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorMessage = `API Error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage =
          typeof errorJson.detail === "string"
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service?: string }>("/health"),

  // Dashboard Stats & Analytics Overview
  getDashboardStats: (hostelId?: number) => {
    const query = hostelId ? `?hostel_id=${hostelId}` : "";
    return request<DashboardStats>(`/dashboard/stats${query}`);
  },

  getAnalyticsOverview: (hostelId?: number) => {
    const query = hostelId ? `?hostel_id=${hostelId}` : "";
    return request<AnalyticsOverview>(`/analytics/overview${query}`);
  },

  // Complaints
  getComplaints: (params?: {
    hostel_id?: number;
    status_id?: number;
    category_id?: number;
    priority_id?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.hostel_id) searchParams.set("hostel_id", String(params.hostel_id));
    if (params?.status_id) searchParams.set("status_id", String(params.status_id));
    if (params?.category_id) searchParams.set("category_id", String(params.category_id));
    if (params?.priority_id) searchParams.set("priority_id", String(params.priority_id));
    if (params?.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    return request<Complaint[]>(`/complaints${queryString ? `?${queryString}` : ""}`);
  },

  getComplaintById: (complaintId: number) =>
    request<ComplaintDetail>(`/complaints/${complaintId}`),

  updateComplaintStatus: (
    complaintId: number,
    statusId: number,
    changedBy?: string,
    note?: string
  ) =>
    request<ComplaintDetail>(`/complaints/${complaintId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status_id: statusId,
        changed_by: changedBy,
        note: note,
      }),
    }),

  assignComplaintStaff: (complaintId: number, staffId: number) =>
    request<ComplaintDetail>(`/complaints/${complaintId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({
        assigned_staff_id: staffId,
      }),
    }),

  addComplaintNote: (complaintId: number, author: string, note: string) =>
    request<{ status: string; message: string }>(`/complaints/${complaintId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        author,
        note,
      }),
    }),

  getComplaintHistory: (complaintId: number) =>
    request<any[]>(`/complaints/${complaintId}/history`),

  // Staff CRUD
  getStaffMembers: (params?: {
    hostel_id?: number;
    role_id?: number;
    is_active?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.hostel_id) searchParams.set("hostel_id", String(params.hostel_id));
    if (params?.role_id) searchParams.set("role_id", String(params.role_id));
    if (params?.is_active !== undefined) searchParams.set("is_active", String(params.is_active));

    const queryString = searchParams.toString();
    return request<Staff[]>(`/staff${queryString ? `?${queryString}` : ""}`);
  },

  createStaffMember: (payload: StaffCreatePayload) =>
    request<Staff>("/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStaffMember: (staffId: number, payload: StaffUpdatePayload) =>
    request<Staff>(`/staff/${staffId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteStaffMember: (staffId: number) =>
    request<{ status: string; message: string }>(`/staff/${staffId}`, {
      method: "DELETE",
    }),

  // Hostels CRUD
  getHostels: () => request<Hostel[]>("/hostels"),

  createHostel: (payload: HostelCreatePayload) =>
    request<Hostel>("/hostels", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateHostel: (hostelId: number, payload: HostelUpdatePayload) =>
    request<Hostel>(`/hostels/${hostelId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteHostel: (hostelId: number) =>
    request<{ status: string; message: string }>(`/hostels/${hostelId}`, {
      method: "DELETE",
    }),

  // Rooms CRUD
  getRooms: (hostelId?: number) => {
    const query = hostelId ? `?hostel_id=${hostelId}` : "";
    return request<Room[]>(`/rooms${query}`);
  },

  createRoom: (payload: RoomCreatePayload) =>
    request<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateRoom: (roomId: number, payload: RoomUpdatePayload) =>
    request<Room>(`/rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteRoom: (roomId: number) =>
    request<{ status: string; message: string }>(`/rooms/${roomId}`, {
      method: "DELETE",
    }),

  // Lookups
  getCategories: () => request<Category[]>("/categories"),
  getStatuses: () => request<Status[]>("/statuses"),
  getPriorities: () => request<Priority[]>("/priorities"),
};
