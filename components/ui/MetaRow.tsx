import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export interface MetaItem {
  /** Ionicons icon name. */
  icon?: string;
  text: string;
  /** Override color for both icon and text. Defaults to Colors.textMuted. */
  color?: string;
}

interface MetaRowProps {
  items: MetaItem[];
  size?: 'sm' | 'md';
  wrap?: boolean;
}

/**
 * Renders a horizontal row of icon+text pairs separated by small dot dividers.
 * Used in RoomCard, VehicleCard, and detail screens for capacity/size/feature rows.
 */
export function MetaRow({ items, size = 'sm', wrap = false }: MetaRowProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const iconSize = size === 'sm' ? 11 : 13;
  const textFs = size === 'sm' ? FontSize.xs : FontSize.sm;

  return (
    <View style={[styles.row, wrap && styles.wrap]}>
      {items.map((item, i) => {
        const color = item.color ?? Colors.textMuted;
        return (
          <React.Fragment key={`${item.text}-${i}`}>
            {i > 0 && <View style={styles.dot} />}
            <View style={styles.item}>
              {item.icon && (
                <Ionicons
                  name={item.icon as any}
                  size={iconSize}
                  color={color}
                />
              )}
              <Text style={[styles.text, { fontSize: textFs, color }]}>
                {item.text}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    wrap: { flexWrap: 'wrap' },
    item: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: Colors.border,
    },
    text: { fontWeight: '500' },
  });
}
