import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { ItineraryActivity } from '../../types/trip.types';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  activity: ItineraryActivity;
  isLast?: boolean;
}

const ACTIVITY_COLORS: Record<string, string> = {
  sightseeing: Colors.primary,
  food: Colors.accent,
  accommodation: Colors.success,
  transport: '#6B7280',
  shopping: '#8B5CF6',
  relaxation: '#06B6D4',
};

const ACTIVITY_ICONS: Record<string, string> = {
  sightseeing: 'camera-outline',
  food: 'restaurant-outline',
  accommodation: 'bed-outline',
  transport: 'car-outline',
  shopping: 'bag-outline',
  relaxation: 'leaf-outline',
};

export function TimelineItem({ activity, isLast }: Props) {
  const { t } = useTranslation();
  const color = ACTIVITY_COLORS[activity.type] ?? Colors.primary;
  const icon = ACTIVITY_ICONS[activity.type] ?? 'ellipse-outline';

  return (
    <View style={styles.container}>
      {/* Timeline Column */}
      <View style={styles.timelineCol}>
        <View style={[styles.dot, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={12} color="#FFFFFF" />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{activity.time}</Text>
          <Text style={styles.duration}>({activity.duration})</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{activity.description}</Text>
          {activity.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.locationText}>{activity.location}</Text>
            </View>
          )}
          {activity.estimatedCost && (
            <View style={styles.costRow}>
              <Ionicons name="card-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.costText}>
                {t('components.timelineItem.estimatedCost', { cost: (activity.estimatedCost * 1350).toLocaleString() })}
              </Text>
            </View>
          )}
          {activity.tips && (
            <View style={styles.tipRow}>
              <Ionicons name="bulb-outline" size={12} color={Colors.accent} />
              <Text style={styles.tipText}>{activity.tips}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timelineCol: {
    alignItems: 'center',
    width: 28,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  time: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  duration: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: { fontSize: FontSize.xs, color: Colors.textMuted },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  costText: { fontSize: FontSize.xs, color: Colors.textMuted },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    backgroundColor: '#FFF8E1',
    borderRadius: Radius.sm,
    padding: Spacing.xs + 1,
  },
  tipText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
});
