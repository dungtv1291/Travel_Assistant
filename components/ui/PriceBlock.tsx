import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FontSize } from '../../constants/typography';
import { formatKRWPrice, formatKRWShort } from '../../utils/format';

interface PriceBlockProps {
  amount: number;
  /** Small muted label above the price (e.g. "최저가", "1박 기준"). */
  label?: string;
  /** Suffix after the price (e.g. "/박", "/일", "/회"). */
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'full' uses formatKRWPrice (만원 style), 'short' uses formatKRWShort (₩28.5만). */
  format?: 'full' | 'short';
  align?: 'left' | 'right';
}

const PRICE_FONT: Record<string, number> = {
  sm: FontSize.base,
  md: FontSize.xl,
  lg: FontSize['2xl'],
};

const META_FONT: Record<string, number> = {
  sm: FontSize.xs,
  md: FontSize.xs,
  lg: FontSize.sm,
};

/**
 * Normalised price display block. Renders an optional muted label,
 * the formatted KRW amount in accent color, and an optional unit suffix.
 * Used in hotel cards, room cards, vehicle cards, and bottom bars.
 */
export function PriceBlock({
  amount,
  label,
  unit,
  size = 'md',
  format = 'full',
  align = 'left',
}: PriceBlockProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const formatted =
    format === 'short' ? formatKRWShort(amount) : formatKRWPrice(amount);

  return (
    <View style={[styles.container, align === 'right' && styles.right]}>
      {label && (
        <Text style={[styles.label, { fontSize: META_FONT[size] }]}>{label}</Text>
      )}
      <View style={styles.row}>
        <Text style={[styles.price, { fontSize: PRICE_FONT[size] }]}>
          {formatted}
        </Text>
        {unit && (
          <Text style={[styles.unit, { fontSize: META_FONT[size] }]}>{unit}</Text>
        )}
      </View>
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { gap: 2 },
    right: { alignItems: 'flex-end' },
    label: { color: Colors.textMuted, fontWeight: '500' },
    row: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    price: { fontWeight: '800', color: Colors.accent },
    unit: { color: Colors.textMuted, fontWeight: '500' },
  });
}
