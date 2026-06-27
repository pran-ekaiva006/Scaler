from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Any

from app.database import get_db
from app.models import History

router = APIRouter(prefix="/api/history", tags=["History"])


# --- Schemas ---

class HistoryResponse(BaseModel):
    id: int
    request_id: Optional[int] = None
    name: str
    method: str
    url: str
    params: Optional[Any] = None
    headers: Optional[Any] = None
    body_type: Optional[str] = None
    body: Optional[Any] = None
    auth_type: Optional[str] = None
    auth: Optional[Any] = None
    response_status: Optional[int] = None
    response_headers: Optional[Any] = None
    response_body: Optional[str] = None
    response_time_ms: Optional[int] = None
    response_size_bytes: Optional[int] = None
    error: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class HistoryListResponse(BaseModel):
    items: List[HistoryResponse]
    total: int
    limit: int
    offset: int


# --- Endpoints ---

@router.get("", response_model=HistoryListResponse)
async def list_history(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    # Get total count
    count_result = await db.execute(select(func.count(History.id)))
    total = count_result.scalar() or 0

    # Get paginated results, most recent first
    result = await db.execute(
        select(History)
        .order_by(History.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    items = result.scalars().all()

    return HistoryListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/{id}", response_model=HistoryResponse)
async def get_history(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(History).filter(History.id == id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    return entry


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(History).filter(History.id == id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    await db.delete(entry)
    await db.commit()
    return None


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(History))
    await db.commit()
    return None
