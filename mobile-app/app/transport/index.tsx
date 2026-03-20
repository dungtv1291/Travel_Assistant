import React, { useEffect, useState , useMemo} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { transportService } from '../../services/mock/transport.service';
import { TransportVehicle, TransportType } from '../../types/transport.types';
import { LoadingState } from '../../components/common/LoadingState';
import VehicleCard from '../../components/transport/VehicleCard';
import { useTranslation } from '../../hooks/useTranslation';

export default function TransportListScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();

  const TYPE_FILTERS: { id: TransportType | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: t('transport.all'), icon: '🚘' },
    { id: 'airport_pickup', label: t('transport.airportPickup'), icon: '🛬' },
    { id: 'private_car', label: t('transport.privateTransfer'), icon: '🚗' },
    { id: 'self_drive', label: t('transport.selfDrive'), icon: '🔑' },
    { id: 'scooter', label: t('transport.scooter'), icon: '🛵' },
    { id: 'day_tour', label: t('transport.dayTour'), icon: '🌏' },
  ];

  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<TransportType | 'all'>('all');

  useEffect(() => {
    transportService.getAll().then(v => { setVehicles(v); setLoading(false); });
  }, []);

  const filtered = selectedType === 'all'
    ? vehicles
    : vehicles.filter(v => v.type === selectedType);

  if (loading) return <LoadingState message={t('transport.loading')} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('transport.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Gradient Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconWrap}>
            <Text style={styles.bannerEmoji}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t('transport.subtitle')}</Text>
            <Text style={styles.bannerSub}>{t('transport.subtitleHint')}</Text>
          </View>
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatNum}>{vehicles.length}</Text>
            <Text style={styles.bannerStatLabel}>{t('transport.options')}</Text>
          </View>
        </View>

        {/* Type Filters */}
        <View style={styles.typeFilterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeFilterContent}
          >
            {TYPE_FILTERS.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.typeChip, selectedType === f.id && styles.typeChipActive]}
                onPress={() => setSelectedType(f.id)}
              >
                <Text style={styles.typeEmoji}>{f.icon}</Text>
                <Text style={[styles.typeLabel, selectedType === f.id && styles.typeLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Count row */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {t('transport.filteredCount', { count: filtered.length })}
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => router.push(`/transport/${item.id}` as never)}
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
  bannerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.base, backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.md,
  },
  bannerIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  bannerEmoji: { fontSize: 24 },
  bannerTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  bannerSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  bannerStat: { alignItems: 'center' },
  bannerStatNum: { fontSize: FontSize['2xl'], fontWeight: '800', color: Colors.primary },
  bannerStatLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  typeFilterWrapper: { height: 68, justifyContent: 'center', marginBottom: Spacing.sm },
  typeFilter: { marginBottom: Spacing.sm },
  typeFilterContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' },
  typeChip: {
    alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.xl, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, gap: 2, minWidth: 72,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeEmoji: { fontSize: 18 },
  typeLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  typeLabelActive: { color: '#FFF' },
  countRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  countText: { fontSize: FontSize.sm, color: Colors.textMuted },
  countNum: { fontWeight: '700', color: Colors.primary },
  listContent: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'] },
  });
}
