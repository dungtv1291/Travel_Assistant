import React, { useEffect, useRef , useMemo} from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Radius, Shadow } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';

export default function TransportConfirmationScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();

  const getTypeLabel = (type: string) => ({
    airport_pickup: t('transport.airportPickup'),
    private_car: t('transport.privateTransfer'),
    self_drive: t('transport.selfDrive'),
    day_tour: t('transport.dayTour'),
    scooter: t('transport.scooter'),
  } as Record<string, string>)[type] ?? type;

  const {
    confirmationCode, vehicleName, vehicleType,
    pickupLocation, pickupDate, returnDate, days, totalPrice, driverIncluded,
  } = useLocalSearchParams<{
    confirmationCode: string; vehicleName: string; vehicleType: string;
    pickupLocation: string; pickupDate: string; returnDate: string;
    days: string; totalPrice: string; driverIncluded: string;
  }>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const formattedTotal = totalPrice
    ? `${Number(totalPrice).toLocaleString('ko-KR')}원`
    : '';
  const isPerTrip = vehicleType === 'airport_pickup' || vehicleType === 'day_tour';

  const detailRows = [
    { label: t('transport.vehicle'), value: String(vehicleName ?? '') },
    { label: t('transport.serviceType'), value: getTypeLabel(vehicleType ?? '') },
    { label: t('transport.pickup'), value: String(pickupLocation ?? '') },
    { label: t('transport.pickupDate'), value: String(pickupDate ?? '') },
    ...(!isPerTrip && days ? [{ label: t('transport.usagePeriod'), value: `${days} ${t('common.days')} (${returnDate ?? ''})` }] : []),
    { label: t('transport.driver'), value: driverIncluded === '1' ? t('transport.withDriver') : t('transport.selfMode') },
    { label: t('common.total'), value: formattedTotal },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          {/* Animated Success Icon */}
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="car-sport" size={48} color="#FFF" />
            </View>
          </Animated.View>

          <Animated.View style={[styles.textWrap, { opacity: fadeAnim }]}>
            <Text style={styles.title}>{t('transport.confirmationTitle')}</Text>
            <Text style={styles.subtitle}>{t('transport.confirmationSubtitle')}</Text>

            {/* Booking card */}
            <View style={styles.bookingCard}>
              <View style={styles.bookingCardHeader}>
                <Ionicons name="car-outline" size={18} color={Colors.primary} />
                <Text style={styles.bookingCardTitle}>{t('transport.bookingNumber')}</Text>
              </View>
              <Text style={styles.bookingId}>
                {confirmationCode ?? `VTT-${Date.now()}`}
              </Text>
              {detailRows.map(row => (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Driver note */}
            <View style={styles.tipBox}>
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>{t('transport.driverContactNote')}</Text>
            </View>
          </Animated.View>

          {/* CTA buttons */}
          <View style={styles.actions}>
            <Button
              title={t('transport.viewBookings')}
              onPress={() => router.replace('/(tabs)/bookings' as never)}
              fullWidth
            />
            <Button
              title={t('transport.backHome')}
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  iconWrap: { alignItems: 'center' },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  textWrap: { width: '100%', gap: Spacing.md },
  title: { fontSize: FontSize['3xl'], fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  bookingCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.base, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  bookingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bookingCardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  bookingId: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, textAlign: 'center', letterSpacing: 1, paddingBottom: Spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  rowValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'right', paddingLeft: Spacing.sm },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary },
  actions: { width: '100%', gap: Spacing.md },
  });
}
