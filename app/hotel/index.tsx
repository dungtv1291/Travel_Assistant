import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { hotelsService } from '../../services/mock/hotels.service';
import { Hotel } from '../../types/hotel.types';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { formatKRWPrice } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

export default function HotelListScreen() {
  const { t } = useTranslation();

  const HOTEL_FILTER_KEYS = ['all', 'fiveStar', 'resort', 'boutique', 'cityView'] as const;
  const SORT_KEYS = ['sortRecommended', 'sortCheapest', 'sortRating', 'sortReviews'] as const;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<typeof HOTEL_FILTER_KEYS[number]>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_KEYS[number]>('sortRecommended');
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    hotelsService.getAll().then(h => {
      setHotels(h);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = hotels;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(h => h.name.toLowerCase().includes(q) || h.nameKo.includes(q) || (h.location ?? '').includes(q));
    }
    if (sortBy === 'sortCheapest') result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'sortRating') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'sortReviews') result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    return result;
  }, [hotels, query, sortBy]);

  if (loading) return <LoadingState message={t('common.loading')} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('hotels.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('hotels.searchPlaceholder')} />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent} style={styles.filterScroll}>
          {HOTEL_FILTER_KEYS.map(key => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, selectedFilter === key && styles.filterChipActive]}
              onPress={() => setSelectedFilter(key)}
            >
              <Text style={[styles.filterChipText, selectedFilter === key && styles.filterChipTextActive]}>{t(`hotels.${key}`)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Row */}
        <View style={styles.sortRow}>
          <Text style={styles.countText}>{t('hotels.hotelCount', { count: filtered.length })}</Text>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
            <Ionicons name="swap-vertical-outline" size={16} color={Colors.primary} />
            <Text style={styles.sortBtnText}>{t(`hotels.${sortBy}`)}</Text>
          </TouchableOpacity>
        </View>

        {showSort && (
          <View style={styles.sortDropdown}>
            {SORT_KEYS.map(key => (
              <TouchableOpacity key={key} style={styles.sortOption} onPress={() => { setSortBy(key); setShowSort(false); }}>
                <Text style={[styles.sortOptionText, sortBy === key && { color: Colors.primary, fontWeight: '700' }]}>{t(`hotels.${key}`)}</Text>
                {sortBy === key && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/hotel/${item.id}` as never)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              {item.isRecommended && (
                <View style={styles.recommendBadge}>
                  <Text style={styles.recommendBadgeText}>{t('common.recommend')}</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.nameKo}</Text>
                    <Text style={styles.cardLocation}>📍 {item.location}</Text>
                  </View>
                  <View style={styles.cardStars}>
                    {Array.from({ length: item.starRating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={10} color="#FFC107" />
                    ))}
                  </View>
                </View>
                <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
                <View style={styles.cardAmenities}>
                  {item.amenities.slice(0, 3).map(am => (
                    <Badge key={am} label={am} variant="neutral" size="sm" />
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardPriceLabel}>{t('hotels.perNight')}</Text>
                    <Text style={styles.cardPrice}>{formatKRWPrice(item.pricePerNight)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => router.push(`/hotel/${item.id}` as never)}
                  >
                    <Text style={styles.bookBtnText}>{t('hotels.book')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  searchSection: { paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  filterScroll: { marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  countText: { fontSize: FontSize.sm, color: Colors.textMuted },
  countNum: { fontWeight: '700', color: Colors.primary },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight },
  sortBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  sortDropdown: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortOptionText: { fontSize: FontSize.base, color: Colors.textSecondary },
  listContent: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  card: { backgroundColor: Colors.surface, borderRadius: Radius['2xl'], overflow: 'hidden', ...Shadow.card },
  cardImage: { width: '100%', height: 180, resizeMode: 'cover' },
  recommendBadge: { position: 'absolute', top: Spacing.md, left: Spacing.md, backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  recommendBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: '#FFFFFF' },
  cardContent: { padding: Spacing.md, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  cardName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  cardLocation: { fontSize: FontSize.sm, color: Colors.textMuted },
  cardStars: { flexDirection: 'row', gap: 1, marginTop: 3 },
  cardAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  cardPriceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  cardPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  bookBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#FFFFFF' },
});
