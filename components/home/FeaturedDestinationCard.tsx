import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Destination } from '../../types/destination.types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { formatReviewCount } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.62;
const CARD_HEIGHT = 230;

interface FeaturedDestinationCardProps {
  destination: Destination;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  dealBadge?: string; // e.g. '32%' — green deal percentage badge
}

export const FeaturedDestinationCard: React.FC<FeaturedDestinationCardProps> = ({
  destination,
  onPress,
  isFavorite = false,
  onFavoriteToggle,
  dealBadge,
}) => {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.92}>
    <Image source={{ uri: destination.imageUrl }} style={styles.image} />
    <LinearGradient
      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.78)']}
      style={StyleSheet.absoluteFillObject}
    />

    {/* Heart button */}
    {onFavoriteToggle && (
      <TouchableOpacity style={styles.favoriteBtn} onPress={onFavoriteToggle}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite ? Colors.accent : '#FFF'}
        />
      </TouchableOpacity>
    )}

    {/* Deal badge — TravelIn style green badge */}
    {dealBadge && (
      <View style={styles.dealBadge}>
        <Text style={styles.dealBadgeText}>{dealBadge}</Text>
      </View>
    )}

    {/* Bottom content overlay */}
    <View style={styles.content}>
      <Text style={styles.name}>{destination.nameKo}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.85)" />
        <Text style={styles.location}>{destination.region}, {t('common.vietnam')}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFB800" />
          <Text style={styles.ratingText}>{destination.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({formatReviewCount(destination.reviewCount)})</Text>
        </View>
        <View style={styles.peopleBadge}>
          <Ionicons name="people-outline" size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.peopleText}>{(destination.popularityScore ?? 0)}%</Text>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );
};

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    ...Shadow.card,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  dealBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    gap: 4,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  peopleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  peopleText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  });
}

