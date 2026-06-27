from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Folder, Collection
from app.schemas import FolderCreate, FolderUpdate, FolderResponse

router = APIRouter(tags=["Folders"])

@router.post("/api/collections/{collection_id}/folders", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(collection_id: int, folder: FolderCreate, db: AsyncSession = Depends(get_db)):
    # Verify collection exists
    result = await db.execute(select(Collection).filter(Collection.id == collection_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Collection not found")
        
    new_folder = Folder(**folder.model_dump(), collection_id=collection_id)
    db.add(new_folder)
    await db.commit()
    
    result = await db.execute(select(Folder).filter(Folder.id == new_folder.id).options(selectinload(Folder.requests)))
    return result.scalars().first()

@router.put("/api/folders/{id}", response_model=FolderResponse)
async def update_folder(id: int, folder: FolderUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Folder).filter(Folder.id == id).options(selectinload(Folder.requests)))
    db_folder = result.scalars().first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    update_data = folder.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_folder, key, value)
        
    await db.commit()
    
    result = await db.execute(select(Folder).filter(Folder.id == id).options(selectinload(Folder.requests)))
    return result.scalars().first()

@router.delete("/api/folders/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Folder).filter(Folder.id == id))
    db_folder = result.scalars().first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
        
    await db.delete(db_folder)
    await db.commit()
    return None
