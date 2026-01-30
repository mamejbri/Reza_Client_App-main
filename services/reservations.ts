// src/services/reservations.ts
import http from "../src/api/http";
import dayjs from "dayjs";
import { EstablishmentType } from "../types/establishment";
import { getCurrentUser } from "./user";
import { API } from "../src/config/env";

// ============================================================
// TYPES
// ============================================================

export type StatutReservation =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUSED"
  | "CLIENT_CANCELLED";

export interface ReservationDto {
  id: number;
  etablissementId: number;
  prestationId?: number;
  prestationName?: string;
  prestationDuration?: number;
  partySize?: number;
  date: string;
  heureDebut: string;
  heureFin?: string;
  statut: StatutReservation;
  name: string;
  clientId: number;
  address: string;
  imageUrl?: string;
  price?: number;
}

export interface ReservationRequest {
  clientId: number;
  prestationId?: number | null;
  collaborateurId?: number | null;
  dateReservation: string;
  heureDebut: string;
  heureFin?: string | null;
  statut: StatutReservation;
  partySize?: number | null;
  source?: string | null;
}

// ============================================================
// UTIL
// ============================================================

export const computeHeureFin = (
  dateISO: string,
  startHHmm: string,
  durationMin?: number
): string | undefined => {
  if (!durationMin) return undefined;
  const hhmm = startHHmm.length > 5 ? startHHmm.slice(0, 5) : startHHmm;
  return dayjs(`${dateISO}T${hhmm}`).add(durationMin, "minute").format("HH:mm");
};

// ============================================================
// API: UPCOMING
// ============================================================

export async function fetchUserReservations(type?: EstablishmentType) {
  try {
    const user = await getCurrentUser(true);
    const clientId =
      (typeof user?.clientId === "number" ? user.clientId : null) ??
      (typeof user?.id === "number" ? user.id : null);

    if (!clientId) return [];

    const url = `/reservations/me/${clientId}`;
    const { data } = await http.get<ReservationDto[]>(url, {
      params: type ? { type } : undefined,
    });

    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("fetchUserReservations error", e);
    return [];
  }
}

// ============================================================
// API: PAST
// ============================================================

export async function fetchUserPastReservations() {
  try {
    const user = await getCurrentUser(true);
    const clientId =
      (typeof user?.clientId === "number" ? user.clientId : null) ??
      (typeof user?.id === "number" ? user.id : null);

    if (!clientId) return [];

    const url = `/reservations/client/${clientId}/past`;
    const { data } = await http.get<ReservationDto[]>(url);

    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("fetchUserPastReservations error", e);
    return [];
  }
}

// ============================================================
// API: CREATE FLEX
// ============================================================

export interface ReservationCreateFlexDto {
  id: number | string;
  etablissementId: number;
  clientId: number;
  date: string;
  time: string;
  partySize?: number | null;
  prestationId?: number | null;
  statut: StatutReservation;
}

export async function createReservation(
placeId: number, dateISO: string, timeHHmm: string, people?: number, programId?: string, effectiveClientId?: number): Promise<ReservationCreateFlexDto> {

  // 🔐 ALWAYS resolve auth from storage
  const user = await getCurrentUser(false);
  const resolvedClientId =
    (typeof user?.clientId === "number" ? user.clientId : null) ??
    (typeof user?.id === "number" ? user.id : null);

  // ⛔ HARD STOP — NO BACKEND CALL
  if (!resolvedClientId) {
    const err = new Error("AUTH_REQUIRED");
    (err as any).code = "AUTH_REQUIRED";
    throw err;
  }

  const dto = {
    etablissementId: placeId,
    clientId: resolvedClientId,
    date: dateISO,
    time: timeHHmm.length > 5 ? timeHHmm.slice(0, 5) : timeHHmm,
    partySize: typeof people === "number" ? people : null,
    prestationId: programId ? Number(programId) : null,
    collborateurId: null,
    statut: "PENDING" as StatutReservation,
    id: undefined,
  };

  const { data } = await http.post("/reservations/flex", dto);
  return data;
}
// wrapper
export async function createReservationFlex(input: {
  placeId?: number;
  establishmentId?: number;
  etablissementId?: number;
  dateISO: string;
  time: string;
  people?: number;
  programId?: string;
  clientId: number;
}): Promise<ReservationCreateFlexDto> {
  const placeId =
    input.placeId ?? input.establishmentId ?? input.etablissementId;

  if (!placeId) throw new Error("Missing placeId");

  return createReservation(
    placeId,
    input.dateISO,
    input.time,
    input.people,
    input.programId,
    input.clientId
  );
}

// ============================================================
// API: UPDATE
// ============================================================

export async function updateReservation(input: {
  id: string | number;
  clientId: number;
  dateISO: string;
  timeHHmm: string;
  statut?: StatutReservation;
  people?: number;
  programId?: string;
  collaborateurId?: number;
  durationMin?: number;
  source?: string;
}): Promise<boolean> {
  const {
    id,
    clientId,
    dateISO,
    timeHHmm,
    statut = "PENDING",
    people,
    programId,
    collaborateurId,
    durationMin,
    source,
  } = input;

  const body: ReservationRequest = {
    clientId,
    prestationId: programId ? Number(programId) : undefined,
    collaborateurId: collaborateurId ?? undefined,
    dateReservation: dateISO,
    heureDebut: timeHHmm.length > 5 ? timeHHmm.slice(0, 5) : timeHHmm,
    heureFin: durationMin
      ? computeHeureFin(dateISO, timeHHmm, durationMin) ?? null
      : undefined,
    statut,
    partySize: typeof people === "number" ? people : undefined,
    source: source ?? undefined,
  };

  const { status } = await http.put(`/reservations/${id}`, body);
  return status >= 200 && status < 300;
}

// ============================================================
// API: CANCEL BY CLIENT
// ============================================================

export async function cancelReservation(
  id: string | number,
  _placeId: number,
  date: string,
  time: string,
  programId?: string | number | null,
  partySize?: number | null
): Promise<boolean> {
  try {
    const user = await getCurrentUser(true);
    const clientId =
      (typeof user?.clientId === "number" ? user.clientId : null) ??
      (typeof user?.id === "number" ? user.id : null);

    if (!clientId) return false;

    const url = `${API.BASE_URL.replace(/\/+$/, "")}/reservations/client/cancel`;

    await http.post(url, {
      reservationId: Number(id),
      clientId,
    });

    return true;
  } catch (e) {
    console.error("cancelReservation error", e);
    return false;
  }
}
