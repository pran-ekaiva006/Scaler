"""
Proxy router — POST /api/proxy/send
The core endpoint: resolves variables, fires the real HTTP request,
saves history, and returns the result.
"""

import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Environment, EnvironmentVariable, History
from app.schemas import ProxySendRequest, ProxyResponse
from app.services.variable_resolver import resolve_request
from app.services.http_runner import execute_request

router = APIRouter(prefix="/api/proxy", tags=["Proxy"])


@router.post("/send", response_model=ProxyResponse)
async def send_request(req: ProxySendRequest, db: AsyncSession = Depends(get_db)):
    """
    Core proxy endpoint:
    1. Load environment variables if environment_id is set
    2. Resolve {{var}} placeholders
    3. Execute the real HTTP request
    4. Persist a History row
    5. Return the result
    """

    # 1. Load environment variables
    variables: dict[str, str] = {}
    if req.environment_id:
        result = await db.execute(
            select(Environment)
            .filter(Environment.id == req.environment_id)
            .options(selectinload(Environment.variables))
        )
        env = result.scalars().first()
        if env:
            for var in env.variables:
                if var.enabled:
                    variables[var.key] = var.value

    # 2. Resolve variables across the request
    body_for_resolver = req.body.model_dump() if req.body else None
    resolved = resolve_request(
        method=req.method,
        url=req.url,
        params=req.params or [],
        headers=req.headers or [],
        body=body_for_resolver,
        body_type=req.body_type,
        auth=req.auth,
        auth_type=req.auth_type,
        variables=variables,
    )

    # 3. Execute the real HTTP request
    result = await execute_request(
        method=resolved["method"],
        url=resolved["url"],
        params=resolved["params"],
        headers=resolved["headers"],
        body=resolved["body"],
        body_type=resolved["body_type"],
        auth=resolved["auth"],
        auth_type=resolved["auth_type"],
    )

    # 4. Persist History row
    is_error = "error" in result
    history = History(
        request_id=req.request_id,
        name=f"{resolved['method'].upper()} {resolved['url']}",
        method=resolved["method"].upper(),
        url=resolved["url"],
        params=resolved["params"],
        headers=resolved["headers"],
        body_type=resolved["body_type"],
        body=resolved["body"],
        auth_type=resolved["auth_type"],
        auth=resolved["auth"],
        response_status=result.get("status"),
        response_headers=result.get("headers"),
        response_body=result.get("body"),
        response_time_ms=result.get("time_ms", 0),
        response_size_bytes=result.get("size_bytes"),
        error=f"{result.get('error')}: {result.get('message')}" if is_error else None,
    )
    db.add(history)
    await db.commit()
    await db.refresh(history)

    # 5. Return response
    return ProxyResponse(
        status=result.get("status"),
        headers=result.get("headers"),
        body=result.get("body"),
        time_ms=result.get("time_ms", 0),
        size_bytes=result.get("size_bytes"),
        is_json=result.get("is_json"),
        error=result.get("error"),
        message=result.get("message"),
        history_id=history.id,
    )
