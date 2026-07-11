import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from .config import getSettings

pinIterations = 310_000
sessionDays = 30


def getClientIp(request: Request) -> str:
    forwardedFor = request.headers.get("x-forwarded-for", "")
    if forwardedFor:
        return forwardedFor.split(",")[0].strip()
    realIp = request.headers.get("x-real-ip")
    if realIp:
        return realIp.strip()
    return request.client.host if request.client else ""


def isAllowedIp(request: Request) -> bool:
    settings = getSettings()
    return getClientIp(request) in set(settings["adminAllowedIps"])


def assertAllowedIp(request: Request) -> None:
    if not isAllowedIp(request):
        raise HTTPException(status_code=403, detail="admin is not available from this IP")


def hashPin(pin: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode(), salt.encode(), pinIterations).hex()
    return f"pbkdf2_sha256${pinIterations}${salt}${digest}"


def verifyPin(pin: str, storedHash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = storedHash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", pin.encode(), salt.encode(), int(iterations)).hex()
        return hmac.compare_digest(digest, expected)
    except ValueError:
        return False


def tokenHash(token: str) -> str:
    settings = getSettings()
    secret = str(settings["sessionSecret"]).encode()
    return hmac.new(secret, token.encode(), hashlib.sha256).hexdigest()


def viewIpHash(ip: str) -> str:
    settings = getSettings()
    secret = str(settings["sessionSecret"]).encode()
    return hmac.new(secret, f"article-view:{ip}".encode(), hashlib.sha256).hexdigest()


async def createSession(database: AsyncIOMotorDatabase, request: Request) -> str:
    token = secrets.token_urlsafe(48)
    now = datetime.now(UTC)
    await database.adminSessions.insert_one(
        {
            "tokenHash": tokenHash(token),
            "ip": getClientIp(request),
            "createdAt": now,
            "expiresAt": now + timedelta(days=sessionDays),
        }
    )
    return token


async def requireAdmin(database: AsyncIOMotorDatabase, request: Request) -> None:
    assertAllowedIp(request)
    token = request.cookies.get("adminSession")
    if not token:
        raise HTTPException(status_code=401, detail="admin session required")
    session = await database.adminSessions.find_one({"tokenHash": tokenHash(token)})
    if not session:
        raise HTTPException(status_code=401, detail="admin session required")
