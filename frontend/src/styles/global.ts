// Tema sacado del Figma (mobileRecipes)
export const colors = {
  primary: '#cd6249',
  text: '#25241f',
  textSecondary: '#68665e',
  textMuted: '#56544d',
  surface: '#fbfaf6',
  input: '#ffffff',
  border: '#e7e2d8',
  white: '#ffffff',
  error: '#b3261e',
  danger: '#b34735',
  tabInactive: '#6e6b64',
  tabBar: 'rgba(251, 250, 246, 0.96)',
  // Fondo del avatar cuando el usuario no tiene avatarColor
  avatar: '#76505b',
  closeButton: '#f0ece4',
  // Oscurece la pantalla detrás de una hoja inferior (BottomSheet)
  backdrop: 'rgba(24, 25, 20, 0.5)',
  // Degradado oscuro sobre la foto de fondo de login y registro
  overlayTop: 'rgba(24, 25, 20, 0.5)',
  overlayBottom: 'rgba(24, 25, 20, 0.82)',
};

// Colores de perfil que el usuario puede elegir; el primero es el de por defecto (colors.avatar)
export const avatarColors = ['#76505b', '#955846', '#b56f55', '#9a7448', '#526879', '#6c5d87'];

// Nombres con los que se cargan en src/app/_layout.tsx
export const fonts = {
  heading: 'PlayfairDisplay_600SemiBold',
  headingItalic: 'PlayfairDisplay_600SemiBold_Italic',
  regular: 'DMSans_400Regular',
  bold: 'DMSans_700Bold',
};
