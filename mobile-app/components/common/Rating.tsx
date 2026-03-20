import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  style?: ViewStyle;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  reviewCount,
  size = 'md',
  showCount = true,
  style,
}) => {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const starSize = size === 'sm' ? 12 : size === 'md' ? 14 : 18;
  const textSize = size === 'sm' ? FontSize.xs : size === 'md' ? FontSize.sm : FontSize.base;

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="star" size={starSize} color="#FFB800" />
      <Text style={[styles.value, { fontSize: textSize }]}>{value.toFixed(1)}</Text>
      {showCount && reviewCount !== undefined && (
        <Text style={[styles.count, { fontSize: textSize }]}>({reviewCount.toLocaleString()})</Text>
      )}
    </View>
  );
};

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs - 1,
  },
  value: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  count: {
    color: Colors.textMuted,
    fontWeight: '400',
  },
  });
}
