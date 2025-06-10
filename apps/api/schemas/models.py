# API Models/Schemas for data validation using Pydantic

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Union, Any
from uuid import UUID

from pydantic import BaseModel, Field

# Element type enum
class ElementType(str, Enum):
    STICKY_NOTE = "sticky-note"
    SHAPE = "shape"
    TEXT = "text"
    CONNECTOR = "connector"
    IMAGE = "image"

# Base models
class PositionModel(BaseModel):
    x: float
    y: float

class SizeModel(BaseModel):
    width: float
    height: float

# Board schemas
class BoardBase(BaseModel):
    title: str
    description: Optional[str] = None

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BoardBase):
    title: Optional[str] = None

class BoardResponse(BoardBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    userId: str

    class Config:
        from_attributes = True

# Board Element schemas
class BoardElementBase(BaseModel):
    type: ElementType
    content: Dict[str, Any]
    position: PositionModel
    size: Optional[SizeModel] = None
    style: Optional[Dict[str, Any]] = None
    zIndex: int = 0

class BoardElementCreate(BoardElementBase):
    boardId: str

class BoardElementUpdate(BaseModel):
    content: Optional[Dict[str, Any]] = None
    position: Optional[PositionModel] = None
    size: Optional[SizeModel] = None
    style: Optional[Dict[str, Any]] = None
    zIndex: Optional[int] = None

class BoardElementResponse(BoardElementBase):
    id: str
    boardId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
