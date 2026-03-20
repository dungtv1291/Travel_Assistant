import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

function getVariantColors(Colors: ReturnType<typeof useThemeColors>): Record<BadgeVariant, { bg: string; text: string }> {
  return {
    primary: { bg: Colors.primaryLight, text: Colors.primary },
    success: { bg: Colors.successLight, text: Colors.success },
    warning: { bg: Colors.warningLight, text: Colors.warning },
    error: { bg: Colors.errorLight, text: Colors.error },
    info: { bg: Colors.infoLight, text: Colors.info },
    neutral: { bg: Colors.surfaceSecondary, text: Colors.textSecondary },
  };
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  size = 'sm',
}) => {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const variantColors = getVariantColors(Colors);
  const colors = variantColors[variant];
  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      <Text style={[styles.text, size === 'sm' ? styles.textSm : styles.textMd, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
};

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  small: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  medium: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  text: { fontWeight: '600' },
  textSm: { fontSize: FontSize.xs },
  textMd: { fontSize: FontSize.sm },
  });
}
