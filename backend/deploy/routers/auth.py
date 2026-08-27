import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException

from ..auth import create_access_token, get_current_user, hash_password, verify_password
from ..database import get_db
from ..schemas import TokenOut, UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ponytail: in-memory login throttle (per-process). Move to a shared store if running multiple workers.
_MAX_FAILED = 5
_WINDOW_SECONDS = 900
_failed_attempts = defaultdict(list)


def _too_many_attempts(email: str) -> bool:
    now = time.time()
    recent = [t for t in _failed_attempts[email] if now - t < _WINDOW_SECONDS]
    _failed_attempts[email] = recent
    return len(recent) >= _MAX_FAILED


@router.post("/register", status_code=201)
async def register(user: UserCreate):
    db = get_db()
    email = user.email.strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    doc = user.model_dump(exclude={"password"})
    doc["email"] = email
    doc["role"] = "doctor"  # registration never grants admin
    doc["hashed_password"] = hash_password(user.password)
    await db.users.insert_one(doc)
    return {"message": "User created", "email": email}


@router.post("/login", response_model=TokenOut)
async def login(user: UserCreate):
    db = get_db()
    email = user.email.strip().lower()
    if _too_many_attempts(email):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")
    doc = await db.users.find_one({"email": email})
    if not doc or not verify_password(user.password, doc["hashed_password"]):
        _failed_attempts[email].append(time.time())
        raise HTTPException(status_code=401, detail="Invalid credentials")
    _failed_attempts.pop(email, None)
    token = create_access_token({"sub": email, "role": doc["role"]})
    return TokenOut(access_token=token, user=UserOut(email=email, role=doc["role"]))


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(email=current_user["sub"], role=current_user["role"])
