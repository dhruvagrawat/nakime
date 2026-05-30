import time
import httpx
from fastapi import APIRouter, HTTPException, Query

from config import settings

router = APIRouter()

# JWT cache — Wazuh tokens expire in 900s by default
_jwt: dict = {"token": None, "expires": 0.0}


async def _get_token() -> str:
    if _jwt["token"] and time.time() < _jwt["expires"]:
        return _jwt["token"]  # type: ignore[return-value]
    async with httpx.AsyncClient(verify=settings.wazuh_verify_ssl, timeout=10) as client:
        r = await client.post(
            f"{settings.wazuh_url}/security/user/authenticate",
            auth=(settings.wazuh_user, settings.wazuh_pass),
        )
        r.raise_for_status()
        token = r.json()["data"]["token"]
        _jwt["token"] = token
        _jwt["expires"] = time.time() + 800  # refresh before actual expiry
        return token


async def _wazuh(path: str, params: dict | None = None) -> dict:
    token = await _get_token()
    async with httpx.AsyncClient(verify=settings.wazuh_verify_ssl, timeout=15) as client:
        r = await client.get(
            f"{settings.wazuh_url}{path}",
            headers={"Authorization": f"Bearer {token}"},
            params=params or {},
        )
        r.raise_for_status()
        return r.json()


@router.get("/agents")
async def agents(limit: int = Query(500, ge=1, le=500)):
    try:
        data = await _wazuh("/agents", {
            "limit": limit,
            "select": "id,name,status,ip,os,lastKeepAlive,version,registerIP",
        })
        return data
    except Exception as exc:
        return {"data": {"affected_items": [], "total_affected_items": 0}, "error": str(exc)}


@router.get("/alerts")
async def alerts(limit: int = Query(50, ge=1, le=500)):
    try:
        # /security/events is the unified endpoint in Wazuh 4.7+
        data = await _wazuh("/security/events", {"limit": limit})
        return data
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            return {"data": {"affected_items": []}, "error": "events endpoint unavailable"}
        return {"data": {"affected_items": []}, "error": str(exc)}
    except Exception as exc:
        return {"data": {"affected_items": []}, "error": str(exc)}


@router.get("/stats")
async def stats():
    try:
        return await _wazuh("/manager/stats")
    except Exception as exc:
        return {"error": str(exc)}


@router.get("/vulnerabilities/{agent_id}")
async def vulnerabilities(agent_id: str, limit: int = Query(100, ge=1, le=500)):
    try:
        return await _wazuh(f"/vulnerability/{agent_id}", {"limit": limit})
    except Exception as exc:
        return {"data": {"affected_items": []}, "error": str(exc)}


@router.get("/summary")
async def summary():
    """Quick agent-count summary — safe to poll frequently."""
    try:
        data = await _wazuh("/agents/summary/status")
        return data
    except Exception as exc:
        return {"data": {}, "error": str(exc)}
