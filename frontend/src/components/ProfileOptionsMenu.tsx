import { StyleSheet, View } from 'react-native';

import ProfileOption from '@/components/ProfileOption';
import { glassSurface } from '@/styles/global';

type ProfileOptionsMenuProps = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

export default function ProfileOptionsMenu({ onSignOut, onDeleteAccount }: ProfileOptionsMenuProps) {
  return (
    <View style={styles.card}>
      <ProfileOption
        icon={require('@/assets/images/profile/sign-out.svg')}
        label="Cerrar sesión"
        onPress={onSignOut}
      />
      <ProfileOption
        icon={require('@/assets/images/profile/trash.svg')}
        label="Eliminar cuenta"
        onPress={onDeleteAccount}
        danger
        last
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    ...glassSurface,
    borderRadius: 17,
  },
});
