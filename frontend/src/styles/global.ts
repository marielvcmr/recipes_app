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
  // Fondo del selector Todas/Públicas/Privadas
  segmentBg: '#f2eee6',
  // Círculos de número de paso y fondo de receta sin foto
  badge: '#eee8dd',
  // Puntos separadores "•" en la info de una receta
  dot: '#c9c4ba',
  // Botón Eliminar de una receta
  dangerSoft: '#fff7f5',
  dangerBorder: '#ecd2cc',
  // Botón circular de borrar (detalle de un grupo)
  dangerButton: '#f8e7e3',
  // Borde punteado de la tarjeta "Nuevo grupo"
  dashed: '#cbc5b9',
  // Oscurece la pantalla detrás de una hoja inferior (BottomSheet)
  backdrop: 'rgba(24, 25, 20, 0.5)',
  // Oscurecido suave sobre el fondo desenfocado de las hojas (BottomSheet)
  scrim: 'rgba(24, 25, 20, 0.3)',
  // Barrita para arrastrar las hojas: se ve sobre el fondo crema y sobre las fotos
  handle: 'rgba(201, 196, 186, 0.95)',
  // Índice alfabético: fondo de la barra mientras se arrastra y mini tarjetas de letras sin recetas
  indexTrack: 'rgba(242, 238, 230, 0.92)',
  indexCardOff: 'rgba(255, 255, 255, 0.55)',
  // Degradado oscuro sobre la foto de fondo de login y registro
  overlayTop: 'rgba(24, 25, 20, 0.5)',
  overlayBottom: 'rgba(24, 25, 20, 0.82)',
};

// Colores de perfil que el usuario puede elegir; el primero es el de por defecto (colors.avatar)
export const avatarColors = ['#76505b', '#955846', '#b56f55', '#9a7448', '#526879', '#6c5d87'];

// Fondo de la portada de cada grupo (se elige por su posición en la lista)
export const groupColors = ['#df795f', '#9b6258', '#d6a84f', '#7f8f6a', '#526879', '#6c5d87'];

// Nombres con los que se cargan en src/app/_layout.tsx
export const fonts = {
  heading: 'PlayfairDisplay_600SemiBold',
  headingItalic: 'PlayfairDisplay_600SemiBold_Italic',
  regular: 'DMSans_400Regular',
  bold: 'DMSans_700Bold',
};
