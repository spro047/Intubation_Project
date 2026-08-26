from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import connect_db, close_db, ensure_indexes
from .model_loader import load_model
from .routers import auth, llm, patients, predictions


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await ensure_indexes()
    load_model()
    yield
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(llm.router)
app.include_router(patients.router)
app.include_router(predictions.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.app_version}
