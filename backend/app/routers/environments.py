from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.models import Environment, EnvironmentVariable
from app.schemas import (
    EnvironmentCreate, EnvironmentUpdate, EnvironmentResponse,
    EnvironmentVariableCreate, EnvironmentVariableUpdate, EnvironmentVariableResponse
)

router = APIRouter(tags=["Environments"])

@router.get("/api/environments", response_model=List[EnvironmentResponse])
async def list_environments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Environment).options(selectinload(Environment.variables))
    )
    return result.scalars().unique().all()

@router.post("/api/environments", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
async def create_environment(env: EnvironmentCreate, db: AsyncSession = Depends(get_db)):
    if env.is_active:
        # Deactivate all other environments
        await db.execute(update(Environment).values(is_active=False))
        
    new_env = Environment(**env.model_dump())
    db.add(new_env)
    await db.commit()
    
    result = await db.execute(select(Environment).filter(Environment.id == new_env.id).options(selectinload(Environment.variables)))
    return result.scalars().first()

@router.put("/api/environments/{id}", response_model=EnvironmentResponse)
async def update_environment(id: int, env: EnvironmentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Environment).filter(Environment.id == id))
    db_env = result.scalars().first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    update_data = env.model_dump(exclude_unset=True)
    
    if update_data.get("is_active") is True:
        # Deactivate all other environments
        await db.execute(update(Environment).filter(Environment.id != id).values(is_active=False))
        
    for key, value in update_data.items():
        setattr(db_env, key, value)
        
    await db.commit()
    
    result = await db.execute(select(Environment).filter(Environment.id == id).options(selectinload(Environment.variables)))
    return result.scalars().first()

@router.delete("/api/environments/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_environment(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Environment).filter(Environment.id == id))
    db_env = result.scalars().first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment not found")
        
    await db.delete(db_env)
    await db.commit()
    return None

@router.post("/api/environments/{id}/variables", response_model=EnvironmentVariableResponse, status_code=status.HTTP_201_CREATED)
async def create_variable(id: int, var: EnvironmentVariableCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Environment).filter(Environment.id == id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Environment not found")
        
    new_var = EnvironmentVariable(**var.model_dump(), environment_id=id)
    db.add(new_var)
    await db.commit()
    await db.refresh(new_var)
    return new_var

@router.put("/api/environments/variables/{var_id}", response_model=EnvironmentVariableResponse)
async def update_variable(var_id: int, var: EnvironmentVariableUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnvironmentVariable).filter(EnvironmentVariable.id == var_id))
    db_var = result.scalars().first()
    if not db_var:
        raise HTTPException(status_code=404, detail="Variable not found")
        
    update_data = var.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_var, key, value)
        
    await db.commit()
    await db.refresh(db_var)
    return db_var

@router.delete("/api/environments/variables/{var_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_variable(var_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnvironmentVariable).filter(EnvironmentVariable.id == var_id))
    db_var = result.scalars().first()
    if not db_var:
        raise HTTPException(status_code=404, detail="Variable not found")
        
    await db.delete(db_var)
    await db.commit()
    return None
