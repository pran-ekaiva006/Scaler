from pydantic import BaseModel, ConfigDict, model_validator
from typing import List, Optional, Any
from datetime import datetime

# --- Request ---

class RequestBase(BaseModel):
    name: str
    method: str
    url: str
    params: Optional[List[dict]] = []
    headers: Optional[List[dict]] = []
    body_type: Optional[str] = None
    body: Optional[Any] = None
    auth_type: Optional[str] = None
    auth: Optional[Any] = None
    folder_id: Optional[int] = None
    order_index: Optional[int] = 0

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    name: Optional[str] = None
    method: Optional[str] = None
    url: Optional[str] = None
    params: Optional[List[dict]] = None
    headers: Optional[List[dict]] = None
    body_type: Optional[str] = None
    body: Optional[Any] = None
    auth_type: Optional[str] = None
    auth: Optional[Any] = None
    folder_id: Optional[int] = None
    order_index: Optional[int] = None

class RequestResponse(RequestBase):
    id: int
    collection_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Folder ---

class FolderBase(BaseModel):
    name: str
    order_index: Optional[int] = 0

class FolderCreate(FolderBase):
    pass

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    order_index: Optional[int] = None

class FolderResponse(FolderBase):
    id: int
    collection_id: int
    created_at: datetime
    requests: List[RequestResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- Collection ---

class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CollectionResponse(CollectionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    folders: List[FolderResponse] = []
    requests: List[RequestResponse] = []
    
    @model_validator(mode="after")
    def filter_root_requests(self) -> "CollectionResponse":
        self.requests = [req for req in self.requests if req.folder_id is None]
        return self
        
    model_config = ConfigDict(from_attributes=True)
