import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';

export default function TransportConfirmationScreen() {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const bookingId = `VTT-${Math.floor(Math.random() * 900000 + 100000)}`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name="car-sport" size={80} color={Colors.success} />
          </Animated.View>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Text style={styles.title}>{t('transport.confirmationTitle')}</Text>
            <Text style={styles.subtitle}>{t('transport.confirmationSubtitle')}</Text>

            <View style={styles.card}>
              <Text style={styles.bookingId}>{bookingId}</Text>
              {[
                { label: '차량', value: 'Toyota Innova' },
                { label: '픽업 날짜', value: '2026년 4월 10일' },
                { label: '픽업 장소', value: '다낭 국제공항' },
                { label: '기사', value: '포함 (영어 가능)' },
                { label: '총 금액', value: '594,000원' },
              ].map(r => (
                <View key={r.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tip}>
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>{t('transport.driverContactNote')}</Text>
            </View>
          </Animated.View>

          <View style={styles.actions}>
            <Button title={t('transport.viewBookings')} onPress={() => router.replace('/(tabs)/bookings' as never)} fullWidth />
            <Button title={t('transport.backHome')} variant="outline" onPress={() => router.replace('/(tabs)')} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.xl },
  content: { width: '100%', gap: Spacing.md },
  title: { fontSize: FontSize['3xl'], fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  bookingId: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, textAlign: 'center', letterSpacing: 1, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  rowValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  tip: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary },
  actions: { width: '100%', gap: Spacing.md },
});
