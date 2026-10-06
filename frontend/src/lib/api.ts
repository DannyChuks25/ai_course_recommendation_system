import type { Taxonomy, PredictionRequest, PredictionResponse, University } from '../types';

// Configure via .env: VITE_API_BASE_URL=http://localhost:8000
export const API_BASE_URL: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  'http://localhost:8000';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = Array.isArray(body?.detail)
      ? body.detail.map((d: { msg?: string }) => d.msg).join('; ')
      : body?.detail || body?.message;
    throw new Error(detail || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTaxonomy(): Promise<Taxonomy> {
  const res = await fetch(`${API_BASE_URL}/taxonomy`);
  return handle<Taxonomy>(res);
}

export async function fetchUniversities(): Promise<University[]> {
  const res = await fetch(`${API_BASE_URL}/universities`);
  const data = await handle<{ total: number; universities: University[] }>(res);
  return data.universities;
}

export async function submitPrediction(payload: PredictionRequest): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle<PredictionResponse>(res);
}
