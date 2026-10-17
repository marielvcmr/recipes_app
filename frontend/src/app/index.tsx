import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

// La app arranca en "/" y ninguna pantalla tiene esa ruta (todas están dentro de (auth) o (tabs)):
// sin esto el APK abre en "Unmatched Route". Se manda a Explorar o a login según haya sesión
export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/feed' : '/login'} />;
}
