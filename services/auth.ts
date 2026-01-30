// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from '../src/api/http';
import { API } from '../src/config/env';
import { decodeJwtPayload } from './jwt';
import { clearCachedUser } from './user';

/* =====================================================
   TYPES
===================================================== */
type Ok = { success: true };
type Fail = { success: false; message: string };

export type LoginResult =
  | { success: true; token: string; clientId?: number }
  | Fail;

export type SignupResult = Ok | Fail;

/* =====================================================
   STORAGE KEYS (SINGLE SOURCE OF TRUTH)
===================================================== */
const TOKEN_KEY = 'token';
const CLIENT_ID_KEY = 'client_id';

/* =====================================================
   TOKEN & CLIENT ID HELPERS
===================================================== */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getStoredClientId(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(CLIENT_ID_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredClientId(id: number | null) {
  if (id == null) {
    await AsyncStorage.removeItem(CLIENT_ID_KEY);
  } else {
    await AsyncStorage.setItem(CLIENT_ID_KEY, String(id));
  }
}

/* =====================================================
   LOGIN  (AXIOS ONLY — IMPORTANT)
===================================================== */
/**
 * Login client
 * Endpoint: POST /auth/login_client
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const { data } = await http.post<{
      token?: string;
      clientId?: number;
      user?: { clientId?: number };
      client?: { id?: number };
    }>('/auth/login_client', { email, password });

    const token = data?.token;
    if (!token) {
      return {
        success: false,
        message: 'Réponse invalide du serveur (token manquant).',
      };
    }

    const clientId: number | undefined =
      (typeof data.clientId === 'number' && data.clientId) ||
      (typeof data.user?.clientId === 'number' && data.user.clientId) ||
      (typeof data.client?.id === 'number' && data.client.id) ||
      undefined;

    // 🔐 Persist auth
    await setToken(token);
    http.defaults.headers.common.Authorization = `Bearer ${token}`;

    if (typeof clientId === 'number') {
      await setStoredClientId(clientId);
    } else {
      await setStoredClientId(null);
    }

    return { success: true, token, clientId };
  } catch (err: any) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (status === 401
        ? 'Email ou mot de passe incorrect.'
        : 'Impossible de contacter le serveur.');

    return { success: false, message };
  }
}

/* =====================================================
   SIGNUP
===================================================== */
/**
 * CLIENT signup
 * Endpoint: POST /auth/register_client
 */
export async function signup(
  phoneDigits: string,
  email: string,
  password: string
): Promise<SignupResult> {
  try {
    await http.post('/auth/register_client', {
      email,
      password,
      phoneNumber: phoneDigits,
    });

    return { success: true };
  } catch (err: any) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (status === 409
        ? 'Adresse e-mail déjà utilisée.'
        : status === 400
        ? 'Données invalides.'
        : 'Erreur serveur.');

    return { success: false, message };
  }
}

/* =====================================================
   PASSWORD RESET
===================================================== */
export async function requestPasswordReset(email: string): Promise<void> {
  const base = API.BASE_URL.replace(/\/+$/, '');
  await http.post(`${base}/auth/forgot-password`, { email });
}

/* =====================================================
   LOGOUT (ONLY PLACE THAT CLEARS AUTH)
===================================================== */
export async function logout() {
  await AsyncStorage.multiRemove([TOKEN_KEY, CLIENT_ID_KEY]);

  // 🔥 VERY IMPORTANT: clear axios auth
  delete http.defaults.headers.common.Authorization;

  // 🧠 clear cached user profile
  await clearCachedUser();
}

/* =====================================================
   UPDATE PASSWORD
===================================================== */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await http.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    return { success: true };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      'Mot de passe actuel incorrect';

    return { success: false, error: message };
  }
}

/* =====================================================
   AUTH CHECK
===================================================== */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}
