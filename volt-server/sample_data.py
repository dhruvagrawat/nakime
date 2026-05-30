"""
Demo / sample data for Volt development and testing.
Used when USE_SAMPLE_DATA=true or when real backends are unreachable.
Data is intentionally realistic-looking so the UI is fully explorable.
"""

from datetime import datetime, timezone, timedelta


def _ts(minutes_ago: int = 0, seconds_ago: int = 0) -> str:
    delta = timedelta(minutes=minutes_ago, seconds=seconds_ago)
    dt = datetime.now(timezone.utc) - delta
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


# ── Wazuh ────────────────────────────────────────────────────────────────────

WAZUH_AGENTS = {
    "data": {
        "affected_items": [
            {"id": "001", "name": "WS-ENGINEERING-01", "ip": "192.168.10.101",
             "status": "active", "version": "Wazuh v4.7.2",
             "lastKeepAlive": _ts(0, 23),
             "os": {"name": "Windows 11 Pro", "platform": "windows", "version": "10.0.22631"}},
            {"id": "002", "name": "WS-ENGINEERING-02", "ip": "192.168.10.102",
             "status": "active", "version": "Wazuh v4.7.2",
             "lastKeepAlive": _ts(0, 45),
             "os": {"name": "Ubuntu 22.04 LTS", "platform": "ubuntu", "version": "22.04"}},
            {"id": "003", "name": "SRV-WEB-PROD-01", "ip": "192.168.20.10",
             "status": "active", "version": "Wazuh v4.7.1",
             "lastKeepAlive": _ts(0, 12),
             "os": {"name": "Ubuntu 22.04 LTS", "platform": "ubuntu", "version": "22.04"}},
            {"id": "004", "name": "SRV-DB-PROD-01", "ip": "192.168.20.20",
             "status": "active", "version": "Wazuh v4.7.1",
             "lastKeepAlive": _ts(0, 8),
             "os": {"name": "CentOS 7", "platform": "centos", "version": "7.9.2009"}},
            {"id": "005", "name": "SRV-MAIL-01", "ip": "192.168.20.30",
             "status": "active", "version": "Wazuh v4.6.0",
             "lastKeepAlive": _ts(2),
             "os": {"name": "Debian 12", "platform": "debian", "version": "12.4"}},
            {"id": "006", "name": "WS-HR-03", "ip": "192.168.10.150",
             "status": "disconnected", "version": "Wazuh v4.5.4",
             "lastKeepAlive": _ts(42),
             "os": {"name": "Windows 10 Pro", "platform": "windows", "version": "10.0.19045"}},
            {"id": "007", "name": "LAPTOP-EXEC-01", "ip": "192.168.10.200",
             "status": "active", "version": "Wazuh v4.7.2",
             "lastKeepAlive": _ts(1),
             "os": {"name": "macOS 14.2", "platform": "darwin", "version": "14.2.1"}},
            {"id": "008", "name": "IOT-CAM-GATEWAY", "ip": "192.168.30.5",
             "status": "pending", "version": "Wazuh v4.7.0",
             "lastKeepAlive": _ts(15),
             "os": {"name": "Raspbian 11", "platform": "raspbian", "version": "11"}},
        ],
        "total_affected_items": 8,
    }
}

WAZUH_ALERTS = {
    "data": {
        "affected_items": [
            {
                "id": "1001", "timestamp": _ts(1, 12),
                "rule": {"level": 14, "description": "SSH brute force attack — 10 failed logins in 30 seconds", "groups": ["authentication_failures", "ssh", "attack"]},
                "agent": {"id": "003", "name": "SRV-WEB-PROD-01"},
                "data": {"srcip": "203.0.113.42", "dstuser": "root"},
            },
            {
                "id": "1002", "timestamp": _ts(3, 55),
                "rule": {"level": 12, "description": "Rootcheck: Suspicious file found in /tmp — possible backdoor", "groups": ["rootcheck", "trojan"]},
                "agent": {"id": "004", "name": "SRV-DB-PROD-01"},
                "data": {"file": "/tmp/.hidden_shell"},
            },
            {
                "id": "1003", "timestamp": _ts(7),
                "rule": {"level": 9, "description": "PAM: User authentication failure for root", "groups": ["pam", "authentication_failed"]},
                "agent": {"id": "003", "name": "SRV-WEB-PROD-01"},
            },
            {
                "id": "1004", "timestamp": _ts(12),
                "rule": {"level": 8, "description": "File integrity monitoring: File modified — /etc/passwd", "groups": ["syscheck", "fim"]},
                "agent": {"id": "004", "name": "SRV-DB-PROD-01"},
                "data": {"path": "/etc/passwd"},
            },
            {
                "id": "1005", "timestamp": _ts(18),
                "rule": {"level": 7, "description": "Firewall rule modified — iptables chain INPUT changed", "groups": ["firewall", "policy_changed"]},
                "agent": {"id": "005", "name": "SRV-MAIL-01"},
            },
            {
                "id": "1006", "timestamp": _ts(23),
                "rule": {"level": 6, "description": "New user account added to the system", "groups": ["account_change", "adduser"]},
                "agent": {"id": "001", "name": "WS-ENGINEERING-01"},
                "data": {"dstuser": "deploy_svc"},
            },
            {
                "id": "1007", "timestamp": _ts(31),
                "rule": {"level": 5, "description": "Audit: Configuration file changed", "groups": ["audit", "configuration_changed"]},
                "agent": {"id": "002", "name": "WS-ENGINEERING-02"},
            },
            {
                "id": "1008", "timestamp": _ts(45),
                "rule": {"level": 3, "description": "System information: Service started", "groups": ["syslog", "service_start"]},
                "agent": {"id": "005", "name": "SRV-MAIL-01"},
            },
        ],
        "total_affected_items": 8,
    }
}

WAZUH_SUMMARY = {
    "data": {
        "connection": {"active": 6, "disconnected": 1, "pending": 1, "never_connected": 0, "total": 8},
        "configuration": {"synced": 7, "not_synced": 1, "total": 8},
    }
}

WAZUH_STATS = {
    "data": {
        "affected_items": [{"alerts": {"1": 823, "2": 145, "3": 67, "4": 12, "5": 3}, "timestamp": _ts(0)}],
    }
}


# ── Suricata ─────────────────────────────────────────────────────────────────

SURICATA_ALERTS = {
    "alerts": [
        {
            "timestamp": _ts(0, 38), "src_ip": "203.0.113.42", "src_port": 54231,
            "dest_ip": "192.168.20.10", "dest_port": 22, "proto": "TCP",
            "severity": 1, "signature": "ET SCAN Nmap OS Detection Probe",
            "category": "Attempted Information Leak", "action": "allowed",
        },
        {
            "timestamp": _ts(2, 5), "src_ip": "198.51.100.77", "src_port": 443,
            "dest_ip": "192.168.10.101", "dest_port": 49152, "proto": "TCP",
            "severity": 2, "signature": "GPL ATTACK_RESPONSE id check returned root",
            "category": "Potentially Bad Traffic", "action": "allowed",
        },
        {
            "timestamp": _ts(4), "src_ip": "192.168.10.150", "src_port": 58342,
            "dest_ip": "203.0.113.100", "dest_port": 4444, "proto": "TCP",
            "severity": 1, "signature": "ET MALWARE Possible Metasploit Meterpreter Reverse Shell",
            "category": "A Network Trojan was detected", "action": "blocked",
        },
        {
            "timestamp": _ts(8), "src_ip": "192.168.10.101", "src_port": 35621,
            "dest_ip": "8.8.8.8", "dest_port": 53, "proto": "UDP",
            "severity": 3, "signature": "ET DNS Query to a *.cc TLD", "category": "Potentially Bad Traffic", "action": "allowed",
        },
        {
            "timestamp": _ts(11), "src_ip": "192.168.20.10", "src_port": 45122,
            "dest_ip": "104.21.42.10", "dest_port": 443, "proto": "TCP",
            "severity": 3, "signature": "ET POLICY SSH Outbound connection", "category": "Potential Corporate Privacy Violation", "action": "allowed",
        },
        {
            "timestamp": _ts(16), "src_ip": "203.0.113.88", "src_port": 80,
            "dest_ip": "192.168.20.30", "dest_port": 25, "proto": "TCP",
            "severity": 2, "signature": "ET SCAN LibSSH Server Scanning", "category": "Attempted Information Leak", "action": "allowed",
        },
        {
            "timestamp": _ts(25), "src_ip": "192.168.10.102", "src_port": 52100,
            "dest_ip": "151.101.0.0", "dest_port": 443, "proto": "TCP",
            "severity": 4, "signature": "ET INFO Outbound Connection to High Risk Hosting", "category": "Misc activity", "action": "allowed",
        },
    ],
    "count": 7,
}

SURICATA_STATS = {
    "timestamp": _ts(0),
    "uptime": 172840,  # ~48 hours
    "capture": {"kernel_packets": 15823400, "kernel_drops": 0, "errors": 0},
    "decoder": {"pkts": 15823400, "bytes": 14520349440, "invalid": 12},
    "flow": {"state": {"new": 342, "established": 1204, "closed": 89231}},
    "detect": {"alert": 287},
    "dns": {"queries": 48320, "answers": 47980},
    "http": {"requests": 234510, "responses": 234321},
}


# ── Employees ────────────────────────────────────────────────────────────────

SAMPLE_EMPLOYEES = [
    {"employee_id": "EMP-001", "name": "Alice Chen", "department": "Engineering", "role": "Backend Engineer",
     "location": "Floor 3 — East Wing", "lat": 37.7749, "lng": -122.4194, "status": "active",
     "avatar_initials": "AC", "badge_color": "#00e5ff", "last_seen": 1717027200 + 30, "checked_in": True},
    {"employee_id": "EMP-002", "name": "Bob Martinez", "department": "Security", "role": "SOC Analyst",
     "location": "SOC Room", "lat": 37.7750, "lng": -122.4180, "status": "active",
     "avatar_initials": "BM", "badge_color": "#ff4444", "last_seen": 1717027200 + 15, "checked_in": True},
    {"employee_id": "EMP-003", "name": "Charlie Wilson", "department": "IT Ops", "role": "Systems Admin",
     "location": "Server Room B1", "lat": 37.7748, "lng": -122.4200, "status": "away",
     "avatar_initials": "CW", "badge_color": "#d4af37", "last_seen": 1717027200 - 300, "checked_in": True},
    {"employee_id": "EMP-004", "name": "Diana Park", "department": "Executive", "role": "CTO",
     "location": "Floor 5 — Conference", "lat": 37.7755, "lng": -122.4190, "status": "busy",
     "avatar_initials": "DP", "badge_color": "#9c27b0", "last_seen": 1717027200 + 60, "checked_in": True},
    {"employee_id": "EMP-005", "name": "Eve Johnson", "department": "HR", "role": "HR Manager",
     "location": "Floor 2", "lat": 37.7747, "lng": -122.4195, "status": "active",
     "avatar_initials": "EJ", "badge_color": "#4caf50", "last_seen": 1717027200 + 90, "checked_in": True},
    {"employee_id": "EMP-006", "name": "Frank Davis", "department": "Engineering", "role": "DevOps Lead",
     "location": "Floor 3 — West Wing", "lat": 37.7751, "lng": -122.4185, "status": "active",
     "avatar_initials": "FD", "badge_color": "#00e5ff", "last_seen": 1717027200 + 45, "checked_in": True},
    {"employee_id": "EMP-007", "name": "Grace Kim", "department": "Finance", "role": "CFO",
     "location": None, "lat": None, "lng": None, "status": "offline",
     "avatar_initials": "GK", "badge_color": "#607d8b", "last_seen": 1717027200 - 7200, "checked_in": False},
    {"employee_id": "EMP-008", "name": "Henry Taylor", "department": "IT Ops", "role": "Network Engineer",
     "location": "NOC", "lat": 37.7746, "lng": -122.4198, "status": "active",
     "avatar_initials": "HT", "badge_color": "#ff9800", "last_seen": 1717027200 + 20, "checked_in": True},
]


# ── Health ────────────────────────────────────────────────────────────────────

HEALTH_RESULTS = {
    "results": [
        {"name": "Wazuh Manager",    "url": "http://localhost:55000",          "status": "UP",       "http_status": 200, "latency_ms": 45.2},
        {"name": "Suricata (ES)",    "url": "http://localhost:9200/_cluster/health", "status": "UP", "http_status": 200, "latency_ms": 22.8},
        {"name": "ntopng",          "url": "http://localhost:3000",            "status": "DEGRADED", "http_status": 401, "latency_ms": 887.4},
        {"name": "Volt Backend",    "url": "http://localhost:8000/healthz",    "status": "UP",       "http_status": 200, "latency_ms": 7.1},
    ],
    "summary": {"total": 4, "up": 3, "down": 1, "health": "degraded"},
}


# ── ntopng ────────────────────────────────────────────────────────────────────

NTOPNG_STATS = {
    "rsp": {
        "throughput": {"download": 145_300_000, "upload": 23_100_000},
        "flows": {"active": 342, "idle": 1204},
        "packets": {"received": 15_823_400, "sent": 4_210_900},
        "bytes": {"received": 14_520_349_440, "sent": 3_840_122_880},
        "name": "eth0",
    }
}

NTOPNG_TOP_HOSTS = {
    "rsp": [
        {"name": "SRV-WEB-PROD-01", "ip": "192.168.20.10", "bytes": 8_240_000_000, "pkts": 5_812_400},
        {"name": "SRV-DB-PROD-01",  "ip": "192.168.20.20", "bytes": 3_120_000_000, "pkts": 2_204_100},
        {"name": "WS-ENGINEERING-01","ip": "192.168.10.101","bytes": 1_540_000_000, "pkts": 1_032_500},
        {"name": "SRV-MAIL-01",     "ip": "192.168.20.30", "bytes": 980_000_000,  "pkts": 712_300},
        {"name": "LAPTOP-EXEC-01",  "ip": "192.168.10.200","bytes": 640_000_000,  "pkts": 482_100},
    ]
}


def employee_presence_response() -> dict:
    """Returns employees with live-ish last_seen timestamps."""
    import time
    now = time.time()
    out = []
    for emp in SAMPLE_EMPLOYEES:
        e = dict(emp)
        # Active employees have a recent ping; offline ones don't
        if e["checked_in"]:
            e["last_seen"] = now - (abs(hash(e["employee_id"])) % 180)
        else:
            e["last_seen"] = now - 7200
        out.append(e)
    active = sum(1 for e in out if e["checked_in"] and e["status"] != "offline")
    return {"employees": out, "active_count": active, "total": len(out)}
