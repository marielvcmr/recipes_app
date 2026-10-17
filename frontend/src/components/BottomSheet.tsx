import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBlurTarget } from '@/context/BlurTargetContext';
import { colors } from '@/styles/global';

type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

// Arrastrar la barrita más de esto (o soltarla rápido hacia abajo) cierra la hoja
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.6; // px por ms

// Hoja que sube desde abajo sobre la pantalla desenfocada.
// Se cierra con la X de cada contenido, tocando el fondo, con "atrás" en Android o arrastrando la barrita hacia abajo.
export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const blurTarget = useBlurTarget();

  // El Modal sigue montado mientras corre la animación de salida (visible ya es false)
  const [mounted, setMounted] = useState(visible);
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setMounted(true);
  }

  // progress: 0 = oculta, 1 = abierta. drag: cuánto se arrastró la hoja hacia abajo
  const [progress] = useState(() => new Animated.Value(0));
  const [drag] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      drag.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress, drag]);

  // --- Arrastre de la barrita ---
  const start = useRef(0);
  const last = useRef({ pageY: 0, time: 0, velocity: 0 });

  const dragHandlers = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (event: GestureResponderEvent) => {
      const { pageY, timestamp } = event.nativeEvent;
      start.current = pageY;
      last.current = { pageY, time: timestamp, velocity: 0 };
    },
    onResponderMove: (event: GestureResponderEvent) => {
      const { pageY, timestamp } = event.nativeEvent;
      // Hacia arriba no se mueve: la hoja ya está en su lugar
      drag.setValue(Math.max(0, pageY - start.current));
      const elapsed = Math.max(1, timestamp - last.current.time);
      last.current = { pageY, time: timestamp, velocity: (pageY - last.current.pageY) / elapsed };
    },
    onResponderRelease: (event: GestureResponderEvent) => {
      const distance = event.nativeEvent.pageY - start.current;
      if (distance > DISMISS_DISTANCE || last.current.velocity > DISMISS_VELOCITY) onClose();
      // Si la pantalla no la cerró (ej. se está guardando), vuelve a su lugar
      Animated.spring(drag, { toValue: 0, bounciness: 4, useNativeDriver: true }).start();
    },
    onResponderTerminate: () => {
      Animated.spring(drag, { toValue: 0, bounciness: 4, useNativeDriver: true }).start();
    },
  };

  const translateY = Animated.add(
    progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }),
    drag,
  );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Fondo: la pantalla de atrás desenfocada y un poco oscurecida; aparece con un fundido */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={45}
            tint="dark"
            blurMethod="dimezisBlurViewSdk31Plus"
            blurTarget={blurTarget ?? undefined}
          />
          <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        </Animated.View>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />

        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom, transform: [{ translateY }] }]}>
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>

          {/* Barrita para arrastrar hacia abajo: va encima del contenido (también sobre la foto de una receta) */}
          <View style={styles.handleArea} pointerEvents="box-none">
            <View
              style={styles.handleTouch}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              accessibilityHint="Desliza hacia abajo para cerrar"
              onAccessibilityTap={onClose}
              {...dragHandlers}
            >
              <View style={styles.handle} />
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    backgroundColor: colors.scrim,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    boxShadow: '0px -15px 50px rgba(0, 0, 0, 0.14)',
    overflow: 'hidden',
  },
  handleArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // Zona de toque más grande que la barrita, para que sea fácil agarrarla
  handleTouch: {
    width: 120,
    height: 26,
    alignItems: 'center',
    paddingTop: 9,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.handle,
  },
});
