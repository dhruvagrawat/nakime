import httpx
from fastapi import APIRouter, Query

from config import settings
import sample_data as demo

router = APIRouter()


async def _get(path: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{settings.ntopng_url}{path}",
            auth=(settings.ntopng_user, settings.ntopng_pass),
        )
        r.raise_for_status()
        return r.json()


@router.get("/interfaces")
async def interfaces():
    if settings.use_sample_data:
        return {"rsp": [{"id": 0, "name": "eth0"}]}
    try:
        return await _get("/lua/rest/v2/get/ntopng/interfaces.lua")
    except Exception as exc:
        return {"error": str(exc), "interfaces": []}


@router.get("/stats")
async def stats(ifid: int = Query(0)):
    if settings.use_sample_data:
        return demo.NTOPNG_STATS
    try:
        return await _get(f"/lua/rest/v2/get/interface/data.lua?ifid={ifid}")
    except Exception as exc:
        return {"error": str(exc)}


@router.get("/top-hosts")
async def top_hosts(ifid: int = Query(0), limit: int = Query(20, ge=1, le=100)):
    if settings.use_sample_data:
        return demo.NTOPNG_TOP_HOSTS
    try:
        return await _get(f"/lua/rest/v2/get/interface/top_hosts.lua?ifid={ifid}&max_num_hosts={limit}")
    except Exception as exc:
        return {"error": str(exc), "hosts": []}


@router.get("/flows")
async def flows(ifid: int = Query(0), limit: int = Query(50, ge=1, le=200)):
    if settings.use_sample_data:
        return {"rsp": []}
    try:
        return await _get(f"/lua/rest/v2/get/flow/active.lua?ifid={ifid}&maxHits={limit}")
    except Exception as exc:
        return {"error": str(exc), "flows": []}


@router.get("/alerts")
async def network_alerts(ifid: int = Query(0), limit: int = Query(50, ge=1, le=200)):
    if settings.use_sample_data:
        return {"rsp": []}
    try:
        return await _get(f"/lua/rest/v2/get/flow/alert/list.lua?ifid={ifid}&maxHits={limit}")
    except Exception as exc:
        return {"error": str(exc), "alerts": []}
