import type { ReactElement } from 'react';
import { FlatList, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Group } from '@/api/types';
import GroupCard from '@/components/GroupCard';
import NewGroupTile from '@/components/NewGroupTile';

type GroupGridProps = {
  groups: Group[];
  onCreate: () => void;
  onOpen: (group: Group) => void;
  header?: ReactElement;
  // Carga, error o "sin resultados": va debajo de la grilla porque la tarjeta "Nuevo grupo" siempre está
  footer?: ReactElement | null;
  onEndReached?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

// "new": tarjeta "Nuevo grupo"; "spacer": hueco para que la última tarjeta de una fila impar no se estire
type Cell = { kind: 'new' } | { kind: 'group'; group: Group; index: number } | { kind: 'spacer' };

// Grilla de 2 columnas con mis grupos; la primera celda es siempre "Nuevo grupo"
export default function GroupGrid({
  groups,
  onCreate,
  onOpen,
  header,
  footer,
  onEndReached,
  contentContainerStyle,
}: GroupGridProps) {
  const cells: Cell[] = [{ kind: 'new' }, ...groups.map((group, index) => ({ kind: 'group' as const, group, index }))];
  if (cells.length % 2 === 1) cells.push({ kind: 'spacer' });

  return (
    <FlatList
      data={cells}
      numColumns={2}
      keyExtractor={(cell) => (cell.kind === 'group' ? cell.group.id : cell.kind)}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          {item.kind === 'new' && <NewGroupTile onPress={onCreate} />}
          {item.kind === 'group' && <GroupCard group={item.group} index={item.index} onPress={() => onOpen(item.group)} />}
        </View>
      )}
      columnWrapperStyle={styles.row}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={contentContainerStyle}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 14,
  },
  cell: {
    flex: 1,
  },
  separator: {
    height: 22,
  },
});
