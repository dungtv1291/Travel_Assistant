import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hotel } from '../../types/hotel.types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Rating } from '../common/Rating';
import { Badge } from '../common/Badge';
import { useTranslation } from '../../hooks/useTranslation';
import { formatKRWPrice } from '../../utils/format';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
  compact?: boolean;
}

export function HotelCard({ hotel, onPress, compact = false }: HotelCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  return (
  <TouchableOpacity style={[styles.container, compact && styles.compact]} onPress={onPress} activeOpacity={0.9}>
    <Image source={{ uri: hotel.imageUrl }} style={compact ? styles.imageSm : styles.image} />
    <View style={styles.info}>
      <View style={styles.topRow}>
        <View style={styles.stars}>
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <Ionicons key={i} name="star" size={10} color="#FFB800" />
          ))}
        </View>
        {hotel.isRecommended && <Badge label={t('components.hotelCard.recommended')} variant="primary" />}
      </View>
      <Text style={styles.name} numberOfLines={1}>{hotel.nameKo}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
        <Text style={styles.location}>{hotel.city}</Text>
      </View>
      <View style={styles.footer}>
        <Rating value={hotel.rating} reviewCount={hotel.reviewCount} size="sm" />
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatKRWPrice(hotel.pricePerNight)}</Text>
          <Text style={styles.perNight}>{t('common.perNight')}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    width: 200,
    marginRight: Spacing.md,
    ...Shadow.md,
  },
  compact: { width: '100%', flexDirection: 'row', height: 100 },
  image: { width: '100%', height: 130 },
  imageSm: { width: 100, height: 100 },
  info: {
    padding: Spacing.md,
    flex: 1,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stars: { flexDirection: 'row', gap: 1 },
  name: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  location: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  price: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.primary,
  },
  perNight: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  });
}
