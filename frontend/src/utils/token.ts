import * as SecureStore from 'expo-secure-store';

// SecureStore guarda el token cifrado en el teléfono (Keychain en iOS, Keystore en Android)
const TOKEN_KEY = 'cookplan.token';

export function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function saveToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function deleteToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
