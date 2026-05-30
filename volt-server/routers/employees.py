import time
from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In-memory presence store. Replace with SQLite/Redis for persistence.
_store: dict[str, dict[str, Any]] = {}


class CheckIn(BaseModel):
    employee_id: str
    name: str
    department: str = ""
    role: str = ""
    location: str = ""        # logical: "floor-2-east"
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str = "active"    # active | away | busy | offline
    avatar_initials: str = "" # e.g. "JD"
    badge_color: str = "#00e5ff"


@router.post("/checkin")
async def checkin(data: CheckIn):
    record = data.model_dump()
    record["last_seen"] = time.time()
    record["checked_in"] = True
    _store[data.employee_id] = record
    return {"ok": True, "employee_id": data.employee_id}


@router.post("/checkout/{employee_id}")
async def checkout(employee_id: str):
    if employee_id in _store:
        _store[employee_id]["checked_in"] = False
        _store[employee_id]["status"] = "offline"
        _store[employee_id]["last_seen"] = time.time()
    return {"ok": True}


@router.put("/status/{employee_id}")
async def update_status(employee_id: str, status: str):
    if employee_id in _store:
        _store[employee_id]["status"] = status
        _store[employee_id]["last_seen"] = time.time()
    return {"ok": True}


@router.get("/presence")
async def presence():
    now = time.time()
    employees = []
    for emp in _store.values():
        stale = now - emp.get("last_seen", 0) > 600  # 10 min = stale
        if stale and emp.get("checked_in"):
            emp["status"] = "away"
        employees.append(emp)

    employees.sort(key=lambda e: (not e.get("checked_in", False), e.get("name", "")))

    return {
        "employees": employees,
        "active_count": sum(1 for e in employees if e.get("checked_in") and e.get("status") != "offline"),
        "total": len(employees),
    }


@router.delete("/{employee_id}")
async def remove(employee_id: str):
    _store.pop(employee_id, None)
    return {"ok": True}
