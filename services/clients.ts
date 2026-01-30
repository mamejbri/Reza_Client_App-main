import http from '../src/api/http';
import { API } from '../src/config/env';

/** --- Types from backend contracts --- */
export interface ClientProfileResponse {
  id: number;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  photo?: string | null;
}

export interface UpdateClientProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/** --- Load current client profile --- */
export async function getClientProfile(): Promise<ClientProfileResponse | null> {
  try {
    const { data } = await http.get<ClientProfileResponse>('/clients/me');
    return data;
  } catch {
    return null;
  }
}

/** --- Update profile (NO PHOTO) --- */
export async function updateClientProfile(
  payload: UpdateClientProfileRequest
): Promise<{ success: boolean; data?: ClientProfileResponse; message?: string }> {
  try {
    const { data } = await http.put<ClientProfileResponse>(
      '/clients/me',
      payload
    );
    return { success: true, data };
  } catch (e: any) {
    return {
      success: false,
      message:
        e?.response?.data?.message ??
        e?.message ??
        'Échec de la mise à jour du profil.',
    };
  }
}

/** --- Update profile photo (MULTIPART) --- */
export async function updateClientPhotoBase64(base64: string) {
  try {
    const { data } = await http.put('/clients/me/photo', {
      photoBase64: base64, // ✅ MUST MATCH DTO
    });
    return { success: true, data };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? e?.message,
    };
  }
}
