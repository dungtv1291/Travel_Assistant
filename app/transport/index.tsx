import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { transportService } from '../../services/mock/transport.service';
import { TransportVehicle, TransportType } from '../../types/transport.types';
import { formatKRWPrice } from '../../utils/format';
import { LoadingState } from '../../components/common/LoadingState';
import { Badge } from '../../components/common/Badge';
import { Rating } from '../../components/common/Rating';
import { useTranslation } from '../../hooks/useTranslation';

export default function TransportListScreen() {
  const { t } = useTranslation();

  const TYPE_FILTERS: { id: TransportType | 'all'; labelKey: string; icon: string }[] = [
    { id: 'all', labelKey: 'all', icon: '🚘' },
    { id: 'airport_pickup', labelKey: 'airportPickup', icon: '🛬' },
    { id: 'private_car', labelKey: 'privateTransfer', icon: '🚗' },
    { id: 'self_drive', labelKey: 'selfDrive', icon: '🔑' },
    { id: 'scooter', labelKey: 'scooter', icon: '🛵' },
    { id: 'day_tour', labelKey: 'dayTour', icon: '🌏' },
  ];
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<TransportType | 'all'>('all');

  useEffect(() => {
    transportService.getAll().then(v => { setVehicles(v); setLoading(false); });
  }, []);

  const filtered = selectedType === 'all' ? vehicles : vehicles.filter(v => v.type === selectedType);

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

        {/* Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerEmoji}>🚗</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t('transport.subtitle')}</Text>
            <Text style={styles.bannerSub}>{t('transport.subtitleHint')}</Text>
          </View>
        </View>

        {/* Type Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterContent} style={styles.typeFilter}>
          {TYPE_FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.typeChip, selectedType === f.id && styles.typeChipActive]}
              onPress={() => setSelectedType(f.id)}
            >
              <Text style={styles.typeEmoji}>{f.icon}</Text>
              <Text style={[styles.typeLabel, selectedType === f.id && styles.typeLabelActive]}>{t(`transport.${f.labelKey}`)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/transport/${item.id}` as never)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.nameKo}</Text>
                    <Text style={styles.cardSubtitle}>{item.vehicleModel} · {t('transport.capacity', { count: item.capacity })}</Text>
                  </View>
                  {item.isPopular && <Badge label={t('transport.popular')} variant="warning" size="sm" />}
                </View>
                <Rating value={item.rating} reviewCount={item.reviewCount} size="sm" />
                <View style={styles.features}>
                  {item.features.slice(0, 3).map(f => (
                    <View key={f} style={styles.featureTag}>
                      <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>{t('transport.perDay')}</Text>
                    <Text style={styles.price}>{formatKRWPrice(item.pricePerDay ?? item.pricePerTrip ?? 0)}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookBtn} onPress={() => router.push(`/transport/${item.id}` as never)}>
                    <Text style={styles.bookBtnText}>{t('transport.book')}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  bannerCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginHorizontal: Spacing.base, backgroundColor: '#EEF3FF', borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.md },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  bannerSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  typeFilter: { marginBottom: Spacing.md },
  typeFilterContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  typeChip: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.xl, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 2, minWidth: 72 },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeEmoji: { fontSize: 18 },
  typeLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  typeLabelActive: { color: '#FFF' },
  listContent: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  card: { backgroundColor: Colors.surface, borderRadius: Radius['2xl'], overflow: 'hidden', ...Shadow.card },
  cardImage: { width: '100%', height: 160, resizeMode: 'cover' },
  cardContent: { padding: Spacing.md, gap: Spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  cardName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  cardSubtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  features: { gap: 4 },
  featureTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  bookBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#FFF' },
});
