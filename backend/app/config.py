import os
from functools import lru_cache


def splitCsv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache(maxsize=1)
def getSettings() -> dict[str, object]:
    return {
        "mongodbUrl": os.environ.get("MONGODB_URL", "mongodb://localhost:27017"),
        "mongodbDatabase": os.environ.get("MONGODB_DATABASE", "jackhales"),
        "adminAllowedIps": splitCsv(os.environ.get("ADMIN_ALLOWED_IPS", "182.253.75.243")),
        "adminBootstrapIp": os.environ.get("ADMIN_BOOTSTRAP_IP", "182.253.75.243"),
        "sessionSecret": os.environ.get("SESSION_SECRET", "local-dev-session-secret"),
        "publicSiteUrl": os.environ.get("PUBLIC_SITE_URL", "https://jackhales.jackhalestesting.xyz").rstrip("/"),
        "corsOrigins": splitCsv(os.environ.get("CORS_ORIGINS", "")),
    }

