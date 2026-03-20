import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../common/Button';
import { useFormatter } from '../../hooks/useFormatter';

interface StickyBottomBarProps {
  /**
   * Small label shown above the price (e.g. room name or "총 요금 (2박)").
   * Omitted when no price is shown.
   */
  label?: string;
  /** If provided, shows a price block on the left of the action button. */
  price?: number;
  /** Unit suffix rendered after the price (e.g. "/박", "/일"). */
  priceUnit?: string;
  buttonTitle: string;
  /** Ionicons name + position for an icon inside the button. */
  buttonIcon?: { name: string; position?: 'left' | 'right' };
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Fixed bottom action bar with an optional price display on the left
 * and a primary CTA button on the right. Shared by hotel and transport
 * detail screens.
 */
export function StickyBottomBar({
  label,
  price,
  priceUnit,
  buttonTitle,
  buttonIcon,
  onPress,
  disabled,
  loading,
}: StickyBottomBarProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { formatPrice } = useFormatter();

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.inner}>
        {price != null && (
          <View style={styles.priceSection}>
            {label && (
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(price)}</Text>
              {priceUnit && <Text style={styles.priceUnit}>{priceUnit}</Text>}
            </View>
          </View>
        )}

        <Button
          title={buttonTitle}
          onPress={onPress}
          disabled={disabled}
          loading={loading}
          style={styles.button}
          icon={
            buttonIcon ? (
              <Ionicons name={buttonIcon.name as any} size={16} color="#FFFFFF" />
            ) : undefined
          }
          iconPosition={buttonIcon?.position ?? 'left'}
        />
      </View>
    </SafeAreaView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xs,
    },
    priceSection: { gap: 2 },
    label: {
      fontSize: FontSize.xs,
      color: Colors.textMuted,
      maxWidth: 140,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    price: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: Colors.accent,
    },
    priceUnit: {
      fontSize: FontSize.xs,
      color: Colors.textMuted,
    },
    button: { flex: 1 },
  });
}
