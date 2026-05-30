from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import employees, health, ntopng, splunk, suricata, wazuh

app = FastAPI(title="Volt Security Backend", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wazuh.router,     prefix="/wazuh",     tags=["Wazuh"])
app.include_router(suricata.router,  prefix="/suricata",  tags=["Suricata"])
app.include_router(health.router,    prefix="/health",    tags=["Health"])
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(ntopng.router,    prefix="/ntopng",    tags=["ntopng"])
app.include_router(splunk.router,    prefix="/splunk",    tags=["Splunk"])


@app.get("/")
def root():
    return {"service": "volt-server", "version": "1.0.0", "status": "running", "docs": "/docs"}


@app.get("/healthz")
def healthz():
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
