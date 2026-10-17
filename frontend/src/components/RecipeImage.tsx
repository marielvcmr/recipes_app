import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/styles/global';

type RecipeImageProps = {
  // imageUrl de la receta (Cloudinary) o la uri local de una foto recién elegida
  uri: string | null | undefined;
  iconSize?: number;
};

// Foto de la receta o, si no tiene, la imagen por defecto (fondo crema con el ícono de recetario).
// Ocupa todo su contenedor: el tamaño lo decide quien la usa.
export default function RecipeImage({ uri, iconSize = 34 }: RecipeImageProps) {
  if (uri) {
    return <Image source={{ uri }} style={styles.fill} contentFit="cover" transition={150} />;
  }

  return (
    <View style={[styles.fill, styles.placeholder]}>
      <Image
        source={require('@/assets/images/tabs/my-recipes.svg')}
        style={{ width: iconSize, height: iconSize }}
        tintColor={colors.dot}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.badge,
  },
});
