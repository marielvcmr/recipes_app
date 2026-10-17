import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/styles/global';
import type { FormErrors } from '@/utils/errors';

type LoginCardProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  errors?: FormErrors;
};

export default function LoginCard({ onSubmit, loading = false, errors }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Inicia sesión para acceder a tus recetas</Text>

      <TextField
        label="Correo electrónico"
        placeholder="nombre@correo.com"
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
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        error={errors?.fields.password}
      />

      {errors?.message && <Text style={styles.error}>{errors.message}</Text>}

      <View style={styles.buttonSpacing}>
        <Button title="Iniciar sesión" onPress={() => onSubmit(email, password)} loading={loading} />
      </View>

      <Link href="/register" style={styles.link}>
        ¿Aún no tienes cuenta? Regístrate
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
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 34.5,
    letterSpacing: -0.6,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
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
