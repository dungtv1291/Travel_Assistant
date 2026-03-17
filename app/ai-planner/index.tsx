import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';

const DESTINATIONS = ['다낭', '호이안', '하노이', '호치민', '푸꾸옥', '하롱베이', '사파', '나트랑', '후에'];

const TRAVEL_STYLES: { id: string; label: string; icon: string }[] = [
  { id: 'cultural',   label: '문화 탐방',  icon: '🏛️' },
  { id: 'beach',      label: '해변 휴양',  icon: '🏖️' },
  { id: 'adventure',  label: '액티비티',   icon: '🧗' },
  { id: 'food',       label: '미식 여행',  icon: '🍜' },
  { id: 'shopping',   label: '쇼핑',       icon: '🛍️' },
  { id: 'relaxation', label: '휴식/힐링',  icon: '🧘' },
];

const TRAVELER_TYPES: { id: string; label: string; icon: string }[] = [
  { id: 'solo',    label: '혼자',   icon: '🧍' },
  { id: 'couple',  label: '커플',   icon: '👫' },
  { id: 'family',  label: '가족',   icon: '👨‍👩‍👧' },
  { id: 'friends', label: '친구들', icon: '👯' },
];

const BUDGET_OPTIONS = [
  { id: 'budget',  label: '절약형',   sub: '~₩50만/일',     icon: '💚' },
  { id: 'medium',  label: '일반',     sub: '₩50~100만/일',  icon: '💛' },
  { id: 'luxury',  label: '럭셔리',   sub: '₩100만+/일',    icon: '💜' },
] as const;

const PACE_OPTIONS = [
  { id: 'relaxed',   icon: '🌿', label: '여유롭게' },
  { id: 'moderate',  icon: '⚡', label: '알차게' },
  { id: 'intensive', icon: '🚀', label: '빠르게' },
] as const;

const INTEREST_OPTIONS: { id: string; icon: string; label: string }[] = [
  { id: 'history',     icon: '🏛️', label: '역사' },
  { id: 'nature',      icon: '🌿', label: '자연' },
  { id: 'nightlife',   icon: '🎶', label: '나이트라이프' },
  { id: 'art',         icon: '🎨', label: '예술' },
  { id: 'sports',      icon: '⚽', label: '스포츠' },
  { id: 'wellness',    icon: '🧘', label: '웰니스' },
  { id: 'photography', icon: '📷', label: '사진' },
  { id: 'local',       icon: '🍜', label: '현지 음식' },
];

const DAYS_OPTIONS = [3, 5, 7, 10, 14];

export default function AIPlannerScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [days, setDays] = useState(5);
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [travelerType, setTravelerType] = useState('couple');
  const [budget, setBudget] = useState<'budget' | 'medium' | 'luxury'>('medium');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'intensive'>('moderate');
  const [interests, setInterests] = useState<string[]>([]);
  const { t } = useTranslation();

  const toggleStyle = (id: string) =>
    setTravelStyle(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleInterest = (id: string) =>
    setInterests(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('aiPlanner.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Hero ── */}
          <LinearGradient
            colors={['#1BBCD4', '#6B35FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIconWrap}>
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>{t('aiPlanner.subtitle')}</Text>
            <Text style={styles.heroSub}>{t('aiPlanner.hint')}</Text>
          </LinearGradient>

          {/* ── Form sections ── */}
          <View style={styles.sections}>

            {/* 1 · 목적지 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>목적지 선택</Text>
              </View>
              <View style={styles.chipWrap}>
                {DESTINATIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, destination === d && styles.chipSel]}
                    onPress={() => setDestination(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, destination === d && styles.chipTextSel]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2 · 여행 기간 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>여행 기간</Text>
              </View>
              <View style={styles.daysRow}>
                {DAYS_OPTIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.daysBtn, days === d && styles.daysBtnSel]}
                    onPress={() => setDays(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.daysNum, days === d && styles.daysNumSel]}>{d}</Text>
                    <Text style={[styles.daysUnit, days === d && styles.daysUnitSel]}>박</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 3 · 여행 스타일 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>여행 스타일</Text>
                <Text style={styles.cardHint}>여러 개 선택 가능</Text>
              </View>
              <View style={styles.chipWrap}>
                {TRAVEL_STYLES.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.tagChip, travelStyle.includes(s.id) && styles.tagChipSel]}
                    onPress={() => toggleStyle(s.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tagEmoji}>{s.icon}</Text>
                    <Text style={[styles.tagText, travelStyle.includes(s.id) && styles.tagTextSel]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 4 · 여행자 유형 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>여행자 유형</Text>
              </View>
              <View style={styles.selRow}>
                {TRAVELER_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.selCard, travelerType === type.id && styles.selCardSel]}
                    onPress={() => setTravelerType(type.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selEmoji}>{type.icon}</Text>
                    <Text style={[styles.selLabel, travelerType === type.id && styles.selLabelSel]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 5 · 예산 수준 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>예산 수준</Text>
              </View>
              <View style={styles.selRow}>
                {BUDGET_OPTIONS.map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.selCard, budget === b.id && styles.selCardSel]}
                    onPress={() => setBudget(b.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selEmoji}>{b.icon}</Text>
                    <Text style={[styles.selLabel, budget === b.id && styles.selLabelSel]}>{b.label}</Text>
                    <Text style={[styles.selSub, budget === b.id && styles.selSubSel]}>{b.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 6 · 여행 속도 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>여행 속도</Text>
              </View>
              <View style={styles.selRow}>
                {PACE_OPTIONS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.selCard, pace === p.id && styles.selCardSel]}
                    onPress={() => setPace(p.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selEmoji}>{p.icon}</Text>
                    <Text style={[styles.selLabel, pace === p.id && styles.selLabelSel]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 7 · 관심사 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>관심사</Text>
                <Text style={styles.cardHint}>여러 개 선택 가능</Text>
              </View>
              <View style={styles.chipWrap}>
                {INTEREST_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.tagChip, interests.includes(item.id) && styles.tagChipSel]}
                    onPress={() => toggleInterest(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tagEmoji}>{item.icon}</Text>
                    <Text style={[styles.tagText, interests.includes(item.id) && styles.tagTextSel]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>

          {/* ── CTA ── */}
          <View style={styles.ctaArea}>
            <View style={styles.notice}>
              <Ionicons name="flash" size={15} color={Colors.primary} />
              <Text style={styles.noticeText}>
                선택하신 조건으로{' '}
                <Text style={styles.noticeStrong}>{days}박 {days + 1}일</Text>
                {' '}최적 일정을 AI가 생성합니다
              </Text>
            </View>
            <Button
              title={t('aiPlanner.generate')}
              onPress={() => router.push({
                pathname: '/ai-planner/results',
                params: { destination, days, travelStyle: travelStyle.join(','), travelerType, budget, pace, interests: interests.join(',') },
              } as never)}
              fullWidth
              size="lg"
              icon={<Ionicons name="sparkles" size={16} color="#FFFFFF" />}
              iconPosition="left"
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    // ── Layout ──
    safe:        { flex: 1, backgroundColor: Colors.background },
    header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
    backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
    headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },

    // ── Hero ──
    hero:        { marginHorizontal: Spacing.base, borderRadius: Radius['2xl'], paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xl, gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.xl },
    heroIconWrap:{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
    heroTitle:   { fontSize: FontSize['2xl'], fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 32 },
    heroSub:     { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 20 },

    // ── Sections wrapper ──
    sections:    { paddingHorizontal: Spacing.base, gap: Spacing.md },

    // ── Card ──
    card:        { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.md, ...Shadow.sm },
    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle:   { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
    cardHint:    { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },

    // ── Destination chips (text-only, solid primary when selected) ──
    chipWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip:        { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.surfaceSecondary, borderWidth: 1.5, borderColor: Colors.border },
    chipSel:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText:    { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
    chipTextSel: { color: '#FFFFFF' },

    // ── Days buttons (numeric blocks, solid primary when selected) ──
    daysRow:    { flexDirection: 'row', gap: Spacing.sm },
    daysBtn:    { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.surfaceSecondary, borderWidth: 1.5, borderColor: Colors.border, gap: 2 },
    daysBtnSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    daysNum:    { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textSecondary, lineHeight: 26 },
    daysNumSel: { color: '#FFFFFF' },
    daysUnit:   { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
    daysUnitSel:{ color: 'rgba(255,255,255,0.8)' },

    // ── Tag chips (emoji + text, tinted primary when selected — signals multi-select) ──
    tagChip:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.surfaceSecondary, borderWidth: 1.5, borderColor: Colors.border },
    tagChipSel: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
    tagEmoji:   { fontSize: 15 },
    tagText:    { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
    tagTextSel: { color: Colors.primary },

    // ── Selector cards (equal-width: traveler type, pace, budget) ──
    selRow:       { flexDirection: 'row', gap: Spacing.sm },
    selCard:      { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.surfaceSecondary, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.xs },
    selCardSel:   { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
    selEmoji:     { fontSize: 22 },
    selLabel:     { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
    selLabelSel:  { color: Colors.primary },
    selSub:       { fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 14 },
    selSubSel:    { color: Colors.primaryDark },

    // ── CTA area ──
    ctaArea:       { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing['3xl'], gap: Spacing.md },
    notice:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderWidth: 1, borderColor: Colors.primary + '33' },
    noticeText:    { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
    noticeStrong:  { fontWeight: '700', color: Colors.primary },
  });
}
