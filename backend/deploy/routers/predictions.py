from fastapi import APIRouter, HTTPException, Depends
from pathlib import Path
from typing import List
from datetime import datetime, timezone
import torch
import pandas as pd
import numpy as np
import joblib
from bson import ObjectId
from bson.errors import InvalidId

from ..database import get_db
from ..auth import get_current_user, require_role
from ..schemas import PredictionInput, PredictionOut, LLMReportOut
from ..model_loader import predict_tabular
from ..llm_assistant import generate_clinical_summary, generate_recommendations
from backend.data.preprocessing import CATEGORICAL_COLS, NUMERICAL_COLS

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

_scaler = None


def _get_scaler():
    global _scaler
    if _scaler is None:
        path = Path(__file__).resolve().parent.parent.parent.parent / "checkpoints" / "tabular_scaler.pkl"
        if path.exists():
            _scaler = joblib.load(path)
    return _scaler


def _prepare_input(data: PredictionInput):
    df = pd.DataFrame([{
        "Age": data.age,
        "BMI": data.bmi,
        "Neck_Circumference_cm": data.neck_circumference,
        "Mouth_Opening_mm": data.mouth_opening,
        "Thyromental_Distance_TMD_cm": data.tmd,
        "Sternomental_Distance_SMD_cm": data.smd,
        "Neck_Movement_Degrees": data.neck_movement,
    }])
    scaler = _get_scaler()
    if scaler is not None:
        df[NUMERICAL_COLS] = scaler.transform(df[NUMERICAL_COLS])
    numerical = torch.tensor(df[NUMERICAL_COLS].values, dtype=torch.float32)
    cat_values = {
        "Gender": 1 if data.gender.lower() == "male" else 0,
        "Mallampati_Score": max(0, min(3, int(data.mallampati_score) - 1)),
    }
    categorical = []
    for col in CATEGORICAL_COLS:
        val = cat_values.get(col, 0)
        categorical.append(torch.tensor([val], dtype=torch.long))
    return numerical, categorical


@router.post("")
async def run_prediction(
    data: PredictionInput, user: dict = Depends(require_role("doctor"))
):
    db = get_db()
    patient = await db.patients.find_one({"patient_id": data.patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    numerical, categorical = _prepare_input(data)
    result = predict_tabular(numerical, categorical)

    prob_score = result["probabilities"]
    weighted = (0 * prob_score.get("Easy", 0) + 50 * prob_score.get("Moderate", 0) + 100 * prob_score.get("Difficult", 0))
    risk_score = round(weighted / 100, 3)

    pred_doc = {
        "patient_id": data.patient_id,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "risk_score": risk_score,
        "created_at": datetime.now(timezone.utc),
    }
    insert_result = await db.predictions.insert_one(pred_doc)
    pred_doc["id"] = str(insert_result.inserted_id)
    pred_doc.pop("_id", None)

    patient_data = data.model_dump()
    summary = generate_clinical_summary(
        result["prediction"], result["confidence"], result["probabilities"], patient_data
    )
    recommendations = generate_recommendations(
        result["prediction"], result["confidence"], result["probabilities"], patient_data
    )

    llm_doc = {
        "prediction_id": pred_doc["id"],
        "summary": summary or "",
        "recommendations": recommendations or "",
        "created_at": datetime.now(timezone.utc),
    }
    await db.llm_reports.insert_one(llm_doc)
    llm_doc.pop("_id", None)

    return {
        "prediction": pred_doc,
        "clinical_summary": summary,
        "recommendations": recommendations,
    }


@router.get("", response_model=List[PredictionOut])
async def list_predictions(
    patient_id: str = None, skip: int = 0, limit: int = 50,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    cursor = db.predictions.find(query).skip(skip).limit(limit).sort("created_at", -1)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(PredictionOut(**doc))
    return results


@router.get("/{prediction_id}/report", response_model=LLMReportOut)
async def get_llm_report(prediction_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.llm_reports.find_one({"prediction_id": prediction_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    return LLMReportOut(**doc)


@router.delete("/{prediction_id}", status_code=204)
async def delete_prediction(
    prediction_id: str, user: dict = Depends(require_role("admin"))
):
    db = get_db()
    try:
        oid = ObjectId(prediction_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid prediction id")
    pred = await db.predictions.delete_one({"_id": oid})
    if pred.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")
    await db.llm_reports.delete_one({"prediction_id": prediction_id})
    return None


@router.get("/export/csv")
async def export_csv(user: dict = Depends(require_role("doctor"))):
    from fastapi.responses import StreamingResponse
    import io, csv

    db = get_db()
    cursor = db.predictions.find({}, {"_id": 0}).sort("created_at", -1)
    rows = await cursor.to_list(length=10000)

    output = io.StringIO()
    writer = csv.writer(output)
    if rows:
        writer.writerow(rows[0].keys())
        for row in rows:
            writer.writerow(row.values())
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictions.csv"},
    )
