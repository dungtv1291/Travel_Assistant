import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../common/Chip';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing } from '../../constants/spacing';
import { useTranslation } from '../../hooks/useTranslation';

export const CATEGORY_FILTER_IDS = ['all', 'beach', 'city', 'mountain', 'culture', 'family', 'food'] as const;

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function FilterChips({ selected, onSelect }: Props) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const filters = CATEGORY_FILTER_IDS.map(id => ({ id, label: t(`components.filterChips.${id}`) }));
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
      {filters.map(cat => (
        <Chip
          key={cat.id}
          label={cat.label}
          selected={selected === cat.id}
          onPress={() => onSelect(cat.id)}
        />
      ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  wrapper: { height: 44, justifyContent: 'center', marginBottom: Spacing.base },
  scroll: { marginBottom: Spacing.md },
  content: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  });
}
