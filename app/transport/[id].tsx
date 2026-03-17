import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { transportService } from '../../services/mock/transport.service';
import { TransportVehicle } from '../../types/transport.types';
import { formatKRWPrice } from '../../utils/format';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { useTranslation } from '../../hooks/useTranslation';
import { HeroImage, StickyBottomBar, InfoCard, FeatureChips, PriceBlock } from '../../components/ui';

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
          <HeroImage
            imageUrl={vehicle.imageUrl}
            height={260}
            gradient={false}
            onBack={() => router.back()}
            rightActions={vehicle.isPopular ? (
              <Badge label={`🔥 ${t('transport.popular')}`} variant="warning" size="sm" />
            ) : undefined}
          />

          <View style={styles.content}>
            {/* Basic Info */}
            <InfoCard>
              <View style={styles.infoTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>{vehicle.nameKo}</Text>
                  <Text style={styles.vehicleModel}>{vehicle.vehicleModel}</Text>
                </View>
                <PriceBlock
                  label={t('transport.perDay')}
                  amount={vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0}
                  align="right"
                />
              </View>
              <Rating value={vehicle.rating} reviewCount={vehicle.reviewCount} size="md" />
              <Text style={styles.description}>{vehicle.descriptionKo ?? vehicle.description}</Text>
            </InfoCard>

            {/* Specs */}
            <InfoCard title={t('transport.carSpecs')}>
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
            </InfoCard>
            <InfoCard title={t('transport.includes')}>
              <FeatureChips features={vehicle.features} max={vehicle.features.length} size="md" />
            </InfoCard>

            {/* Duration Selector */}
            <InfoCard title={t('transport.selectDays')}>
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
            </InfoCard>

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
        <StickyBottomBar
          label={t('transport.totalAmount', { days: selectedDays })}
          price={totalPrice}
          buttonTitle={t('transport.book')}
          onPress={() => router.push({ pathname: '/transport/booking', params: {
            vehicleId: vehicle.id,
            days: String(selectedDays),
            vehicleName: vehicle.nameKo,
            vehicleImage: vehicle.imageUrl,
            vehiclePrice: String(vehicle.pricePerDay ?? vehicle.pricePerTrip ?? 0),
            vehicleType: vehicle.type,
            driverIncluded: vehicle.driverIncluded ? '1' : '0',
          } } as never)}
        />
      </View>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
    infoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.base },
    vehicleName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
    vehicleModel: { fontSize: FontSize.sm, color: Colors.textMuted },
    description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
    specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    specItem: { width: '47%', backgroundColor: Colors.background, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
    specLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
    specValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
    daysRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
    dayBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
    dayBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
    dayBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textSecondary },
    dayBtnTextActive: { color: Colors.primary },
    priceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.sm },
    priceSummaryLabel: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
    priceSummaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
    notice: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
    noticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  });
}
