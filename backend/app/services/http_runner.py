"""
HTTP Runner service.
Executes real outbound HTTP requests via httpx, measures timing,
captures responses, and handles errors gracefully.
"""

import time
import json
from typing import Any, Optional

import httpx

DEFAULT_TIMEOUT = 15.0  # seconds


async def execute_request(
    method: str,
    url: str,
    params: list[dict],
    headers: list[dict],
    body: Any,
    body_type: Optional[str],
    auth: Any,
    auth_type: Optional[str],
    timeout: float = DEFAULT_TIMEOUT,
) -> dict:
    """
    Execute a real HTTP request and return the result.
    
    Returns dict with either:
      Success: {status, headers, body, time_ms, size_bytes, is_json}
      Failure: {error, message, time_ms}
    """
    # Build query params from enabled entries
    query_params = {}
    for p in (params or []):
        if p.get("enabled", True) and p.get("key"):
            query_params[p["key"]] = p.get("value", "")

    # Build headers from enabled entries
    request_headers = {}
    for h in (headers or []):
        if h.get("enabled", True) and h.get("key"):
            request_headers[h["key"]] = h.get("value", "")

    # Build auth
    httpx_auth = None
    if auth_type == "bearer" and auth:
        token = auth.get("token", "")
        request_headers["Authorization"] = f"Bearer {token}"
    elif auth_type == "basic" and auth:
        username = auth.get("username", "")
        password = auth.get("password", "")
        httpx_auth = httpx.BasicAuth(username, password)

    # Build body/content
    content = None
    data = None
    json_data = None
    files = None

    if body_type == "raw" and body:
        raw_content = body.get("raw_content", "") if isinstance(body, dict) else str(body)
        raw_content_type = body.get("raw_content_type", "text") if isinstance(body, dict) else "text"

        if raw_content_type == "json":
            # Set Content-Type if user hasn't already
            if "Content-Type" not in request_headers and "content-type" not in request_headers:
                request_headers["Content-Type"] = "application/json"
            # Try to parse as actual JSON for httpx
            try:
                json_data = json.loads(raw_content)
            except (json.JSONDecodeError, TypeError):
                content = raw_content
        else:
            if "Content-Type" not in request_headers and "content-type" not in request_headers:
                request_headers["Content-Type"] = "text/plain"
            content = raw_content

    elif body_type == "form-data" and body:
        form_items = body.get("form_data", []) if isinstance(body, dict) else body if isinstance(body, list) else []
        # For multipart form data, use files parameter
        files = []
        for item in form_items:
            if item.get("enabled", True) and item.get("key"):
                files.append((item["key"], (None, item.get("value", ""))))

    elif body_type == "x-www-form-urlencoded" and body:
        form_items = body.get("form_data", []) if isinstance(body, dict) else body if isinstance(body, list) else []
        data = {}
        for item in form_items:
            if item.get("enabled", True) and item.get("key"):
                data[item["key"]] = item.get("value", "")

    # Validate URL before sending
    if not url or not url.startswith(("http://", "https://")):
        return {
            "error": "invalid_url",
            "message": f"Invalid URL: '{url}'. URL must start with http:// or https://",
            "time_ms": 0,
        }

    # Execute the request
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.request(
                method=method.upper(),
                url=url,
                params=query_params if query_params else None,
                headers=request_headers if request_headers else None,
                content=content,
                data=data if data else None,
                json=json_data,
                files=files if files else None,
                auth=httpx_auth,
            )
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        # Capture response
        response_body = response.text
        response_size = len(response.content)

        # Check if response is JSON
        is_json = False
        try:
            json.loads(response_body)
            is_json = True
        except (json.JSONDecodeError, ValueError):
            pass

        # Convert response headers to a simple dict
        response_headers = dict(response.headers)

        return {
            "status": response.status_code,
            "headers": response_headers,
            "body": response_body,
            "time_ms": elapsed_ms,
            "size_bytes": response_size,
            "is_json": is_json,
        }

    except httpx.TimeoutException:
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return {
            "error": "timeout",
            "message": f"Request timed out after {timeout}s",
            "time_ms": elapsed_ms,
        }

    except httpx.ConnectError as e:
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return {
            "error": "connection_failed",
            "message": f"Could not connect to the server: {str(e)}",
            "time_ms": elapsed_ms,
        }

    except httpx.RequestError as e:
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return {
            "error": "request_error",
            "message": f"Request failed: {str(e)}",
            "time_ms": elapsed_ms,
        }
