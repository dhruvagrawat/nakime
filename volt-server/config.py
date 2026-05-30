import os

class Settings:
    wazuh_url: str = os.getenv("WAZUH_URL", "https://localhost:55000")
    wazuh_user: str = os.getenv("WAZUH_USER", "wazuh-wui")
    wazuh_pass: str = os.getenv("WAZUH_PASS", "")
    wazuh_verify_ssl: bool = os.getenv("WAZUH_VERIFY_SSL", "false").lower() == "true"

    suricata_eve_path: str = os.getenv("SURICATA_EVE_PATH", "/var/log/suricata/eve.json")

    ntopng_url: str = os.getenv("NTOPNG_URL", "http://localhost:3000")
    ntopng_user: str = os.getenv("NTOPNG_USER", "admin")
    ntopng_pass: str = os.getenv("NTOPNG_PASS", "admin")

    splunk_url: str = os.getenv("SPLUNK_URL", "https://localhost:8089")
    splunk_token: str = os.getenv("SPLUNK_TOKEN", "")

    port: int = int(os.getenv("VOLT_PORT", "8000"))
    cors_origins: str = os.getenv("VOLT_CORS_ORIGINS", "*")

settings = Settings()
