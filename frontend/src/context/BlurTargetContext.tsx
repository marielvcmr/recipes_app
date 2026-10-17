import { BlurTargetView } from 'expo-blur';
import { createContext, useContext, useRef, type PropsWithChildren, type RefObject } from 'react';
import { StyleSheet, type View } from 'react-native';

// En Android, el BlurView de expo-blur necesita saber qué vista desenfocar: toda la app va dentro
// de este BlurTargetView y las hojas (BottomSheet) lo usan como fondo borroso. En iOS no hace falta.
const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export function useBlurTarget() {
  return useContext(BlurTargetContext);
}

export function BlurTargetProvider({ children }: PropsWithChildren) {
  const target = useRef<View>(null);

  return (
    <BlurTargetContext.Provider value={target}>
      <BlurTargetView ref={target} style={styles.fill}>
        {children}
      </BlurTargetView>
    </BlurTargetContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
