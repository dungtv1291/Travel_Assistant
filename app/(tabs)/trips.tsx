import React, { useState , useMemo} from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useTripsStore } from '../../store/trips.store';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Trip } from '../../types/trip.types';
import { useTranslation } from '../../hooks/useTranslation';
import { formatKRWPrice } from '../../utils/format';

type Tab = 'saved' | 'favorites';

export default function TripsScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { savedTrips, favorites } = useTripsStore();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const { t } = useTranslation();

  const renderTrip = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => router.push(`/ai-planner/results?tripId=${item.id}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.coverImage || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' }} style={styles.tripImage} />
      <View style={styles.tripOverlay} />
      <View style={styles.tripContent}>
        <View style={styles.tripMeta}>
          <View style={styles.tripBadge}>
            <Ionicons name="sparkles" size={10} color={Colors.primary} />
            <Text style={styles.tripBadgeText}>{t('trips.aiGenerated')}</Text>
          </View>
          <Text style={styles.tripDuration}>{item.duration}{t('common.night')} {item.duration + 1}{t('common.day')}</Text>
        </View>
        <Text style={styles.tripTitle}>{item.title}</Text>
        <View style={styles.tripFooter}>
          <View style={styles.tripStat}>
            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.tripStatText}>{item.startDate}</Text>
          </View>
          <View style={styles.tripStat}>
            <Ionicons name="map-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.tripStatText}>{item.itinerary.reduce((acc, d) => acc + d.activities.length, 0)}{t('trips.activities')}</Text>
          </View>
          <View style={styles.tripStat}>
            <Ionicons name="wallet-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.tripStatText}>{formatKRWPrice(item.totalEstimatedCost)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFavorite = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.favCard}
      onPress={() => router.push(`/destination/${item}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: `https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400` }} style={styles.favImage} />
      <View style={styles.favOverlay} />
      <View style={styles.favContent}>
        <Ionicons name="heart" size={16} color="#FF6B6B" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('trips.title')}</Text>
        <TouchableOpacity
          style={styles.newTripBtn}
          onPress={() => router.push('/ai-planner')}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.newTripText}>{t('trips.newTrip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Chips */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Ionicons name="calendar" size={16} color={Colors.primary} />
          <Text style={styles.summaryNum}>{savedTrips.length}</Text>
          <Text style={styles.summaryLabel}>{t('trips.savedTrips')}</Text>
        </View>
        <View style={styles.summaryChip}>
          <Ionicons name="heart" size={16} color="#FF6B6B" />
          <Text style={styles.summaryNum}>{favorites.length}</Text>
          <Text style={styles.summaryLabel}>{t('trips.favorites')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([['saved', t('trips.savedTrips'), 'calendar-outline'], ['favorites', t('trips.favorites'), 'heart-outline']] as const).map(([key, label, icon]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
          >
            <Ionicons name={icon as any} size={15} color={activeTab === key ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'saved' ? (
        <FlatList
          key="saved-list"
          data={savedTrips}
          keyExtractor={i => i.id}
          renderItem={renderTrip}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={t('trips.noSavedTrips')}
              description={t('trips.noSavedTripsHint')}
              action={
                <Button title={t('trips.createAITrip')} onPress={() => router.push('/ai-planner')} />
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="favorites-list"
          data={favorites}
          keyExtractor={i => i}
          numColumns={2}
          renderItem={renderFavorite}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.favRow}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title={t('trips.noFavorites')}
              description={t('trips.noFavoritesHint')}
              action={
                <Button title={t('trips.exploreDest')} onPress={() => router.push('/(tabs)/explore')} />
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: '800', color: Colors.textPrimary },
  newTripBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  newTripText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.md, marginBottom: Spacing.md },
  summaryChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.sm },
  summaryNum: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  tabRow: { flexDirection: 'row', marginHorizontal: Spacing.base, marginBottom: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.xl, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  tabActive: { backgroundColor: Colors.surface, ...Shadow.sm },
  tabLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary },
  listContent: { padding: Spacing.base, paddingTop: 0, gap: Spacing.md, paddingBottom: 100 },
  tripCard: { height: 180, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md },
  tripImage: { ...StyleSheet.absoluteFillObject },
  tripOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  tripContent: { flex: 1, padding: Spacing.base, justifyContent: 'space-between' },
  tripMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  tripBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  tripDuration: { fontSize: FontSize.sm, fontWeight: '700', color: '#FFF' },
  tripTitle: { fontSize: FontSize.lg, fontWeight: '800', color: '#FFF' },
  tripFooter: { flexDirection: 'row', gap: Spacing.md },
  tripStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripStatText: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  favRow: { gap: Spacing.md },
  favCard: { flex: 1, height: 140, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  favImage: { ...StyleSheet.absoluteFillObject },
  favOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  favContent: { flex: 1, padding: Spacing.sm, alignItems: 'flex-end' },
  });
}
