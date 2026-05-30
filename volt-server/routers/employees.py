import time
from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from config import settings
import sample_data as demo

router = APIRouter()

# In-memory presence store. Replace with SQLite/Redis for persistence.
_store: dict[str, dict[str, Any]] = {}
_seeded = False


def _seed_sample_employees() -> None:
    global _seeded
    if _seeded:
        return
    for emp in demo.SAMPLE_EMPLOYEES:
        _store[emp["employee_id"]] = dict(emp)
    _seeded = True


class CheckIn(BaseModel):
    employee_id: str
    name: str
    department: str = ""
    role: str = ""
    location: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str = "active"
    avatar_initials: str = ""
    badge_color: str = "#00e5ff"


@router.post("/checkin")
async def checkin(data: CheckIn):
    if settings.use_sample_data and not _store:
        _seed_sample_employees()
    record = data.model_dump()
    record["last_seen"] = time.time()
    record["checked_in"] = True
    _store[data.employee_id] = record
    return {"ok": True, "employee_id": data.employee_id}


@router.post("/checkout/{employee_id}")
async def checkout(employee_id: str):
    if settings.use_sample_data and not _store:
        _seed_sample_employees()
    if employee_id in _store:
        _store[employee_id]["checked_in"] = False
        _store[employee_id]["status"] = "offline"
        _store[employee_id]["last_seen"] = time.time()
    return {"ok": True}


@router.put("/status/{employee_id}")
async def update_status(employee_id: str, status: str):
    if settings.use_sample_data and not _store:
        _seed_sample_employees()
    if employee_id in _store:
        _store[employee_id]["status"] = status
        _store[employee_id]["last_seen"] = time.time()
    return {"ok": True}


@router.get("/presence")
async def presence():
    if settings.use_sample_data and not _store:
        _seed_sample_employees()

    if settings.use_sample_data and _store:
        # Refresh last_seen for active employees so they look live
        now = time.time()
        for eid, emp in _store.items():
            if emp.get("checked_in") and emp.get("status") != "offline":
                emp["last_seen"] = now - (abs(hash(eid)) % 180)

    now = time.time()
    employees = []
    for emp in _store.values():
        stale = now - emp.get("last_seen", 0) > 600
        if stale and emp.get("checked_in"):
            emp["status"] = "away"
        employees.append(emp)

    employees.sort(key=lambda e: (not e.get("checked_in", False), e.get("name", "")))

    active = sum(1 for e in employees if e.get("checked_in") and e.get("status") != "offline")
    return {"employees": employees, "active_count": active, "total": len(employees)}


@router.delete("/{employee_id}")
async def remove(employee_id: str):
    _store.pop(employee_id, None)
    return {"ok": True}
