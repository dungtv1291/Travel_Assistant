import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Destination } from '../../types/destination.types';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

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
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const CATEGORY_EMOJIS: Record<string, string> = {
    beach: '🏖️', city: '🏙️', mountain: '⛰️', culture: '🏛️', family: '👨‍👩‍👧', food: '🍜',
  };

  const categoryEmoji = CATEGORY_EMOJIS[destination.category] ?? '📍';
  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.9}>
        {imgError ? (
          <View style={[styles.listImage, styles.imgFallback]}>
            <Text style={styles.imgFallbackEmoji}>{categoryEmoji}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: destination.imageUrl }}
            style={styles.listImage}
            onError={() => setImgError(true)}
          />
        )}
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listName}>{destination.nameKo}</Text>
              <Text style={styles.listRegion}>{destination.region}</Text>
            </View>
            <TouchableOpacity
              onPress={onFavoriteToggle}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? Colors.error : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.listRatingRow}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.listRatingText}>{destination.rating.toFixed(1)}</Text>
            {destination.reviewCount != null && (
              <Text style={styles.listRatingCount}>({destination.reviewCount.toLocaleString()})</Text>
            )}
          </View>
          <Text style={styles.listDescription} numberOfLines={2}>
            {destination.descriptionKo}
          </Text>
          <View style={styles.listFooter}>
            <View style={styles.listStat}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.listStatText}>{destination.bestSeason}</Text>
            </View>
            <View style={styles.listStat}>
              <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.listStatText}>{t('destination.visitors', { count: (destination.popularityKorean ?? 0).toLocaleString() })}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
      {imgError ? (
        <View style={[styles.gridImage, styles.imgFallback]}>
          <Text style={styles.imgFallbackEmoji}>{categoryEmoji}</Text>
        </View>
      ) : (
        <Image
          source={{ uri: destination.imageUrl }}
          style={styles.gridImage}
          onError={() => setImgError(true)}
        />
      )}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={onFavoriteToggle}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={16}
          color={isFavorite ? Colors.accent : '#FFFFFF'}
        />
      </TouchableOpacity>
      <View style={styles.gridContent}>
        <Text style={styles.gridName} numberOfLines={1}>{destination.nameKo}</Text>
        <View style={styles.gridLocationRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.gridRegion} numberOfLines={1}>{destination.region}</Text>
        </View>
        <View style={styles.gridFooter}>
          <Ionicons name="star" size={11} color="#FBBF24" />
          <Text style={styles.gridRating}>{destination.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  // Grid variant
  gridCard: {
    width: (width - Spacing.base * 2 - Spacing.md) / 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  imgFallback: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgFallbackEmoji: {
    fontSize: 36,
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    padding: Spacing.sm + 2,
    gap: 3,
  },
  gridName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridRegion: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    flex: 1,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridRating: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // List variant
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  listImage: {
    width: 100,
    height: 120,
  },
  listContent: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listRegion: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  listDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  listFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listStatText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  listRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listRatingText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listRatingCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  });
}
