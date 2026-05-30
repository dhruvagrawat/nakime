import json
import os
from fastapi import APIRouter, Query

from config import settings
import sample_data as demo

router = APIRouter()

TAIL_BYTES = 300_000


def _tail_eve(max_bytes: int = TAIL_BYTES) -> list[str]:
    path = settings.suricata_eve_path
    if not os.path.exists(path):
        return []
    with open(path, "rb") as f:
        f.seek(0, 2)
        size = f.tell()
        f.seek(max(0, size - max_bytes))
        raw = f.read().decode("utf-8", errors="replace")
    return raw.splitlines()


@router.get("/alerts")
async def alerts(limit: int = Query(100, ge=1, le=1000)):
    if settings.use_sample_data:
        return {**demo.SURICATA_ALERTS, "alerts": demo.SURICATA_ALERTS["alerts"][:limit]}

    lines = _tail_eve()
    if not lines:
        path = settings.suricata_eve_path
        return {"alerts": [], "count": 0, "error": f"EVE log not found at {path}"}

    results = []
    for line in reversed(lines):
        if len(results) >= limit:
            break
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("event_type") != "alert":
            continue
        ab = ev.get("alert", {})
        results.append({
            "timestamp": ev.get("timestamp"),
            "src_ip": ev.get("src_ip"),
            "src_port": ev.get("src_port"),
            "dest_ip": ev.get("dest_ip"),
            "dest_port": ev.get("dest_port"),
            "proto": ev.get("proto"),
            "app_proto": ev.get("app_proto"),
            "severity": ab.get("severity", 3),
            "signature": ab.get("signature", ""),
            "signature_id": ab.get("signature_id"),
            "category": ab.get("category", ""),
            "action": ab.get("action", "allowed"),
        })

    return {"alerts": results, "count": len(results)}


@router.get("/stats")
async def stats():
    if settings.use_sample_data:
        return demo.SURICATA_STATS

    lines = _tail_eve(max_bytes=600_000)
    for line in reversed(lines):
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("event_type") == "stats":
            s = ev.get("stats", {})
            return {
                "timestamp": ev.get("timestamp"),
                "uptime": s.get("uptime", 0),
                "capture": s.get("capture", {}),
                "decoder": s.get("decoder", {}),
                "flow": s.get("flow", {}),
                "detect": {"alert": s.get("detect", {}).get("alert", 0)},
                "dns": s.get("dns", {}),
                "http": s.get("http", {}),
            }
    return {"error": f"No stats event found in {settings.suricata_eve_path}"}


@router.get("/flows")
async def flows(limit: int = Query(50, ge=1, le=500)):
    if settings.use_sample_data:
        return {"flows": [], "count": 0, "note": "sample mode — no flow data"}

    lines = _tail_eve()
    results = []
    for line in reversed(lines):
        if len(results) >= limit:
            break
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("event_type") != "flow":
            continue
        flow = ev.get("flow", {})
        results.append({
            "timestamp": ev.get("timestamp"),
            "src_ip": ev.get("src_ip"),
            "src_port": ev.get("src_port"),
            "dest_ip": ev.get("dest_ip"),
            "dest_port": ev.get("dest_port"),
            "proto": ev.get("proto"),
            "app_proto": ev.get("app_proto"),
            "bytes_toserver": flow.get("bytes_toserver", 0),
            "bytes_toclient": flow.get("bytes_toclient", 0),
            "pkts_toserver": flow.get("pkts_toserver", 0),
            "pkts_toclient": flow.get("pkts_toclient", 0),
            "state": flow.get("state"),
        })
    return {"flows": results, "count": len(results)}
