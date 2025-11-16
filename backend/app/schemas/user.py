from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models import UserRole


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[UserRole] = UserRole.USER
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserChangePassword(BaseModel):
    old_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str

# Made with Bob
