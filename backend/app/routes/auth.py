from fastapi import APIRouter, Depends, HTTPException

from app.db import db
from app.core.utils import create_access_token, get_current_user, get_password_hash, verify_password
from app.models.user import Token, User, UserCreate, UserLogin, UserResponse
import uuid

api_router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@api_router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        is_admin=False
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)
    )

@api_router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user_obj = User(**user)
    access_token = create_access_token(data={"sub": user_obj.id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(id=user_obj.id, name=user_obj.name, email=user_obj.email, is_admin=user_obj.is_admin)
    )

@api_router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=current_user.id, name=current_user.name, email=current_user.email, is_admin=current_user.is_admin)