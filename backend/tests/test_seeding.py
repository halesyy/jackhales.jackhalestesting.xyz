import unittest
from datetime import UTC, datetime
from pathlib import Path
from tempfile import TemporaryDirectory

from app.seeding import loadReseedToken, loadSeedArticles, reseedArticles, syncVersionedSeedArticles


class FakeDeleteResult:
    def __init__(self, deletedCount: int) -> None:
        self.deleted_count = deletedCount


class FakeCollection:
    def __init__(self, deletedCount: int = 0) -> None:
        self.deletedCount = deletedCount
        self.insertedDocuments: list[dict] = []

    async def delete_many(self, query: dict) -> FakeDeleteResult:
        self.assertEmptyQuery(query)
        return FakeDeleteResult(self.deletedCount)

    async def insert_many(self, documents: list[dict]) -> None:
        self.insertedDocuments = documents

    @staticmethod
    def assertEmptyQuery(query: dict) -> None:
        if query:
            raise AssertionError(f"Expected an empty collection query, received {query}")


class FakeDatabase:
    def __init__(self) -> None:
        self.articles = FakeCollection(13)
        self.articleViews = FakeCollection(4)
        self.adminSessions = FakeCollection(2)


class FakeDocumentCollection:
    def __init__(self, documents: list[dict] | None = None) -> None:
        self.documents = {document["_id"]: document.copy() for document in (documents or [])}

    async def find_one(self, query: dict, projection: dict | None = None) -> dict | None:
        for document in self.documents.values():
            if all(document.get(key) == value for key, value in query.items()):
                return document.copy()
        return None

    async def insert_one(self, document: dict) -> None:
        self.documents[document["_id"]] = document.copy()

    async def update_one(self, query: dict, update: dict, upsert: bool = False) -> None:
        document = await self.find_one(query)
        if document is None:
            if not upsert:
                return
            document = query.copy()
            document.update(update.get("$setOnInsert", {}))
        document.update(update.get("$set", {}))
        self.documents[document["_id"]] = document


class FakeArticleSyncDatabase:
    def __init__(self) -> None:
        createdAt = datetime(2024, 10, 23, tzinfo=UTC)
        self.articles = FakeDocumentCollection(
            [
                {
                    "_id": "prime-article",
                    "slug": "prime-number-research-2024",
                    "title": "Old title",
                    "bodyMarkdown": "Flattened legacy body",
                    "createdAt": createdAt,
                    "updatedAt": createdAt,
                }
            ]
        )
        self.maintenanceBackups = FakeDocumentCollection()
        self.maintenanceRuns = FakeDocumentCollection()


class SeedArticlesTest(unittest.TestCase):
    def testSeedArticlesAreCanonicalAndDeterministic(self) -> None:
        seededAt = datetime(2026, 7, 11, tzinfo=UTC)
        articles = loadSeedArticles(seededAt)

        self.assertEqual(len(articles), 10)
        self.assertEqual(len({article["slug"] for article in articles}), 10)
        self.assertNotIn("test", {article["slug"] for article in articles})
        self.assertTrue(all(article["createdAt"] == seededAt for article in articles))
        self.assertTrue(all(article["updatedAt"] == seededAt for article in articles))
        self.assertTrue(all(article["publishedAt"].tzinfo is not None for article in articles))

        primeArticle = next(article for article in articles if article["slug"] == "prime-number-research-2024")
        self.assertTrue(primeArticle["bodyMarkdown"].startswith("## 23rd of October, 2024"))
        self.assertNotIn("bodyMarkdownPath", primeArticle)
        self.assertIn("/article/ai-agents-research-2024", primeArticle["bodyMarkdown"])
        self.assertEqual(primeArticle["seedVersion"], "2026-07-17-prime-markdown-v1")

    def testReseedTokenIsValidated(self) -> None:
        with TemporaryDirectory() as directory:
            tokenPath = Path(directory) / "reseed.once"
            tokenPath.write_text("20260711-canonical-articles-v1\n")
            self.assertEqual(loadReseedToken(tokenPath), "20260711-canonical-articles-v1")

            tokenPath.write_text("../../unsafe")
            with self.assertRaises(ValueError):
                loadReseedToken(tokenPath)


class ReseedArticlesTest(unittest.IsolatedAsyncioTestCase):
    async def testReseedReplacesArticlesAndClearsTransientCollections(self) -> None:
        database = FakeDatabase()

        summary = await reseedArticles(database)

        self.assertEqual(
            summary,
            {
                "articlesDeleted": 13,
                "articlesInserted": 10,
                "articleViewsDeleted": 4,
                "adminSessionsDeleted": 2,
            },
        )
        self.assertEqual(len(database.articles.insertedDocuments), 10)


class VersionedSeedArticleTest(unittest.IsolatedAsyncioTestCase):
    async def testVersionedArticleSyncUpdatesOnlyTheTargetAndKeepsABackup(self) -> None:
        database = FakeArticleSyncDatabase()

        self.assertEqual(await syncVersionedSeedArticles(database), 1)

        article = database.articles.documents["prime-article"]
        self.assertEqual(article["title"], "Jack Hales Prime Number Research Journal - 2024")
        self.assertTrue(article["bodyMarkdown"].startswith("## 23rd of October, 2024"))
        self.assertEqual(article["createdAt"], datetime(2024, 10, 23, tzinfo=UTC))

        operationId = "article:prime-number-research-2024:2026-07-17-prime-markdown-v1"
        backup = database.maintenanceBackups.documents[operationId]
        self.assertEqual(backup["collections"]["articles"][0]["bodyMarkdown"], "Flattened legacy body")
        self.assertEqual(database.maintenanceRuns.documents[operationId]["status"], "completed")

        self.assertEqual(await syncVersionedSeedArticles(database), 0)


if __name__ == "__main__":
    unittest.main()
