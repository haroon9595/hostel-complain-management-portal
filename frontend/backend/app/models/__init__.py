from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, desc
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Hostel(Base):
    __tablename__ = "hostels"

    hostel_id = Column(Integer, primary_key=True, index=True)
    hostel_name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Priority(Base):
    __tablename__ = "priorities"

    priority_id = Column(Integer, primary_key=True, index=True)
    priority_name = Column(String, unique=True, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Status(Base):
    __tablename__ = "statuses"

    status_id = Column(Integer, primary_key=True, index=True)
    status_name = Column(String, unique=True, nullable=False)
    is_terminal = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, unique=True, nullable=False)


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(Integer, primary_key=True, index=True)
    hostel_id = Column(Integer, ForeignKey("hostels.hostel_id"), nullable=False)
    room_number = Column(String, nullable=False)
    block = Column(String, nullable=False)
    floor = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hostel = relationship("Hostel", foreign_keys=[hostel_id])


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    roll_number = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=True)
    email = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", foreign_keys=[room_id])


class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    # IMPORTANT: staff.whatsapp_number must remain as whatsapp_number (RT identifier/Slack contact)
    whatsapp_number = Column(String, nullable=False)
    email = Column(String, nullable=True)
    hostel_id = Column(Integer, ForeignKey("hostels.hostel_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    block = Column(String, nullable=True)
    current_load = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hostel = relationship("Hostel", foreign_keys=[hostel_id])
    category = relationship("Category", foreign_keys=[category_id])
    role = relationship("Role", foreign_keys=[role_id])


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    room_number = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    sub_issue = Column(String, nullable=True)
    priority_id = Column(Integer, ForeignKey("priorities.priority_id"), nullable=False)
    description = Column(Text, nullable=False)
    raw_message = Column(Text, nullable=True)
    assigned_staff_id = Column(Integer, ForeignKey("staff.staff_id"), nullable=True)
    status_id = Column(Integer, ForeignKey("statuses.status_id"), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    hostel_id = Column(Integer, ForeignKey("hostels.hostel_id"), nullable=False)

    student = relationship("Student", foreign_keys=[student_id])
    category = relationship("Category", foreign_keys=[category_id])
    priority = relationship("Priority", foreign_keys=[priority_id])
    status = relationship("Status", foreign_keys=[status_id])
    assigned_staff = relationship("Staff", foreign_keys=[assigned_staff_id])
    hostel = relationship("Hostel", foreign_keys=[hostel_id])
    status_history = relationship(
        "ComplaintStatusHistory",
        back_populates="complaint",
        order_by="desc(ComplaintStatusHistory.changed_at)",
    )


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    history_id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    status_id = Column(Integer, ForeignKey("statuses.status_id"), nullable=False)
    changed_by = Column(String, nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(Text, nullable=True)

    complaint = relationship("Complaint", back_populates="status_history", foreign_keys=[complaint_id])
    status = relationship("Status", foreign_keys=[status_id])

