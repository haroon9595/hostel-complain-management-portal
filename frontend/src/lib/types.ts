export interface Hostel {
  hostel_id: number;
  hostel_name: string;
  created_at?: string | null;
  room_count?: number;
  active_complaints_count?: number;
}

export interface HostelCreatePayload {
  hostel_name: string;
}

export interface HostelUpdatePayload {
  hostel_name: string;
}

export interface Room {
  room_id: number;
  hostel_id: number;
  room_number: string;
  block: string;
  floor?: string | null;
  created_at?: string | null;
  hostel_name?: string | null;
}

export interface RoomCreatePayload {
  hostel_id: number;
  room_number: string;
  block: string;
  floor?: string;
}

export interface RoomUpdatePayload {
  hostel_id?: number;
  room_number?: string;
  block?: string;
  floor?: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  created_at?: string | null;
}

export interface Priority {
  priority_id: number;
  priority_name: string;
  sort_order?: number;
  created_at?: string | null;
}

export interface Status {
  status_id: number;
  status_name: string;
  is_terminal?: boolean;
  sort_order?: number;
  created_at?: string | null;
}

export interface Student {
  student_id: number;
  full_name: string;
  roll_number?: string | null;
  whatsapp_number: string;
  phone_number?: string | null;
  email?: string | null;
  room_id?: number | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface Staff {
  staff_id: number;
  full_name: string;
  whatsapp_number: string;
  email?: string | null;
  hostel_id: number;
  category_id?: number | null;
  role_id: number;
  block?: string | null;
  current_load: number;
  is_active: boolean;
  created_at?: string | null;
  hostel_name?: string | null;
  role_name?: string | null;
  category_name?: string | null;
}

export interface StaffCreatePayload {
  full_name: string;
  whatsapp_number: string;
  email?: string;
  hostel_id: number;
  category_id?: number;
  role_id?: number;
  block?: string;
}

export interface StaffUpdatePayload {
  full_name?: string;
  whatsapp_number?: string;
  email?: string;
  hostel_id?: number;
  category_id?: number;
  role_id?: number;
  block?: string;
  is_active?: boolean;
}

export interface ComplaintStatusHistory {
  history_id: number;
  complaint_id: number;
  status_id: number;
  status_name?: string | null;
  changed_by: string;
  changed_at?: string | null;
  note?: string | null;
}

export interface Complaint {
  complaint_id: number;
  room_number: string;
  sub_issue?: string | null;
  description: string;
  raw_message?: string | null;
  student_id: number;
  student_name?: string | null;
  student_roll_number?: string | null;
  student_whatsapp?: string | null;
  hostel_id: number;
  hostel_name?: string | null;
  category_id: number;
  category_name?: string | null;
  priority_id: number;
  priority_name?: string | null;
  status_id: number;
  status_name?: string | null;
  assigned_staff_id?: number | null;
  assigned_staff_name?: string | null;
  resolved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ComplaintDetail extends Complaint {
  student?: Student | null;
  category?: Category | null;
  priority?: Priority | null;
  status?: Status | null;
  hostel?: Hostel | null;
  assigned_staff?: Staff | null;
  status_history?: ComplaintStatusHistory[] | null;
}

export interface DashboardStats {
  total_complaints: number;
  pending_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  closed_complaints: number;
}

export interface WeeklyTrendItem {
  day: string;
  count: number;
}

export interface CategoryBreakdownItem {
  name: string;
  value: number;
  color?: string;
}

export interface HostelHeatmapItem {
  label: string;
  count: number;
  level: "low" | "medium" | "high";
}

export interface StaffLoadItem {
  staff_name: string;
  active: number;
  in_progress: number;
  resolved: number;
}

export interface RTStats {
  total_resolved: number;
  avg_response_time_min: number;
}

export interface AnalyticsOverview {
  total_complaints_count: number;
  weekly_trend: WeeklyTrendItem[];
  category_breakdown: CategoryBreakdownItem[];
  hostel_heatmap: HostelHeatmapItem[];
  staff_load: StaffLoadItem[];
  rt_stats: RTStats;
}
