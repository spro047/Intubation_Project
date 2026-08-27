import type { PredictionInput } from '@/types';

// Port of PatientForm.tsx:62-81 validation rules (web src/components/PatientForm.tsx)

export function validateField(
  field: keyof PredictionInput,
  value: string | number | undefined | null,
): string | null {
  switch (field) {
    case 'patient_id':
      if (!String(value ?? '').trim()) return 'Required';
      return null;
    case 'age': {
      const n = Number(value);
      if (!value || Number.isNaN(n) || n < 0 || n > 120) return '0\u2013120';
      return null;
    }
    case 'gender':
      if (!String(value ?? '').trim()) return 'Required';
      return null;
    case 'bmi': {
      const n = Number(value);
      if (!value || Number.isNaN(n) || n < 10 || n > 60) return '10\u201360';
      return null;
    }
    case 'mallampati_score': {
      const n = Number(value);
      if (!value || Number.isNaN(n) || n < 1 || n > 4) return '1\u20134 required';
      return null;
    }
    case 'tmd': {
      const n = Number(value);
      if (!value || Number.isNaN(n) || n < 3 || n > 12) return '3\u201312 cm';
      return null;
    }
    case 'neck_circumference': {
      const n = Number(value);
      if (!value || Number.isNaN(n) || n < 20 || n > 60) return '20\u201360 cm';
      return null;
    }
    case 'mouth_opening': {
      const n = Number(value);
      if (value === undefined || value === null || Number.isNaN(n) || n < 10 || n > 80) {
        return '10\u201380 mm';
      }
      return null;
    }
    case 'smd': {
      const n = Number(value);
      if (value === undefined || value === null || Number.isNaN(n) || n < 3 || n > 20) {
        return '3\u201320 cm';
      }
      return null;
    }
    case 'neck_movement': {
      const n = Number(value);
      if (value === undefined || value === null || Number.isNaN(n) || n < 30 || n > 180) {
        return '30\u2013180\u00b0';
      }
      return null;
    }
    default:
      return null;
  }
}

export function validateAll(data: PredictionInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields: (keyof PredictionInput)[] = [
    'patient_id',
    'age',
    'gender',
    'bmi',
    'mallampati_score',
    'tmd',
    'neck_circumference',
    'mouth_opening',
    'smd',
    'neck_movement',
  ];
  for (const f of fields) {
    const err = validateField(f, data[f]);
    if (err) errors[f as string] = err;
  }
  return errors;
}

export function validateStep(
  step: number,
  data: PredictionInput,
): Record<string, string> {
  const errors: Record<string, string> = {};
  switch (step) {
    case 1: // Basic: patient_id, age, gender, bmi
      for (const f of ['patient_id', 'age', 'gender', 'bmi'] as const) {
        const err = validateField(f, data[f]);
        if (err) errors[f as string] = err;
      }
      break;
    case 2: // Airway: mallampati, tmd, mouth_opening
      for (const f of ['mallampati_score', 'tmd', 'mouth_opening'] as const) {
        const err = validateField(f, data[f]);
        if (err) errors[f as string] = err;
      }
      break;
    case 3: // Physical: neck_circumference, smd, neck_movement
      for (const f of ['neck_circumference', 'smd', 'neck_movement'] as const) {
        const err = validateField(f, data[f]);
        if (err) errors[f as string] = err;
      }
      break;
    case 4: // History: no required fields
      break;
  }
  return errors;
}