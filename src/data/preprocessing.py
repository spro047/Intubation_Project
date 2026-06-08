import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from typing import Tuple, List, Dict

CATEGORICAL_COLS = [
    "Gender", "Previous_Airway_Records",
    "Disease_Arthritis", "Disease_Diabetes", "Disease_Down_Syndrome",
    "Breathing_Snoring", "Breathing_Sleep_Apnea",
    "Symptom_Voice_Changes", "Symptom_Difficulty_Swallowing", "Symptom_Cant_Lie_Flat",
    "Injury_Swelling", "Injury_Previous_Neck_Fracture",
    "Previous_Emergencies_ICU",
    "BMI_Category", "Beard", "Chest_Size", "Neck_Structure",
    "Mallampati_Score", "TMD_Category",
    "Jaw_Movement", "Neck_Movement_Category", "Tissue_Flexibility",
]

ORDINAL_COLS = {
    "Mallampati_Score": ["Class I", "Class II", "Class III", "Class IV"],
}

NUMERICAL_COLS = [
    "Age",
    "BMI", "Neck_Circumference_cm",
    "Mouth_Opening_mm", "Thyromental_Distance_TMD_cm",
    "Sternomental_Distance_SMD_cm", "Neck_Movement_Degrees",
]


def load_and_preprocess(
    xlsx_path: str,
    fit_scaler: bool = True,
    scaler: StandardScaler = None,
    label_encoders: Dict[str, LabelEncoder] = None,
) -> Tuple[pd.DataFrame, StandardScaler, Dict[str, LabelEncoder]]:
    df = pd.read_excel(xlsx_path)
    df = df.drop(columns=["Patient_ID"], errors="ignore")

    categorical_mappings = {}
    if label_encoders is None:
        label_encoders = {}
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            if col not in label_encoders:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                label_encoders[col] = le
            else:
                df[col] = df[col].fillna("missing")
                known = set(label_encoders[col].classes_)
                df[col] = df[col].apply(
                    lambda x: x if x in known else "missing"
                )
                df[col] = label_encoders[col].transform(df[col].astype(str))
            categorical_mappings[col] = dict(
                zip(label_encoders[col].classes_, label_encoders[col].transform(label_encoders[col].classes_))
            )

    for col in ORDINAL_COLS:
        if col in df.columns:
            mapping = {v: i for i, v in enumerate(ORDINAL_COLS[col])}
            df[col] = df[col].map(mapping).fillna(-1)

    numerical_present = [c for c in NUMERICAL_COLS if c in df.columns]
    if fit_scaler:
        scaler = StandardScaler()
        df[numerical_present] = scaler.fit_transform(df[numerical_present].fillna(df[numerical_present].median()))
    else:
        df[numerical_present] = scaler.transform(df[numerical_present].fillna(df[numerical_present].median()))

    label_col = "Target" if "Target" in df.columns else None
    return df, scaler, label_encoders
