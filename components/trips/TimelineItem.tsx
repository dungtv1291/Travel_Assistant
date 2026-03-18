import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { ItineraryActivity } from '../../types/trip.types';
import { useTranslation } from '../../hooks/useTranslation';
import { useFormatter } from '../../hooks/useFormatter';

interface Props {
  activity: ItineraryActivity;
  isLast?: boolean;
}

const ACTIVITY_ICONS: Record<string, string> = {
  sightseeing:   'camera-outline',
  attraction:    'camera-outline',
  food:          'restaurant-outline',
  accommodation: 'bed-outline',
  transport:     'car-outline',
  shopping:      'bag-outline',
  relaxation:    'leaf-outline',
  free_time:     'cafe-outline',
};

export function TimelineItem({ activity, isLast }: Props) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { formatPrice } = useFormatter();

  const ACTIVITY_COLORS: Record<string, string> = {
    sightseeing:   Colors.primary,
    attraction:    Colors.primary,
    food:          Colors.accent,
    accommodation: Colors.success,
    transport:     '#6B7280',
    shopping:      '#8B5CF6',
    relaxation:    '#06B6D4',
    free_time:     '#10B981',
  };

  const color = ACTIVITY_COLORS[activity.type] ?? Colors.primary;
  const icon  = ACTIVITY_ICONS[activity.type]  ?? 'ellipse-outline';

  const costLabel = (activity.estimatedCost ?? 0) > 0
    ? formatPrice(activity.estimatedCost, (activity.currency as 'KRW' | 'VND') ?? 'VND')
    : null;

  return (
    <View style={styles.container}>
      {/* Vertical timeline */}
      <View style={styles.timelineCol}>
        <View style={[styles.dot, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={11} color="#FFFFFF" />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Content */}
      <View style={styles.content}>

        {/* Time + duration + booking badge */}
        <View style={styles.timeRow}>
          <Text style={styles.time}>{activity.time}</Text>
          <View style={styles.durationPill}>
            <Ionicons name="time-outline" size={10} color={Colors.textMuted} />
            <Text style={styles.durationText}>{activity.duration}</Text>
          </View>
          {activity.bookingRequired && (
            <View style={styles.bookingPill}>
              <Text style={styles.bookingText}>{t('aiPlanner.bookingRequired')}</Text>
            </View>
          )}
        </View>

        {/* Activity card */}
        <View style={[styles.card, { borderLeftColor: color }]}>
          <Text style={styles.title}>{activity.title}</Text>

          {!!activity.description && (
            <Text style={styles.description} numberOfLines={2}>{activity.description}</Text>
          )}

          {/* Location + cost meta row */}
          {(activity.location || costLabel) ? (
            <View style={styles.metaRow}>
              {activity.location ? (
                <View style={styles.locationPill}>
                  <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                  <Text style={styles.locationText} numberOfLines={1}>{activity.location}</Text>
                </View>
              ) : null}
              {costLabel ? (
                <View style={[styles.costPill, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.costText, { color }]}>{costLabel}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* AI tip */}
          {activity.tips ? (
            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={12} color={Colors.accent} />
              <Text style={styles.tipText}>{activity.tips}</Text>
            </View>
          ) : null}

        </View>
      </View>
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    // ── Timeline structure ──
    container:    { flexDirection: 'row', gap: Spacing.md, marginBottom: 2 },
    timelineCol:  { alignItems: 'center', width: 28 },
    dot:          { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    line:         { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 2, minHeight: 16 },
    content:      { flex: 1, paddingBottom: Spacing.xl },

    // ── Time row ──
    timeRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
    time:         { fontSize: FontSize.base, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.3 },
    durationPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 3 },
    durationText: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
    bookingPill:  { backgroundColor: '#FFF3E0', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    bookingText:  { fontSize: 10, color: '#D97706', fontWeight: '700' },

    // ── Activity card ──
    card:         { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: 6, borderLeftWidth: 3 },
    title:        { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
    description:  { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

    // ── Location + cost meta row ──
    metaRow:      { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
    locationPill: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, minWidth: 0 },
    locationText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
    costPill:     { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    costText:     { fontSize: FontSize.xs, fontWeight: '700' },

    // ── AI tip ──
    tipBox:       { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: Colors.accent + '12', borderRadius: Radius.md, padding: Spacing.sm, marginTop: 4 },
    tipText:      { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
  });
}
