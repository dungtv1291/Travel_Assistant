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
import { Hotel } from '../../types/hotel.types';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';
import HotelCard from '../../components/hotels/HotelCard';
import { useTranslation } from '../../hooks/useTranslation';

export default function HotelListScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();

  const SORT_KEYS = ['sortRecommended', 'sortCheapest', 'sortRating', 'sortReviews'] as const;

  const CITY_FILTERS = [
    { key: 'all', label: t('hotels.all') },
    { key: 'Da Nang', label: 'Đà Nẵng' },
    { key: 'Hoi An', label: 'Hội An' },
    { key: 'Ho Chi Minh', label: 'TP. Hồ Chí Minh' },
    { key: 'Ha Noi', label: 'Hà Nội' },
    { key: 'Phu Quoc', label: 'Phú Quốc' },
    { key: 'Nha Trang', label: 'Nha Trang' },
  ];

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
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
      result = result.filter(h =>
        h.name.toLowerCase().includes(q) || h.nameKo.includes(q) || h.city.includes(q),
      );
    }
    if (selectedCity !== 'all') {
      result = result.filter(h => h.city === selectedCity);
    }
    if (sortBy === 'sortCheapest') result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'sortRating') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'sortReviews') result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    return result;
  }, [hotels, query, selectedCity, sortBy]);

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

        {/* City Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
        </View>

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
              <TouchableOpacity
                key={key}
                style={styles.sortOption}
                onPress={() => { setSortBy(key); setShowSort(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === key && { color: Colors.primary, fontWeight: '700' }]}>
                  {t(`hotels.${key}`)}
                </Text>
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
            <HotelCard
              hotel={item}
              onPress={() => router.push(`/hotel/${item.id}` as never)}
            />
          )}
        />
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  searchSection: { paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  filterWrapper: { height: 40, justifyContent: 'center', marginBottom: Spacing.sm },
  filterScroll: { marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  countText: { fontSize: FontSize.sm, color: Colors.textMuted },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight },
  sortBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  sortDropdown: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortOptionText: { fontSize: FontSize.base, color: Colors.textSecondary },
  listContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  });
}
