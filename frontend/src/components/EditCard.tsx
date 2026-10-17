import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { User } from '@/api/types';
import type { ProfileChanges } from '@/api/users';
import Button from '@/components/Button';
import ColorPicker from '@/components/ColorPicker';
import TextField from '@/components/TextField';
import { avatarColors, colors, fonts, glassCircle } from '@/styles/global';
import type { FormErrors } from '@/utils/errors';

type EditCardProps = {
  user: User;
  // Recibe solo los campos que cambiaron (puede venir vacío)
  onSubmit: (changes: ProfileChanges) => void;
  onClose: () => void;
  loading?: boolean;
  errors?: FormErrors;
};

export default function EditCard({ user, onSubmit, onClose, loading = false, errors }: EditCardProps) {
  const initialColor = user.avatarColor ?? colors.avatar;

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  // Vacía = no cambiar la clave
  const [password, setPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState(initialColor);

  const handleSubmit = () => {
    const changes: ProfileChanges = {};
    if (username.trim() !== user.username) changes.username = username.trim();
    if (email.trim().toLowerCase() !== user.email) changes.email = email.trim();
    if (password) changes.password = password;
    if (avatarColor.toLowerCase() !== initialColor.toLowerCase()) changes.avatarColor = avatarColor;
    onSubmit(changes);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TU INFORMACIÓN</Text>
          <Text style={styles.title}>Editar perfil</Text>
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={8}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <Image source={require('@/assets/images/profile/close.svg')} style={styles.closeIcon} contentFit="contain" />
        </Pressable>
      </View>

      <TextField
        label="Nombre de usuario"
        labelStyle={styles.label}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
        textContentType="username"
        error={errors?.fields.username}
      />

      <TextField
        label="Correo"
        labelStyle={styles.label}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors?.fields.email}
      />

      <TextField
        label="Clave"
        labelStyle={styles.label}
        value={password}
        onChangeText={setPassword}
        revealable
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors?.fields.password}
      />

      <View style={styles.colorField}>
        <Text style={styles.label}>Color de perfil</Text>
        <ColorPicker colors={avatarColors} value={avatarColor} onChange={setAvatarColor} />
        {errors?.fields.avatarColor && <Text style={styles.fieldError}>{errors.fields.avatarColor}</Text>}
      </View>

      {errors?.message && <Text style={styles.error}>{errors.message}</Text>}

      <Button title="Guardar cambios" onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 2,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.54,
  },
  title: {
    paddingTop: 7,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 27,
    lineHeight: 31.05,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    ...glassCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  closeIcon: {
    width: 22,
    height: 22,
  },
  label: {
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.text,
    fontFamily: fonts.bold,
  },
  colorField: {
    gap: 9,
  },
  fieldError: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
