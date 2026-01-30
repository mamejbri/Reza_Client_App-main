// src/services/opening-hours.ts
import http from '../src/api/http';
import { API } from '../src/config/env';

export type DayHoursDto = {
  day: 'MONDAY'|'TUESDAY'|'WEDNESDAY'|'THURSDAY'|'FRIDAY'|'SATURDAY'|'SUNDAY' | string;
  heureOuvertureMatin?: string | { hour: number; minute: number } | null;
  heureFermetureMatin?: string | { hour: number; minute: number } | null;
  heureOuvertureMidi?: string | { hour: number; minute: number } | null;
  heureFermetureMidi?: string | { hour: number; minute: number } | null;
};

/** GET /opening-hours (your controller’s getMine) */
export async function fetchMyOpeningHours(): Promise<DayHoursDto[]> {
  const { data } = await http.get<DayHoursDto[]>(`${API.BASE_URL}/opening-hours`);
  return Array.isArray(data) ? data : [];
}
