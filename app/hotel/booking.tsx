import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Colors } from '../../constants/colors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { hotelsService } from '../../services/mock/hotels.service';
import { useAuthStore } from '../../store/auth.store';
import { useBookingsStore } from '../../store/bookings.store';
import { Button } from '../../components/common/Button';
import { formatKRWPrice, formatDateShort } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

const bookingSchema = z.object({
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.number().min(1).max(6),
  children: z.number().min(0).max(4),
  requests: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const DATE_OPTIONS = [
  { label: '오늘 ~ 1박', checkIn: '2026-04-10', checkOut: '2026-04-11', nights: 1 },
  { label: '2박 3일', checkIn: '2026-04-10', checkOut: '2026-04-12', nights: 2 },
  { label: '3박 4일', checkIn: '2026-04-10', checkOut: '2026-04-13', nights: 3 },
  { label: '5박 6일', checkIn: '2026-04-10', checkOut: '2026-04-15', nights: 5 },
];

export default function HotelBookingScreen() {
  const { t } = useTranslation();
  const { hotelId, roomId } = useLocalSearchParams<{ hotelId: string; roomId: string }>();
  const { user } = useAuthStore();
  const { addHotelBooking } = useBookingsStore();
  const [selectedDates, setSelectedDates] = useState(DATE_OPTIONS[1]);
  const [loading, setLoading] = useState(false);

  const ROOM_PRICE = 450000; // mock KRW per night
  const TOTAL = ROOM_PRICE * selectedDates.nights;
  const TAX = Math.round(TOTAL * 0.1);
  const GRAND_TOTAL = TOTAL + TAX;

  const { control, handleSubmit, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkIn: selectedDates.checkIn,
      checkOut: selectedDates.checkOut,
      adults: 2,
      children: 0,
      requests: '',
    },
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      const booking = await hotelsService.createBooking({
        hotelId: hotelId ?? '',
        hotelName: hotelId ?? '',
        hotelImage: '',
        roomId: roomId ?? '',
        roomName: roomId ?? '',
        checkIn: selectedDates.checkIn,
        checkOut: selectedDates.checkOut,
        nights: selectedDates.nights,
        guests: 2,
        pricePerNight: GRAND_TOTAL / 1350 / selectedDates.nights,
        totalPrice: GRAND_TOTAL / 1350,
        currency: 'USD',
        status: 'confirmed',
        guestName: user?.name ?? '이름 없음',
        guestEmail: user?.email ?? '',
      } as any);
      addHotelBooking(booking);
      router.replace({ pathname: '/hotel/confirmation', params: { bookingId: booking.id } } as never);
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('hotels.bookingTitle')}</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Date Selection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('hotels.selectDates')}</Text>
              <View style={styles.dateOptions}>
                {DATE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.dateOption, selectedDates.label === opt.label && styles.dateOptionActive]}
                    onPress={() => setSelectedDates(opt)}
                  >
                    <Text style={[styles.dateOptionLabel, selectedDates.label === opt.label && styles.dateOptionLabelActive]}>{opt.label}</Text>
                    <Text style={[styles.dateOptionDates, selectedDates.label === opt.label && styles.dateOptionDatesActive]}>
                      {opt.checkIn} ~ {opt.checkOut}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Guest Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('hotels.guestInfo')}</Text>
              <View style={styles.guestRow}>
                <View style={styles.guestAvatar}>
                  <Text style={styles.guestAvatarText}>{user?.name?.[0] ?? 'K'}</Text>
                </View>
                <View>
                  <Text style={styles.guestName}>{user?.name ?? '김여행'}</Text>
                  <Text style={styles.guestEmail}>{user?.email ?? 'kim@travel.com'}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.verifiedText}>{t('hotels.verified')}</Text>
                </View>
              </View>
            </View>

            {/* Stay Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('hotels.stayInfo')}</Text>
              {[
                { icon: 'calendar-outline', label: t('hotels.checkIn'), value: selectedDates.checkIn },
                { icon: 'calendar-outline', label: t('hotels.checkOut'), value: selectedDates.checkOut },
                { icon: 'moon-outline', label: t('hotels.duration'), value: `${selectedDates.nights}${t('common.nights')}` },
                { icon: 'people-outline', label: t('hotels.guests'), value: t('hotels.adults2') },
              ].map(row => (
                <View key={row.label} style={styles.summaryRow}>
                  <View style={styles.summaryLeft}>
                    <Ionicons name={row.icon as any} size={16} color={Colors.textMuted} />
                    <Text style={styles.summaryLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Price Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('hotels.feeBreakdown')}</Text>
              {[
                { label: t('hotels.roomFeeNights', { nights: selectedDates.nights }), value: formatKRWPrice(TOTAL) },
                { label: t('hotels.taxFee'), value: formatKRWPrice(TAX) },
              ].map(p => (
                <View key={p.label} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{p.label}</Text>
                  <Text style={styles.priceValue}>{p.value}</Text>
                </View>
              ))}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('common.total')}</Text>
                <Text style={styles.totalValue}>{formatKRWPrice(GRAND_TOTAL)}</Text>
              </View>
            </View>

            {/* Requests */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('hotels.specialRequest')}</Text>
              <View style={styles.requestInput}>
                <Text style={styles.requestPlaceholder}>{t('hotels.specialRequestPlaceholder')}</Text>
              </View>
            </View>

            {/* Policy Notice */}
            <View style={styles.noticeCard}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.noticeText}>
                {t('hotels.cancelNote')}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomInner}>
            <View>
              <Text style={styles.bottomLabel}>{t('common.total')}</Text>
              <Text style={styles.bottomTotal}>{formatKRWPrice(GRAND_TOTAL)}</Text>
            </View>
            <Button
              title={t('common.book')}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
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
  dateOptions: { gap: Spacing.sm },
  dateOption: { borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md },
  dateOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dateOptionLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textSecondary },
  dateOptionLabelActive: { color: Colors.primary },
  dateOptionDates: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  dateOptionDatesActive: { color: Colors.primary },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  guestAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  guestAvatarText: { fontSize: FontSize.xl, fontWeight: '700', color: '#FFF' },
  guestName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  guestEmail: { fontSize: FontSize.sm, color: Colors.textMuted },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto', backgroundColor: '#ECFDF5', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  verifiedText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.success },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs + 1, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 1 },
  priceLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  priceValue: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  totalRow: { borderTopWidth: 1.5, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.md },
  totalLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  requestInput: { borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, height: 80, backgroundColor: Colors.background },
  requestPlaceholder: { fontSize: FontSize.sm, color: Colors.textMuted },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', paddingBottom: Spacing.sm },
  bottomLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  bottomTotal: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
});
