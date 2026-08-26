from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..config import settings
from ..llm_assistant import check_llm_connection

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.get("/status")
async def llm_status(_: dict = Depends(get_current_user)):
    connected, latency_ms = check_llm_connection()
    return {
        "connected": connected,
        "model": settings.llm_model,
        "latency_ms": latency_ms,
    }