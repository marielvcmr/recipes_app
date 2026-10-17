import { StyleSheet, View } from 'react-native';

import ProfileOption from '@/components/ProfileOption';
import { colors } from '@/styles/global';

type ProfileOptionsMenuProps = {
  onAccountData: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

export default function ProfileOptionsMenu({
  onAccountData,
  onSignOut,
  onDeleteAccount,
}: ProfileOptionsMenuProps) {
  return (
    <View style={styles.card}>
      <ProfileOption
        icon={require('@/assets/images/profile/user.svg')}
        label="Datos de la cuenta"
        onPress={onAccountData}
      />
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
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 17,
  },
});
