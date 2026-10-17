import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import ProfileIcon from '@/components/ProfileIcon';
import ScreenTitle from '@/components/ScreenTitle';
import { useAuth } from '@/context/AuthContext';
import { glassCircle } from '@/styles/global';

type ScreenHeaderProps = {
  lead: string;
  accent: string;
};

// Título de la pantalla con el avatar del usuario a la derecha (abre el perfil)
export default function ScreenHeader({ lead, accent }: ScreenHeaderProps) {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      {/* El título ocupa el espacio libre y pasa a otra línea si no cabe junto al avatar */}
      <View style={styles.title}>
        <ScreenTitle lead={lead} accent={accent} />
      </View>
      {user && (
        // Link cambia a la pestaña Perfil (como tocarla en la barra de abajo)
        <Link href="/profile" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            hitSlop={10}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <View style={styles.avatarRing}>
              <ProfileIcon name={user.username} color={user.avatarColor} size={42} />
            </View>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  // Anillo de vidrio alrededor del avatar
  avatarRing: {
    ...glassCircle,
    padding: 3,
    borderRadius: 26,
  },
});
