import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { transportService } from '../../services/mock/transport.service';
import { TransportVehicle } from '../../types/transport.types';
import { formatKRWPrice } from '../../utils/format';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

const RENTAL_DAYS = [1, 2, 3, 5, 7];

export default function TransportDetailScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<TransportVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(2);

  useEffect(() => {
    if (id) {
      transportService.getById(id).then(v => { setVehicle(v || null); setLoading(false); });
    }
  }, [id]);

  if (loading) return <LoadingState message={t('transport.detailLoading')} />;
  if (!vehicle) return <LoadingState message={t('transport.notFound')} />;

  const totalPrice = (vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0) * selectedDays;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Image source={{ uri: vehicle.imageUrl }} style={styles.heroImage} />
            <SafeAreaView edges={['top']} style={styles.heroSafe}>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={20} color="#FFF" />
                </TouchableOpacity>
                {vehicle.isPopular && <Badge label={`🔥 ${t('transport.popular')}`} variant="warning" size="sm" />}
              </View>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            {/* Basic Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>{vehicle.nameKo}</Text>
                  <Text style={styles.vehicleModel}>{vehicle.vehicleModel}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceLabel}>{t('transport.perDay')}</Text>
                  <Text style={styles.price}>{formatKRWPrice(vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0)}</Text>
                </View>
              </View>
              <Rating value={vehicle.rating} reviewCount={vehicle.reviewCount} size="md" />
              <Text style={styles.description}>{vehicle.descriptionKo ?? vehicle.description}</Text>
            </View>

            {/* Specs */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.carSpecs')}</Text>
              <View style={styles.specGrid}>
                {[
                  { icon: 'people-outline', label: t('transport.maxPassengers'), value: `${vehicle.capacity}${t('common.person')}` },
                  { icon: 'briefcase-outline', label: t('transport.luggageCapacity'), value: t('transport.largeLuggage', { count: vehicle.luggageCapacity ?? 2 }) },
                  { icon: 'car-sport-outline', label: t('transport.vehicleType'), value: vehicle.vehicleModel },
                  { icon: 'navigate-outline', label: t('transport.driveMode'), value: vehicle.type === 'self_drive' ? t('transport.selfMode') : t('transport.withDriver') },
                ].map(spec => (
                  <View key={spec.label} style={styles.specItem}>
                    <Ionicons name={spec.icon as any} size={20} color={Colors.primary} />
                    <Text style={styles.specLabel}>{spec.label}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Features */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.includes')}</Text>
              {vehicle.features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Duration Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.selectDays')}</Text>
              <View style={styles.daysRow}>
                {RENTAL_DAYS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayBtn, selectedDays === d && styles.dayBtnActive]}
                    onPress={() => setSelectedDays(d)}
                  >
                  <Text style={[styles.dayBtnText, selectedDays === d && styles.dayBtnTextActive]}>{d}{t('common.day')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.priceSummary}>
                <Text style={styles.priceSummaryLabel}>{t('transport.totalEstimate', { days: selectedDays })}</Text>
                <Text style={styles.priceSummaryValue}>{formatKRWPrice(totalPrice)}</Text>
              </View>
            </View>

            {/* Notice */}
            <View style={styles.notice}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
              <Text style={styles.noticeText}>
                {t('transport.insuranceNote')}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomInner}>
            <View>
              <Text style={styles.bottomLabel}>{t('transport.totalAmount', { days: selectedDays })}</Text>
              <Text style={styles.bottomPrice}>{formatKRWPrice(totalPrice)}</Text>
            </View>
            <Button
              title={t('transport.book')}
              onPress={() => router.push({ pathname: '/transport/booking', params: {
                vehicleId: vehicle.id,
                days: String(selectedDays),
                vehicleName: vehicle.nameKo,
                vehicleImage: vehicle.imageUrl,
                vehiclePrice: String(vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0),
                vehicleType: vehicle.type,
                driverIncluded: vehicle.driverIncluded ? '1' : '0',
              } } as never)}
              style={{ flex: 1 }}
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 260, position: 'relative' },
  heroImage: { width, height: 260, resizeMode: 'cover' },
  heroSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  infoCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  infoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.base },
  vehicleName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  vehicleModel: { fontSize: FontSize.sm, color: Colors.textMuted },
  priceBlock: { alignItems: 'flex-end' },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  specItem: { width: '47%', backgroundColor: Colors.background, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  specLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  specValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { fontSize: FontSize.base, color: Colors.textSecondary },
  daysRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  dayBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  dayBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textSecondary },
  dayBtnTextActive: { color: Colors.primary },
  priceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.sm },
  priceSummaryLabel: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
  priceSummaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  notice: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', paddingBottom: Spacing.sm },
  bottomLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  bottomPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  });
}
