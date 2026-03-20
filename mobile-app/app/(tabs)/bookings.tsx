import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useBookingsStore } from '../../store/bookings.store';
import { bookingsService } from '../../services/mock/bookings.service';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { HotelBooking } from '../../types/hotel.types';
import { TransportBooking } from '../../types/transport.types';
import { useTranslation } from '../../hooks/useTranslation';
import { useFormatter } from '../../hooks/useFormatter';

type FilterTab = 'all' | 'hotel' | 'transport';

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  cancelled: '#EF4444',
  completed: '#1BBCD4',
};

export default function BookingsScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { hotelBookings: storeHotelBookings, transportBookings: storeTransportBookings } = useBookingsStore();
  const [loadedHotelBookings, setLoadedHotelBookings] = useState<HotelBooking[] | null>(null);
  const [loadedTransportBookings, setLoadedTransportBookings] = useState<TransportBooking[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const hotelBookings = loadedHotelBookings ?? storeHotelBookings;
  const transportBookings = loadedTransportBookings ?? storeTransportBookings;

  useEffect(() => {
    bookingsService.getHotelBookings().then(setLoadedHotelBookings).catch(() => {});
    bookingsService.getTransportBookings().then(setLoadedTransportBookings).catch(() => {});
  }, []);
  const { t } = useTranslation();
  const { formatPrice, formatDate } = useFormatter();

  const allBookings = [
    ...hotelBookings.map(b => ({ ...b, _kind: 'hotel' as const })),
    ...transportBookings.map(b => ({ ...b, _kind: 'transport' as const })),
  ].sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

  const filteredBookings = activeFilter === 'all'
    ? allBookings
    : allBookings.filter(b => b._kind === activeFilter);

  const renderHotelBooking = (item: HotelBooking & { _kind: 'hotel' }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push('/hotel/confirmation')}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeTag}>
          <Ionicons name="bed-outline" size={12} color={Colors.primary} />
          <Text style={styles.typeTagText}>{t('bookings.hotel')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
            {t(`bookings.${item.status}` as any) ?? item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.hotelName}</Text>
          <Text style={styles.cardSub}>{item.roomName}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.cardMetaText}>{formatDate(item.checkIn)} → {formatDate(item.checkOut)}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.cardMetaText}>{t('bookings.adultsNights', { nights: item.nights })}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.priceLabel}>{t('bookings.totalAmount')}</Text>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
          <Text style={styles.bookingId}>{item.confirmationCode}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransportBooking = (item: TransportBooking & { _kind: 'transport' }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push('/transport/confirmation')}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeTag, styles.typeTagTransport]}>
          <Ionicons name="car-outline" size={12} color="#FF6B35" />
          <Text style={[styles.typeTagText, { color: '#FF6B35' }]}>{t('bookings.transport')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
            {t(`bookings.${item.status}` as any) ?? item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.vehicleName}</Text>
          <Text style={styles.cardSub}>{item.type === 'airport_pickup' ? t('bookings.airportPickup') : item.type}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.cardMetaText}>{formatDate(item.pickupDate)}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.cardMetaText}>{item.pickupLocation}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.priceLabel}>{t('bookings.totalAmount')}</Text>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
          <Text style={styles.bookingId}>{item.confirmationCode}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('bookings.title')}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{t('bookings.countLabel', { count: allBookings.length })}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{hotelBookings.length}</Text>
          <Text style={styles.statLabel}>{t('bookings.hotels')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{transportBookings.length}</Text>
          <Text style={styles.statLabel}>{t('bookings.transport')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{allBookings.filter(b => b.status === 'confirmed').length}</Text>
          <Text style={styles.statLabel}>{t('bookings.confirmed')}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {([['all', t('common.all')], ['hotel', t('bookings.hotel')], ['transport', t('bookings.transport')]] as [FilterTab, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, activeFilter === key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.filterLabel, activeFilter === key && styles.filterLabelActive]}>{label}</Text>
            <View style={[styles.filterCount, activeFilter === key && styles.filterCountActive]}>
              <Text style={[styles.filterCountText, activeFilter === key && styles.filterCountTextActive]}>
                {key === 'all' ? allBookings.length : key === 'hotel' ? hotelBookings.length : transportBookings.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.confirmationCode}
        renderItem={({ item }) =>
          item._kind === 'hotel'
            ? renderHotelBooking(item as HotelBooking & { _kind: 'hotel' })
            : renderTransportBooking(item as TransportBooking & { _kind: 'transport' })
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={t('bookings.noBookings')}
            description={t('bookings.noBookings')}
            action={
              <Button title={t('common.book')} onPress={() => router.push('/hotel')} />
            }
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.base, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: '800', color: Colors.textPrimary },
  countBadge: { backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, marginHorizontal: Spacing.base, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.md, ...Shadow.sm, justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  statDivider: { width: 1, backgroundColor: Colors.border },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.md },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.surfaceSecondary },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterLabelActive: { color: '#FFFFFF' },
  filterCount: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  filterCountTextActive: { color: '#FFF' },
  listContent: { padding: Spacing.base, paddingTop: 0, gap: Spacing.md, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  typeTagTransport: { backgroundColor: '#FFF3ED' },
  typeTagText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  cardLeft: { flex: 1, gap: 6 },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.base, fontWeight: '800', color: Colors.primary },
  bookingId: { fontSize: 10, fontFamily: 'monospace', color: Colors.textMuted, backgroundColor: Colors.surfaceSecondary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  });
}
