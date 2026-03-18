import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { transportService } from '../../services/mock/transport.service';
import { useAuthStore } from '../../store/auth.store';
import { useBookingsStore } from '../../store/bookings.store';
import { Button } from '../../components/common/Button';
import { useFormatter } from '../../hooks/useFormatter';
import { useTranslation } from '../../hooks/useTranslation';
import { TransportType } from '../../types/transport.types';

const DATE_OPTION_DEFAULTS = [
  { pickupDate: '2026-04-10', returnDate: '2026-04-11', days: 1 },
  { pickupDate: '2026-04-10', returnDate: '2026-04-12', days: 2 },
  { pickupDate: '2026-04-10', returnDate: '2026-04-13', days: 3 },
  { pickupDate: '2026-04-10', returnDate: '2026-04-15', days: 5 },
];

export default function TransportBookingScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { formatPrice } = useFormatter();
  const {
    vehicleId, vehicleName, vehicleImage, vehiclePrice, vehicleType, driverIncluded,
  } = useLocalSearchParams<{
    vehicleId: string; vehicleName: string; vehicleImage: string;
    vehiclePrice: string; vehicleType: string; driverIncluded: string; days: string;
  }>();
  const { user } = useAuthStore();
  const { addTransportBooking } = useBookingsStore();
  const [loading, setLoading] = useState(false);
  const [pickupOption, setPickupOption] = useState(0);
  const [selectedDateIdx, setSelectedDateIdx] = useState(1);

  const DATE_OPTIONS = [
    { label: t('transport.dateToday'), ...DATE_OPTION_DEFAULTS[0] },
    { label: t('transport.date2Days'), ...DATE_OPTION_DEFAULTS[1] },
    { label: t('transport.date3Days'), ...DATE_OPTION_DEFAULTS[2] },
    { label: t('transport.date5Days'), ...DATE_OPTION_DEFAULTS[3] },
  ];

  const selectedDate = DATE_OPTIONS[selectedDateIdx];

  const PRICE_PER_UNIT = Number(vehiclePrice) || 0;
  const isPerTrip = vehicleType === 'airport_pickup' || vehicleType === 'day_tour';
  const numDays = selectedDate.days;

  const VEHICLE_TOTAL = isPerTrip ? PRICE_PER_UNIT : PRICE_PER_UNIT * numDays;
  const PICKUP_EXTRA = pickupOption === 1 ? Math.round(PRICE_PER_UNIT * 0.1) : 0;
  const SUBTOTAL = VEHICLE_TOTAL + PICKUP_EXTRA;
  const TAX = Math.round(SUBTOTAL * 0.1);
  const GRAND_TOTAL = SUBTOTAL + TAX;

  const PICKUPS = [
    { label: t('transport.directAirport'), detail: t('transport.airportPickupDetail'), extra: 0 },
    { label: t('transport.hotelPickup'), detail: t('transport.hotelPickupDetail'), extra: PICKUP_EXTRA },
  ];

  const onConfirm = async () => {
    setLoading(true);
    try {
      const booking = await transportService.createBooking({
        vehicleId: vehicleId ?? '',
        vehicleName: String(vehicleName ?? ''),
        vehicleImage: String(vehicleImage ?? ''),
        type: (vehicleType ?? 'private_car') as TransportType,
        pickupLocation: PICKUPS[pickupOption].label,
        dropoffLocation: t('transport.dropoffLocation'),
        pickupDate: selectedDate.pickupDate,
        returnDate: isPerTrip ? selectedDate.pickupDate : selectedDate.returnDate,
        days: isPerTrip ? 1 : numDays,
        passengerCount: 2,
        totalPrice: GRAND_TOTAL,
        currency: 'KRW',
        status: 'confirmed',
      });
      addTransportBooking(booking);
      router.replace({
        pathname: '/transport/confirmation',
        params: {
          confirmationCode: booking.confirmationCode,
          vehicleName: String(vehicleName ?? ''),
          vehicleType: vehicleType ?? '',
          pickupLocation: PICKUPS[pickupOption].label,
          pickupDate: selectedDate.pickupDate,
          returnDate: isPerTrip ? selectedDate.pickupDate : selectedDate.returnDate,
          days: String(isPerTrip ? 1 : numDays),
          totalPrice: String(GRAND_TOTAL),
          driverIncluded: driverIncluded ?? '0',
        },
      } as never);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('transport.bookingTitle')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            {/* Vehicle summary hero card */}
            <View style={styles.vehicleCard}>
              {vehicleImage ? (
                <Image source={{ uri: vehicleImage }} style={styles.vehicleThumb} />
              ) : null}
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName} numberOfLines={2}>
                  {vehicleName}
                </Text>
                <View style={styles.vehicleMeta}>
                  <Ionicons
                    name={driverIncluded === '1' ? 'person-circle-outline' : 'key-outline'}
                    size={14}
                    color={driverIncluded === '1' ? Colors.success : Colors.warning}
                  />
                  <Text style={[
                    styles.vehicleMetaText,
                    { color: driverIncluded === '1' ? Colors.success : Colors.warning },
                  ]}>
                    {driverIncluded === '1' ? t('transport.withDriver') : t('transport.selfDriveMode')}
                  </Text>
                </View>
              </View>
              <View style={styles.vehiclePriceBlock}>
                <Text style={styles.vehiclePriceLabel}>{isPerTrip ? t('transport.priceOnce') : t('transport.priceDay')}</Text>
                <Text style={styles.vehiclePriceValue}>{formatPrice(PRICE_PER_UNIT)}</Text>
              </View>
            </View>

            {/* Date selector â€” only for non-trip types */}
            {!isPerTrip && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('transport.selectDays')}</Text>
                <View style={styles.dateGrid}>
                  {DATE_OPTIONS.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dateOption, selectedDateIdx === idx && styles.dateOptionActive]}
                      onPress={() => setSelectedDateIdx(idx)}
                    >
                      <Text style={[styles.dateOptionLabel, selectedDateIdx === idx && styles.dateOptionLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.dateOptionSub, selectedDateIdx === idx && styles.dateOptionSubActive]}>
                        {opt.pickupDate} ~
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Pickup selection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.selectPickup')}</Text>
              {PICKUPS.map((p, i) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.pickupOption, pickupOption === i && styles.pickupOptionActive]}
                  onPress={() => setPickupOption(i)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickupLabel}>{p.label}</Text>
                    <Text style={styles.pickupDetail}>{p.detail}</Text>
                  </View>
                  <View style={styles.pickupRight}>
                    {p.extra > 0 && (
                      <Text style={styles.pickupExtra}>+{formatPrice(p.extra)}</Text>
                    )}
                    {pickupOption === i && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Booking Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.bookingSummary')}</Text>
              {([
                {
                  icon: 'calendar-outline' as const,
                  label: t('transport.usagePeriod'),
                  value: isPerTrip
                    ? selectedDate.pickupDate
                    : `${selectedDate.pickupDate} ~ ${selectedDate.returnDate} (${numDays}${t('common.day')})`,
                },
                {
                  icon: 'car-outline' as const,
                  label: t('transport.vehicle'),
                  value: String(vehicleName ?? ''),
                },
                {
                  icon: 'person-outline' as const,
                  label: t('transport.driver'),
                  value: driverIncluded === '1' ? t('transport.withDriver') : t('transport.selfMode'),
                },
                {
                  icon: 'location-outline' as const,
                  label: t('transport.pickup'),
                  value: PICKUPS[pickupOption].label,
                },
              ] as { icon: any; label: string; value: string }[]).map(row => (
                <View key={row.label} style={styles.summaryRow}>
                  <View style={styles.summaryLeft}>
                    <Ionicons name={row.icon} size={15} color={Colors.textMuted} />
                    <Text style={styles.summaryLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Price Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.feeBreakdown')}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {isPerTrip
                    ? `${String(vehicleName ?? '')} (${t('transport.priceOnce')})`
                    : t('transport.vehicleFee', { days: numDays })}
                </Text>
                <Text style={styles.priceValue}>{formatPrice(VEHICLE_TOTAL)}</Text>
              </View>
              {PICKUP_EXTRA > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{t('transport.pickupFee')}</Text>
                  <Text style={styles.priceValue}>{formatPrice(PICKUP_EXTRA)}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('transport.tax')}</Text>
                <Text style={styles.priceValue}>{formatPrice(TAX)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('common.total')}</Text>
                <Text style={styles.totalValue}>{formatPrice(GRAND_TOTAL)}</Text>
              </View>
            </View>

            {/* Guest info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('transport.guestInfo')}</Text>
              <View style={styles.guestRow}>
                <View style={styles.guestAvatar}>
                  <Text style={styles.guestAvatarText}>{user?.name?.[0] ?? 'K'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestName}>{user?.name ?? ''}</Text>
                  <Text style={styles.guestEmail}>{user?.email ?? ''}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.verifiedText}>{t('hotels.verified')}</Text>
                </View>
              </View>
            </View>

            {/* Policy notice */}
            <View style={styles.noticeCard}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
              <Text style={styles.noticeText}>{t('transport.insuranceNote')}</Text>
            </View>

          </View>
        </ScrollView>

        {/* Bottom bar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomInner}>
            <View>
              <Text style={styles.bottomLabel}>{t('common.total')}</Text>
              <Text style={styles.bottomTotal}>{formatPrice(GRAND_TOTAL)}</Text>
            </View>
            <Button
              title={t('transport.confirmPayment')}
              onPress={onConfirm}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </SafeAreaView>
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
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    overflow: 'hidden', ...Shadow.sm,
  },
  vehicleThumb: { width: 96, height: 80, resizeMode: 'cover' },
  vehicleInfo: { flex: 1, gap: 4, paddingVertical: Spacing.md },
  vehicleName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  vehicleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vehicleMetaText: { fontSize: FontSize.sm, fontWeight: '600' },
  vehiclePriceBlock: { alignItems: 'flex-end', paddingRight: Spacing.md },
  vehiclePriceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  vehiclePriceValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dateOption: {
    flex: 1, minWidth: '40%',
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    padding: Spacing.md,
  },
  dateOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dateOptionLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textSecondary },
  dateOptionLabelActive: { color: Colors.primary },
  dateOptionSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  dateOptionSubActive: { color: Colors.primary },
  pickupOption: {
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  pickupOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pickupLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  pickupDetail: { fontSize: FontSize.sm, color: Colors.textMuted },
  pickupRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pickupExtra: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.xs + 1, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'right', paddingLeft: Spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 1 },
  priceLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  priceValue: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  totalRow: { borderTopWidth: 1.5, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.md },
  totalLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  guestAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  guestAvatarText: { fontSize: FontSize.xl, fontWeight: '700', color: '#FFF' },
  guestName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  guestEmail: { fontSize: FontSize.sm, color: Colors.textMuted },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.successLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  verifiedText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.success },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', paddingBottom: Spacing.sm },
  bottomLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  bottomTotal: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  });
}
