import React, { useMemo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Hotel } from '../../types/hotel.types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTranslation } from '../../hooks/useTranslation';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { HOTEL_CATEGORY, ratingLabel } from '../../constants/categoryMeta';
import { FeatureChips } from '../ui/FeatureChips';
import { PriceBlock } from '../ui/PriceBlock';

interface HotelCardProps {
  hotel: Hotel;
  onPress: (hotel: Hotel) => void;
}

export default function HotelCard({ hotel, onPress }: HotelCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const cat = HOTEL_CATEGORY[hotel.category] ?? { label: hotel.category, color: Colors.primary };
  const topAmenities = hotel.amenities.slice(0, 3);
  const ratingDesc = ratingLabel(hotel.rating);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(hotel)} activeOpacity={0.92}>
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: hotel.imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.52)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top row overlays */}
        <View style={styles.imgTopRow}>
          {hotel.isRecommended ? (
            <View style={styles.recommendBadge}>
              <Ionicons name="sparkles" size={10} color="#FFFFFF" />
              <Text style={styles.recommendText}>추천</Text>
            </View>
          ) : <View />}
          <TouchableOpacity style={styles.heartBtn} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom row overlays */}
        <View style={styles.imgBottomRow}>
          <View style={[styles.catPill, { backgroundColor: cat.color }]}>
            <Text style={styles.catText}>{cat.label}</Text>
          </View>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingPillText}>{hotel.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Star rating row */}
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons key={i} name="star" size={11} color={i < hotel.starRating ? '#F59E0B' : '#E5E7EB'} />
          ))}
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>{hotel.nameKo}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{hotel.location ?? hotel.city}</Text>
        </View>

        {/* Amenity chips */}
        <FeatureChips features={topAmenities} variant="tag" />

        {/* Footer: price + rating */}
        <View style={styles.footer}>
          <PriceBlock label={t('hotels.lowestPrice')} amount={hotel.pricePerNight} unit={t('common.perNight')} />
          <View style={styles.reviewBlock}>
            <View style={styles.reviewRatingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.reviewRating}>{hotel.rating.toFixed(1)}</Text>
              <Text style={styles.reviewRatingDesc}>{ratingDesc}</Text>
            </View>
            <Text style={styles.reviewCount}>{t('hotels.reviewCount', { count: hotel.reviewCount.toLocaleString() })}</Text>
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
      ...Shadow.md,
    },
    imageWrap:    { height: 200, position: 'relative' },
    image:        { width: '100%', height: '100%', resizeMode: 'cover' },
    imgTopRow:    { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    recommendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 4 },
    recommendText:  { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: '700' },
    heartBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
    imgBottomRow: { position: 'absolute', bottom: 10, left: 10, right: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    catPill:      { borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 4 },
    catText:      { fontSize: FontSize.xs, fontWeight: '700', color: '#FFFFFF' },
    ratingPill:   { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
    ratingPillText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700' },
    body:         { padding: Spacing.base, gap: 6 },
    starsRow:     { flexDirection: 'row', gap: 2 },
    name:         { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, lineHeight: 24 },
    locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
    location:     { fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
    footer:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: Spacing.sm, marginTop: 4, borderTopWidth: 1, borderTopColor: Colors.border },
    reviewBlock:      { alignItems: 'flex-end', gap: 2 },
    reviewRatingRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
    reviewRating:     { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textPrimary },
    reviewRatingDesc: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
    reviewCount:      { fontSize: FontSize.xs, color: Colors.textMuted },
  });
}
