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

// Canonical Korean destination names for the mock service (DEST_ALIASES lookup)
const DEST_KO: Record<string, string> = {
  danang: '다낭', hoian: '호이안', hanoi: '하노이', hochiminh: '호치민',
  phuquoc: '푸꾸옥', halong: '하롱베이', sapa: '사파', nhatrang: '나트랑', hue: '후에',
};
const DESTINATION_KEYS = Object.keys(DEST_KO);

const DAYS_OPTIONS = [3, 5, 7, 10, 14];

export default function AIPlannerScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const [destKey, setDestKey] = useState(DESTINATION_KEYS[0]);
  const [days, setDays] = useState(5);
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [travelerType, setTravelerType] = useState('couple');
  const [budget, setBudget] = useState<'budget' | 'medium' | 'luxury'>('medium');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'intensive'>('moderate');
  const [interests, setInterests] = useState<string[]>([]);
  const { t } = useTranslation();

  const TRAVEL_STYLES = [
    { id: 'cultural',   label: t('aiPlanner.styles.cultural'),   icon: '🏛️' },
    { id: 'beach',      label: t('aiPlanner.styles.beach'),      icon: '🏖️' },
    { id: 'adventure',  label: t('aiPlanner.styles.adventure'),  icon: '🧗' },
    { id: 'food',       label: t('aiPlanner.styles.food'),       icon: '🍜' },
    { id: 'shopping',   label: t('aiPlanner.styles.shopping'),   icon: '🛍️' },
    { id: 'relaxation', label: t('aiPlanner.styles.relaxation'), icon: '🧘' },
  ];
  const TRAVELER_TYPES = [
    { id: 'solo',    label: t('aiPlanner.travelerTypes.solo'),    icon: '🧍' },
    { id: 'couple',  label: t('aiPlanner.travelerTypes.couple'),  icon: '👫' },
    { id: 'family',  label: t('aiPlanner.travelerTypes.family'),  icon: '👨‍👩‍👧' },
    { id: 'friends', label: t('aiPlanner.travelerTypes.friends'), icon: '👯' },
  ];
  const BUDGET_OPTIONS = [
    { id: 'budget' as const, label: t('aiPlanner.budgets.budget'), sub: t('aiPlanner.budgetDesc.budget'), icon: '💚' },
    { id: 'medium' as const, label: t('aiPlanner.budgets.medium'), sub: t('aiPlanner.budgetDesc.medium'), icon: '💛' },
    { id: 'luxury' as const, label: t('aiPlanner.budgets.luxury'), sub: t('aiPlanner.budgetDesc.luxury'), icon: '💜' },
  ];
  const PACE_OPTIONS = [
    { id: 'relaxed'   as const, icon: '🌿', label: t('aiPlanner.paces.relaxed') },
    { id: 'moderate'  as const, icon: '⚡', label: t('aiPlanner.paces.moderate') },
    { id: 'intensive' as const, icon: '🚀', label: t('aiPlanner.paces.intensive') },
  ];
  const INTEREST_OPTIONS = [
    { id: 'history',     icon: '🏛️', label: t('aiPlanner.interestsList.history') },
    { id: 'nature',      icon: '🌿', label: t('aiPlanner.interestsList.nature') },
    { id: 'nightlife',   icon: '🎶', label: t('aiPlanner.interestsList.nightlife') },
    { id: 'art',         icon: '🎨', label: t('aiPlanner.interestsList.art') },
    { id: 'sports',      icon: '⚽', label: t('aiPlanner.interestsList.sports') },
    { id: 'wellness',    icon: '🧘', label: t('aiPlanner.interestsList.wellness') },
    { id: 'photography', icon: '📷', label: t('aiPlanner.interestsList.photography') },
    { id: 'local',       icon: '🍜', label: t('aiPlanner.interestsList.local') },
  ];

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
                <Text style={styles.cardTitle}>{t('aiPlanner.destination')}</Text>
              </View>
              <View style={styles.chipWrap}>
                {DESTINATION_KEYS.map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, destKey === key && styles.chipSel]}
                    onPress={() => setDestKey(key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, destKey === key && styles.chipTextSel]}>{t(`aiPlanner.destinations.${key}` as any)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2 · 여행 기간 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>{t('aiPlanner.duration')}</Text>
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
                    <Text style={[styles.daysUnit, days === d && styles.daysUnitSel]}>{t('common.night')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 3 · 여행 스타일 */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>{t('aiPlanner.travelStyle')}</Text>
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
                <Text style={styles.cardTitle}>{t('aiPlanner.travelerType')}</Text>
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
                <Text style={styles.cardTitle}>{t('aiPlanner.budget')}</Text>
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
                <Text style={styles.cardTitle}>{t('aiPlanner.pace')}</Text>
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
                <Text style={styles.cardTitle}>{t('aiPlanner.interests')}</Text>
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
                {t('aiPlanner.generateHint', { days, nextDays: days + 1, destination: t(`aiPlanner.destinations.${destKey}` as any) })}
              </Text>
            </View>
            <Button
              title={t('aiPlanner.generate')}
              onPress={() => router.push({
                pathname: '/ai-planner/results',
                params: { destination: DEST_KO[destKey], days, travelStyle: travelStyle.join(','), travelerType, budget, pace, interests: interests.join(',') },
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
