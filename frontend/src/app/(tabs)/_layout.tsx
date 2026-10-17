import { Image, type ImageSource } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { colors, fonts, glass } from '@/styles/global';

// Los íconos vienen en gris del Figma; tintColor los pinta del color de la pestaña
function tabIcon(source: ImageSource | number) {
  return function TabIcon({ color }: { color: ColorValue }) {
    // Los colores de las pestañas son hex del tema, siempre strings
    return <Image source={source} style={styles.icon} tintColor={color as string} contentFit="contain" />;
  };
}

// La pestaña activa va en negrita, las demás en regular
function TabLabel({
  focused,
  color,
  children,
}: {
  focused: boolean;
  color: ColorValue;
  children: string;
}) {
  return (
    <Text style={[styles.label, { color, fontFamily: focused ? fonts.bold : fonts.regular }]}>
      {children}
    </Text>
  );
}

// Fondo de vidrio de la barra: en iOS desenfoca lo que pasa por debajo; en Android (donde el desenfoque
// no puede apuntar a la misma vista que lo contiene) queda como vidrio translúcido sin desenfoque
function TabBarGlass() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Platform.OS === 'ios' && <BlurView style={StyleSheet.absoluteFill} intensity={40} tint="light" />}
      <View style={[StyleSheet.absoluteFill, styles.glass]} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const height = useTabBarHeight();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabel: TabLabel,
        tabBarStyle: [styles.bar, { height, paddingBottom: insets.bottom }],
        tabBarBackground: TabBarGlass,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{ title: 'Explorar', tabBarIcon: tabIcon(require('@/assets/images/tabs/explore.svg')) }}
      />
      <Tabs.Screen
        name="groups"
        options={{ title: 'Grupos', tabBarIcon: tabIcon(require('@/assets/images/tabs/groups.svg')) }}
      />
      <Tabs.Screen
        name="my-recipes"
        options={{
          title: 'Mis recetas',
          tabBarIcon: tabIcon(require('@/assets/images/tabs/my-recipes.svg')),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: tabIcon(require('@/assets/images/tabs/profile.svg')) }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Flota sobre el contenido: las listas se ven pasar por detrás del vidrio
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    elevation: 0,
    boxShadow: '0px -6px 20px rgba(84, 62, 40, 0.06)',
  },
  glass: {
    backgroundColor: Platform.OS === 'ios' ? glass.tabBarBlur : glass.tabBar,
    boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.9)',
  },
  item: {
    paddingTop: 13,
    gap: 5,
  },
  icon: {
    width: 21,
    height: 21,
  },
  label: {
    fontSize: 12,
    lineHeight: 18,
  },
});
