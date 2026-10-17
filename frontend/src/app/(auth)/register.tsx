import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import RegisterCard from '@/components/RegisterCard';
import { colors } from '@/styles/global';

export default function RegisterScreen() {
  // TODO: llamar a POST /auth/register cuando exista src/api/auth.ts
  const handleRegister = (username: string, email: string, password: string) => {
    console.log({ username, email, password });
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

          <RegisterCard onSubmit={handleRegister} />
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
