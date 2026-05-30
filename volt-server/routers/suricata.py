import json
import os
from fastapi import APIRouter, Query

from config import settings

router = APIRouter()

TAIL_BYTES = 300_000  # how much of eve.json to read from the end


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
        alert_block = ev.get("alert", {})
        results.append({
            "timestamp": ev.get("timestamp"),
            "src_ip": ev.get("src_ip"),
            "src_port": ev.get("src_port"),
            "dest_ip": ev.get("dest_ip"),
            "dest_port": ev.get("dest_port"),
            "proto": ev.get("proto"),
            "app_proto": ev.get("app_proto"),
            "severity": alert_block.get("severity", 3),
            "signature": alert_block.get("signature", ""),
            "signature_id": alert_block.get("signature_id"),
            "category": alert_block.get("category", ""),
            "action": alert_block.get("action", "allowed"),
            "metadata": alert_block.get("metadata", {}),
        })

    return {"alerts": results, "count": len(results)}


@router.get("/stats")
async def stats():
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
                "detect": {
                    "alert": s.get("detect", {}).get("alert", 0),
                    "engines": s.get("detect", {}).get("engines", []),
                },
                "dns": s.get("dns", {}),
                "http": s.get("http", {}),
            }
    path = settings.suricata_eve_path
    return {"error": f"No stats event found in last {TAIL_BYTES // 1024}KB of {path}"}


@router.get("/flows")
async def flows(limit: int = Query(50, ge=1, le=500)):
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
            "reason": flow.get("reason"),
        })
    return {"flows": results, "count": len(results)}
