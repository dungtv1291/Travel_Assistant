import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

// ── City metadata ─────────────────────────────────────────────────────────────
type CityMeta = { code: string; city: string; airport: string };
const CITY_META: Record<string, CityMeta> = {
  '서울 인천 (ICN)': { code: 'ICN', city: '서울',   airport: '인천국제공항' },
  '서울 김포 (GMP)': { code: 'GMP', city: '서울',   airport: '김포국제공항' },
  '부산 (PUS)':      { code: 'PUS', city: '부산',   airport: '김해국제공항' },
  '제주 (CJU)':      { code: 'CJU', city: '제주',   airport: '제주국제공항' },
  '하노이 (HAN)':    { code: 'HAN', city: '하노이', airport: '노이바이국제공항' },
  '다낭 (DAD)':      { code: 'DAD', city: '다낭',   airport: '다낭국제공항' },
  '호치민 (SGN)':    { code: 'SGN', city: '호치민', airport: '탄손녓국제공항' },
  '푸꾸옥 (PQC)':    { code: 'PQC', city: '푸꾸옥', airport: '푸꾸옥국제공항' },
  '나트랑 (CXR)':    { code: 'CXR', city: '나트랑', airport: '캄란국제공항' },
  '후에 (HUI)':      { code: 'HUI', city: '후에',   airport: '푸바이국제공항' },
};

const VIETNAM_CITIES = ['하노이 (HAN)', '다낭 (DAD)', '호치민 (SGN)', '푸꾸옥 (PQC)', '나트랑 (CXR)', '후에 (HUI)'];
const KOREAN_CITIES  = ['서울 인천 (ICN)', '서울 김포 (GMP)', '부산 (PUS)', '제주 (CJU)'];

const CLASS_OPTIONS: { key: 'economy' | 'business' | 'first'; label: string }[] = [
  { key: 'economy',  label: '일반석' },
  { key: 'business', label: '비즈니스' },
  { key: 'first',    label: '일등석' },
];

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: `${d.getMonth() + 1}월 ${d.getDate()}일`,
    day:  `(${DAY_NAMES[d.getDay()]})`,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function FlightSearchScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const [origin,      setOrigin]      = useState(KOREAN_CITIES[0]);
  const [destination, setDestination] = useState(VIETNAM_CITIES[1]);
  const [flightClass, setFlightClass] = useState<'economy' | 'business' | 'first'>('economy');
  const [passengers,  setPassengers]  = useState(2);
  const [tripType,    setTripType]    = useState<'round' | 'one'>('round');
  const [departDate,  setDepartDate]  = useState('2026-04-10');
  const [returnDate,  setReturnDate]  = useState('2026-04-17');
  const [isFlexible,  setIsFlexible]  = useState(false);

  const swap = () => { const tmp = origin; setOrigin(destination); setDestination(tmp); };

  const originMeta = CITY_META[origin]      ?? { code: '???', city: origin,      airport: '' };
  const destMeta   = CITY_META[destination] ?? { code: '???', city: destination, airport: '' };
  const depart     = formatDate(departDate);
  const ret        = formatDate(returnDate);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ── Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>항공권 검색</Text>
            <Text style={styles.headerSub}>베트남 직항 · 8개 도시</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            {/* ── Trip type switcher */}
            <View style={styles.tripSwitch}>
              {(['round', 'one'] as const).map(tt => (
                <TouchableOpacity
                  key={tt}
                  style={[styles.tripBtn, tripType === tt && styles.tripBtnActive]}
                  onPress={() => setTripType(tt)}
                >
                  <Ionicons
                    name={tt === 'round' ? 'repeat' : 'arrow-forward'}
                    size={14}
                    color={tripType === tt ? '#FFF' : Colors.textMuted}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.tripBtnText, tripType === tt && styles.tripBtnTextActive]}>
                    {tt === 'round' ? '왕복' : '편도'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Route block */}
            <View style={styles.routeCard}>
              <View style={styles.routeSide}>
                <Text style={styles.routeCode}>{originMeta.code}</Text>
                <Text style={styles.routeCity}>{originMeta.city}</Text>
                <Text style={styles.routeAirport} numberOfLines={1}>{originMeta.airport}</Text>
              </View>
              <View style={styles.routeMiddle}>
                <View style={styles.routeLine} />
                <TouchableOpacity style={styles.swapBtn} onPress={swap}>
                  <Ionicons name="swap-horizontal" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.routeLine} />
              </View>
              <View style={[styles.routeSide, { alignItems: 'flex-end' }]}>
                <Text style={styles.routeCode}>{destMeta.code}</Text>
                <Text style={styles.routeCity}>{destMeta.city}</Text>
                <Text style={styles.routeAirport} numberOfLines={1}>{destMeta.airport}</Text>
              </View>
            </View>

            {/* ── Destination picker */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={15} color={Colors.primary} />
                <Text style={styles.sectionTitle}>베트남 목적지</Text>
              </View>
              <View style={styles.chipGrid}>
                {VIETNAM_CITIES.map(city => {
                  const meta = CITY_META[city];
                  const active = destination === city;
                  return (
                    <TouchableOpacity
                      key={city}
                      style={[styles.cityChip, active && styles.cityChipActive]}
                      onPress={() => setDestination(city)}
                    >
                      <Text style={[styles.cityChipName, active && styles.cityChipNameActive]}>
                        {meta?.city ?? city}
                      </Text>
                      <Text style={[styles.cityChipCode, active && styles.cityChipCodeActive]}>
                        {meta?.code ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Origin picker */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="airplane-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.sectionTitle}>출발 공항</Text>
              </View>
              <View style={styles.chipGrid}>
                {KOREAN_CITIES.map(city => {
                  const meta = CITY_META[city];
                  const active = origin === city;
                  return (
                    <TouchableOpacity
                      key={city}
                      style={[styles.originChip, active && styles.originChipActive]}
                      onPress={() => setOrigin(city)}
                    >
                      <Text style={[styles.cityChipName, active && styles.originChipNameActive]}>
                        {meta?.city ?? city}
                      </Text>
                      <Text style={[styles.cityChipCode, active && styles.originChipCodeActive]}>
                        {meta?.code ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Date block */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                <Text style={styles.sectionTitle}>날짜 선택</Text>
              </View>
              <View style={styles.dateRow}>
                <View style={[styles.dateCard, { borderColor: Colors.primary }]}>
                  <Text style={styles.dateCardLabel}>출발일</Text>
                  <Text style={styles.dateCardDate}>{depart.date}</Text>
                  <Text style={styles.dateCardDay}>{depart.day}</Text>
                </View>
                <View style={styles.dateDivider}>
                  <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
                </View>
                {tripType === 'round' ? (
                  <View style={[styles.dateCard, { borderColor: Colors.border }]}>
                    <Text style={styles.dateCardLabel}>귀국일</Text>
                    <Text style={styles.dateCardDate}>{ret.date}</Text>
                    <Text style={styles.dateCardDay}>{ret.day}</Text>
                  </View>
                ) : (
                  <View style={[styles.dateCard, styles.dateCardDisabled]}>
                    <Text style={styles.dateCardLabel}>귀국일</Text>
                    <Text style={[styles.dateCardDate, { color: Colors.textMuted }]}>편도</Text>
                    <Text style={styles.dateCardDay}> </Text>
                  </View>
                )}
              </View>

              {tripType === 'round' && (
                <View style={styles.quickRow}>
                  <Text style={styles.quickLabel}>빠른 선택</Text>
                  <View style={styles.quickChips}>
                    {[{ label: '3박', n: 4 }, { label: '5박', n: 6 }, { label: '7박', n: 8 }, { label: '14박', n: 15 }].map(({ label, n }) => (
                      <TouchableOpacity
                        key={label}
                        style={styles.quickChip}
                        onPress={() => setReturnDate(addDays(departDate, n))}
                      >
                        <Text style={styles.quickChipText}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* ── Class & Passengers */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={15} color={Colors.primary} />
                <Text style={styles.sectionTitle}>탑승 정보</Text>
              </View>

              {/* Seat class */}
              <View style={styles.classRow}>
                {CLASS_OPTIONS.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.classBtn, flightClass === key && styles.classBtnActive]}
                    onPress={() => setFlightClass(key)}
                  >
                    {flightClass === key && (
                      <Ionicons name="checkmark" size={13} color="#FFF" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.classBtnText, flightClass === key && styles.classBtnTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Passenger stepper */}
              <View style={styles.passengerRow}>
                <View>
                  <Text style={styles.passengerLabel}>인원</Text>
                  <Text style={styles.passengerSub}>성인 기준</Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={[styles.stepBtn, passengers <= 1 && styles.stepBtnDisabled]}
                    onPress={() => setPassengers(p => Math.max(1, p - 1))}
                    disabled={passengers <= 1}
                  >
                    <Ionicons name="remove" size={18} color={passengers <= 1 ? Colors.border : Colors.primary} />
                  </TouchableOpacity>
                  <View style={styles.stepCountWrap}>
                    <Text style={styles.stepCount}>{passengers}</Text>
                    <Text style={styles.stepUnit}>명</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.stepBtn, passengers >= 9 && styles.stepBtnDisabled]}
                    onPress={() => setPassengers(p => Math.min(9, p + 1))}
                    disabled={passengers >= 9}
                  >
                    <Ionicons name="add" size={18} color={passengers >= 9 ? Colors.border : Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Flexible toggle */}
              <TouchableOpacity
                style={[styles.flexCheck, isFlexible && styles.flexCheckActive]}
                onPress={() => setIsFlexible(v => !v)}
              >
                <Ionicons
                  name={isFlexible ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={isFlexible ? Colors.primary : Colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.flexCheckText, isFlexible && styles.flexCheckTextActive]}>
                    날짜 유연하게 검색 (±3일)
                  </Text>
                  <Text style={styles.flexCheckSub}>더 저렴한 항공권을 놓치지 마세요</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── AI notice */}
            <View style={styles.aiCard}>
              <View style={styles.aiTop}>
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
                <Text style={styles.aiTitle}>AI 최적화 검색</Text>
              </View>
              <Text style={styles.aiBody}>
                실시간 가격 데이터와 AI 분석으로 최적의 항공권을 추천합니다. 최저가 · 최단시간 · 최고 가성비 순으로 결과를 제공합니다.
              </Text>
            </View>

            {/* ── CTA */}
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.85}
              onPress={() => router.push({
                pathname: '/flights/results',
                params: {
                  origin, destination, departDate, returnDate,
                  flightClass, passengers: String(passengers),
                  isFlexible: String(isFlexible),
                },
              } as never)}
            >
              <Ionicons name="airplane" size={20} color="#FFF" />
              <Text style={styles.ctaText}>항공권 검색</Text>
            </TouchableOpacity>
            <Text style={styles.ctaSummary}>
              {originMeta.city} → {destMeta.city} · {depart.date} · {passengers}명 · {CLASS_OPTIONS.find(c => c.key === flightClass)?.label}
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe:         { flex: 1, backgroundColor: Colors.background },
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
    backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
    headerCenter: { alignItems: 'center', gap: 2 },
    headerTitle:  { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
    headerSub:    { fontSize: FontSize.xs, color: Colors.textMuted },
    content:      { padding: Spacing.base, gap: Spacing.md, paddingBottom: 48 },

    // Trip switch
    tripSwitch:        { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 4, ...Shadow.sm },
    tripBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: Radius.lg },
    tripBtnActive:     { backgroundColor: Colors.primary },
    tripBtnText:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted },
    tripBtnTextActive: { color: '#FFF' },

    // Route card
    routeCard:    { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', ...Shadow.md },
    routeSide:    { flex: 1 },
    routeCode:    { fontSize: 34, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
    routeCity:    { fontSize: FontSize.sm, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    routeAirport: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
    routeMiddle:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm },
    routeLine:    { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', minWidth: 12 },
    swapBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginHorizontal: 6, ...Shadow.sm },

    // Sections
    section:       { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.md, ...Shadow.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: -4 },
    sectionTitle:  { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.2 },

    // City chips (shared styles)
    chipGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    cityChip:           { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, minWidth: 60 },
    cityChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
    cityChipName:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
    cityChipNameActive: { color: '#FFF' },
    cityChipCode:       { fontSize: 10, fontWeight: '600', color: Colors.textMuted, marginTop: 1, textAlign: 'center' },
    cityChipCodeActive: { color: 'rgba(255,255,255,0.65)' },

    // Origin chips (outlined style)
    originChip:        { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, minWidth: 60 },
    originChipActive:  { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
    originChipNameActive: { color: Colors.primary },
    originChipCodeActive: { color: Colors.primary },

    // Date block
    dateRow:          { flexDirection: 'row', alignItems: 'center' },
    dateCard:         { flex: 1, borderRadius: Radius.lg, borderWidth: 2, padding: Spacing.md, backgroundColor: Colors.background },
    dateCardLabel:    { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted, marginBottom: 4 },
    dateCardDate:     { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
    dateCardDay:      { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    dateCardDisabled: { borderColor: Colors.border, opacity: 0.4 },
    dateDivider:      { width: 30, alignItems: 'center' },

    // Quick duration
    quickRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    quickLabel:    { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
    quickChips:    { flexDirection: 'row', gap: Spacing.xs },
    quickChip:     { paddingHorizontal: Spacing.sm + 2, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
    quickChipText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },

    // Seat class
    classRow:           { flexDirection: 'row', gap: Spacing.sm },
    classBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: Radius.lg, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
    classBtnActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
    classBtnText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
    classBtnTextActive: { color: '#FFF' },

    // Passenger stepper
    passengerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs },
    passengerLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
    passengerSub:   { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    stepper:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    stepBtn:             { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
    stepBtnDisabled:     { borderColor: Colors.border },
    stepCountWrap:  { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    stepCount:      { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, minWidth: 26, textAlign: 'center' },
    stepUnit:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },

    // Flexible toggle
    flexCheck:           { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
    flexCheckActive:     { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
    flexCheckText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
    flexCheckTextActive: { color: Colors.primary },
    flexCheckSub:        { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },

    // AI card
    aiCard:  { backgroundColor: Colors.primaryLight, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '33' },
    aiTop:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    aiTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
    aiBody:  { fontSize: FontSize.sm, color: Colors.primary, lineHeight: 20, opacity: 0.85 },

    // CTA
    ctaBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, ...Shadow.md },
    ctaText:    { fontSize: FontSize.lg, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
    ctaSummary: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: -4, marginBottom: 4 },
  });
}
