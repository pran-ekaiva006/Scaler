"""
Variable resolver service.
Replaces {{key}} placeholders in request fields with environment variable values.
Unresolved variables (key not found) are left as-is so the user can see what's missing.
"""

import re
from typing import Any, Optional

# Matches {{variable_name}} — captures the key inside the braces
_VAR_PATTERN = re.compile(r"\{\{(\w+)\}\}")


def resolve(text: str, variables: dict[str, str]) -> str:
    """
    Replace every {{key}} in `text` with variables[key].
    If key is not found, leave {{key}} untouched.
    """
    def _replacer(match: re.Match) -> str:
        key = match.group(1)
        return variables.get(key, match.group(0))  # keep original if missing

    return _VAR_PATTERN.sub(_replacer, text)


def _resolve_value(value: Any, variables: dict[str, str]) -> Any:
    """Resolve a single value — only processes strings."""
    if isinstance(value, str):
        return resolve(value, variables)
    return value


def _resolve_kv_list(items: list[dict], variables: dict[str, str]) -> list[dict]:
    """Resolve the 'value' field in a list of {key, value, enabled} dicts."""
    resolved = []
    for item in items:
        new_item = dict(item)  # shallow copy
        if "value" in new_item:
            new_item["value"] = _resolve_value(new_item["value"], variables)
        resolved.append(new_item)
    return resolved


def _resolve_body(body: Any, body_type: Optional[str], variables: dict[str, str]) -> Any:
    """
    Resolve variables in the request body based on body_type.
    - raw / json: treat body as a string and resolve the whole thing
    - form-data / urlencoded: body is a list of {key, value} entries — resolve each value
    - otherwise: return as-is
    """
    if body is None:
        return body

    if body_type in ("raw", "json"):
        if isinstance(body, str):
            return resolve(body, variables)
        # If body is a dict (parsed JSON), convert to string, resolve, return string
        if isinstance(body, dict) and "content" in body:
            body["content"] = _resolve_value(body["content"], variables)
            return body
        return body

    if body_type in ("form-data", "urlencoded"):
        if isinstance(body, list):
            return _resolve_kv_list(body, variables)
        return body

    return body


def _resolve_auth(auth: Any, auth_type: Optional[str], variables: dict[str, str]) -> Any:
    """
    Resolve variables in auth config based on auth_type.
    - bearer: resolve the token string
    - basic: resolve username and password
    - api-key: resolve the value
    """
    if auth is None or auth_type is None:
        return auth

    auth = dict(auth) if isinstance(auth, dict) else auth

    if auth_type == "bearer":
        if isinstance(auth, dict) and "token" in auth:
            auth["token"] = _resolve_value(auth["token"], variables)

    elif auth_type == "basic":
        if isinstance(auth, dict):
            if "username" in auth:
                auth["username"] = _resolve_value(auth["username"], variables)
            if "password" in auth:
                auth["password"] = _resolve_value(auth["password"], variables)

    elif auth_type == "api-key":
        if isinstance(auth, dict) and "value" in auth:
            auth["value"] = _resolve_value(auth["value"], variables)

    return auth


def resolve_request(
    method: str,
    url: str,
    params: list[dict],
    headers: list[dict],
    body: Any,
    body_type: Optional[str],
    auth: Any,
    auth_type: Optional[str],
    variables: dict[str, str],
) -> dict:
    """
    Apply variable resolution to every field in a request.
    Returns a dict with the same shape but all {{var}} placeholders replaced.
    """
    return {
        "method": method,
        "url": resolve(url, variables),
        "params": _resolve_kv_list(params or [], variables),
        "headers": _resolve_kv_list(headers or [], variables),
        "body": _resolve_body(body, body_type, variables),
        "body_type": body_type,
        "auth": _resolve_auth(auth, auth_type, variables),
        "auth_type": auth_type,
    }
