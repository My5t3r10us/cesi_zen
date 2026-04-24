import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cesizen_token';

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  if (typeof token !== 'string' || !token) {
    throw new Error('Invalid token: must be a non-empty string');
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
