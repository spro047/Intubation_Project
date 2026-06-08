import type {
  AuthResponse,
  Patient,
  PredictionInput,
  PredictionResponse,
  PredictionHistory,
  LLMReport,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function setToken(token: string): void {
  localStorage.setItem('access_token', token);
}

function clearToken(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

function getUser(): { username: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setUser(user: { username: string; role: string }): void {
  localStorage.setItem('user', JSON.stringify(user));
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) {
        errorMessage = errorBody.detail;
      } else if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.detail || errorMessage;
    } catch {
      errorMessage = `Login failed: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data: AuthResponse = await response.json();
  setToken(data.access_token);
  setUser(data.user);
  return data;
}

export function logout(): void {
  clearToken();
}

export async function getPatients(): Promise<Patient[]> {
  return apiFetch<Patient[]>('/api/patients');
}

export async function createPatient(
  data: Partial<Patient>
): Promise<Patient> {
  return apiFetch<Patient>('/api/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPatient(id: string): Promise<Patient> {
  return apiFetch<Patient>(`/api/patients/${id}`);
}

export async function runPrediction(
  data: PredictionInput
): Promise<PredictionResponse> {
  return apiFetch<PredictionResponse>('/api/predictions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPredictions(
  patientId?: string
): Promise<PredictionHistory[]> {
  const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : '';
  return apiFetch<PredictionHistory[]>(`/api/predictions${query}`);
}

export async function getPredictionReport(
  predictionId: string
): Promise<LLMReport> {
  return apiFetch<LLMReport>(
    `/api/predictions/${encodeURIComponent(predictionId)}/report`
  );
}

export async function deletePrediction(predictionId: string): Promise<void> {
  await apiFetch<void>(`/api/predictions/${encodeURIComponent(predictionId)}`, {
    method: 'DELETE',
  });
}

export async function exportCsv(): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/api/predictions/export/csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }

  return response.blob();
}

export { getToken, setToken, clearToken, getUser, setUser };
export { BASE_URL };
