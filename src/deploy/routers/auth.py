from fastapi import APIRouter, HTTPException, Depends, status
from ..auth import hash_password, verify_password, create_access_token, get_current_user, require_role
from ..database import get_db
from ..schemas import UserCreate, UserOut, TokenOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    doc = user.model_dump()
    doc["hashed_password"] = hash_password(user.password)
    doc.pop("password")
    await db.users.insert_one(doc)
    return {"message": "User created", "username": user.username}


@router.post("/login", response_model=TokenOut)
async def login(user: UserCreate):
    db = get_db()
    doc = await db.users.find_one({"username": user.username})
    if not doc or not verify_password(user.password, doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username, "role": doc["role"]})
    return TokenOut(access_token=token, user=UserOut(username=user.username, role=doc["role"]))


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(username=current_user["sub"], role=current_user["role"])
