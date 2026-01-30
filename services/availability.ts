// src/services/availability.ts
import http from '../src/api/http';
import { API } from '../src/config/env';

export type AvailabilitySlotsResponse = {
  prestationId: number;
  etablissementId: number;
  date: string;              // "YYYY-MM-DD"
  durationMinutes: number;
  stepMinutes: number;
  bufferBefore?: number;
  bufferAfter?: number;
  slots: string[];           // ["HH:mm", ...]
};
export type RestaurantAvailabilityResponse = {
  etablissementId: number;
  date: string;          // "YYYY-MM-DD"
  open: boolean;
  slots: string[];       // ["HH:mm", ...]
  reason?: string | null; // "NON_WORKING_DAY" | "CLOSED" | null
};
/**
 * Get 15-min (by default) start times where at least one eligible collaborator
 * is free for the whole prestation duration (incl. optional buffers).
 */
export async function fetchPrestationAvailability(
  etablissementId: number,
  prestationId: number,
  dateISO: string,            // "YYYY-MM-DD"
  stepMinutes = 15,
  bufferBefore = 0,
  bufferAfter = 0
): Promise<AvailabilitySlotsResponse> {
  const url = `${API.BASE_URL}/availability/prestations/${encodeURIComponent(
    String(prestationId)
  )}/slots`;

  const { data } = await http.get<AvailabilitySlotsResponse>(url, {
    params: {
      etablissementId,
      date: dateISO,
      step: stepMinutes,
      bufferBefore,
      bufferAfter,
    },
  });
  return data;
}

export async function fetchRestaurantAvailability(
  etablissementId: number,
  dateISO: string // "YYYY-MM-DD"
): Promise<RestaurantAvailabilityResponse> {
  const url = `${API.BASE_URL}/availability/${encodeURIComponent(
    String(etablissementId)
  )}/availability`;

  const { data } = await http.get<RestaurantAvailabilityResponse>(url, {
    params: {
      date: dateISO,
    },
  });
  console.log(data);
  return data;
}