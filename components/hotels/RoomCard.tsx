import React, { useMemo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomType } from '../../types/hotel.types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize, Typography } from '../../constants/typography';
import { MetaRow } from '../ui/MetaRow';
import { FeatureChips } from '../ui/FeatureChips';
import { PriceBlock } from '../ui/PriceBlock';

interface RoomCardProps {
  room: RoomType;
  selected: boolean;
  onSelect: (room: RoomType) => void;
}

export default function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const metaItems = [
    { icon: 'bed-outline', text: room.bedType },
    { icon: 'expand-outline', text: `${room.size}㎡` },
    { icon: 'people-outline', text: `최대 ${room.maxOccupancy ?? room.maxGuests}명` },
  ];

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
        {selected && (
          <View style={styles.selectedOverlay}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.selectedOverlayText}>선택됨</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{room.nameKo}</Text>

        <MetaRow items={metaItems} />

        {room.features && room.features.length > 0 && (
          <FeatureChips features={room.features} max={3} />
        )}

        {/* Footer: price + select button */}
        <View style={styles.footer}>
          <PriceBlock label="1박 기준" amount={room.pricePerNight} size="md" />
          <View style={[styles.selectBtn, selected && styles.selectBtnActive]}>
            {selected && (
              <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            )}
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
    selectedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.38)',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    selectedOverlayText: {
      color: '#FFFFFF',
      fontSize: FontSize.base,
      fontWeight: '700',
    },
    body: {
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    name: {
      ...Typography.title,
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
