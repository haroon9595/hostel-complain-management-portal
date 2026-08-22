from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class HostelBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    hostel_id: int
    hostel_name: str
    created_at: Optional[datetime] = None
    room_count: Optional[int] = 0
    active_complaints_count: Optional[int] = 0


class HostelCreate(BaseModel):
    hostel_name: str = Field(..., min_length=1, max_length=100)


class HostelUpdate(BaseModel):
    hostel_name: str = Field(..., min_length=1, max_length=100)


class CategoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    category_id: int
    category_name: str
    created_at: Optional[datetime] = None


class PriorityBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    priority_id: int
    priority_name: str
    sort_order: Optional[int] = 0
    created_at: Optional[datetime] = None


class StatusBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status_id: int
    status_name: str
    is_terminal: Optional[bool] = False
    sort_order: Optional[int] = 0
    created_at: Optional[datetime] = None


class RoleBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    role_id: int
    role_name: str


class RoomBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    room_id: int
    hostel_id: int
    room_number: str
    block: str
    floor: Optional[str] = None
    created_at: Optional[datetime] = None
    hostel_name: Optional[str] = None


class RoomCreate(BaseModel):
    hostel_id: int
    room_number: str = Field(..., min_length=1, max_length=50)
    block: str = Field(..., min_length=1, max_length=50)
    floor: Optional[str] = Field(None, max_length=50)


class RoomUpdate(BaseModel):
    hostel_id: Optional[int] = None
    room_number: Optional[str] = Field(None, min_length=1, max_length=50)
    block: Optional[str] = Field(None, min_length=1, max_length=50)
    floor: Optional[str] = Field(None, max_length=50)


class StudentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    student_id: int
    full_name: str
    roll_number: Optional[str] = None
    whatsapp_number: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    room_id: Optional[int] = None
    is_active: bool = True
    created_at: Optional[datetime] = None


class StaffBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    staff_id: int
    full_name: str
    whatsapp_number: str
    email: Optional[str] = None
    hostel_id: int
    category_id: Optional[int] = None
    role_id: int
    block: Optional[str] = None
    current_load: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None
    
    # Optional nested/joined labels
    hostel_name: Optional[str] = None
    role_name: Optional[str] = None
    category_name: Optional[str] = None


class StaffCreate(BaseModel):
    full_name: str = Field(..., min_length=1)
    whatsapp_number: str = Field(..., min_length=1, description="Slack / RT contact identifier")
    email: Optional[str] = None
    hostel_id: int
    category_id: Optional[int] = None
    role_id: int = 1
    block: Optional[str] = None


class StaffUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1)
    whatsapp_number: Optional[str] = Field(None, min_length=1)
    email: Optional[str] = None
    hostel_id: Optional[int] = None
    category_id: Optional[int] = None
    role_id: Optional[int] = None
    block: Optional[str] = None
    is_active: Optional[bool] = None


class ComplaintStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    history_id: int
    complaint_id: int
    status_id: int
    status_name: Optional[str] = None
    changed_by: str
    changed_at: Optional[datetime] = None
    note: Optional[str] = None


class ComplaintStatusUpdate(BaseModel):
    status_id: int
    changed_by: Optional[str] = "Admin / RT"
    note: Optional[str] = None


class ComplaintAssignUpdate(BaseModel):
    assigned_staff_id: int


class NoteCreate(BaseModel):
    author: Optional[str] = "Admin"
    note: str = Field(..., min_length=1)


class ComplaintListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    complaint_id: int
    room_number: str
    sub_issue: Optional[str] = None
    description: str
    raw_message: Optional[str] = None
    
    student_id: int
    student_name: Optional[str] = None
    student_roll_number: Optional[str] = None
    student_whatsapp: Optional[str] = None
    
    hostel_id: int
    hostel_name: Optional[str] = None
    
    category_id: int
    category_name: Optional[str] = None
    
    priority_id: int
    priority_name: Optional[str] = None
    
    status_id: int
    status_name: Optional[str] = None
    
    assigned_staff_id: Optional[int] = None
    assigned_staff_name: Optional[str] = None
    
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ComplaintDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    complaint_id: int
    room_number: str
    sub_issue: Optional[str] = None
    description: str
    raw_message: Optional[str] = None
    hostel_id: int
    category_id: int
    priority_id: int
    status_id: int
    student_id: int
    assigned_staff_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Flattened helper attributes for frontend convenience
    student_name: Optional[str] = None
    student_roll_number: Optional[str] = None
    student_whatsapp: Optional[str] = None
    hostel_name: Optional[str] = None
    category_name: Optional[str] = None
    priority_name: Optional[str] = None
    status_name: Optional[str] = None
    assigned_staff_name: Optional[str] = None

    # Joined relations
    student: Optional[StudentBase] = None
    category: Optional[CategoryBase] = None
    priority: Optional[PriorityBase] = None
    status: Optional[StatusBase] = None
    hostel: Optional[HostelBase] = None
    assigned_staff: Optional[StaffBase] = None
    status_history: Optional[List[ComplaintStatusHistoryOut]] = None


class DashboardStats(BaseModel):
    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    closed_complaints: int


class WeeklyTrendItem(BaseModel):
    day: str
    count: int


class CategoryBreakdownItem(BaseModel):
    name: str
    value: int
    color: Optional[str] = None


class HostelHeatmapItem(BaseModel):
    label: str
    count: int
    level: str  # "low", "medium", "high"


class StaffLoadItem(BaseModel):
    staff_name: str
    active: int
    in_progress: int
    resolved: int


class RTStats(BaseModel):
    total_resolved: int
    avg_response_time_min: int


class AnalyticsOverview(BaseModel):
    total_complaints_count: int
    weekly_trend: List[WeeklyTrendItem]
    category_breakdown: List[CategoryBreakdownItem]
    hostel_heatmap: List[HostelHeatmapItem]
    staff_load: List[StaffLoadItem]
    rt_stats: RTStats
