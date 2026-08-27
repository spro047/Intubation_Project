import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'airway_user';
const API_URL_KEY = 'apiBaseUrl';
const THEME_KEY = 'theme';

// ---- SecureStore (encrypted): token + user ----

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    // ignore
  }
}

// ---- AsyncStorage (non-sensitive) ----

export async function getApiBaseUrl(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(API_URL_KEY);
    if (!raw) return null;
    let url = raw.trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\//i.test(url)) {
      url = `http://${url}`;
    }
    return url;
  } catch {
    return null;
  }
}

export async function setApiBaseUrl(url: string): Promise<void> {
  let normalized = url.trim().replace(/\/+$/, '');
  if (normalized && !/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }
  await AsyncStorage.setItem(API_URL_KEY, normalized);
}

export async function getThemePreference(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export async function setThemePreference(mode: 'light' | 'dark'): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, mode);
}

// Draft persistence for the assessment wizard
const DRAFT_KEY = 'assessment_draft';

export async function saveDraft(data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function loadDraft<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

// Read-only cache for history (offline view)
const PREDICTIONS_CACHE_KEY = 'predictions_cache';

export async function cachePredictions(data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREDICTIONS_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function getCachedPredictions<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREDICTIONS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}