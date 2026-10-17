import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { deleteMe, getMe, type ProfileChanges } from '@/api/users';
import BottomSheet from '@/components/BottomSheet';
import EditCard from '@/components/EditCard';
import ProfileBrief from '@/components/ProfileBrief';
import ProfileIcon from '@/components/ProfileIcon';
import ProfileOptionsMenu from '@/components/ProfileOptionsMenu';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/styles/global';
import { toFormErrors, type FormErrors } from '@/utils/errors';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [counts, setCounts] = useState({ recipes: 0, groups: 0 });

  const [editing, setEditing] = useState(false);
  // Cambia en cada apertura para que el formulario empiece con los datos actuales
  const [editKey, setEditKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<FormErrors>();

  const openEdit = () => {
    setEditErrors(undefined);
    setEditKey((key) => key + 1);
    setEditing(true);
  };

  const closeEdit = () => {
    if (!saving) setEditing(false);
  };

  const handleSave = async (changes: ProfileChanges) => {
    // Nada cambió: no hace falta llamar al backend
    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setEditErrors(undefined);
    try {
      await updateProfile(changes);
      setEditing(false);
    } catch (error) {
      setEditErrors(toFormErrors(error));
    } finally {
      setSaving(false);
    }
  };

  // Se recargan al volver a la pestaña, por si se crearon recetas o grupos
  useFocusEffect(
    useCallback(() => {
      getMe()
        .then((me) => setCounts(me.counts))
        .catch(() => {});
    }, []),
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Se borrarán tu cuenta, tus recetas y tus grupos. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMe();
              await signOut();
            } catch (error) {
              const message = error instanceof ApiError ? error.message : 'Error inesperado.';
              Alert.alert('No se pudo eliminar la cuenta', message);
            }
          },
        },
      ],
    );
  };

  if (!user) return null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 45 }]}
    >
      <Text style={styles.title}>
        Mi <Text style={styles.titleAccent}>perfil</Text>
      </Text>

      <View style={styles.header}>
        <ProfileIcon name={user.username} color={user.avatarColor} />
        <Text style={styles.name}>{user.username}</Text>

        <Pressable
          onPress={openEdit}
          accessibilityRole="button"
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        >
          <Image
            source={require('@/assets/images/profile/edit.svg')}
            style={styles.editIcon}
            contentFit="contain"
          />
          <Text style={styles.editLabel}>Editar perfil</Text>
        </Pressable>
      </View>

      <ProfileBrief recipes={counts.recipes} groups={counts.groups} />

      <View style={styles.menu}>
        <ProfileOptionsMenu
          // TODO: abrir los datos de la cuenta cuando esté su mockup
          onAccountData={() => {}}
          onSignOut={signOut}
          onDeleteAccount={handleDeleteAccount}
        />
      </View>

      <BottomSheet visible={editing} onClose={closeEdit}>
        <EditCard
          key={editKey}
          user={user}
          onSubmit={handleSave}
          onClose={closeEdit}
          loading={saving}
          errors={editErrors}
        />
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 34,
    lineHeight: 36.72,
    letterSpacing: -0.68,
  },
  titleAccent: {
    color: colors.primary,
    fontFamily: fonts.headingItalic,
  },
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 12,
  },
  name: {
    marginTop: 13,
    marginBottom: 16,
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 25,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  editIcon: {
    width: 17,
    height: 17,
  },
  editLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  menu: {
    paddingTop: 30,
  },
});
