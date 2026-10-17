import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import LoginCard from '@/components/LoginCard';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/styles/global';
import { toFormErrors, type FormErrors } from '@/utils/errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setErrors(undefined);
    try {
      await signIn(email, password);
      router.replace('/profile');
    } catch (error) {
      setErrors(toFormErrors(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/auth/background.jpg')}
      resizeMode="cover"
      style={styles.background}
    >
      <LinearGradient
        colors={[colors.overlayTop, colors.overlayBottom]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/auth/logo.svg')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="CookPlan"
            />
          </View>

          <LoginCard onSubmit={handleLogin} loading={loading} errors={errors} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  header: {
    height: 220,
    justifyContent: 'flex-end',
    paddingBottom: 41,
  },
  logo: {
    width: 169,
    height: 32,
  },
});
