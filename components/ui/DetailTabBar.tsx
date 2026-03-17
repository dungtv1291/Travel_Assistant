import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

interface DetailTabBarProps {
  tabs: readonly string[];
  activeIndex: number;
  onChange: (index: number) => void;
  /**
   * When true the tab bar is scrollable horizontally and each tab
   * sizes to its content. When false (default) tabs share equal width.
   */
  scrollable?: boolean;
}

/**
 * Horizontal tab selector used in detail screens (hotel detail 4 tabs,
 * destination detail 5 tabs). Supports both fixed-width and scrollable modes.
 */
export function DetailTabBar({
  tabs,
  activeIndex,
  onChange,
  scrollable = false,
}: DetailTabBarProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const items = (tabs as string[]).map((tab, i) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tab,
        scrollable ? styles.tabScrollable : styles.tabRow,
        activeIndex === i && styles.tabActive,
      ]}
      onPress={() => onChange(i)}
    >
      <Text style={[styles.tabText, activeIndex === i && styles.tabTextActive]}>
        {tab}
      </Text>
    </TouchableOpacity>
  ));

  if (scrollable) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.container, styles.rowContainer]}>{items}</View>;
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    rowContainer: { flexDirection: 'row' },
    scrollContent: { paddingHorizontal: Spacing.base },
    tab: {
      paddingVertical: Spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabRow: {
      flex: 1,
      alignItems: 'center',
    },
    tabScrollable: {
      paddingHorizontal: Spacing.md,
    },
    tabActive: { borderBottomColor: Colors.primary },
    tabText: {
      fontSize: FontSize.xs,
      fontWeight: '600',
      color: Colors.textMuted,
    },
    tabTextActive: { color: Colors.primary },
  });
}
