import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Destination } from '../../types/destination.types';
import { useTranslation } from '../../hooks/useTranslation';
import { useFormatter } from '../../hooks/useFormatter';

const { width } = Dimensions.get('window');

const GRID_GAP   = Spacing.md;
const GRID_H_PAD = Spacing.base;
const CARD_WIDTH = (width - GRID_H_PAD * 2 - GRID_GAP) / 2;
const GRID_IMG_H = 148;

const CATEGORY_EMOJIS: Record<string, string> = {
  beach: '🏖️', city: '🌆', mountain: '⛰️', culture: '🏛️', family: '👨‍👩‍👧', food: '🍜',
};

const FALLBACK_GRADIENTS: Record<string, [string, string]> = {
  beach:    ['#BAE6FD', '#0EA5E9'],
  city:     ['#C7D2FE', '#6366F1'],
  mountain: ['#BBF7D0', '#059669'],
  culture:  ['#FDE68A', '#D97706'],
  family:   ['#FBCFE8', '#DB2777'],
  food:     ['#FED7AA', '#EA580C'],
};

interface Props {
  destination: Destination;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  variant?: 'grid' | 'list';
}

export function DestinationCard({ destination, onPress, isFavorite, onFavoriteToggle, variant = 'grid' }: Props) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const [imgError, setImgError] = useState(false);
  const { t } = useTranslation();
  const { formatReviewCount } = useFormatter();

  const categoryEmoji  = CATEGORY_EMOJIS[destination.category] ?? '📍';
  const fallbackColors: [string, string] = FALLBACK_GRADIENTS[destination.category] ?? ['#E4F9FC', '#1BBCD4'];
  const firstTag       = destination.tags?.[0];

  const HeartBtn = () => (
    <TouchableOpacity
      style={styles.heartBtnOverlay}
      onPress={onFavoriteToggle}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      activeOpacity={0.8}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={15}
        color={isFavorite ? Colors.accent : '#FFFFFF'}
      />
    </TouchableOpacity>
  );

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.listImgWrap}>
          {imgError ? (
            <LinearGradient colors={fallbackColors} style={[styles.listImage, styles.fallbackCenter]}>
              <Text style={styles.fallbackEmoji}>{categoryEmoji}</Text>
            </LinearGradient>
          ) : (
            <Image
              source={{ uri: destination.imageUrl }}
              style={styles.listImage}
              onError={() => setImgError(true)}
            />
          )}
          <HeartBtn />
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listName} numberOfLines={1}>{destination.nameKo}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.listRegion} numberOfLines={1}>{destination.region}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.star} />
            <Text style={styles.ratingValue}>{destination.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>· {formatReviewCount(destination.reviewCount)} {t('hotels.reviews')}</Text>
          </View>
          <Text style={styles.listDescription} numberOfLines={2}>{destination.descriptionKo}</Text>
          {firstTag && (
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{firstTag}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.gridImgWrap}>
        {imgError ? (
          <LinearGradient colors={fallbackColors} style={[styles.gridImage, styles.fallbackCenter]}>
            <Text style={styles.fallbackEmoji}>{categoryEmoji}</Text>
          </LinearGradient>
        ) : (
          <>
            <Image
              source={{ uri: destination.imageUrl }}
              style={styles.gridImage}
              onError={() => setImgError(true)}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.48)']}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
          </>
        )}
        {firstTag && (
          <View style={styles.gridTagBadge}>
            <Text style={styles.gridTagText}>{firstTag}</Text>
          </View>
        )}
        <HeartBtn />
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridName} numberOfLines={1}>{destination.nameKo}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
          <Text style={styles.gridRegion} numberOfLines={1}>{destination.region}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={10} color={Colors.star} />
          <Text style={styles.ratingValue}>{destination.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>· {formatReviewCount(destination.reviewCount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  // ── Shared ──
  fallbackCenter: { alignItems: 'center', justifyContent: 'center' },
  fallbackEmoji:  { fontSize: 36 },
  heartBtnOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingValue: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textPrimary },
  ratingCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xs + 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 1,
  },
  tagPillText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  // ── Grid card ──
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  gridImgWrap: { height: GRID_IMG_H },
  gridImage:   { width: CARD_WIDTH, height: GRID_IMG_H },
  gridTagBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  gridTagText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  gridContent: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.sm,
    gap: 3,
  },
  gridName:   { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  gridRegion: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },

  // ── List card ──
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  listImgWrap: { position: 'relative' },
  listImage:   { width: 110, height: 116 },
  listContent: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  listName:   { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  listRegion: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  listDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  });
}
