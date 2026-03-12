import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

import { destinationsService } from '../../services/mock/destinations.service';
import { useTripsStore } from '../../store/trips.store';
import { Destination } from '../../types/destination.types';

import { SearchBar } from '../../components/common/SearchBar';
import { FilterChips } from '../../components/explore/FilterChips';
import { DestinationCard } from '../../components/explore/DestinationCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { useTranslation } from '../../hooks/useTranslation';

type ViewMode = 'grid' | 'list';

export default function ExploreScreen() {
  const { toggleFavorite, isFavorite, recentSearches, addRecentSearch } = useTripsStore();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    destinationsService.getAll().then(dests => {
      setDestinations(dests);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = destinations;
    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        d =>
          d.nameKo.includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.region.includes(q) ||
          d.descriptionKo.includes(q)
      );
    }
    return result;
  }, [destinations, selectedCategory, query]);

  const handleSearch = (text: string) => {
    setQuery(text);
    setShowRecentSearches(text.length === 0);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setShowRecentSearches(false);
    }
  };

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    setShowRecentSearches(false);
  };

  if (loading) return <LoadingState message={t('explore.title') + '...'} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t('explore.title')}</Text>
          <Text style={styles.headerTitle}>{t('explore.popularPlaces')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          onSubmit={handleSearchSubmit}
          placeholder={t('explore.searchPlaceholder')}
          onFilterPress={() => {}}
        />
      </View>

      {/* Recent Searches */}
      {showRecentSearches && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>{t('explore.recentSearches')}</Text>
          <View style={styles.recentTags}>
            {recentSearches.map(term => (
              <TouchableOpacity
                key={term}
                style={styles.recentTag}
                onPress={() => handleRecentSearch(term)}
              >
                <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.recentTagText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Filters */}
      <FilterChips selected={selectedCategory} onSelect={cat => { setSelectedCategory(cat); setShowRecentSearches(false); }} />

      {/* Stats */}
      <View style={styles.statsRow}>
          <Text style={styles.statsText}>{t('explore.resultsCount', { count: filtered.length })}</Text>
        {selectedCategory !== 'all' && (
          <TouchableOpacity onPress={() => setSelectedCategory('all')}>
            <Text style={styles.clearFilter}>{t('explore.resetFilter')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Destination List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={t('explore.noDestinations')}
          description={`"${query}"`}
        />
      ) : (
        <FlatList
          data={filtered}
          key={viewMode}
          keyExtractor={item => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={[
            styles.listContent,
            viewMode === 'grid' && styles.gridContent,
          ]}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              variant={viewMode}
              onPress={() => {
                addRecentSearch(item.nameKo);
                router.push(`/destination/${item.id}` as never);
              }}
              isFavorite={isFavorite(item.id)}
              onFavoriteToggle={() => toggleFavorite(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.xs },
  viewToggle: {
    width: 36, height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  viewToggleActive: {
    backgroundColor: Colors.primaryLight,
  },
  searchSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  recentSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentTagText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  statsText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  statsCount: {
    fontWeight: '700',
    color: Colors.accent,
  },
  clearFilter: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  gridContent: {},
  gridRow: {
    justifyContent: 'space-between',
  },
});
