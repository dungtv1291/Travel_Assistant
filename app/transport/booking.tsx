import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { transportService } from '../../services/mock/transport.service';
import { useAuthStore } from '../../store/auth.store';
import { useBookingsStore } from '../../store/bookings.store';
import { Button } from '../../components/common/Button';
import { formatKRWPrice } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

export default function TransportBookingScreen() {
  const { t } = useTranslation();
  const { vehicleId, days } = useLocalSearchParams<{ vehicleId: string; days: string }>();
  const { user } = useAuthStore();
  const { addTransportBooking } = useBookingsStore();
  const [loading, setLoading] = useState(false);
  const [pickupOption, setPickupOption] = useState(0);

  const numDays = parseInt(days ?? '2', 10);
  const DAILY_RATE = 270000;
  const total = DAILY_RATE * numDays;
  const tax = Math.round(total * 0.1);

  const PICKUPS = [
    { label: t('transport.directAirport'), detail: t('transport.directAirport'), extra: 0 },
    { label: t('transport.hotelPickup'), detail: t('transport.departToHotel'), extra: 27000 },
  ];

  const onConfirm = async () => {
    setLoading(true);
    try {
      const booking = await transportService.createBooking({
        vehicleId: vehicleId ?? '',
        vehicleName: vehicleId ?? '',
        vehicleImage: '',
        type: 'private_car',
        pickupDate: '2026-04-10',
        returnDate: '2026-04-12',
        pickupLocation: PICKUPS[pickupOption].label,
        dropoffLocation: '호치민 시 중심',
        passengerCount: 2,
        totalPrice: (total + tax + PICKUPS[pickupOption].extra) / 1350,
        currency: 'USD',
        status: 'confirmed',
      } as any);
      addTransportBooking(booking);
      router.replace({ pathname: '/transport/confirmation', params: { bookingId: booking.id } } as never);
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('transport.bookingTitle')}</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Pickup */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.selectPickup')}</Text>
              {PICKUPS.map((p, i) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.pickupOption, pickupOption === i && styles.pickupOptionActive]}
                  onPress={() => setPickupOption(i)}
                >
                  <View>
                    <Text style={styles.pickupLabel}>{p.label}</Text>
                    <Text style={styles.pickupDetail}>{p.detail}</Text>
                  </View>
                  <View style={styles.pickupRight}>
                    {p.extra > 0 && <Text style={styles.pickupExtra}>+{formatKRWPrice(p.extra)}</Text>}
                    {pickupOption === i && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Booking Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.bookingSummary')}</Text>
              {[
                { label: t('transport.usagePeriod'), value: `${numDays}${t('common.day')} (2026.04.10 ~ 2026.04.12)` },
                { label: t('transport.vehicle'), value: 'Toyota Innova · 최대 7인' },
                { label: t('transport.driver'), value: t('transport.withDriver') },
                { label: t('transport.fuel'), value: t('transport.includes') },
                { label: t('transport.pickup'), value: PICKUPS[pickupOption].label },
              ].map(r => (
                <View key={r.label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{r.label}</Text>
                  <Text style={styles.summaryValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            {/* Price */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.feeBreakdown')}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('transport.vehicleFee', { days: numDays })}</Text>
                <Text style={styles.priceValue}>{formatKRWPrice(total)}</Text>
              </View>
              {PICKUPS[pickupOption].extra > 0 && (
                <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('transport.pickupFee')}</Text>
                  <Text style={styles.priceValue}>{formatKRWPrice(PICKUPS[pickupOption].extra)}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('transport.tax')}</Text>
                <Text style={styles.priceValue}>{formatKRWPrice(tax)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('common.total')}</Text>
                <Text style={styles.totalValue}>{formatKRWPrice(total + tax + PICKUPS[pickupOption].extra)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <Button
            title={t('transport.confirmPayment')}
            onPress={onConfirm}
            loading={loading}
            fullWidth
          />
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  pickupOption: { borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickupOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pickupLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  pickupDetail: { fontSize: FontSize.sm, color: Colors.textMuted },
  pickupRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pickupExtra: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 1, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'right', paddingLeft: Spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  priceLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  priceValue: { fontSize: FontSize.base, color: Colors.textPrimary },
  totalRow: { borderTopWidth: 1.5, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.md },
  totalLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, padding: Spacing.base },
});
