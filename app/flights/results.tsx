import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { flightsService } from '../../services/mock/flights.service';
import { Flight, AIFlightAnalysis, FlightSearchParams } from '../../types/flight.types';
import { FlightCard } from '../../components/flights/FlightCard';
import { AIAnalysisCard } from '../../components/flights/AIAnalysisCard';
import { LoadingState } from '../../components/common/LoadingState';
import { Button } from '../../components/common/Button';
import { formatKRWPrice } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

export default function FlightResultsScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const SORT_OPTS = [
    { key: 'sortRecommended', label: t('flights.sortRecommended') },
    { key: 'sortCheapest', label: t('flights.sortCheapest') },
    { key: 'sortFastest', label: t('flights.sortFastest') },
    { key: 'sortShortest', label: t('flights.sortShortest') },
  ];
  const { origin, destination, departDate, flightClass, passengers, isFlexible } = useLocalSearchParams<Record<string, string>>();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [analysis, setAnalysis] = useState<AIFlightAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('sortRecommended');
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    const searchParams: FlightSearchParams = { origin: origin ?? 'ICN', destination: destination ?? 'DAD', departureDate: departDate ?? '2026-04-10', passengers: 2, class: 'economy' };
    Promise.all([
      flightsService.search(searchParams),
      flightsService.getAIAnalysis(searchParams),
    ]).then(([f, a]) => {
      setFlights(f);
      setAnalysis(a);
      if (f.length > 0) setSelectedFlight(f[0].id);
      setLoading(false);
    });
  }, []);

  const sorted = [...flights].sort((a, b) => {
    if (sortKey === 'sortCheapest') return a.price - b.price;
    if (sortKey === 'sortFastest') return a.departureTime.localeCompare(b.departureTime);
    if (sortKey === 'sortShortest') return a.duration.localeCompare(b.duration);
    return 0;
  });

  const selectedFlightData = flights.find(f => f.id === selectedFlight);

  if (loading) return <LoadingState message={t('flights.aiAnalyzing')} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerRoute}>{origin ?? 'ICN'} → {destination ?? 'DAD'}</Text>
            <Text style={styles.headerSub}>{departDate} · {passengers} · {flightClass}</Text>
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
            <Ionicons name="swap-vertical-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {showSort && (
          <View style={styles.sortDropdown}>
            {SORT_OPTS.map(opt => (
              <TouchableOpacity key={opt.key} style={styles.sortOption} onPress={() => { setSortKey(opt.key); setShowSort(false); }}>
                <Text style={[styles.sortOptionText, sortKey === opt.key && { color: Colors.primary, fontWeight: '700' }]}>{opt.label}</Text>
                {sortKey === opt.key && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Flexible dates notice */}
              {isFlexible === 'true' && (
                <View style={styles.flexibleBanner}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                  <Text style={styles.flexibleBannerText}>{t('flights.flexibleNote')}</Text>
                </View>
              )}
              {/* AI Analysis */}
              {analysis && (
                <View style={styles.analysisWrap}>
                  <AIAnalysisCard analysis={analysis} />
                </View>
              )}
              <View style={styles.countRow}>
                <Text style={styles.countText}>{t('flights.flightCount', { count: sorted.length })}</Text>
                <Text style={styles.sortLabel}>{SORT_OPTS.find(o => o.key === sortKey)?.label ?? ''}</Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <FlightCard
              flight={item}
              isSelected={selectedFlight === item.id}
              onPress={() => setSelectedFlight(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        />

        {/* Bottom CTA */}
        {selectedFlightData && (
          <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
            <View style={styles.bottomInner}>
              <View>
                <Text style={styles.bottomLabel}>{selectedFlightData.airline} · {selectedFlightData.flightNumber}</Text>
                <Text style={styles.bottomPrice}>{formatKRWPrice(selectedFlightData.price)}</Text>
              </View>
              <Button
                title={t('common.confirm')}
                onPress={() => Alert.alert(t('flights.bookingConfirm').split(' ')[0], t('flights.bookingConfirm', { airline: selectedFlightData.airline, flightNumber: selectedFlightData.flightNumber }))}
                style={{ flex: 1 }}
              />
            </View>
          </SafeAreaView>
        )}
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRoute: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  sortBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sortDropdown: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm, zIndex: 10 },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortOptionText: { fontSize: FontSize.base, color: Colors.textSecondary },
  listContent: { padding: Spacing.base, paddingBottom: 100 },
  analysisWrap: { marginBottom: Spacing.md },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  countText: { fontSize: FontSize.sm, color: Colors.textMuted },
  countNum: { fontWeight: '700', color: Colors.primary },
  sortLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  flexibleBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.sm + 2, marginBottom: Spacing.md },
  flexibleBannerText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', paddingBottom: Spacing.sm },
  bottomLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  bottomPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  });
}
