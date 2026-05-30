import asyncio
import httpx
from fastapi import APIRouter, Query

from config import settings

router = APIRouter()


def _headers() -> dict:
    return {
        "Authorization": f"Splunk {settings.splunk_token}",
        "Content-Type": "application/x-www-form-urlencoded",
    }


async def _req(method: str, path: str, **kwargs) -> dict:
    async with httpx.AsyncClient(verify=False, timeout=30) as client:
        fn = getattr(client, method.lower())
        r = await fn(f"{settings.splunk_url}{path}", headers=_headers(), **kwargs)
        r.raise_for_status()
        return r.json()


@router.get("/search")
async def search(
    q: str = Query(..., description="SPL search string (without leading 'search')"),
    earliest: str = Query("-24h"),
    latest: str = Query("now"),
):
    if not settings.splunk_token:
        return {"error": "SPLUNK_TOKEN not configured", "results": []}
    try:
        job = await _req(
            "post",
            "/services/search/jobs",
            data={"search": f"search {q}", "earliest_time": earliest, "latest_time": latest, "output_mode": "json"},
        )
        sid = job["sid"]

        for _ in range(30):
            await asyncio.sleep(1)
            status = await _req("get", f"/services/search/jobs/{sid}?output_mode=json")
            state = status["entry"][0]["content"].get("dispatchState", "")
            if state in ("DONE", "FAILED"):
                break

        results = await _req("get", f"/services/search/jobs/{sid}/results?output_mode=json&count=200")
        return {"results": results.get("results", []), "sid": sid}
    except Exception as exc:
        return {"error": str(exc), "results": []}


@router.get("/notable-events")
async def notable_events(limit: int = Query(50, ge=1, le=200)):
    """Pull Splunk ES notable events (requires Enterprise Security)."""
    if not settings.splunk_token:
        return {"error": "SPLUNK_TOKEN not configured", "events": []}
    return await search(
        q="index=notable | head {limit} | fields event_id, rule_name, severity, src, dest, status".format(limit=limit),
        earliest="-24h",
        latest="now",
    )
