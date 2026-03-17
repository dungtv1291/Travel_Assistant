import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Router } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

interface Category {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  route: string;
}

const CATEGORIES: Category[] = [
  { id: 'flights', icon: 'airplane-outline', color: '#1BBCD4', bgColor: '#E4F9FC', route: '/flights' },
  { id: 'hotels', icon: 'bed-outline', color: '#7C3AED', bgColor: '#F5F3FF', route: '/hotel' },
  { id: 'transport', icon: 'car-outline', color: '#059669', bgColor: '#ECFDF5', route: '/transport' },
  { id: 'tours', icon: 'map-outline', color: '#D97706', bgColor: '#FFFBEB', route: '/ai-planner' },
  { id: 'ai', icon: 'sparkles-outline', color: '#EC4899', bgColor: '#FDF4FF', route: '/ai-planner' },
  { id: 'food', icon: 'restaurant-outline', color: '#EF4444', bgColor: '#FEF2F2', route: '/(tabs)/explore' },
];

interface CategoryGridProps {
  router: Router;
}

export function CategoryGrid({ router }: CategoryGridProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {CATEGORIES.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={styles.item}
          onPress={() => router.push(cat.route as never)}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, { backgroundColor: cat.bgColor }]}>
            <Ionicons name={cat.icon} size={26} color={cat.color} />
          </View>
          <Text style={styles.label}>{t(`categories.${cat.id}`)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  item: {
    alignItems: 'center',
    gap: 6,
    width: 66,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  });
}
