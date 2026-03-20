import React, { useEffect, useRef , useMemo} from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { useFormatter } from '../../hooks/useFormatter';

export default function HotelConfirmationScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { formatPrice, formatDate } = useFormatter();
  const {
    confirmationCode, hotelName, roomName,
    checkIn, checkOut, nights, totalPrice,
  } = useLocalSearchParams<{
    confirmationCode: string; hotelName: string; roomName: string;
    checkIn: string; checkOut: string; nights: string; totalPrice: string;
  }>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const bookingId = confirmationCode || `VTH-${Math.floor(Math.random() * 900000 + 100000)}`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Success Animation */}
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </Animated.View>

          <Animated.View style={[styles.textWrap, { opacity: fadeAnim }]}>
            <Text style={styles.title}>{t('hotels.confirmationTitle')}</Text>
            <Text style={styles.subtitle}>{t('hotels.confirmationSubtitle')}</Text>

            {/* Booking Card */}
            <View style={styles.bookingCard}>
              <View style={styles.bookingCardHeader}>
                <Ionicons name="bed-outline" size={20} color={Colors.primary} />
                <Text style={styles.bookingCardTitle}>{t('hotels.bookingNumber')}</Text>
              </View>
              <Text style={styles.bookingId}>{bookingId}</Text>

              {[
                { label: t('bookings.hotel'), value: hotelName ?? '' },
                { label: t('hotels.checkIn'),  value: checkIn  ? formatDate(checkIn,  'long') : '' },
                { label: t('hotels.checkOut'), value: checkOut ? formatDate(checkOut, 'long') : '' },
                { label: t('hotels.duration'), value: `${nights ?? ''}${t('common.nights')}` },
                { label: t('hotels.roomInfo'), value: roomName ?? '' },
                { label: t('common.total'), value: totalPrice ? formatPrice(Number(totalPrice)) : '' },
              ].map(row => (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              ))}
            </View>

              <View style={styles.infoBox}>
              <Ionicons name="mail-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>{t('hotels.emailSent')}</Text>
            </View>
          </Animated.View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={t('hotels.viewBookings')}
              onPress={() => router.replace('/(tabs)/bookings' as never)}
              fullWidth
            />
            <Button
              title={t('hotels.backHome')}
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.xl },
  iconWrap: { alignItems: 'center' },
  textWrap: { width: '100%', gap: Spacing.md },
  title: { fontSize: FontSize['3xl'], fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bookingCardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  bookingId: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, textAlign: 'center', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  rowValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md },
  infoText: { fontSize: FontSize.sm, color: Colors.primary, flex: 1 },
  actions: { width: '100%', gap: Spacing.md },
  });
}
