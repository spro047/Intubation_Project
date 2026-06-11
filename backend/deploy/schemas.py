from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    doctor = "doctor"
    viewer = "viewer"


class UserCreate(BaseModel):
    username: str
    password: str
    role: RoleEnum = RoleEnum.doctor


class UserOut(BaseModel):
    username: str
    role: str

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PatientCreate(BaseModel):
    patient_id: str
    age: int = Field(ge=0, le=120)
    gender: str
    bmi: float = Field(ge=10, le=60)
    mallampati: str
    tmd: float = Field(ge=3, le=12)
    neck_circumference: float = Field(ge=20, le=60)
    comorbidities: Optional[dict] = None


class PatientOut(PatientCreate):
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionInput(BaseModel):
    patient_id: str
    age: float
    gender: str
    bmi: float
    mallampati_score: float
    tmd: float
    neck_circumference: float
    mouth_opening: Optional[float] = 40.0
    smd: Optional[float] = 14.0
    neck_movement: Optional[float] = 85.0
    previous_airway_records: Optional[str] = "No"
    disease_arthritis: Optional[str] = "No"
    disease_diabetes: Optional[str] = "No"
    disease_down_syndrome: Optional[str] = "No"
    breathing_snoring: Optional[str] = "No"
    breathing_sleep_apnea: Optional[str] = "No"
    symptom_voice_changes: Optional[str] = "No"
    symptom_difficulty_swallowing: Optional[str] = "No"
    symptom_cant_lie_flat: Optional[str] = "No"
    injury_swelling: Optional[str] = "No"
    injury_previous_neck_fracture: Optional[str] = "No"
    previous_emergencies_icu: Optional[str] = "No"
    bmi_category: Optional[str] = "Normal"
    beard: Optional[str] = "No"
    chest_size: Optional[str] = "Medium"
    neck_structure: Optional[str] = "Normal"
    tmd_category: Optional[str] = "Normal"
    jaw_movement: Optional[str] = "Normal"
    neck_movement_category: Optional[str] = "Normal"
    tissue_flexibility: Optional[str] = "Normal"


class PredictionOut(BaseModel):
    id: Optional[str] = None
    patient_id: str
    prediction: str
    confidence: float
    probabilities: dict
    risk_score: float
    created_at: datetime


class LLMReportOut(BaseModel):
    prediction_id: str
    summary: str
    recommendations: str
    created_at: datetime
