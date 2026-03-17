import React, { useState , useMemo} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { AIFlightAnalysis, Flight } from '../../types/flight.types';
import { formatKRWPrice } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  analysis: AIFlightAnalysis;
}

type OptionConfig = {
  key: 'cheapest' | 'fastest' | 'bestValue';
  labelKey: string;
  icon: string;
  color: string;
  bgColor: string;
  badgeColor: string;
  subLabel: (f: Flight) => string;
};

export function AIAnalysisCard({ analysis }: Props) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const [insightsOpen, setInsightsOpen] = useState(false);
  const OPTIONS: OptionConfig[] = [
    {
      key: 'cheapest',
      labelKey: 'flights.cheapestOption',
      icon: 'pricetag',
      color: Colors.success,
      bgColor: '#ECFDF5',
      badgeColor: '#D1FAE5',
      subLabel: (f) => formatKRWPrice(f.price),
    },
    {
      key: 'fastest',
      labelKey: 'flights.fastestOption',
      icon: 'flash',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      badgeColor: '#BAE6FD',
      subLabel: (f) => f.duration,
    },
    {
      key: 'bestValue',
      labelKey: 'flights.bestValueOption',
      icon: 'star',
      color: Colors.warning,
      bgColor: '#FFFBEB',
      badgeColor: '#FDE68A',
      subLabel: (f) => formatKRWPrice(f.price),
    },
  ];

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>{t('flights.aiAnalysis')}</Text>
            <Text style={styles.subtitle}>{t('flights.aiRecommendation')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* 3 Option Cards */}
        <View style={styles.optionsRow}>
          {OPTIONS.map(opt => {
            const flight: Flight = analysis[opt.key];
            return (
              <View key={opt.key} style={[styles.optionCard, { backgroundColor: opt.bgColor, borderColor: opt.color }]}>
                {/* Badge label */}
                <View style={[styles.optionBadge, { backgroundColor: opt.badgeColor }]}>
                  <Ionicons name={opt.icon as never} size={10} color={opt.color} />
                  <Text style={[styles.optionBadgeText, { color: opt.color }]} numberOfLines={1}>
                    {t(opt.labelKey)}
                  </Text>
                </View>
                {/* Airline */}
                <Text style={styles.optionAirline} numberOfLines={1}>{flight.airline}</Text>
                <Text style={styles.optionFlightNum}>{flight.flightNumber}</Text>
                {/* Times */}
                <View style={styles.optionTimeRow}>
                  <Text style={styles.optionTime}>{flight.departureTime}</Text>
                  <Ionicons name="arrow-forward" size={10} color={Colors.textMuted} />
                  <Text style={styles.optionTime}>{flight.arrivalTime}</Text>
                </View>
                {/* Highlight value */}
                <Text style={[styles.optionValue, { color: opt.color }]}>{opt.subLabel(flight)}</Text>
                <Text style={styles.optionDuration}>{flight.duration}</Text>
              </View>
            );
          })}
        </View>

        {/* Recommendation */}
        <View style={styles.recommendBox}>
          <Ionicons name="bulb-outline" size={18} color={Colors.accent} />
          <Text style={styles.recommendText}>{analysis.recommendation}</Text>
        </View>

        {/* Insights toggle */}
        <TouchableOpacity style={styles.insightsToggle} onPress={() => setInsightsOpen(v => !v)} activeOpacity={0.8}>
          <Ionicons name="analytics-outline" size={14} color={Colors.primary} />
          <Text style={styles.insightsToggleText}>{t('flights.aiAnalysis')} {t('flights.insights')}</Text>
          <Ionicons name={insightsOpen ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.primary} />
        </TouchableOpacity>

        {insightsOpen && (
          <View style={styles.insightsBody}>
            {(analysis.insights ?? []).map((ins, i) => (
              <Text key={i} style={styles.insightText}>{ins}</Text>
            ))}
            {(analysis.details ?? []).map((d, i) => (
              <View key={`d-${i}`} style={styles.detailRow}>
                <Ionicons name="checkmark-circle-outline" size={13} color={Colors.primary} />
                <Text style={styles.detailText}>{d}</Text>
              </View>
            ))}
            {analysis.bestBookingTime && (
              <View style={styles.bestTimeRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.bestTimeText}>{t('flights.bestBookingTime')}: {analysis.bestBookingTime}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md, borderWidth: 1, borderColor: Colors.primaryLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm, backgroundColor: Colors.primaryLight },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted },
  body: { padding: Spacing.md, gap: Spacing.sm },
  optionsRow: { flexDirection: 'row', gap: Spacing.sm },
  optionCard: { flex: 1, borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.sm, gap: 3 },
  optionBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  optionBadgeText: { fontSize: 9, fontWeight: '700' },
  optionAirline: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  optionFlightNum: { fontSize: 10, color: Colors.textMuted },
  optionTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  optionTime: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary },
  optionValue: { fontSize: FontSize.sm, fontWeight: '800', marginTop: 4 },
  optionDuration: { fontSize: 10, color: Colors.textMuted },
  recommendBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#FFF8E1', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  recommendText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  insightsToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  insightsToggleText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  insightsBody: { gap: Spacing.sm, paddingTop: Spacing.xs },
  insightText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  detailRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  detailText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  bestTimeRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  bestTimeText: { fontSize: FontSize.sm, color: Colors.textMuted },
  });
}

