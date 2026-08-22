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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
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
  checkHealth: () => request<{ status: string }>("/health"),

  // Dashboard Stats & Analytics Overview
  getDashboardStats: (hostelId?: number) => {
    const query = hostelId ? `?hostel_id=${hostelId}` : "";
    return request<DashboardStats>(`/api/dashboard/stats${query}`);
  },

  getAnalyticsOverview: (hostelId?: number) => {
    const query = hostelId ? `?hostel_id=${hostelId}` : "";
    return request<AnalyticsOverview>(`/api/analytics/overview${query}`);
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
    return request<Complaint[]>(`/api/complaints${queryString ? `?${queryString}` : ""}`);
  },

  getComplaintById: (complaintId: number) =>
    request<ComplaintDetail>(`/api/complaints/${complaintId}`),

  updateComplaintStatus: (
    complaintId: number,
    statusId: number,
    changedBy?: string,
    note?: string
  ) =>
    request<ComplaintDetail>(`/api/complaints/${complaintId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status_id: statusId,
        changed_by: changedBy,
        note: note,
      }),
    }),

  assignComplaintStaff: (complaintId: number, staffId: number) =>
    request<ComplaintDetail>(`/api/complaints/${complaintId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({
        assigned_staff_id: staffId,
      }),
    }),

  addComplaintNote: (complaintId: number, author: string, note: string) =>
    request<{ status: string; message: string }>(`/api/complaints/${complaintId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        author,
        note,
      }),
    }),

  getComplaintHistory: (complaintId: number) =>
    request<any[]>(`/api/complaints/${complaintId}/history`),

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
    return request<Staff[]>(`/api/staff${queryString ? `?${queryString}` : ""}`);
  },

  createStaffMember: (payload: StaffCreatePayload) =>
    request<Staff>("/api/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStaffMember: (staffId: number, payload: StaffUpdatePayload) =>
    request<Staff>(`/api/staff/${staffId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteStaffMember: (staffId: number) =>
    request<{ status: string; message: string }>(`/api/staff/${staffId}`, {
      method: "DELETE",
    }),

  // Hostels CRUD
  getHostels: () => request<Hostel[]>("/api/hostels"),

  createHostel: (payload: HostelCreatePayload) =>
    request<Hostel>("/api/hostels", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateHostel: (hostelId: number, payload: HostelUpdatePayload) =>
    request<Hostel>(`/api/hostels/${hostelId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteHostel: (hostelId: number) =>
    request<{ status: string; message: string }>(`/api/hostels/${hostelId}`, {
      method: "DELETE",
    }),

  // Rooms CRUD
  getRooms: (hostelId?: number) => {
    const query = hostelId ? `?hostel_id=${hostelId}` : "";
    return request<Room[]>(`/api/rooms${query}`);
  },

  createRoom: (payload: RoomCreatePayload) =>
    request<Room>("/api/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateRoom: (roomId: number, payload: RoomUpdatePayload) =>
    request<Room>(`/api/rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteRoom: (roomId: number) =>
    request<{ status: string; message: string }>(`/api/rooms/${roomId}`, {
      method: "DELETE",
    }),

  // Lookups
  getCategories: () => request<Category[]>("/api/categories"),
  getStatuses: () => request<Status[]>("/api/statuses"),
  getPriorities: () => request<Priority[]>("/api/priorities"),
};
