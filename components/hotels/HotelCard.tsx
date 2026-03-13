import React, { useMemo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Hotel } from '../../types/hotel.types';
import { formatKRWPrice } from '../../utils/format';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize, Typography } from '../../constants/typography';

interface HotelCardProps {
  hotel: Hotel;
  onPress: (hotel: Hotel) => void;
}

function StarRow({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name="star"
          size={11}
          color={i < count ? '#F59E0B' : '#E5E7EB'}
        />
      ))}
    </View>
  );
}

export default function HotelCard({ hotel, onPress }: HotelCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const topAmenities = hotel.amenities.slice(0, 3);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(hotel)}
      activeOpacity={0.92}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: hotel.imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.48)']}
          style={StyleSheet.absoluteFillObject}
        />
        {hotel.isRecommended && (
          <View style={styles.recommendBadge}>
            <Text style={styles.recommendText}>추천</Text>
          </View>
        )}
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingPillText}>{hotel.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Stars + category */}
        <View style={styles.headerRow}>
          <StarRow count={hotel.starRating} />
          <Text style={styles.category}>{CATEGORY_LABELS[hotel.category] ?? hotel.category}</Text>
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>{hotel.nameKo}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {hotel.location ?? hotel.city}
          </Text>
        </View>

        {/* Amenities */}
        <View style={styles.amenityRow}>
          {topAmenities.map((a) => (
            <View key={a} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>1박</Text>
            <Text style={styles.price}>{formatKRWPrice(hotel.pricePerNight)}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Ionicons name="chatbubble-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.reviewCount}>{hotel.reviewCount.toLocaleString()}개 리뷰</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  luxury: '럭셔리',
  boutique: '부티크',
  resort: '리조트',
  business: '비즈니스',
  budget: '버짓',
};

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    ...Shadow.card,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recommendText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
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
  ratingPillText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  category: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...Typography.h5,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: Spacing.sm,
  },
  location: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    flex: 1,
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  amenityChip: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  amenityText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.accent,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  });
}
