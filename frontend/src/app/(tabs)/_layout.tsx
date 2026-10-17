import { Image, type ImageSource } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/styles/global';

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

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabel: TabLabel,
        tabBarStyle: [styles.bar, { height: 72 + insets.bottom, paddingBottom: insets.bottom }],
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
  bar: {
    backgroundColor: colors.tabBar,
    borderTopWidth: 1.2,
    borderTopColor: colors.border,
    elevation: 0,
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
