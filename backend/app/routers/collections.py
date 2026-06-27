from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.models import Collection, Folder, Request
from app.schemas import CollectionCreate, CollectionUpdate, CollectionResponse

router = APIRouter(prefix="/api/collections", tags=["Collections"])

@router.get("", response_model=List[CollectionResponse])
async def list_collections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Collection).options(
            selectinload(Collection.folders).selectinload(Folder.requests),
            selectinload(Collection.requests)
        )
    )
    return result.scalars().unique().all()

@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(collection: CollectionCreate, db: AsyncSession = Depends(get_db)):
    new_col = Collection(**collection.model_dump())
    db.add(new_col)
    await db.commit()
    await db.refresh(new_col)
    
    # Eager load relationships for the response
    result = await db.execute(select(Collection).filter(Collection.id == new_col.id).options(
        selectinload(Collection.folders).selectinload(Folder.requests),
        selectinload(Collection.requests)
    ))
    return result.scalars().first()

@router.put("/{id}", response_model=CollectionResponse)
async def update_collection(id: int, collection: CollectionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).filter(Collection.id == id).options(
        selectinload(Collection.folders).selectinload(Folder.requests),
        selectinload(Collection.requests)
    ))
    db_col = result.scalars().first()
    if not db_col:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    update_data = collection.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_col, key, value)
        
    await db.commit()
    
    # Fetch again with relationships
    result = await db.execute(select(Collection).filter(Collection.id == id).options(
        selectinload(Collection.folders).selectinload(Folder.requests),
        selectinload(Collection.requests)
    ))
    return result.scalars().first()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).filter(Collection.id == id))
    db_col = result.scalars().first()
    if not db_col:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    await db.delete(db_col)
    await db.commit()
    return None
