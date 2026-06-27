from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    folders: Mapped[List["Folder"]] = relationship("Folder", back_populates="collection", cascade="all, delete-orphan")
    requests: Mapped[List["Request"]] = relationship("Request", back_populates="collection", cascade="all, delete-orphan")


class Folder(Base):
    __tablename__ = "folders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    collection_id: Mapped[int] = mapped_column(ForeignKey("collections.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, server_default=func.now())

    collection: Mapped["Collection"] = relationship("Collection", back_populates="folders")
    requests: Mapped[List["Request"]] = relationship("Request", back_populates="folder", cascade="all, delete-orphan")


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    collection_id: Mapped[Optional[int]] = mapped_column(ForeignKey("collections.id", ondelete="CASCADE"), nullable=True)
    folder_id: Mapped[Optional[int]] = mapped_column(ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    method: Mapped[str] = mapped_column(String(10))
    url: Mapped[str] = mapped_column(String(2048))
    params: Mapped[list] = mapped_column(JSON, default=list)
    headers: Mapped[list] = mapped_column(JSON, default=list)
    body_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    body: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    auth_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    auth: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    collection: Mapped[Optional["Collection"]] = relationship("Collection", back_populates="requests")
    folder: Mapped[Optional["Folder"]] = relationship("Folder", back_populates="requests")
    history: Mapped[List["History"]] = relationship("History", back_populates="request", cascade="all, delete-orphan")


class Environment(Base):
    __tablename__ = "environments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    variables: Mapped[List["EnvironmentVariable"]] = relationship("EnvironmentVariable", back_populates="environment", cascade="all, delete-orphan")


class EnvironmentVariable(Base):
    __tablename__ = "environment_variables"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    environment_id: Mapped[int] = mapped_column(ForeignKey("environments.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(255))
    value: Mapped[str] = mapped_column(Text)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    environment: Mapped["Environment"] = relationship("Environment", back_populates="variables")


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[Optional[int]] = mapped_column(ForeignKey("requests.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    method: Mapped[str] = mapped_column(String(10))
    url: Mapped[str] = mapped_column(String(2048))
    params: Mapped[list] = mapped_column(JSON, nullable=True)
    headers: Mapped[list] = mapped_column(JSON, nullable=True)
    body_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    body: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    auth_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    auth: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    response_status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    response_headers: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    response_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    response_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, server_default=func.now())

    request: Mapped[Optional["Request"]] = relationship("Request", back_populates="history")
