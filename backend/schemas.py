from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# Auth
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Products
class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int
    icon: str

    model_config = {"from_attributes": True}


# Comments
class CommentCreate(BaseModel):
    content: str
    rating: int = 5


class CommentOut(BaseModel):
    id: int
    product_id: int
    user_id: int
    content: str
    rating: int
    created_at: datetime
    username: Optional[str] = None

    model_config = {"from_attributes": True}


# Chat
class ChatRequest(BaseModel):
    message: str
    session_id: str
    product_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    tools_called: List[dict] = []
    attack_type: Optional[str] = None
    defense_active: bool = False


# User update
class EmailUpdate(BaseModel):
    new_email: EmailStr


class PasswordReset(BaseModel):
    new_password: str


# Admin
class SQLQuery(BaseModel):
    query: str


# Chat log
class ChatLogOut(BaseModel):
    id: int
    session_id: str
    user_id: Optional[int]
    user_message: str
    system_prompt: Optional[str]
    context_injected: Optional[str]
    llm_response: Optional[str]
    tools_called: Optional[Any]
    attack_type: Optional[str]
    defense_active: bool = False
    timestamp: datetime

    model_config = {"from_attributes": True}
