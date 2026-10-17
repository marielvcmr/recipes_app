import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

type GroupCoverProps = {
  // Fotos de las 2 primeras recetas del grupo (0, 1 o 2)
  urls: string[];
  color: string;
  // Posición del grupo en la lista: se muestra como "01", "02"...
  index: number;
};

// Portada de la tarjeta de un grupo: dos fotos lado a lado, una sola o, sin fotos, el color con el ícono de carpeta
export default function GroupCover({ urls, color, index }: GroupCoverProps) {
  const photos = urls.slice(0, 2);

  return (
    <View style={[styles.cover, { backgroundColor: color }]}>
      {photos.length > 0 ? (
        photos.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.photo} contentFit="cover" transition={150} />
        ))
      ) : (
        <View style={styles.empty}>
          <Image
            source={require('@/assets/images/tabs/groups.svg')}
            style={styles.emptyIcon}
            tintColor={colors.white}
            contentFit="contain"
          />
        </View>
      )}
      <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 142,
    flexDirection: 'row',
    borderRadius: 19,
    overflow: 'hidden',
  },
  photo: {
    flex: 1,
    height: '100%',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 34,
    height: 34,
    opacity: 0.85,
  },
  number: {
    position: 'absolute',
    top: 9,
    right: 10,
    color: colors.white,
    fontFamily: fonts.headingItalic,
    fontSize: 16,
  },
});
