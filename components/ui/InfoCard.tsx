import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface InfoCardProps {
  /** Optional card header text. */
  title?: string;
  /** Optional Ionicons icon shown before the title. */
  icon?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Generic surface card with optional icon+title header.
 * Normalises the card pattern used 4× in transport detail.
 */
export function InfoCard({ title, icon, children, style }: InfoCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={styles.header}>
          {icon && (
            <Ionicons name={icon as any} size={16} color={Colors.primary} />
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,
      padding: Spacing.base,
      gap: Spacing.sm,
      ...Shadow.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    title: {
      fontSize: FontSize.base,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
  });
}
