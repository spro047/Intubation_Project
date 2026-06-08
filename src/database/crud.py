# API service
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
import os

app = FastAPI(title="Airway DB API")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.airway_db


class PatientCreate(BaseModel):
    patient_id: str
    age: int
    gender: str
    bmi: float
    mallampati: str
    tmd: float
    neck_circumference: float
    comorbidities: Optional[dict] = None


class PredictionCreate(BaseModel):
    patient_id: str
    model_version: str
    predicted_class: str
    confidence: float
    probabilities: dict
    shap_values: Optional[dict] = None


@app.post("/patients")
async def create_patient(patient: PatientCreate):
    existing = await db.patients.find_one({"patient_id": patient.patient_id})
    if existing:
        return {"message": "Patient already exists", "patient_id": patient.patient_id}
    await db.patients.insert_one(patient.model_dump())
    return {"message": "Patient created", "patient_id": patient.patient_id}


@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    patient = await db.patients.find_one({"patient_id": patient_id}, {"_id": 0})
    if not patient:
        return {"error": "Patient not found"}, 404
    predictions = await db.predictions.find(
        {"patient_id": patient_id}, {"_id": 0}
    ).to_list(length=100)
    patient["predictions"] = predictions
    return patient


@app.post("/predictions")
async def save_prediction(pred: PredictionCreate):
    await db.predictions.insert_one(pred.model_dump())
    return {"message": "Prediction saved"}


@app.get("/predictions/{patient_id}")
async def get_predictions(patient_id: str):
    preds = await db.predictions.find(
        {"patient_id": patient_id}, {"_id": 0}
    ).sort("_id", -1).to_list(length=50)
    return {"predictions": preds}
