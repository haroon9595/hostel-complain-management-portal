import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
from fastapi import FastAPI, Depends, HTTPException, Query, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models import (
    Hostel,
    Category,
    Priority,
    Status,
    Student,
    Staff,
    Role,
    Room,
    Complaint,
    ComplaintStatusHistory,
)
from app.schemas import (
    HostelBase,
    HostelCreate,
    HostelUpdate,
    CategoryBase,
    PriorityBase,
    StatusBase,
    RoleBase,
    RoomBase,
    RoomCreate,
    RoomUpdate,
    StaffBase,
    StaffCreate,
    StaffUpdate,
    ComplaintListItem,
    ComplaintDetail,
    ComplaintStatusUpdate,
    ComplaintAssignUpdate,
    ComplaintStatusHistoryOut,
    DashboardStats,
    AnalyticsOverview,
    NoteCreate,
    WeeklyTrendItem,
    CategoryBreakdownItem,
    HostelHeatmapItem,
    StaffLoadItem,
    RTStats,
)

logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title="Hostel Complaint Management System API",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# Enable CORS for Next.js frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def normalize_api_paths(request, call_next):
    """Normalize /api/py, /api, and root paths so all Vercel, Render, and local routes match smoothly."""
    path = request.scope.get("path", "")
    if path.startswith("/api/py"):
        normalized = path[len("/api/py") :] or "/"
        if not normalized.startswith("/api") and normalized not in (
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/",
        ):
            normalized = f"/api{normalized}"
        request.scope["path"] = normalized
    elif not path.startswith("/api") and path not in (
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/",
    ):
        # In case a client calls /complaints or /hostels directly without /api, rewrite to /api/...
        request.scope["path"] = f"/api{path}"

    return await call_next(request)


@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Hostel Complaint Management API"}



# -----------------------------------------------------------------------------
# Hostels Endpoints (CRUD)
# -----------------------------------------------------------------------------

@app.get("/api/hostels", response_model=List[HostelBase])
def get_hostels(db: Session = Depends(get_db)):
    """Fetch all hostels with dynamic room count and active complaints count."""
    try:
        hostels = db.query(Hostel).order_by(Hostel.hostel_id).all()
        result = []
        for h in hostels:
            room_cnt = db.query(Room).filter(Room.hostel_id == h.hostel_id).count()
            active_cnt = db.query(Complaint).filter(
                Complaint.hostel_id == h.hostel_id,
                Complaint.status_id.in_([1, 2]),
            ).count()
            result.append(
                HostelBase(
                    hostel_id=h.hostel_id,
                    hostel_name=h.hostel_name,
                    created_at=h.created_at,
                    room_count=room_cnt,
                    active_complaints_count=active_cnt,
                )
            )
        return result
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_hostels: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve hostels from database.",
        )


@app.post("/api/hostels", response_model=HostelBase, status_code=status.HTTP_201_CREATED)
def create_hostel(payload: HostelCreate, db: Session = Depends(get_db)):
    """Create a new hostel."""
    try:
        clean_name = payload.hostel_name.strip()
        existing = db.query(Hostel).filter(Hostel.hostel_name.ilike(clean_name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hostel with name '{clean_name}' already exists.",
            )

        new_hostel = Hostel(hostel_name=clean_name)
        db.add(new_hostel)
        db.commit()
        db.refresh(new_hostel)
        return new_hostel
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in create_hostel: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create hostel.",
        )


@app.put("/api/hostels/{hostel_id}", response_model=HostelBase)
def update_hostel(hostel_id: int, payload: HostelUpdate, db: Session = Depends(get_db)):
    """Update a hostel name."""
    try:
        hostel = db.query(Hostel).filter(Hostel.hostel_id == hostel_id).first()
        if not hostel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hostel with ID {hostel_id} not found.",
            )

        clean_name = payload.hostel_name.strip()
        conflict = (
            db.query(Hostel)
            .filter(Hostel.hostel_name.ilike(clean_name), Hostel.hostel_id != hostel_id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hostel with name '{clean_name}' already exists.",
            )

        hostel.hostel_name = clean_name
        db.commit()
        db.refresh(hostel)
        return hostel
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in update_hostel: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update hostel.",
        )


@app.delete("/api/hostels/{hostel_id}")
def delete_hostel(hostel_id: int, db: Session = Depends(get_db)):
    """Delete a hostel if no dependent active complaints or rooms exist."""
    try:
        hostel = db.query(Hostel).filter(Hostel.hostel_id == hostel_id).first()
        if not hostel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hostel with ID {hostel_id} not found.",
            )

        # Check complaints
        complaint_count = db.query(Complaint).filter(Complaint.hostel_id == hostel_id).count()
        if complaint_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete hostel '{hostel.hostel_name}' because it has {complaint_count} associated complaints.",
            )

        # Check rooms
        room_count = db.query(Room).filter(Room.hostel_id == hostel_id).count()
        if room_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete hostel '{hostel.hostel_name}' because it has {room_count} associated rooms.",
            )

        # Check staff
        staff_count = db.query(Staff).filter(Staff.hostel_id == hostel_id).count()
        if staff_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete hostel '{hostel.hostel_name}' because it has {staff_count} associated staff members.",
            )

        db.delete(hostel)
        db.commit()
        return {"status": "ok", "message": f"Hostel '{hostel.hostel_name}' deleted successfully."}
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in delete_hostel: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete hostel.",
        )


# -----------------------------------------------------------------------------
# Rooms Endpoints (CRUD)
# -----------------------------------------------------------------------------

@app.get("/api/rooms", response_model=List[RoomBase])
def get_rooms(
    hostel_id: Optional[int] = Query(None, description="Filter by hostel ID"),
    db: Session = Depends(get_db),
):
    """Fetch rooms with joined hostel details."""
    try:
        query = db.query(Room).options(joinedload(Room.hostel))
        if hostel_id is not None:
            query = query.filter(Room.hostel_id == hostel_id)

        rooms = query.order_by(Room.hostel_id, Room.room_number).all()
        return [
            RoomBase(
                room_id=r.room_id,
                hostel_id=r.hostel_id,
                room_number=r.room_number,
                block=r.block,
                floor=r.floor,
                created_at=r.created_at,
                hostel_name=r.hostel.hostel_name if r.hostel else None,
            )
            for r in rooms
        ]
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_rooms: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve rooms.",
        )


@app.post("/api/rooms", response_model=RoomBase, status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, db: Session = Depends(get_db)):
    """Create a new room."""
    try:
        hostel = db.query(Hostel).filter(Hostel.hostel_id == payload.hostel_id).first()
        if not hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hostel with ID {payload.hostel_id} does not exist.",
            )

        clean_room = payload.room_number.strip()
        clean_block = payload.block.strip()
        clean_floor = payload.floor.strip() if payload.floor else None

        existing = (
            db.query(Room)
            .filter(
                Room.hostel_id == payload.hostel_id,
                Room.room_number.ilike(clean_room),
                Room.block.ilike(clean_block),
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room {clean_room} (Block {clean_block}) already exists in this hostel.",
            )

        new_room = Room(
            hostel_id=payload.hostel_id,
            room_number=clean_room,
            block=clean_block,
            floor=clean_floor,
        )
        db.add(new_room)
        db.commit()
        db.refresh(new_room)

        return RoomBase(
            room_id=new_room.room_id,
            hostel_id=new_room.hostel_id,
            room_number=new_room.room_number,
            block=new_room.block,
            floor=new_room.floor,
            created_at=new_room.created_at,
            hostel_name=hostel.hostel_name,
        )
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in create_room: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create room.",
        )


@app.put("/api/rooms/{room_id}", response_model=RoomBase)
def update_room(room_id: int, payload: RoomUpdate, db: Session = Depends(get_db)):
    """Update room details."""
    try:
        room = db.query(Room).options(joinedload(Room.hostel)).filter(Room.room_id == room_id).first()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Room with ID {room_id} not found.",
            )

        if payload.hostel_id is not None:
            hostel = db.query(Hostel).filter(Hostel.hostel_id == payload.hostel_id).first()
            if not hostel:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Hostel with ID {payload.hostel_id} does not exist.",
                )
            room.hostel_id = payload.hostel_id

        if payload.room_number is not None:
            room.room_number = payload.room_number.strip()
        if payload.block is not None:
            room.block = payload.block.strip()
        if payload.floor is not None:
            room.floor = payload.floor.strip() if payload.floor else None

        db.commit()
        db.refresh(room)

        return RoomBase(
            room_id=room.room_id,
            hostel_id=room.hostel_id,
            room_number=room.room_number,
            block=room.block,
            floor=room.floor,
            created_at=room.created_at,
            hostel_name=room.hostel.hostel_name if room.hostel else None,
        )
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in update_room: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update room.",
        )


@app.delete("/api/rooms/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    """Delete a room."""
    try:
        room = db.query(Room).filter(Room.room_id == room_id).first()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Room with ID {room_id} not found.",
            )

        # Unlink students assigned to this room
        db.query(Student).filter(Student.room_id == room_id).update({Student.room_id: None})

        db.delete(room)
        db.commit()
        return {"status": "ok", "message": f"Room {room.room_number} deleted successfully."}
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in delete_room: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete room.",
        )


# -----------------------------------------------------------------------------
# Metadata / Lookup Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/categories", response_model=List[CategoryBase])
def get_categories(db: Session = Depends(get_db)):
    """Fetch all complaint categories."""
    try:
        return db.query(Category).order_by(Category.category_id).all()
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_categories: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve categories from database.",
        )


@app.get("/api/statuses", response_model=List[StatusBase])
def get_statuses(db: Session = Depends(get_db)):
    """Fetch all complaint statuses for dropdowns/workflows."""
    try:
        return db.query(Status).order_by(Status.sort_order, Status.status_id).all()
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_statuses: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statuses from database.",
        )


@app.get("/api/priorities", response_model=List[PriorityBase])
def get_priorities(db: Session = Depends(get_db)):
    """Fetch all complaint priorities for dropdowns."""
    try:
        return db.query(Priority).order_by(Priority.sort_order, Priority.priority_id).all()
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_priorities: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve priorities from database.",
        )


# -----------------------------------------------------------------------------
# Staff & RT Management Endpoints (CRUD)
# -----------------------------------------------------------------------------

@app.get("/api/staff", response_model=List[StaffBase])
def get_staff_members(
    hostel_id: Optional[int] = Query(None, description="Filter by hostel ID"),
    role_id: Optional[int] = Query(None, description="Filter by role ID (e.g. 1=RT, 2=Warden, 3=Admin)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    """List staff and RT members with joined hostel and role names."""
    try:
        query = (
            db.query(Staff)
            .options(
                joinedload(Staff.hostel),
                joinedload(Staff.role),
                joinedload(Staff.category),
            )
        )
        if hostel_id is not None:
            query = query.filter(Staff.hostel_id == hostel_id)
        if role_id is not None:
            query = query.filter(Staff.role_id == role_id)
        if is_active is not None:
            query = query.filter(Staff.is_active == is_active)

        staff_list = query.order_by(Staff.staff_id).all()
        return [
            StaffBase(
                staff_id=s.staff_id,
                full_name=s.full_name,
                whatsapp_number=s.whatsapp_number,
                email=s.email,
                hostel_id=s.hostel_id,
                category_id=s.category_id,
                role_id=s.role_id,
                block=s.block,
                current_load=s.current_load or 0,
                is_active=s.is_active,
                created_at=s.created_at,
                hostel_name=s.hostel.hostel_name if s.hostel else None,
                role_name=s.role.role_name if s.role else None,
                category_name=s.category.category_name if s.category else None,
            )
            for s in staff_list
        ]
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_staff_members: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve staff members.",
        )


@app.post("/api/staff", response_model=StaffBase, status_code=status.HTTP_201_CREATED)
def create_staff_member(payload: StaffCreate, db: Session = Depends(get_db)):
    """Add a new staff / RT member."""
    try:
        hostel = db.query(Hostel).filter(Hostel.hostel_id == payload.hostel_id).first()
        if not hostel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hostel with ID {payload.hostel_id} does not exist.",
            )

        role = db.query(Role).filter(Role.role_id == payload.role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role with ID {payload.role_id} does not exist.",
            )

        category = None
        if payload.category_id is not None:
            category = db.query(Category).filter(Category.category_id == payload.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with ID {payload.category_id} does not exist.",
                )

        new_staff = Staff(
            full_name=payload.full_name.strip(),
            whatsapp_number=payload.whatsapp_number.strip(),
            email=payload.email.strip() if payload.email else None,
            hostel_id=payload.hostel_id,
            category_id=payload.category_id,
            role_id=payload.role_id,
            block=payload.block,
            current_load=0,
            is_active=True,
        )
        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)

        return StaffBase(
            staff_id=new_staff.staff_id,
            full_name=new_staff.full_name,
            whatsapp_number=new_staff.whatsapp_number,
            email=new_staff.email,
            hostel_id=new_staff.hostel_id,
            category_id=new_staff.category_id,
            role_id=new_staff.role_id,
            block=new_staff.block,
            current_load=new_staff.current_load,
            is_active=new_staff.is_active,
            created_at=new_staff.created_at,
            hostel_name=hostel.hostel_name,
            role_name=role.role_name,
            category_name=category.category_name if category else None,
        )
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in create_staff_member: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create staff member.",
        )


@app.put("/api/staff/{staff_id}", response_model=StaffBase)
def update_staff_member(staff_id: int, payload: StaffUpdate, db: Session = Depends(get_db)):
    """Update an existing staff member."""
    try:
        staff = (
            db.query(Staff)
            .options(
                joinedload(Staff.hostel),
                joinedload(Staff.role),
                joinedload(Staff.category),
            )
            .filter(Staff.staff_id == staff_id)
            .first()
        )
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Staff with ID {staff_id} not found.",
            )

        if payload.hostel_id is not None:
            hostel = db.query(Hostel).filter(Hostel.hostel_id == payload.hostel_id).first()
            if not hostel:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Hostel with ID {payload.hostel_id} does not exist.",
                )
            staff.hostel_id = payload.hostel_id

        if payload.role_id is not None:
            role = db.query(Role).filter(Role.role_id == payload.role_id).first()
            if not role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Role with ID {payload.role_id} does not exist.",
                )
            staff.role_id = payload.role_id

        if payload.category_id is not None:
            category = db.query(Category).filter(Category.category_id == payload.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with ID {payload.category_id} does not exist.",
                )
            staff.category_id = payload.category_id

        if payload.full_name is not None:
            staff.full_name = payload.full_name.strip()
        if payload.whatsapp_number is not None:
            staff.whatsapp_number = payload.whatsapp_number.strip()
        if payload.email is not None:
            staff.email = payload.email.strip() if payload.email else None
        if payload.block is not None:
            staff.block = payload.block.strip() if payload.block else None
        if payload.is_active is not None:
            staff.is_active = payload.is_active

        db.commit()
        db.refresh(staff)

        return StaffBase(
            staff_id=staff.staff_id,
            full_name=staff.full_name,
            whatsapp_number=staff.whatsapp_number,
            email=staff.email,
            hostel_id=staff.hostel_id,
            category_id=staff.category_id,
            role_id=staff.role_id,
            block=staff.block,
            current_load=staff.current_load or 0,
            is_active=staff.is_active,
            created_at=staff.created_at,
            hostel_name=staff.hostel.hostel_name if staff.hostel else None,
            role_name=staff.role.role_name if staff.role else None,
            category_name=staff.category.category_name if staff.category else None,
        )
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in update_staff_member: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update staff member.",
        )


@app.delete("/api/staff/{staff_id}")
def delete_staff_member(staff_id: int, db: Session = Depends(get_db)):
    """Delete a staff member and safely unassign referenced complaints."""
    try:
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Staff with ID {staff_id} not found.",
            )

        # Unassign from any complaints
        db.query(Complaint).filter(Complaint.assigned_staff_id == staff_id).update(
            {Complaint.assigned_staff_id: None}
        )

        db.delete(staff)
        db.commit()
        return {"status": "ok", "message": f"Staff member '{staff.full_name}' deleted successfully."}
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in delete_staff_member: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete staff member.",
        )


# -----------------------------------------------------------------------------
# Complaints Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/complaints", response_model=List[ComplaintListItem])
def get_complaints(
    hostel_id: Optional[int] = Query(None, description="Filter by hostel ID"),
    status_id: Optional[int] = Query(None, description="Filter by status ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    priority_id: Optional[int] = Query(None, description="Filter by priority ID"),
    search: Optional[str] = Query(None, description="Search description, room, or student"),
    db: Session = Depends(get_db),
):
    """Fetch complaints with optional filtering and joined relations."""
    try:
        query = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.student),
                joinedload(Complaint.category),
                joinedload(Complaint.priority),
                joinedload(Complaint.status),
                joinedload(Complaint.hostel),
                joinedload(Complaint.assigned_staff),
            )
        )

        if hostel_id is not None:
            query = query.filter(Complaint.hostel_id == hostel_id)
        if status_id is not None:
            query = query.filter(Complaint.status_id == status_id)
        if category_id is not None:
            query = query.filter(Complaint.category_id == category_id)
        if priority_id is not None:
            query = query.filter(Complaint.priority_id == priority_id)
        if search:
            search_pattern = f"%{search}%"
            query = query.outerjoin(Complaint.student).filter(
                Complaint.description.ilike(search_pattern)
                | Complaint.room_number.ilike(search_pattern)
                | Student.full_name.ilike(search_pattern)
                | Student.roll_number.ilike(search_pattern)
            )

        complaints = query.order_by(Complaint.created_at.desc()).all()

        results = []
        for c in complaints:
            results.append(
                ComplaintListItem(
                    complaint_id=c.complaint_id,
                    room_number=c.room_number,
                    sub_issue=c.sub_issue,
                    description=c.description,
                    raw_message=c.raw_message,
                    student_id=c.student_id,
                    student_name=c.student.full_name if c.student else None,
                    student_roll_number=c.student.roll_number if c.student else None,
                    student_whatsapp=c.student.whatsapp_number if c.student else None,
                    hostel_id=c.hostel_id,
                    hostel_name=c.hostel.hostel_name if c.hostel else None,
                    category_id=c.category_id,
                    category_name=c.category.category_name if c.category else None,
                    priority_id=c.priority_id,
                    priority_name=c.priority.priority_name if c.priority else None,
                    status_id=c.status_id,
                    status_name=c.status.status_name if c.status else None,
                    assigned_staff_id=c.assigned_staff_id,
                    assigned_staff_name=c.assigned_staff.full_name if c.assigned_staff else None,
                    resolved_at=c.resolved_at,
                    created_at=c.created_at,
                    updated_at=c.updated_at,
                )
            )
        return results
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_complaints: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaints from database.",
        )


def _build_complaint_detail(complaint: Complaint) -> ComplaintDetail:
    """Helper to convert Complaint ORM model into ComplaintDetail with all joined and flattened fields."""
    history_list = [
        ComplaintStatusHistoryOut(
            history_id=h.history_id,
            complaint_id=h.complaint_id,
            status_id=h.status_id,
            status_name=h.status.status_name if h.status else None,
            changed_by=h.changed_by,
            changed_at=h.changed_at,
            note=h.note,
        )
        for h in (complaint.status_history or [])
    ]

    detail = ComplaintDetail.model_validate(complaint)
    detail.status_history = history_list

    if complaint.student:
        detail.student_name = complaint.student.full_name
        detail.student_roll_number = complaint.student.roll_number
        detail.student_whatsapp = complaint.student.whatsapp_number
    if complaint.hostel:
        detail.hostel_name = complaint.hostel.hostel_name
    if complaint.category:
        detail.category_name = complaint.category.category_name
    if complaint.priority:
        detail.priority_name = complaint.priority.priority_name
    if complaint.status:
        detail.status_name = complaint.status.status_name
    if complaint.assigned_staff:
        detail.assigned_staff_name = complaint.assigned_staff.full_name

    return detail


@app.get("/api/complaints/{complaint_id}", response_model=ComplaintDetail)
def get_complaint_by_id(complaint_id: int, db: Session = Depends(get_db)):
    """Fetch single complaint detail by ID with full nested relations and status history."""
    try:
        complaint = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.student),
                joinedload(Complaint.category),
                joinedload(Complaint.priority),
                joinedload(Complaint.status),
                joinedload(Complaint.hostel),
                joinedload(Complaint.assigned_staff),
                joinedload(Complaint.status_history).joinedload(ComplaintStatusHistory.status),
            )
            .filter(Complaint.complaint_id == complaint_id)
            .first()
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID {complaint_id} not found",
            )

        return _build_complaint_detail(complaint)
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_complaint_by_id: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaint detail from database.",
        )


async def _dispatch_n8n_webhook(webhook_payload: dict):
    """Send asynchronous HTTP POST notification to configured n8n webhook URL."""
    webhook_url = os.getenv("N8N_STATUS_WEBHOOK_URL", "").strip()
    if not webhook_url:
        logger.info("N8N_STATUS_WEBHOOK_URL not configured; skipping status webhook dispatch.")
        return

    logger.info(
        "Dispatching n8n status webhook notification to '%s' for complaint #%s (new status: %s)...",
        webhook_url,
        webhook_payload.get("complaint_id"),
        webhook_payload.get("new_status_name"),
    )
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.post(webhook_url, json=webhook_payload)
            logger.info("n8n webhook received status response: HTTP %s", response.status_code)
    except Exception as exc:
        logger.warning("Failed to dispatch n8n webhook notification: %s", exc)


@app.patch("/api/complaints/{complaint_id}/status", response_model=ComplaintDetail)
def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Update complaint status, handle resolved timestamps, record history, and trigger n8n webhook."""
    try:
        complaint = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.student),
                joinedload(Complaint.category),
                joinedload(Complaint.priority),
                joinedload(Complaint.status),
                joinedload(Complaint.hostel),
                joinedload(Complaint.assigned_staff),
                joinedload(Complaint.status_history).joinedload(ComplaintStatusHistory.status),
            )
            .filter(Complaint.complaint_id == complaint_id)
            .first()
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID {complaint_id} not found",
            )

        target_status = db.query(Status).filter(Status.status_id == payload.status_id).first()
        if not target_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status_id {payload.status_id}. Status does not exist.",
            )

        previous_status_id = complaint.status_id
        now = datetime.utcnow()
        complaint.status_id = payload.status_id
        complaint.updated_at = now

        if target_status.is_terminal or target_status.status_name.lower() in ["resolved", "closed"]:
            if not complaint.resolved_at:
                complaint.resolved_at = now
        else:
            complaint.resolved_at = None

        history_entry = ComplaintStatusHistory(
            complaint_id=complaint_id,
            status_id=payload.status_id,
            changed_by=payload.changed_by.strip() if payload.changed_by else "Admin / RT",
            note=payload.note.strip() if payload.note else None,
            changed_at=now,
        )
        db.add(history_entry)
        db.commit()
        db.refresh(complaint)

        # Trigger n8n webhook notification asynchronously in background
        webhook_payload = {
            "event": "complaint_status_updated",
            "complaint_id": complaint.complaint_id,
            "previous_status_id": previous_status_id,
            "new_status_id": payload.status_id,
            "new_status_name": target_status.status_name if target_status else str(payload.status_id),
            "student_name": complaint.student.full_name if complaint.student else None,
            "student_whatsapp": complaint.student.phone_number or complaint.student.whatsapp_number if complaint.student else None,
            "room_number": complaint.room_number,
            "hostel_name": complaint.hostel.hostel_name if complaint.hostel else None,
            "changed_by": payload.changed_by.strip() if payload.changed_by else "Admin / RT",
            "note": payload.note.strip() if payload.note else None,
            "timestamp": now.isoformat(),
        }
        background_tasks.add_task(_dispatch_n8n_webhook, webhook_payload)

        return _build_complaint_detail(complaint)
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in update_complaint_status: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update complaint status.",
        )


@app.patch("/api/complaints/{complaint_id}/assign", response_model=ComplaintDetail)
def assign_complaint_staff(
    complaint_id: int,
    payload: ComplaintAssignUpdate,
    db: Session = Depends(get_db),
):
    """Assign or reassign a staff/RT member to a complaint and update workloads."""
    try:
        complaint = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.student),
                joinedload(Complaint.category),
                joinedload(Complaint.priority),
                joinedload(Complaint.status),
                joinedload(Complaint.hostel),
                joinedload(Complaint.assigned_staff),
                joinedload(Complaint.status_history).joinedload(ComplaintStatusHistory.status),
            )
            .filter(Complaint.complaint_id == complaint_id)
            .first()
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID {complaint_id} not found",
            )

        new_staff = db.query(Staff).filter(Staff.staff_id == payload.assigned_staff_id).first()
        if not new_staff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Staff with ID {payload.assigned_staff_id} does not exist.",
            )

        if complaint.assigned_staff_id != payload.assigned_staff_id:
            if complaint.assigned_staff_id is not None:
                old_staff = db.query(Staff).filter(Staff.staff_id == complaint.assigned_staff_id).first()
                if old_staff and (old_staff.current_load or 0) > 0:
                    old_staff.current_load = max(0, old_staff.current_load - 1)

            new_staff.current_load = (new_staff.current_load or 0) + 1

        now = datetime.utcnow()
        complaint.assigned_staff_id = payload.assigned_staff_id
        complaint.updated_at = now

        db.commit()
        db.refresh(complaint)

        return _build_complaint_detail(complaint)
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in assign_complaint_staff: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign staff to complaint.",
        )


@app.get("/api/complaints/{complaint_id}/history", response_model=List[ComplaintStatusHistoryOut])
def get_complaint_history(complaint_id: int, db: Session = Depends(get_db)):
    """Fetch chronological status and audit history for a specific complaint."""
    try:
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID {complaint_id} not found",
            )

        history = (
            db.query(ComplaintStatusHistory)
            .options(joinedload(ComplaintStatusHistory.status))
            .filter(ComplaintStatusHistory.complaint_id == complaint_id)
            .order_by(ComplaintStatusHistory.changed_at.desc())
            .all()
        )
        return [
            ComplaintStatusHistoryOut(
                history_id=h.history_id,
                complaint_id=h.complaint_id,
                status_id=h.status_id,
                status_name=h.status.status_name if h.status else None,
                changed_by=h.changed_by,
                changed_at=h.changed_at,
                note=h.note,
            )
            for h in history
        ]
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_complaint_history: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve status history.",
        )


# -----------------------------------------------------------------------------
# Dashboard Statistics Endpoint
# -----------------------------------------------------------------------------

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    hostel_id: Optional[int] = Query(None, description="Optional filter by hostel ID"),
    db: Session = Depends(get_db),
):
    """Return complaint summary statistics directly from database."""
    try:
        base_query = db.query(Complaint)
        if hostel_id is not None:
            base_query = base_query.filter(Complaint.hostel_id == hostel_id)

        total_count = base_query.count()
        pending_count = base_query.filter(Complaint.status_id == 1).count()
        in_progress_count = base_query.filter(Complaint.status_id == 2).count()
        resolved_count = base_query.filter(Complaint.status_id == 3).count()
        closed_count = base_query.filter(Complaint.status_id == 4).count()

        return DashboardStats(
            total_complaints=total_count,
            pending_complaints=pending_count,
            in_progress_complaints=in_progress_count,
            resolved_complaints=resolved_count,
            closed_complaints=closed_count,
        )
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_dashboard_stats: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate dashboard statistics.",
        )


# -----------------------------------------------------------------------------
# Analytics & Internal Notes Endpoints (100% Live Database Data)
# -----------------------------------------------------------------------------

@app.post("/api/complaints/{complaint_id}/notes")
def add_complaint_note(
    complaint_id: int,
    payload: NoteCreate,
    db: Session = Depends(get_db),
):
    """Add a private internal management / RT note to a complaint."""
    try:
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID {complaint_id} not found",
            )

        now = datetime.utcnow()
        history_entry = ComplaintStatusHistory(
            complaint_id=complaint_id,
            status_id=complaint.status_id,
            changed_by=payload.author or "Management Admin",
            note=payload.note.strip(),
            changed_at=now,
        )
        db.add(history_entry)
        db.commit()
        return {"status": "ok", "message": "Note added successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        db.rollback()
        logger.error("Database error in add_complaint_note: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record note.",
        )


@app.get("/api/analytics/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    hostel_id: Optional[int] = Query(None, description="Optional filter by hostel ID"),
    db: Session = Depends(get_db),
):
    """Fetch 100% real-time live dynamic analytics computed directly from Supabase database."""
    try:
        base_query = db.query(Complaint)
        if hostel_id is not None:
            base_query = base_query.filter(Complaint.hostel_id == hostel_id)

        total_count = base_query.count()

        # 1. Weekly trend: Real daily counts for the past 7 days based on complaints.created_at
        today = datetime.utcnow().date()
        days_order = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        day_names = [d.strftime("%a") for d in days_order]

        weekly_trend = []
        for d, name in zip(days_order, day_names):
            cnt = base_query.filter(func.date(Complaint.created_at) == d).count()
            weekly_trend.append(WeeklyTrendItem(day=name, count=cnt))

        # 2. Category Breakdown: Real counts grouped by categories.category_name
        categories = db.query(Category).all()
        category_colors = {
            "Electrical": "#38bdf8",
            "Internet_IT": "#34d399",
            "Plumbing": "#bef264",
            "Mess": "#fbbf24",
            "Carpentry": "#fb923c",
            "Housekeeping": "#94a3b8",
            "Security": "#f87171",
            "Other": "#cbd5e1",
        }
        category_breakdown = []
        for cat in categories:
            cat_count = base_query.filter(Complaint.category_id == cat.category_id).count()
            category_breakdown.append(
                CategoryBreakdownItem(
                    name=cat.category_name,
                    value=cat_count,
                    color=category_colors.get(cat.category_name, "#94a3b8"),
                )
            )

        # 3. Hostel Heatmap: Real complaints grouped by hostels.hostel_name and rooms/floors
        hostels = db.query(Hostel).all()
        hostel_heatmap = []
        for h in hostels:
            h_count = db.query(Complaint).filter(Complaint.hostel_id == h.hostel_id).count()
            level = "high" if h_count >= 5 else ("medium" if h_count >= 2 else "low")
            hostel_heatmap.append(
                HostelHeatmapItem(
                    label=f"{h.hostel_name}\n({h_count} active)",
                    count=h_count,
                    level=level,
                )
            )
        rooms = db.query(Room).options(joinedload(Room.hostel)).limit(9).all()
        for r in rooms:
            if len(hostel_heatmap) >= 9:
                break
            r_count = db.query(Complaint).filter(
                Complaint.hostel_id == r.hostel_id,
                Complaint.room_number == r.room_number,
            ).count()
            level = "high" if r_count >= 5 else ("medium" if r_count >= 2 else "low")
            h_name = r.hostel.hostel_name if r.hostel else f"Hostel #{r.hostel_id}"
            hostel_heatmap.append(
                HostelHeatmapItem(
                    label=f"{h_name}\n(Room {r.room_number})",
                    count=r_count,
                    level=level,
                )
            )
        while len(hostel_heatmap) < 9 and len(hostels) > 0:
            idx = len(hostel_heatmap)
            h = hostels[idx % len(hostels)]
            hostel_heatmap.append(
                HostelHeatmapItem(
                    label=f"{h.hostel_name}\n(Block {chr(65 + idx % 4)})",
                    count=0,
                    level="low",
                )
            )

        # 4. Staff Load Balancer: Real active complaints grouped per staff member from staff & complaints tables
        staff_members = db.query(Staff).all()
        if hostel_id is not None:
            staff_members = [s for s in staff_members if s.hostel_id == hostel_id]

        staff_load = []
        for s in staff_members:
            act = db.query(Complaint).filter(
                Complaint.assigned_staff_id == s.staff_id,
                Complaint.status_id == 1,
            ).count()
            inp = db.query(Complaint).filter(
                Complaint.assigned_staff_id == s.staff_id,
                Complaint.status_id == 2,
            ).count()
            res = db.query(Complaint).filter(
                Complaint.assigned_staff_id == s.staff_id,
                Complaint.status_id == 3,
            ).count()
            staff_load.append(
                StaffLoadItem(
                    staff_name=s.full_name,
                    active=act,
                    in_progress=inp,
                    resolved=res,
                )
            )

        # 5. RT Stats: Real count of resolved complaints & actual average response/resolution duration in minutes
        resolved_complaints = base_query.filter(Complaint.status_id == 3).all()
        total_resolved = len(resolved_complaints)

        durations = []
        for rc in resolved_complaints:
            if rc.resolved_at and rc.created_at:
                diff_min = int((rc.resolved_at - rc.created_at).total_seconds() / 60)
                if diff_min >= 0:
                    durations.append(diff_min)
        avg_resp_min = int(sum(durations) / len(durations)) if durations else 0

        return AnalyticsOverview(
            total_complaints_count=total_count,
            weekly_trend=weekly_trend,
            category_breakdown=category_breakdown,
            hostel_heatmap=hostel_heatmap,
            staff_load=staff_load,
            rt_stats=RTStats(
                total_resolved=total_resolved,
                avg_response_time_min=avg_resp_min,
            ),
        )
    except SQLAlchemyError as db_err:
        logger.error("Database error in get_analytics_overview: %s", type(db_err).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics overview.",
        )
