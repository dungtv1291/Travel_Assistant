import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  color?: string;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  color,
  size = 'md',
}) => {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        selected
          ? { backgroundColor: color ?? Colors.primary, borderColor: color ?? Colors.primary }
          : styles.unselected,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'sm' ? styles.labelSm : styles.labelMd,
          selected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 7,
    marginRight: Spacing.sm,
  },
  small: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    marginRight: Spacing.xs,
  },
  unselected: {
    backgroundColor: Colors.surfaceSecondary,
  },
  label: { fontWeight: '600' },
  labelMd: { fontSize: FontSize.sm },
  labelSm: { fontSize: FontSize.xs },
  labelSelected: { color: '#FFFFFF' },
  labelUnselected: { color: Colors.textSecondary },
  });
}
