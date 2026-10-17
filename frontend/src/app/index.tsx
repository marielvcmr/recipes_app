import { Redirect } from 'expo-router';

// Temporal: sin AuthContext todavía, la app siempre empieza en el login.
// Cuando existan las pestañas, "/" será Explorar dentro de (tabs).
export default function Index() {
  return <Redirect href="/login" />;
}
