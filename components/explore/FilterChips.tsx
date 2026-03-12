import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../common/Chip';
import { Spacing } from '../../constants/spacing';
import { useTranslation } from '../../hooks/useTranslation';

export const CATEGORY_FILTER_IDS = ['all', 'beach', 'city', 'mountain', 'culture', 'family', 'food'] as const;

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function FilterChips({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  const filters = CATEGORY_FILTER_IDS.map(id => ({ id, label: t(`components.filterChips.${id}`) }));
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
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
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: Spacing.md },
  content: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
});
