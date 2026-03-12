import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Flight } from '../../types/flight.types';
import { Colors } from '../../constants/colors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  cheapest:   { color: Colors.success,      bg: '#DCFCE7' },
  fastest:    { color: Colors.primary,     bg: Colors.primaryLight },
  best_value: { color: Colors.accent,       bg: Colors.accentLight },
  popular:    { color: '#7C3AED',           bg: '#F5F3FF' },
};

interface FlightDealCardProps {
  flight: Flight;
  onPress: () => void;
}

export function FlightDealCard({ flight, onPress }: FlightDealCardProps) {
  const { t } = useTranslation();
  const TAG_LABELS: Record<string, string> = {
    cheapest:   t('components.flightDealCard.cheapest'),
    fastest:    t('components.flightDealCard.fastest'),
    best_value: t('components.flightDealCard.bestValue'),
    popular:    t('components.flightDealCard.popular'),
  };
  const mainTag = flight.tags[0];
  const tagColors = mainTag ? TAG_COLORS[mainTag] : null;
  const tagLabel = mainTag ? (TAG_LABELS[mainTag] ?? mainTag) : null;
  const priceKRW = flight.currency === 'KRW' ? flight.price : Math.round(flight.price * 1350);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Airline + price */}
      <View style={styles.topRow}>
        <View style={styles.airlineRow}>
          <Text style={styles.airlineLogo}>{flight.airlineLogo}</Text>
          <View>
            <Text style={styles.airlineName}>{flight.airline}</Text>
            <Text style={styles.flightNum}>{flight.flightNumber}</Text>
          </View>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.priceFrom}>{t('components.flightDealCard.from')}</Text>
          <Text style={styles.price}>₩{priceKRW.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Text style={styles.routeTime}>{flight.departureTime}</Text>
          <Text style={styles.routeCode}>{flight.origin.code}</Text>
          <Text style={styles.routeCity}>{flight.origin.city}</Text>
        </View>
        <View style={styles.routeCenter}>
          <View style={styles.routeLine} />
          <Ionicons name="airplane" size={14} color={Colors.primary} />
          <View style={styles.routeLine} />
        </View>
        <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeTime}>{flight.arrivalTime}</Text>
          <Text style={styles.routeCode}>{flight.destination.code}</Text>
          <Text style={styles.routeCity}>{flight.destination.city}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.meta}>{flight.duration} · {flight.stops === 0 ? t('components.flightDealCard.directFlight') : t('components.flightDealCard.stopover', { count: flight.stops })}</Text>
        </View>
        {tagColors && tagLabel && (
          <View style={[styles.tagBadge, { backgroundColor: tagColors.bg }]}>
            <Text style={[styles.tagText, { color: tagColors.color }]}>{tagLabel}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    width: 252,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  airlineLogo: { fontSize: 26 },
  airlineName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  flightNum: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  priceBlock: { alignItems: 'flex-end' },
  priceFrom: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  divider: { height: 1, backgroundColor: Colors.divider },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routePoint: { alignItems: 'flex-start' },
  routeTime: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  routeCode: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 1,
  },
  routeCity: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  routeCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    gap: 3,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  tagBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
