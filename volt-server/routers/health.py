import asyncio
import time
from typing import Any

import httpx
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ServiceDef(BaseModel):
    name: str
    url: str
    method: str = "GET"
    timeout: float = 5.0
    expected_status: int = 200


async def _check(svc: dict[str, Any]) -> dict[str, Any]:
    start = time.monotonic()
    url = svc.get("url", "")
    name = svc.get("name", url)
    timeout = float(svc.get("timeout", 5.0))
    method = svc.get("method", "GET").upper()

    try:
        async with httpx.AsyncClient(verify=False, timeout=timeout) as client:
            fn = client.head if method == "HEAD" else client.get
            r = await fn(url)
            latency = round((time.monotonic() - start) * 1000, 1)
            if r.status_code < 500:
                return {"name": name, "url": url, "status": "UP", "http_status": r.status_code, "latency_ms": latency}
            return {"name": name, "url": url, "status": "DEGRADED", "http_status": r.status_code, "latency_ms": latency}
    except httpx.TimeoutException:
        return {"name": name, "url": url, "status": "TIMEOUT", "latency_ms": None}
    except httpx.ConnectError:
        return {"name": name, "url": url, "status": "DOWN", "latency_ms": None}
    except Exception as exc:
        return {"name": name, "url": url, "status": "DOWN", "error": str(exc), "latency_ms": None}


@router.post("/check")
async def check(services: list[dict[str, Any]]):
    results = list(await asyncio.gather(*[_check(s) for s in services]))
    up = sum(1 for r in results if r["status"] == "UP")
    total = len(results)
    return {
        "results": results,
        "summary": {
            "total": total,
            "up": up,
            "down": total - up,
            "health": "healthy" if up == total else "degraded" if up > 0 else "critical",
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@router.get("/ping")
async def ping():
    """Ping the volt-server itself — lightweight liveness probe."""
    return {"ok": True, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
