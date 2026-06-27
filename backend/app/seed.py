"""
Seed script — populates the database with demo data.
Run manually:  python -m app.seed
Also called automatically on first startup if the DB is empty.
"""

import asyncio
import json
from datetime import datetime, timedelta
import random

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.database import AsyncSessionLocal, init_db
from app.models import Collection, Folder, Request, Environment, EnvironmentVariable, History


async def seed_database():
    """Wipe and re-seed the database with demo data."""
    async with AsyncSessionLocal() as db:
        # Wipe existing data
        for model in [History, EnvironmentVariable, Request, Folder, Environment, Collection]:
            result = await db.execute(select(model))
            for row in result.scalars().all():
                await db.delete(row)
        await db.commit()

        # ============================================================
        # COLLECTIONS & REQUESTS
        # ============================================================

        # --- Collection 1: JSONPlaceholder Demo ---
        col_jp = Collection(
            name="JSONPlaceholder Demo",
            description="Sample requests against jsonplaceholder.typicode.com — a free fake REST API for testing",
        )
        db.add(col_jp)
        await db.flush()

        folder_users = Folder(name="Users", collection_id=col_jp.id, order_index=0)
        folder_posts = Folder(name="Posts", collection_id=col_jp.id, order_index=1)
        db.add_all([folder_users, folder_posts])
        await db.flush()

        jp_requests = [
            Request(
                collection_id=col_jp.id, folder_id=folder_users.id,
                name="List Users", method="GET",
                url="https://jsonplaceholder.typicode.com/users",
                params=[], headers=[], order_index=0,
            ),
            Request(
                collection_id=col_jp.id, folder_id=folder_users.id,
                name="Get User by ID", method="GET",
                url="https://jsonplaceholder.typicode.com/users/1",
                params=[], headers=[], order_index=1,
            ),
            Request(
                collection_id=col_jp.id, folder_id=folder_posts.id,
                name="Create Post", method="POST",
                url="https://jsonplaceholder.typicode.com/posts",
                params=[],
                headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
                body_type="raw",
                body={"raw_content": json.dumps({"title": "foo", "body": "bar", "userId": 1}), "raw_content_type": "json"},
                order_index=0,
            ),
            Request(
                collection_id=col_jp.id, folder_id=folder_posts.id,
                name="Update Post", method="PUT",
                url="https://jsonplaceholder.typicode.com/posts/1",
                params=[],
                headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
                body_type="raw",
                body={"raw_content": json.dumps({"id": 1, "title": "updated", "body": "updated body", "userId": 1}), "raw_content_type": "json"},
                order_index=1,
            ),
            Request(
                collection_id=col_jp.id, folder_id=folder_posts.id,
                name="Delete Post", method="DELETE",
                url="https://jsonplaceholder.typicode.com/posts/1",
                params=[], headers=[], order_index=2,
            ),
        ]
        db.add_all(jp_requests)

        # --- Collection 2: HTTPBin Demo ---
        col_hb = Collection(
            name="HTTPBin Demo",
            description="Sample requests against httpbin.org — a simple HTTP request & response service",
        )
        db.add(col_hb)
        await db.flush()

        hb_requests = [
            Request(
                collection_id=col_hb.id,
                name="GET Request", method="GET",
                url="https://httpbin.org/get",
                params=[{"key": "foo", "value": "bar", "enabled": True}],
                headers=[], order_index=0,
            ),
            Request(
                collection_id=col_hb.id,
                name="POST JSON", method="POST",
                url="https://httpbin.org/post",
                params=[],
                headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
                body_type="raw",
                body={"raw_content": json.dumps({"message": "hello from postman clone"}), "raw_content_type": "json"},
                order_index=1,
            ),
            Request(
                collection_id=col_hb.id,
                name="Basic Auth Test", method="GET",
                url="https://httpbin.org/basic-auth/user/pass",
                params=[], headers=[],
                auth_type="basic",
                auth={"username": "user", "password": "pass"},
                order_index=2,
            ),
            Request(
                collection_id=col_hb.id,
                name="Status Codes", method="GET",
                url="https://httpbin.org/status/418",
                params=[], headers=[], order_index=3,
            ),
        ]
        db.add_all(hb_requests)

        # ============================================================
        # ENVIRONMENTS
        # ============================================================

        env_local = Environment(name="Local", is_active=False)
        env_prod = Environment(name="Production", is_active=True)
        db.add_all([env_local, env_prod])
        await db.flush()

        local_vars = [
            EnvironmentVariable(environment_id=env_local.id, key="base_url", value="http://localhost:8000", enabled=True, order_index=0),
            EnvironmentVariable(environment_id=env_local.id, key="api_key", value="dev-key-12345", enabled=True, order_index=1),
        ]
        prod_vars = [
            EnvironmentVariable(environment_id=env_prod.id, key="base_url", value="https://jsonplaceholder.typicode.com", enabled=True, order_index=0),
            EnvironmentVariable(environment_id=env_prod.id, key="api_key", value="prod-key-99999", enabled=True, order_index=1),
            EnvironmentVariable(environment_id=env_prod.id, key="auth_token", value="Bearer eyJhbGciOiJIUzI1NiJ9.demo", enabled=True, order_index=2),
        ]
        db.add_all(local_vars + prod_vars)

        # ============================================================
        # HISTORY (realistic-looking entries)
        # ============================================================

        now = datetime.utcnow()
        history_entries = [
            History(
                name="GET https://jsonplaceholder.typicode.com/users",
                method="GET",
                url="https://jsonplaceholder.typicode.com/users",
                params=[], headers=[],
                response_status=200,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body=json.dumps([
                    {"id": 1, "name": "Leanne Graham", "username": "Bret", "email": "Sincere@april.biz"},
                    {"id": 2, "name": "Ervin Howell", "username": "Antonette", "email": "Shanna@melissa.tv"},
                ]),
                response_time_ms=342,
                response_size_bytes=5645,
                created_at=now - timedelta(minutes=45),
            ),
            History(
                name="GET https://jsonplaceholder.typicode.com/users/1",
                method="GET",
                url="https://jsonplaceholder.typicode.com/users/1",
                params=[], headers=[],
                response_status=200,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body=json.dumps({
                    "id": 1, "name": "Leanne Graham", "username": "Bret",
                    "email": "Sincere@april.biz", "phone": "1-770-736-8031 x56442",
                }),
                response_time_ms=187,
                response_size_bytes=509,
                created_at=now - timedelta(minutes=30),
            ),
            History(
                name="POST https://jsonplaceholder.typicode.com/posts",
                method="POST",
                url="https://jsonplaceholder.typicode.com/posts",
                params=[],
                headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
                body_type="raw",
                body={"raw_content": json.dumps({"title": "foo", "body": "bar", "userId": 1})},
                response_status=201,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body=json.dumps({"id": 101, "title": "foo", "body": "bar", "userId": 1}),
                response_time_ms=523,
                response_size_bytes=82,
                created_at=now - timedelta(minutes=20),
            ),
            History(
                name="GET https://jsonplaceholder.typicode.com/users/999",
                method="GET",
                url="https://jsonplaceholder.typicode.com/users/999",
                params=[], headers=[],
                response_status=404,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body="{}",
                response_time_ms=156,
                response_size_bytes=2,
                created_at=now - timedelta(minutes=15),
            ),
            History(
                name="GET https://httpbin.org/get",
                method="GET",
                url="https://httpbin.org/get",
                params=[{"key": "foo", "value": "bar", "enabled": True}],
                headers=[],
                response_status=200,
                response_headers={"content-type": "application/json"},
                response_body=json.dumps({
                    "args": {"foo": "bar"},
                    "headers": {"Host": "httpbin.org", "Accept": "*/*"},
                    "origin": "203.0.113.42",
                    "url": "https://httpbin.org/get?foo=bar",
                }),
                response_time_ms=891,
                response_size_bytes=412,
                created_at=now - timedelta(minutes=10),
            ),
            History(
                name="GET https://this-does-not-exist-zzz.com",
                method="GET",
                url="https://this-does-not-exist-zzz.com",
                params=[], headers=[],
                error="connection_failed: Could not connect to the server",
                response_time_ms=2100,
                created_at=now - timedelta(minutes=5),
            ),
        ]
        db.add_all(history_entries)

        await db.commit()
        print("Database seeded successfully!")
        print(f"  - {len(jp_requests) + len(hb_requests)} requests across 2 collections")
        print(f"  - 2 environments ({len(local_vars)} + {len(prod_vars)} variables)")
        print(f"  - {len(history_entries)} history entries")


async def check_and_seed():
    """Check if the database is empty and seed if so."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(func.count(Collection.id)))
        count = result.scalar() or 0
        if count == 0:
            print("Empty database detected — seeding with demo data...")
            await seed_database()
        else:
            print(f"Database already has {count} collection(s), skipping seed.")


if __name__ == "__main__":
    asyncio.run(seed_database())
