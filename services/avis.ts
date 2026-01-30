// src/services/avis.ts
import http from '../src/api/http';
import { API } from '../src/config/env';

export type Avis = {
  id: number;
  etablissementId: number;
  clientId: number;
  reservationId?: number | null;
  rating: number;          // 1..5
  contenu?: string | null;
  createdDate?: string;
  clientEmail?: string | null;
  clientName?:string | null;
  clientLastName?:string | null;
  photoUrl?: string | null;

};
export type ReviewSummary = {
  etablissementId: number;
  count: number;
  average: number;
};
export type AvisCreateRequest = {
  etablissementId: number;
  clientId: number;
  reservationId?: number;
  rating: number;
  contenu?: string;
};

export async function fetchReviewSummary(etablissementId: number) {
  const { data } = await http.get<ReviewSummary>(`${API.BASE_URL}/avis/summary/${etablissementId}`);
  return data;
}

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.content)) return data.content as T[];
  return [];
}

export async function createAvis(payload: AvisCreateRequest): Promise<Avis> {
  const { data } = await http.post<Avis>(`${API.BASE_URL}/avis`, payload);
  return data;
}

export async function fetchEtablissementAvis(etablissementId: number): Promise<Avis[]> {
  const { data } = await http.get(`${API.BASE_URL}/avis/etablissement/${etablissementId}`);
  return unwrapList<Avis>(data);
}

/**
 * Prefer this — simplest, precise lookup if your backend exposes it.
 * Backend route expected: GET /avis/reservation/{reservationId} -> returns single Avis or 404
 */
export async function fetchAvisByReservation(reservationId: number): Promise<Avis | null> {
  try {
    const { data } = await http.get(`${API.BASE_URL}/avis/reservation/${reservationId}`);
    return (data ?? null) as Avis | null;
  } catch (e: any) {
    // 404 => no avis yet
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

/**
 * Fallback: if reservation endpoint isn't available, look up all avis for the
 * establishment and pick the one authored by this client.
 */
export async function fetchMyAvisForEtablissement(
  etablissementId: number,
  clientId: number
): Promise<Avis | null> {
  const list = await fetchEtablissementAvis(etablissementId);
  const found = list.find((a) => Number(a.clientId) === Number(clientId));
  return found ?? null;
}
