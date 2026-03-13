import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Flight } from '../../types/flight.types';
import { formatKRWPrice, formatDuration } from '../../utils/format';
import { Badge } from '../common/Badge';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  flight: Flight;
  onPress: () => void;
  isSelected?: boolean;
}

export function FlightCard({ flight, onPress, isSelected }: Props) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const tagVariant: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    cheapest: 'success',
    fastest: 'primary',
    best_value: 'warning',
    popular: 'info',
  };
  const tagLabel: Record<string, string> = {
    cheapest: t('flights.cheapestTag'),
    fastest: t('flights.fastestTag'),
    best_value: t('flights.bestValueTag'),
    popular: t('flights.popularTag'),
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header: Airline */}
      <View style={styles.header}>
        <View style={styles.airlineRow}>
          <Text style={styles.airlineEmoji}>✈️</Text>
          <View>
            <Text style={styles.airline}>{flight.airline}</Text>
            <Text style={styles.flightNum}>{flight.flightNumber}</Text>
          </View>
        </View>
        <View style={styles.tags}>
          {flight.tags?.map(tag => (
            <Badge key={tag} label={tagLabel[tag] ?? tag} variant={tagVariant[tag] ?? 'neutral'} size="sm" />
          ))}
        </View>
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.routePoint}>
          <Text style={styles.routeTime}>{flight.departureTime}</Text>
          <Text style={styles.routeCode}>{flight.origin.code}</Text>
          <Text style={styles.routeCity}>{flight.origin.cityKo ?? flight.origin.city}</Text>
        </View>
        <View style={styles.routeMiddle}>
          <Text style={styles.duration}>{flight.duration}</Text>
          <View style={styles.routeLine}>
            <View style={styles.routeDot} />
            <View style={styles.routeLineBar} />
            <Ionicons name="airplane" size={16} color={Colors.primary} />
            <View style={styles.routeLineBar} />
            <View style={styles.routeDot} />
          </View>
          <Text style={styles.stops}>
            {flight.stops === 0 ? t('flights.directFlight') : t('flights.stopover', { count: flight.stops })}
          </Text>
        </View>
        <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeTime}>{flight.arrivalTime}</Text>
          <Text style={styles.routeCode}>{flight.destination.code}</Text>
          <Text style={styles.routeCity}>{flight.destination.cityKo ?? flight.destination.city}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerTag}>
            <Ionicons name="briefcase-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.footerTagText}>{flight.baggage?.cabin ?? '7kg'}</Text>
          </View>
          <View style={styles.footerTag}>
            <Ionicons name="restaurant-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.footerTagText}>{flight.meal ? t('flights.includeMeal') : t('flights.noMeal')}</Text>
          </View>
        </View>
        <Text style={styles.price}>{formatKRWPrice(flight.price)}</Text>
      </View>

      {/* Low seats warning */}
      {(flight.seatsLeft ?? 99) < 10 && (
        <View style={styles.seatsAlert}>
          <Ionicons name="alert-circle" size={12} color={Colors.warning} />
          <Text style={styles.seatsAlertText}>{t('flights.seatsLeft', { count: flight.seatsLeft })}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  airlineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  airlineEmoji: { fontSize: 20 },
  airline: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  flightNum: { fontSize: FontSize.xs, color: Colors.textMuted },
  tags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  route: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routePoint: { alignItems: 'flex-start', flex: 1 },
  routeTime: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  routeCode: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  routeCity: { fontSize: FontSize.xs, color: Colors.textMuted },
  routeMiddle: { flex: 1.5, alignItems: 'center', gap: Spacing.xs },
  duration: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
  routeLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  routeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  routeLineBar: { flex: 1, height: 1, backgroundColor: Colors.border },
  stops: { fontSize: FontSize.xs, color: Colors.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  footerLeft: { gap: 3 },
  footerTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerTagText: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  seatsAlert: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF7ED', borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  seatsAlertText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: '700' },
  });
}
