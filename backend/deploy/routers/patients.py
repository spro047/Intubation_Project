from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime, timezone
from ..database import get_db
from ..auth import get_current_user, require_role
from ..schemas import PatientCreate, PatientOut
import uuid

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("", response_model=PatientOut, status_code=201)
async def create_patient(data: PatientCreate, user: dict = Depends(require_role("doctor"))):
    db = get_db()
    existing = await db.patients.find_one({"patient_id": data.patient_id})
    if existing:
        raise HTTPException(status_code=409, detail="Patient already exists")
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = None
    await db.patients.insert_one(doc)
    doc.pop("_id", None)
    return PatientOut(**doc)


@router.get("", response_model=List[PatientOut])
async def list_patients(
    skip: int = 0, limit: int = 50, user: dict = Depends(get_current_user)
):
    db = get_db()
    cursor = db.patients.find({}, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
    return [PatientOut(**doc) async for doc in cursor]


@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.patients.find_one({"patient_id": patient_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientOut(**doc)


@router.put("/{patient_id}", response_model=PatientOut)
async def update_patient(
    patient_id: str, data: PatientCreate, user: dict = Depends(require_role("doctor"))
):
    db = get_db()
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc)
    result = await db.patients.update_one(
        {"patient_id": patient_id}, {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    doc = await db.patients.find_one({"patient_id": patient_id}, {"_id": 0})
    return PatientOut(**doc)


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(patient_id: str, user: dict = Depends(require_role("admin"))):
    db = get_db()
    result = await db.patients.delete_one({"patient_id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    await db.predictions.delete_many({"patient_id": patient_id})
