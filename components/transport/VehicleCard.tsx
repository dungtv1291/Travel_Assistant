import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { TransportVehicle } from '../../types/transport.types';
import { formatKRWPrice } from '../../utils/format';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize, Typography } from '../../constants/typography';

interface VehicleCardProps {
  vehicle: TransportVehicle;
  onPress: (vehicle: TransportVehicle) => void;
}

const TYPE_LABELS: Record<string, string> = {
  airport_pickup: '공항 픽업',
  private_car: '전용 차량',
  self_drive: '셀프 드라이브',
  day_tour: '데이 투어',
  scooter: '스쿠터',
};

export default function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const TYPE_COLORS: Record<string, string> = {
    airport_pickup: Colors.primary,
    private_car: Colors.accent,
    self_drive: Colors.success,
    day_tour: '#7C3AED',
    scooter: Colors.warning,
  };
  const price = vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0;
  const priceUnit = vehicle.pricePerDay ? '1일' : '1회';
  const typeColor = TYPE_COLORS[vehicle.type] ?? Colors.primary;
  const typeLabel = TYPE_LABELS[vehicle.type] ?? vehicle.type;
  const topFeatures = vehicle.features.slice(0, 3);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(vehicle)}
      activeOpacity={0.92}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: vehicle.imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.48)']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Type badge — bottom-left */}
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeBadgeText}>{typeLabel}</Text>
        </View>
        {/* Popular badge — top-right */}
        {vehicle.isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="flame" size={10} color="#FF6B35" />
            <Text style={styles.popularText}>인기</Text>
          </View>
        )}
        {/* Rating pill — bottom-right */}
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingPillText}>{vehicle.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Name + model */}
        <Text style={styles.name} numberOfLines={1}>{vehicle.nameKo}</Text>
        {vehicle.vehicleModel ? (
          <Text style={styles.model}>{vehicle.vehicleModel}</Text>
        ) : null}

        {/* Meta row: seats · driver mode */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>최대 {vehicle.capacity}인</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons
              name={vehicle.driverIncluded ? 'person-circle-outline' : 'key-outline'}
              size={13}
              color={vehicle.driverIncluded ? Colors.success : Colors.warning}
            />
            <Text style={[
              styles.metaText,
              { color: vehicle.driverIncluded ? Colors.success : Colors.warning },
            ]}>
              {vehicle.driverIncluded ? '기사 포함' : '셀프 드라이브'}
            </Text>
          </View>
          {vehicle.luggageCapacity !== undefined && (
            <>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Ionicons name="briefcase-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>짐 {vehicle.luggageCapacity}개</Text>
              </View>
            </>
          )}
        </View>

        {/* Feature chips */}
        <View style={styles.featureRow}>
          {topFeatures.map(f => (
            <View key={f} style={styles.featureChip}>
              <Ionicons name="checkmark-circle" size={10} color={Colors.success} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Price footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceUnit}>{priceUnit} 요금</Text>
            <Text style={styles.price}>{formatKRWPrice(price)}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Ionicons name="chatbubble-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.reviewCount}>
              {vehicle.reviewCount.toLocaleString()}개 리뷰
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.card,
  },
  imageWrap: { position: 'relative', height: 170 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  typeBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: { color: '#FFF', fontSize: FontSize.xs, fontWeight: '700' },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularText: { color: '#FFF', fontSize: FontSize.xs, fontWeight: '700' },
  ratingPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.lg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  ratingPillText: { color: '#FFF', fontSize: FontSize.sm, fontWeight: '700' },
  body: { padding: Spacing.base, gap: Spacing.xs },
  name: { ...Typography.h5 },
  model: { fontSize: FontSize.sm, color: Colors.textMuted },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 2,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  metaText: { fontSize: FontSize.sm, color: Colors.textMuted },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: Spacing.xs,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  featureText: { fontSize: FontSize.xs, color: Colors.success },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  priceUnit: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  });
}
