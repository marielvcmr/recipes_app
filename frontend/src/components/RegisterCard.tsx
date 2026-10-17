import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/styles/global';

type RegisterCardProps = {
  onSubmit: (username: string, email: string, password: string) => void;
  loading?: boolean;
};

export default function RegisterCard({ onSubmit, loading = false }: RegisterCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Tu recetario personal, siempre contigo.</Text>
      </View>

      <TextField
        label="Nombre de usuario"
        placeholder="Tu nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
        textContentType="username"
      />

      <TextField
        label="Correo electrónico"
        placeholder="nombre@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <TextField
        label="Clave"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <View style={styles.buttonSpacing}>
        <Button
          title="Crear cuenta"
          onPress={() => onSubmit(username, email, password)}
          loading={loading}
        />
      </View>

      <Link href="/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 430,
    gap: 15,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 25,
    backgroundColor: colors.surface,
  },
  header: {
    gap: 8,
    paddingBottom: 13,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 34.5,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
  },
  buttonSpacing: {
    paddingTop: 6,
  },
  link: {
    alignSelf: 'center',
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
