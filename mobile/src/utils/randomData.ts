import type { PredictionInput } from '@/types';

// Verbatim port of PatientForm.tsx:19-47 defaultFormData
export const defaultFormData: PredictionInput = {
  patient_id: '',
  age: 0,
  gender: '',
  bmi: 0,
  mallampati_score: 0,
  tmd: 0,
  neck_circumference: 0,
  mouth_opening: 40,
  smd: 14,
  neck_movement: 85,
  beard: 'No',
  chest_size: 'Medium',
  neck_structure: 'Normal',
  jaw_movement: 'Normal',
  tissue_flexibility: 'Normal',
  previous_airway_records: 'No',
  disease_arthritis: 'No',
  disease_diabetes: 'No',
  disease_down_syndrome: 'No',
  breathing_snoring: 'No',
  breathing_sleep_apnea: 'No',
  symptom_voice_changes: 'No',
  symptom_difficulty_swallowing: 'No',
  symptom_cant_lie_flat: 'No',
  injury_swelling: 'No',
  injury_previous_neck_fracture: 'No',
  previous_emergencies_icu: 'No',
};

// Verbatim port of PatientForm.tsx:144-188 generateRandomData()
export function generateRandomData(): PredictionInput {
  const genders = ['Male', 'Female'];
  const gender = genders[Math.random() < 0.5 ? 0 : 1];
  const age = Math.round(30 + Math.random() * 40 + (Math.random() < 0.3 ? 10 : 0));
  const bmi = Math.round((18 + Math.random() * 30 + (Math.random() < 0.4 ? 5 : 0)) * 10) / 10;
  const neck_circ = Math.round((28 + bmi * 0.35 + (Math.random() - 0.5) * 4) * 10) / 10;
  const mallampati_raw = bmi < 25
    ? (Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : Math.random() < 0.7 ? 3 : 4)
    : bmi < 30
    ? (Math.random() < 0.2 ? 1 : Math.random() < 0.5 ? 2 : Math.random() < 0.8 ? 3 : 4)
    : (Math.random() < 0.1 ? 1 : Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 3 : 4);
  const mallampati_score = Math.min(4, Math.max(1, mallampati_raw));
  const tmd = Math.round(Math.max(3.5, Math.min(11, 8.5 - mallampati_score * 0.5 + (Math.random() - 0.5) * 1.5)) * 10) / 10;
  const mouth_opening = Math.round((35 + Math.random() * 20 + (mallampati_score > 3 ? -5 : 0)) * 10) / 10;
  const smd = Math.round((12 + Math.random() * 5 + (tmd < 6 ? -1 : 0)) * 10) / 10;
  const neck_movement = Math.round((70 + Math.random() * 30 + (bmi > 30 ? -10 : 0)) * 10) / 10;
  const beard = gender === 'Male' ? (Math.random() < 0.35 ? 'Yes' : 'No') : 'No';
  const chest_size = bmi < 25 ? 'Small' : bmi < 30 ? 'Medium' : 'Large';
  const neck_structure = bmi < 25 ? 'Normal' : Math.random() < 0.4 ? 'Normal' : 'Abnormal';
  const jaw_movement = Math.random() < 0.75 ? 'Normal' : 'Reduced';
  const tissue_flexibility = Math.random() < 0.65 ? 'Normal' : 'Reduced';
  const prob = (p: number) => Math.random() < p;
  const previous_airway_records = prob(0.15) ? 'Yes' : 'No';
  const disease_arthritis = prob(Math.min(0.02 + age * 0.004, 0.8)) ? 'Yes' : 'No';
  const disease_diabetes = prob(Math.min(0.03 + age * 0.005, 0.8)) ? 'Yes' : 'No';
  const disease_down_syndrome = prob(0.005) ? 'Yes' : 'No';
  const breathing_snoring = prob(Math.min(0.2 + (bmi - 15) * 0.015, 0.85)) ? 'Yes' : 'No';
  const breathing_sleep_apnea = prob(Math.min(0.05 + (bmi - 15) * 0.008, 0.6)) ? 'Yes' : 'No';
  const symptom_voice_changes = prob(0.1) ? 'Yes' : 'No';
  const symptom_difficulty_swallowing = prob(0.15) ? 'Yes' : 'No';
  const symptom_cant_lie_flat = prob(0.12) ? 'Yes' : 'No';
  const injury_swelling = prob(0.08) ? 'Yes' : 'No';
  const injury_previous_neck_fracture = prob(0.03) ? 'Yes' : 'No';
  const previous_emergencies_icu = prob(0.12) ? 'Yes' : 'No';
  return {
    patient_id: `RAND-${Math.floor(1000 + Math.random() * 9000)}`,
    age,
    gender,
    bmi,
    mallampati_score,
    tmd,
    neck_circumference: neck_circ,
    mouth_opening,
    smd,
    neck_movement,
    beard,
    chest_size,
    neck_structure,
    jaw_movement,
    tissue_flexibility,
    previous_airway_records,
    disease_arthritis,
    disease_diabetes,
    disease_down_syndrome,
    breathing_snoring,
    breathing_sleep_apnea,
    symptom_voice_changes,
    symptom_difficulty_swallowing,
    symptom_cant_lie_flat,
    injury_swelling,
    injury_previous_neck_fracture,
    previous_emergencies_icu,
  };
}

// Verbatim port of the 3 test fixtures (PatientForm.tsx:204-223)
export const FIXTURES: { key: 'E' | 'M' | 'D'; label: string; data: PredictionInput }[] = [
  {
    key: 'E',
    label: 'E',
    data: {
      patient_id: 'TEST-EASY-001',
      age: 54,
      gender: 'Female',
      bmi: 23.7,
      mallampati_score: 1,
      tmd: 7.6,
      neck_circumference: 36.4,
      mouth_opening: 43.7,
      smd: 16.1,
      neck_movement: 96.4,
      previous_airway_records: 'No',
      disease_arthritis: 'No',
      disease_diabetes: 'No',
      disease_down_syndrome: 'No',
      breathing_snoring: 'No',
      breathing_sleep_apnea: 'No',
      symptom_voice_changes: 'No',
      symptom_difficulty_swallowing: 'No',
      symptom_cant_lie_flat: 'No',
      injury_swelling: 'No',
      injury_previous_neck_fracture: 'No',
      previous_emergencies_icu: 'No',
    },
  },
  {
    key: 'M',
    label: 'M',
    data: {
      patient_id: 'TEST-MOD-001',
      age: 54,
      gender: 'Female',
      bmi: 32.9,
      mallampati_score: 4,
      tmd: 6.1,
      neck_circumference: 39.2,
      mouth_opening: 50.9,
      smd: 15.7,
      neck_movement: 93.2,
      previous_airway_records: 'No',
      disease_arthritis: 'No',
      disease_diabetes: 'No',
      disease_down_syndrome: 'No',
      breathing_snoring: 'Yes',
      breathing_sleep_apnea: 'No',
      symptom_voice_changes: 'No',
      symptom_difficulty_swallowing: 'No',
      symptom_cant_lie_flat: 'Yes',
      injury_swelling: 'No',
      injury_previous_neck_fracture: 'No',
      previous_emergencies_icu: 'No',
    },
  },
  {
    key: 'D',
    label: 'D',
    data: {
      patient_id: 'TEST-DIFF-001',
      age: 58,
      gender: 'Female',
      bmi: 50.0,
      mallampati_score: 4,
      tmd: 5.7,
      neck_circumference: 46.8,
      mouth_opening: 40.0,
      smd: 18.4,
      neck_movement: 81.2,
      previous_airway_records: 'Yes',
      disease_arthritis: 'No',
      disease_diabetes: 'Yes',
      disease_down_syndrome: 'No',
      breathing_snoring: 'Yes',
      breathing_sleep_apnea: 'Yes',
      symptom_voice_changes: 'No',
      symptom_difficulty_swallowing: 'Yes',
      symptom_cant_lie_flat: 'Yes',
      injury_swelling: 'Yes',
      injury_previous_neck_fracture: 'No',
      previous_emergencies_icu: 'Yes',
    },
  },
];