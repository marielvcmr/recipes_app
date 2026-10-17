import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { colors, fonts, primaryGradient } from '@/styles/global';
import { INDEX_LETTERS } from '@/utils/alphabet';

// Alto de cada letra: se ajusta al alto disponible de la pantalla, dentro de estos límites
const MIN_ROW = 12;
const MAX_ROW = 20;
const TRACK_PADDING = 4;
const BUBBLE_SIZE = 46;

type AlphabetIndexProps = {
  // Letras que tienen recetas; las demás se ven apagadas
  available: string[];
  onSelect: (letter: string) => void;
};

// Índice alfabético vertical, como en Contactos: se toca o se arrastra el dedo sobre las letras
// para saltar a esa sección. Cada letra es una mini tarjeta; mientras se arrastra, una burbuja
// a la derecha muestra la letra actual. Ocupa todo el alto de su contenedor y se centra en él.
export default function AlphabetIndex({ available, onSelect }: AlphabetIndexProps) {
  const [rowHeight, setRowHeight] = useState(MAX_ROW);
  const [active, setActive] = useState<number | null>(null);
  // Dónde empezó el toque: locationY dentro de la barra y pageY en la pantalla
  const start = useRef({ locationY: 0, pageY: 0 });
  const lastLetter = useRef<string | null>(null);

  // Si la letra tocada no tiene recetas, salta a la siguiente que sí tenga (o a la anterior)
  const nearestAvailable = (index: number) => {
    const has = (letter: string) => available.includes(letter);
    return INDEX_LETTERS.slice(index).find(has) ?? INDEX_LETTERS.slice(0, index).reverse().find(has);
  };

  const handle = (y: number) => {
    const index = Math.min(INDEX_LETTERS.length - 1, Math.max(0, Math.floor((y - TRACK_PADDING) / rowHeight)));
    setActive(index);
    const letter = nearestAvailable(index);
    if (letter && letter !== lastLetter.current) {
      lastLetter.current = letter;
      onSelect(letter);
    }
  };

  const release = () => {
    setActive(null);
    lastLetter.current = null;
  };

  const handlers = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    // Que la lista no le quite el gesto mientras se arrastra sobre las letras
    onResponderTerminationRequest: () => false,
    onResponderGrant: (event: GestureResponderEvent) => {
      const { locationY, pageY } = event.nativeEvent;
      start.current = { locationY, pageY };
      handle(locationY);
    },
    onResponderMove: (event: GestureResponderEvent) => {
      handle(start.current.locationY + event.nativeEvent.pageY - start.current.pageY);
    },
    onResponderRelease: release,
    onResponderTerminate: release,
  };

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
      onLayout={(event) => {
        const fit = Math.floor((event.nativeEvent.layout.height - TRACK_PADDING * 2) / INDEX_LETTERS.length);
        setRowHeight(Math.max(MIN_ROW, Math.min(MAX_ROW, fit)));
      }}
    >
      <View>
        <View
          style={[styles.track, active !== null && styles.trackActive]}
          accessibilityRole="adjustable"
          accessibilityLabel="Índice alfabético"
          accessibilityHint="Arrastra para saltar a una letra"
          {...handlers}
        >
          {/* Las letras no reciben toques: así locationY siempre se mide desde el borde de la barra */}
          {INDEX_LETTERS.map((letter, index) => {
            const on = available.includes(letter);
            const isActive = index === active;
            return (
              <View key={letter} pointerEvents="none" style={[styles.row, { height: rowHeight }]}>
                <View
                  style={[
                    styles.card,
                    { height: rowHeight - 3 },
                    !on && styles.cardOff,
                    isActive && styles.cardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.letter,
                      { fontSize: rowHeight >= 16 ? 10.5 : 9 },
                      !on && styles.letterOff,
                      isActive && styles.letterActive,
                    ]}
                  >
                    {letter}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {active !== null && (
          <View
            pointerEvents="none"
            style={[
              styles.bubble,
              { top: TRACK_PADDING + active * rowHeight + rowHeight / 2 - BUBBLE_SIZE / 2 },
            ]}
          >
            <Text style={styles.bubbleText}>{INDEX_LETTERS[active]}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  track: {
    width: 19,
    paddingVertical: TRACK_PADDING,
    alignItems: 'center',
    borderRadius: 8,
  },
  trackActive: {
    backgroundColor: colors.indexTrack,
  },
  row: {
    justifyContent: 'center',
  },
  // Mini tarjeta blanca con sombra naranja debajo
  card: {
    width: 17,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    boxShadow: '0px 1.5px 2.5px rgba(205, 98, 73, 0.38), inset 0px 1px 0px rgba(255, 255, 255, 1)',
  },
  cardOff: {
    backgroundColor: colors.indexCardOff,
    boxShadow: '0px 1px 1.5px rgba(205, 98, 73, 0.1)',
  },
  cardActive: {
    backgroundColor: colors.primary,
    experimental_backgroundImage: primaryGradient,
    boxShadow: '0px 2px 5px rgba(205, 98, 73, 0.55), inset 0px 1px 0px rgba(255, 255, 255, 0.35)',
    transform: [{ scale: 1.15 }],
  },
  letter: {
    color: colors.primary,
    fontFamily: fonts.bold,
    includeFontPadding: false,
    textAlign: 'center',
  },
  letterOff: {
    color: colors.dot,
  },
  letterActive: {
    color: colors.white,
  },
  // Burbuja a la derecha de la barra, a la altura de la letra activa
  bubble: {
    position: 'absolute',
    left: 30,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    experimental_backgroundImage: primaryGradient,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0px 6px 14px rgba(173, 72, 52, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.4)',
  },
  bubbleText: {
    color: colors.white,
    fontFamily: fonts.headingItalic,
    fontSize: 24,
    lineHeight: 30,
  },
});
