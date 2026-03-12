import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { AIFlightAnalysis } from '../../types/flight.types';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  analysis: AIFlightAnalysis;
}

export function AIAnalysisCard({ analysis }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>{t('flights.aiAnalysis')}</Text>
            <Text style={styles.subtitle}>{t('flights.aiRecommendation')}</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* Price Trend */}
          <View style={styles.trendRow}>
            <View style={[styles.trendItem, styles.trendBest]}>
              <Text style={styles.trendLabel}>{t('flights.currentPrice')}</Text>
              <Text style={styles.trendValue}>{analysis.currentPriceLevel}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>{t('flights.priceChange')}</Text>
              <Text style={[styles.trendValue, { color: (analysis.priceChangePercent ?? 0) > 0 ? Colors.error : Colors.success }]}>
                {(analysis.priceChangePercent ?? 0) > 0 ? '\u25b2' : '\u25bc'} {Math.abs(analysis.priceChangePercent ?? 0)}%
              </Text>
            </View>
          </View>

          {/* Recommendation */}
          <View style={styles.recommendBox}>
            <Ionicons name="bulb-outline" size={18} color={Colors.accent} />
            <Text style={styles.recommendText}>{analysis.recommendation}</Text>
          </View>

          {/* Details */}
          {(analysis.details ?? []).map((d, i) => (
            <View key={i} style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.detailText}>{d}</Text>
            </View>
          ))}

          {/* Best Time */}
          <View style={styles.bestTimeRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.bestTimeText}>{t('flights.bestBookingTime')}: {analysis.bestBookingTime}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md, borderWidth: 1, borderColor: Colors.primaryLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.primaryLight },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted },
  body: { padding: Spacing.md, gap: Spacing.md },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center' },
  trendItem: { alignItems: 'center', flex: 1, backgroundColor: Colors.background, borderRadius: Radius.lg, padding: Spacing.sm },
  trendBest: { backgroundColor: '#ECFDF5' },
  trendLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  trendValue: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  recommendBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#FFF8E1', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  recommendText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  detailRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  detailText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  bestTimeRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  bestTimeText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
