import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { hotelsService } from '../../services/mock/hotels.service';
import type { Hotel } from '../../types/hotel.types';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';
import HotelCard from '../../components/hotels/HotelCard';
import { useTranslation } from '../../hooks/useTranslation';

type SortKey = 'recommended' | 'cheapest' | 'rating' | 'reviews';

export default function HotelListScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();

  const CITY_FILTERS = [
    { key: 'all',         label: t('hotels.cityFilters.all') },
    { key: 'Da Nang',     label: t('hotels.cityFilters.daNang') },
    { key: 'Hoi An',      label: t('hotels.cityFilters.hoiAn') },
    { key: 'Ho Chi Minh', label: t('hotels.cityFilters.hoChiMinh') },
    { key: 'Ha Noi',      label: t('hotels.cityFilters.haNoi') },
    { key: 'Phu Quoc',    label: t('hotels.cityFilters.phuQuoc') },
    { key: 'Nha Trang',   label: t('hotels.cityFilters.nhaTrang') },
  ];

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'recommended', label: t('hotels.sortRecommended') },
    { key: 'cheapest',    label: t('hotels.sortCheapest') },
    { key: 'rating',      label: t('hotels.sortRating') },
    { key: 'reviews',     label: t('hotels.sortReviews') },
  ];

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('recommended');
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
      result = result.filter(h =>
        h.name.toLowerCase().includes(q) || h.nameKo.includes(q) || h.city.includes(q),
      );
    }
    if (selectedCity !== 'all') result = result.filter(h => h.city === selectedCity);
    if (sortBy === 'cheapest') result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'rating')   result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'reviews')  result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    return result;
  }, [hotels, query, selectedCity, sortBy]);

  const currentSort = SORT_OPTIONS.find(o => o.key === sortBy)!;

  if (loading) return <LoadingState message={t('hotels.loading')} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('hotels.headerTitle')}</Text>
            <Text style={styles.headerSub}>{t('hotels.countFound', { count: filtered.length })}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('hotels.searchPlaceholder')} />
        </View>

        {/* City chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterWrapper}
          contentContainerStyle={styles.filterContent}
        >
          {CITY_FILTERS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, selectedCity === key && styles.filterChipActive]}
              onPress={() => setSelectedCity(key)}
            >
              <Text style={[styles.filterChipText, selectedCity === key && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort row */}
        <View style={styles.sortRow}>
          <Text style={styles.countText}>{t('hotels.hotelCount', { count: filtered.length })}</Text>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
            <Ionicons name="funnel-outline" size={13} color={Colors.primary} />
            <Text style={styles.sortBtnText}>{currentSort.label}</Text>
            <Ionicons name={showSort ? 'chevron-up' : 'chevron-down'} size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Sort dropdown */}
        {showSort && (
          <View style={styles.sortDropdown}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortOption, sortBy === opt.key && styles.sortOptionActive]}
                onPress={() => { setSortBy(opt.key); setShowSort(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === opt.key && styles.sortOptionTextActive]}>
                  {opt.label}
                </Text>
                {sortBy === opt.key && <Ionicons name="checkmark" size={15} color={Colors.primary} />}
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
            <HotelCard hotel={item} onPress={() => router.push(`/hotel/${item.id}` as never)} />
          )}
        />
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe:             { flex: 1, backgroundColor: Colors.background },
    header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
    backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
    headerCenter:     { alignItems: 'center', gap: 2 },
    headerTitle:      { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
    headerSub:        { fontSize: FontSize.xs, color: Colors.textMuted },
    searchSection:    { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
    filterWrapper:    { maxHeight: 46 },
    filterContent:    { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center', paddingBottom: Spacing.sm },
    filterChip:       { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
    filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterChipText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
    filterChipTextActive: { color: '#FFFFFF' },
    sortRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
    countText:        { fontSize: FontSize.sm, color: Colors.textMuted },
    countNum:         { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    sortBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight },
    sortBtnText:      { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
    sortDropdown:         { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.md },
    sortOption:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
    sortOptionActive:     { backgroundColor: Colors.primaryLight },
    sortOptionText:       { fontSize: FontSize.base, color: Colors.textSecondary },
    sortOptionTextActive: { color: Colors.primary, fontWeight: '700' },
    listContent:      { paddingHorizontal: Spacing.base, paddingTop: Spacing.xs, paddingBottom: 48 },
  });
}
