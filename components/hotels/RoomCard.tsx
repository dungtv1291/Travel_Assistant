import React, { useMemo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomType } from '../../types/hotel.types';
import { formatKRWPrice } from '../../utils/format';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize, Typography } from '../../constants/typography';

interface RoomCardProps {
  room: RoomType;
  selected: boolean;
  onSelect: (room: RoomType) => void;
}

export default function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onSelect(room)}
      activeOpacity={0.88}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: room.imageUrl }} style={styles.image} />
        {room.breakfastIncluded && (
          <View style={styles.breakfastBadge}>
            <Ionicons name="restaurant-outline" size={10} color="#FFFFFF" />
            <Text style={styles.breakfastText}>조식 포함</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Room name */}
        <Text style={styles.name} numberOfLines={1}>{room.nameKo}</Text>

        {/* Bed + size row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="bed-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{room.bedType}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="expand-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{room.size}㎡</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>최대 {room.maxOccupancy ?? room.maxGuests}명</Text>
          </View>
        </View>

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <View style={styles.featureRow}>
            {room.features.slice(0, 3).map((f) => (
              <View key={f} style={styles.featureChip}>
                <Ionicons name="checkmark-circle" size={10} color={Colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price + select */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>1박 기준</Text>
            <Text style={[styles.price, selected && styles.priceSelected]}>
              {formatKRWPrice(room.pricePerNight)}
            </Text>
          </View>
          <View style={[styles.selectBtn, selected && styles.selectBtnActive]}>
            {selected ? (
              <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            ) : null}
            <Text style={[styles.selectText, selected && styles.selectTextActive]}>
              {selected ? '선택됨' : '선택'}
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
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrap: {
    position: 'relative',
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  breakfastBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  breakfastText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.md,
  },
  name: {
    ...Typography.title,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  featureText: {
    fontSize: FontSize.xs,
    color: '#15803D',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priceSelected: {
    color: Colors.primary,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  selectBtnActive: {
    backgroundColor: Colors.primary,
  },
  selectText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  selectTextActive: {
    color: '#FFFFFF',
  },
  });
}
