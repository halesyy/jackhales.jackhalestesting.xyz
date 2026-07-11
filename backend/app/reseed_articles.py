import argparse
import asyncio
import json

from bson import json_util

from .database import closeClient, ensureIndexes, getDatabase
from .seeding import backupCollections, reseedArticles


async def run(command: str) -> None:
    database = getDatabase()
    try:
        if command == "backup":
            print(json_util.dumps(await backupCollections(database)))
            return

        summary = await reseedArticles(database)
        await ensureIndexes()
        print(json.dumps(summary, sort_keys=True))
    finally:
        await closeClient()


def main() -> None:
    parser = argparse.ArgumentParser(description="Back up or reseed the Jack Hales article collections.")
    parser.add_argument("command", choices=("backup", "apply"))
    arguments = parser.parse_args()
    asyncio.run(run(arguments.command))


if __name__ == "__main__":
    main()
