from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Request, Collection, Folder
from app.schemas import RequestCreate, RequestUpdate, RequestResponse

router = APIRouter(tags=["Requests"])

@router.post("/api/collections/{collection_id}/requests", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(collection_id: int, req: RequestCreate, db: AsyncSession = Depends(get_db)):
    # Verify collection exists
    col_result = await db.execute(select(Collection).filter(Collection.id == collection_id))
    if not col_result.scalars().first():
        raise HTTPException(status_code=404, detail="Collection not found")
        
    # Verify folder exists if provided and belongs to the collection
    if req.folder_id is not None:
        folder_result = await db.execute(select(Folder).filter(Folder.id == req.folder_id))
        folder = folder_result.scalars().first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        if folder.collection_id != collection_id:
            raise HTTPException(status_code=400, detail="Folder does not belong to this collection")

    new_req = Request(**req.model_dump(), collection_id=collection_id)
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)
    return new_req

@router.get("/api/requests/{id}", response_model=RequestResponse)
async def get_request(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Request).filter(Request.id == id))
    db_req = result.scalars().first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_req

@router.put("/api/requests/{id}", response_model=RequestResponse)
async def update_request(id: int, req: RequestUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Request).filter(Request.id == id))
    db_req = result.scalars().first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    update_data = req.model_dump(exclude_unset=True)
    
    # If folder_id is being updated, verify it exists and belongs to the same collection
    if "folder_id" in update_data and update_data["folder_id"] is not None:
        folder_result = await db.execute(select(Folder).filter(Folder.id == update_data["folder_id"]))
        folder = folder_result.scalars().first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        if folder.collection_id != db_req.collection_id:
            raise HTTPException(status_code=400, detail="Folder does not belong to this collection")
            
    for key, value in update_data.items():
        setattr(db_req, key, value)
        
    await db.commit()
    await db.refresh(db_req)
    return db_req

@router.delete("/api/requests/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Request).filter(Request.id == id))
    db_req = result.scalars().first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    await db.delete(db_req)
    await db.commit()
    return None
