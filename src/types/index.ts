export interface User {
  username: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Patient {
  patient_id: string;
  age: number;
  gender: string;
  bmi: number;
  mallampati: string;
  tmd: number;
  neck_circumference: number;
  comorbidities?: Record<string, string>;
  created_at: string;
}

export interface PredictionInput {
  patient_id: string;
  age: number;
  gender: string;
  bmi: number;
  mallampati_score: number;
  tmd: number;
  neck_circumference: number;
  mouth_opening?: number;
  smd?: number;
  neck_movement?: number;
}

export interface PredictionResult {
  prediction: string;
  confidence: number;
  risk_score: number;
  probabilities: Record<string, number>;
}

export interface PredictionResponse {
  prediction: PredictionResult;
  clinical_summary: string;
  recommendations: string;
}

export interface PredictionHistory {
  id: string;
  patient_id: string;
  prediction: string;
  confidence: number;
  risk_score: number;
  probabilities: Record<string, number>;
  created_at: string;
}

export interface LLMReport {
  prediction_id: string;
  summary: string;
  recommendations: string;
  created_at: string;
}
