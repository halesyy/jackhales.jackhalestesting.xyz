import json
import re
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase

from .config import getSettings
from .database import closeClient, ensureIndexes, getDatabase
from .schemas import ArticleCreate, ArticleOut, ArticleSummary, ArticleUpdate, PinInput
from .security import assertAllowedIp, createSession, getClientIp, hashPin, isAllowedIp, requireAdmin, tokenHash, verifyPin


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "untitled"


def serializeArticle(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "title": document["title"],
        "slug": document["slug"],
        "summary": document.get("summary", ""),
        "bodyMarkdown": document.get("bodyMarkdown", ""),
        "publishedAt": document["publishedAt"],
        "status": document.get("status", "draft"),
        "sourceUrl": document.get("sourceUrl"),
        "createdAt": document["createdAt"],
        "updatedAt": document["updatedAt"],
    }


def serializeSummary(document: dict) -> dict:
    article = serializeArticle(document)
    article.pop("bodyMarkdown", None)
    article.pop("sourceUrl", None)
    article.pop("createdAt", None)
    return article


async def seedArticles(database: AsyncIOMotorDatabase) -> None:
    if await database.articles.estimated_document_count() > 0:
        return
    seedPath = Path(__file__).resolve().parent.parent / "seed" / "articles.json"
    articles = json.loads(seedPath.read_text())
    now = datetime.now(UTC)
    for article in articles:
        article["slug"] = slugify(article["slug"])
        article["publishedAt"] = datetime.fromisoformat(article["publishedAt"].replace("Z", "+00:00"))
        article["createdAt"] = now
        article["updatedAt"] = now
    if articles:
        await database.articles.insert_many(articles)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensureIndexes()
    await seedArticles(getDatabase())
    yield
    await closeClient()


app = FastAPI(title="Jack Hales Blog API", lifespan=lifespan)
settings = getSettings()
corsOrigins = settings["corsOrigins"]
if corsOrigins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(corsOrigins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def database() -> AsyncIOMotorDatabase:
    return getDatabase()


async def adminOnly(request: Request, database: AsyncIOMotorDatabase = Depends(database)) -> None:
    await requireAdmin(database, request)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/articles", response_model=list[ArticleSummary])
async def listArticles(database: AsyncIOMotorDatabase = Depends(database)) -> list[dict]:
    cursor = database.articles.find({"status": "published"}).sort("publishedAt", -1)
    return [serializeSummary(article) async for article in cursor]


@app.get("/api/articles/{slug}", response_model=ArticleOut)
async def getArticle(slug: str, database: AsyncIOMotorDatabase = Depends(database)) -> dict:
    article = await database.articles.find_one({"slug": slug, "status": "published"})
    if not article:
        raise HTTPException(status_code=404, detail="article not found")
    return serializeArticle(article)


@app.get("/api/sitemap")
async def sitemap(database: AsyncIOMotorDatabase = Depends(database)) -> dict[str, list[str]]:
    siteUrl = str(settings["publicSiteUrl"])
    staticPaths = [
        "",
        "/articles",
        "/background-and-experience",
        "/machine-learning",
        "/software-engineers-guide-exploring-oman-top-travel-tips-itinerary",
    ]
    cursor = database.articles.find({"status": "published"}, {"slug": 1}).sort("publishedAt", -1)
    articlePaths = [f"/article/{article['slug']}" async for article in cursor]
    return {"urls": [f"{siteUrl}{path}" for path in [*staticPaths, *articlePaths]]}


@app.get("/api/admin/status")
async def adminStatus(request: Request, database: AsyncIOMotorDatabase = Depends(database)) -> dict[str, bool]:
    admin = await database.adminConfig.find_one({"key": "pin"})
    return {"hasPin": bool(admin), "allowedIp": isAllowedIp(request)}


@app.post("/api/admin/bootstrap")
async def bootstrapAdmin(
    payload: PinInput,
    request: Request,
    response: Response,
    database: AsyncIOMotorDatabase = Depends(database),
) -> dict[str, bool]:
    settings = getSettings()
    if str(settings["adminBootstrapIp"]) != getClientIp(request):
        assertAllowedIp(request)
    existing = await database.adminConfig.find_one({"key": "pin"})
    if existing:
        raise HTTPException(status_code=409, detail="admin pin already exists")
    await database.adminConfig.insert_one({"key": "pin", "pinHash": hashPin(payload.pin), "createdAt": datetime.now(UTC)})
    token = await createSession(database, request)
    response.set_cookie("adminSession", token, httponly=True, secure=True, samesite="lax", max_age=60 * 60 * 24 * 30)
    return {"ok": True}


@app.post("/api/admin/login")
async def loginAdmin(
    payload: PinInput,
    request: Request,
    response: Response,
    database: AsyncIOMotorDatabase = Depends(database),
) -> dict[str, bool]:
    assertAllowedIp(request)
    admin = await database.adminConfig.find_one({"key": "pin"})
    if not admin or not verifyPin(payload.pin, admin["pinHash"]):
        raise HTTPException(status_code=401, detail="invalid pin")
    token = await createSession(database, request)
    response.set_cookie("adminSession", token, httponly=True, secure=True, samesite="lax", max_age=60 * 60 * 24 * 30)
    return {"ok": True}


@app.post("/api/admin/logout")
async def logoutAdmin(request: Request, response: Response, database: AsyncIOMotorDatabase = Depends(database)) -> dict[str, bool]:
    token = request.cookies.get("adminSession")
    if token:
        await database.adminSessions.delete_one({"tokenHash": tokenHash(token)})
    response.delete_cookie("adminSession")
    return {"ok": True}


@app.get("/api/admin/articles", response_model=list[ArticleSummary], dependencies=[Depends(adminOnly)])
async def adminListArticles(database: AsyncIOMotorDatabase = Depends(database)) -> list[dict]:
    cursor = database.articles.find({}).sort("publishedAt", -1)
    return [serializeSummary(article) async for article in cursor]


@app.get("/api/admin/articles/{slug}", response_model=ArticleOut, dependencies=[Depends(adminOnly)])
async def adminGetArticle(slug: str, database: AsyncIOMotorDatabase = Depends(database)) -> dict:
    article = await database.articles.find_one({"slug": slug})
    if not article:
        raise HTTPException(status_code=404, detail="article not found")
    return serializeArticle(article)


@app.post("/api/admin/articles", response_model=ArticleOut, dependencies=[Depends(adminOnly)])
async def createArticle(payload: ArticleCreate, database: AsyncIOMotorDatabase = Depends(database)) -> dict:
    now = datetime.now(UTC)
    document = payload.model_dump()
    document["slug"] = slugify(document["slug"])
    document["createdAt"] = now
    document["updatedAt"] = now
    result = await database.articles.insert_one(document)
    created = await database.articles.find_one({"_id": result.inserted_id})
    return serializeArticle(created)


@app.put("/api/admin/articles/{slug}", response_model=ArticleOut, dependencies=[Depends(adminOnly)])
async def updateArticle(slug: str, payload: ArticleUpdate, database: AsyncIOMotorDatabase = Depends(database)) -> dict:
    existing = await database.articles.find_one({"slug": slug})
    if not existing:
        raise HTTPException(status_code=404, detail="article not found")
    update = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    if "slug" in update:
        update["slug"] = slugify(update["slug"])
    update["updatedAt"] = datetime.now(UTC)
    await database.articles.update_one({"_id": existing["_id"]}, {"$set": update})
    updatedSlug = update.get("slug", slug)
    article = await database.articles.find_one({"slug": updatedSlug})
    return serializeArticle(article)
