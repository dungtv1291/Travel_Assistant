import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FontSize } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';

interface FeatureChipsProps {
  features: string[];
  /** Maximum chips to render before truncating. Defaults to 3. */
  max?: number;
  size?: 'sm' | 'md';
  /**
   * 'check' — successLight background with a checkmark icon (default).
   *           Used for "included" features in rooms and vehicles.
   * 'tag'   — primaryLight background, no icon.
   *           Used for amenity tags in hotel cards.
   */
  variant?: 'check' | 'tag';
}

/**
 * A chip row for feature / amenity lists. Supports two visual variants:
 * - 'check':  green background + checkmark (RoomCard, VehicleCard)
 * - 'tag':    blue background, no icon (HotelCard amenities)
 */
export function FeatureChips({
  features,
  max = 3,
  size = 'sm',
  variant = 'check',
}: FeatureChipsProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const iconSize = size === 'sm' ? 10 : 12;
  const textStyle =
    size === 'md'
      ? [styles.text, styles.textMd, variant === 'tag' && styles.textTag]
      : [styles.text, variant === 'tag' && styles.textTag];

  return (
    <View style={styles.row}>
      {features.slice(0, max).map(f => (
        <View
          key={f}
          style={[styles.chip, variant === 'tag' && styles.chipTag]}
        >
          {variant === 'check' && (
            <Ionicons
              name="checkmark-circle"
              size={iconSize}
              color={Colors.success}
            />
          )}
          <Text style={textStyle as any}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: Colors.successLight,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: 3,
    },
    chipTag: {
      backgroundColor: Colors.primaryLight,
    },
    text: {
      fontSize: FontSize.xs,
      color: Colors.success,
      fontWeight: '600',
    },
    textTag: { color: Colors.primary },
    textMd: { fontSize: FontSize.sm },
  });
}
