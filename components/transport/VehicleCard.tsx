import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { TransportVehicle } from '../../types/transport.types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize, Typography } from '../../constants/typography';
import { TRANSPORT_TYPE } from '../../constants/categoryMeta';
import { MetaRow, MetaItem } from '../ui/MetaRow';
import { FeatureChips } from '../ui/FeatureChips';
import { PriceBlock } from '../ui/PriceBlock';

interface VehicleCardProps {
  vehicle: TransportVehicle;
  onPress: (vehicle: TransportVehicle) => void;
}

export default function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const price = vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0;
  const priceUnit = vehicle.pricePerDay ? '1일' : '1회';
  const typeMeta = TRANSPORT_TYPE[vehicle.type];
  const typeColor = typeMeta?.color ?? Colors.primary;
  const typeLabel = typeMeta?.label ?? vehicle.type;
  const topFeatures = vehicle.features.slice(0, 3);

  const metaItems: MetaItem[] = [
    { icon: 'people-outline', text: `최대 ${vehicle.capacity}인` },
    {
      icon: vehicle.driverIncluded ? 'person-circle-outline' : 'key-outline',
      text: vehicle.driverIncluded ? '기사 포함' : '셀프 드라이브',
      color: vehicle.driverIncluded ? Colors.success : Colors.warning,
    },
    ...(vehicle.luggageCapacity !== undefined
      ? [{ icon: 'briefcase-outline', text: `짐 ${vehicle.luggageCapacity}개` }]
      : []),
  ];

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
        <MetaRow items={metaItems} size="md" />

        {/* Feature chips */}
        <FeatureChips features={topFeatures} />

        {/* Price footer */}
        <View style={styles.footer}>
          <PriceBlock label={`${priceUnit} 요금`} amount={price} />
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
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  });
}
