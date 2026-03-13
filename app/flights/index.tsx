import React, { useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';

const VIETNAM_CITIES = ['하노이 (HAN)', '다낭 (DAD)', '호치민 (SGN)', '푸꾸옥 (PQC)', '냐짱 (CXR)', '후에 (HUI)'];
const KOREAN_CITIES = ['서울 인천 (ICN)', '서울 김포 (GMP)', '부산 (PUS)', '제주 (CJU)'];

export default function FlightSearchScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const [origin, setOrigin] = useState(KOREAN_CITIES[0]);
  const [destination, setDestination] = useState(VIETNAM_CITIES[1]);
  const [flightClass, setFlightClass] = useState('economy');
  const [passengers, setPassengers] = useState('2');
  const [tripType, setTripType] = useState<'round' | 'one'>('round');
  const [departDate, setDepartDate] = useState('2026-04-10');
  const [returnDate, setReturnDate] = useState('2026-04-17');
  const [isFlexible, setIsFlexible] = useState(false);
  const { t } = useTranslation();

  const swap = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('flights.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Trip Type */}
            <View style={styles.tripTypeRow}>
              {(['round', 'one'] as const).map(tt => (
                <TouchableOpacity
                  key={tt}
                  style={[styles.tripTypeBtn, tripType === tt && styles.tripTypeBtnActive]}
                  onPress={() => setTripType(tt)}
                >
                  <Text style={[styles.tripTypeBtnText, tripType === tt && styles.tripTypeBtnTextActive]}>
                    {tt === 'round' ? t('flights.roundTrip') : t('flights.oneWay')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Route Card */}
            <View style={styles.routeCard}>
              <View style={styles.routeField}>
                <Text style={styles.routeFieldLabel}>{t('flights.origin')}</Text>
                <Text style={styles.routeFieldValue}>{origin}</Text>
              </View>
              <TouchableOpacity style={styles.swapBtn} onPress={swap}>
                <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <View style={[styles.routeField, { alignItems: 'flex-end' }]}>
                <Text style={styles.routeFieldLabel}>{t('flights.destination')}</Text>
                <Text style={styles.routeFieldValue}>{destination}</Text>
              </View>
            </View>

            {/* Destination Picker */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('flights.pickDestination')}</Text>
              <View style={styles.optionGrid}>
                {VIETNAM_CITIES.map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.optionBtn, destination === city && styles.optionBtnActive]}
                    onPress={() => setDestination(city)}
                  >
                    <Text style={[styles.optionBtnText, destination === city && styles.optionBtnTextActive]}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('flights.selectDate')}</Text>
              <View style={styles.dateRow}>
                <View style={[styles.dateField, { borderColor: Colors.primary }]}>
                  <Text style={styles.dateFieldLabel}>{t('flights.departDate')}</Text>
                  <Text style={styles.dateFieldValue}>{departDate}</Text>
                  <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                </View>
                {tripType === 'round' && (
                  <View style={styles.dateField}>
                    <Text style={styles.dateFieldLabel}>{t('flights.returnDate')}</Text>
                    <Text style={styles.dateFieldValue}>{returnDate}</Text>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
                  </View>
                )}
              </View>

              {/* Quick Date Options */}
              <View style={styles.quickDates}>
                {['3박 4일', '5박 6일', '7박 8일', '14박 15일'].map((label, i) => {
                  const nights = [3, 5, 7, 14][i];
                  return (
                    <TouchableOpacity
                      key={label}
                      style={styles.quickDateBtn}
                      onPress={() => {
                        const d = new Date('2026-04-10');
                        d.setDate(d.getDate() + nights + 1);
                        setReturnDate(d.toISOString().split('T')[0]);
                      }}
                    >
                      <Text style={styles.quickDateText}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Class & Passengers */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('flights.cabinClass')}</Text>
              <View style={styles.optionRow}>
                {(['economy', 'business', 'first'] as const).map(cls => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.classBtn, flightClass === cls && styles.classBtnActive]}
                    onPress={() => setFlightClass(cls)}
                  >
                    <Text style={[styles.classBtnText, flightClass === cls && styles.classBtnTextActive]}>{t(`flights.${cls}`)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.cardTitle, { marginTop: Spacing.sm }]}>{t('flights.passengers')}</Text>
              <View style={styles.optionRow}>
                {['1', '2', '3', '4', '5+'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.classBtn, passengers === p && styles.classBtnActive]}
                    onPress={() => setPassengers(p)}
                  >
                    <Text style={[styles.classBtnText, passengers === p && styles.classBtnTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Flexible Dates Toggle */}
              <TouchableOpacity
                style={[styles.flexibleBtn, isFlexible && styles.flexibleBtnActive]}
                onPress={() => setIsFlexible(v => !v)}
              >
                <Ionicons
                  name={isFlexible ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={isFlexible ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.flexibleBtnText, isFlexible && styles.flexibleBtnTextActive]}>
                  {t('flights.flexibleDates')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* AI Notice */}
            <View style={styles.aiNotice}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <Text style={styles.aiNoticeText}>{t('flights.aiHint')}</Text>
            </View>

            <Button
              title={t('flights.search')}
              onPress={() => router.push({ pathname: '/flights/results', params: { origin, destination, departDate, returnDate, flightClass, passengers, isFlexible: String(isFlexible) } } as never)}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  tripTypeRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 4, ...Shadow.sm },
  tripTypeBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  tripTypeBtnActive: { backgroundColor: Colors.primary },
  tripTypeBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textMuted },
  tripTypeBtnTextActive: { color: '#FFF' },
  routeCard: { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeField: { flex: 1 },
  routeFieldLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  routeFieldValue: { fontSize: FontSize.base, fontWeight: '700', color: '#FFF' },
  swapBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  optionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  optionBtnTextActive: { color: '#FFF', fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  dateField: { flex: 1, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md },
  dateFieldLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  dateFieldValue: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  quickDates: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  quickDateBtn: { paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs, backgroundColor: Colors.background, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  quickDateText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  optionRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  classBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  classBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  classBtnTextActive: { color: '#FFF', fontWeight: '600' },
  aiNotice: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  aiNoticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  flexibleBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background, alignSelf: 'flex-start' },
  flexibleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  flexibleBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },
  flexibleBtnTextActive: { color: Colors.primary },
  });
}
