// src/services/user.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from '../src/api/http';
import { API } from '../src/config/env';
import { getToken, setStoredClientId } from './auth';
const USER_CACHE_KEY = 'currentUser';

export type CurrentUser = {
  id?: number | string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;

  // ✅ align with backend & reviews
  photoUrl?: string | null;

  clientId?: number | null;
};

export type UpdateUserPayload =
  Partial<Pick<CurrentUser, 'firstName' | 'lastName' | 'photoUrl'>>;

export type UpdateResult = { success: boolean; message?: string };

// ----------------------------------------------------
// Cache helpers
// ----------------------------------------------------
export async function clearCachedUser() {
  try { await AsyncStorage.removeItem(USER_CACHE_KEY); } catch {}
}

async function readCachedUser(): Promise<CurrentUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeCachedUser(u: CurrentUser) {
  try { await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(u)); } catch {}
}



// ----------------------------------------------------
// Get current user
// ----------------------------------------------------
export async function getCurrentUser(
  forceRefresh = false
): Promise<CurrentUser | null> {

  if (!forceRefresh) {
    const token = await getToken();
    if (token) {
      const cached = await readCachedUser();
      if (cached) return cached;
    }
  }

  const token = await getToken();
  if (!token) {
    await clearCachedUser();
    await setStoredClientId(null);
    return null;
  }

  // ✅ SINGLE SOURCE OF TRUTH: BACKEND
  for (const url of [`${API.BASE_URL}/clients/me`, `${API.BASE_URL}/users/me`]) {
    try {
      const { data } = await http.get<CurrentUser>(url);

      const user: CurrentUser = {
        ...data,
        clientId: data?.clientId ?? null,
      };

      if (user.clientId != null) {
        await setStoredClientId(user.clientId);
      }

      await writeCachedUser(user);
      return user;
    } catch {
      /* try next */
    }
  }

  // ❌ NO FALLBACK
  await clearCachedUser();
  await setStoredClientId(null);
  return null;
}

// ----------------------------------------------------
// Update current user
// ----------------------------------------------------
export async function updateCurrentUser(
  patch: UpdateUserPayload
): Promise<UpdateResult> {

  for (const url of [`${API.BASE_URL}/clients/me`, `${API.BASE_URL}/users/me`]) {
    try {
      const { data } = await http.put<CurrentUser>(url, patch);
      const existing = (await readCachedUser()) ?? {};

      // ✅ backend wins
      const merged: CurrentUser = {
        ...existing,
        ...patch,
        ...data,
      };

      if (merged.clientId != null) {
        await setStoredClientId(merged.clientId);
      }

      await writeCachedUser(merged);
      return { success: true };
    } catch {
      /* try next */
    }
  }

  return { success: false, message: 'Impossible de mettre à jour le profil.' };
}
