import React, { useState , useMemo} from 'react';
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
  { id: 'cultural', label: '문화 탐방', icon: '🏛️' },
  { id: 'beach', label: '해변 휴양', icon: '🏖️' },
  { id: 'adventure', label: '액티비티', icon: '🧗' },
  { id: 'food', label: '미식 여행', icon: '🍜' },
  { id: 'shopping', label: '쇼핑', icon: '🛍️' },
  { id: 'relaxation', label: '휴식/힐링', icon: '🧘' },
];
const TRAVELER_TYPES: { id: string; label: string; icon: string }[] = [
  { id: 'solo', label: '혼자 여행', icon: '🧍' },
  { id: 'couple', label: '커플', icon: '👫' },
  { id: 'family', label: '가족', icon: '👨‍👩‍👧' },
  { id: 'friends', label: '친구들', icon: '👯' },
];
const PACE_OPTIONS: { id: 'relaxed' | 'moderate' | 'intensive'; icon: string }[] = [
  { id: 'relaxed', icon: '🌿' },
  { id: 'moderate', icon: '⚡' },
  { id: 'intensive', icon: '🚀' },
];
const INTEREST_OPTIONS: { id: string; icon: string }[] = [
  { id: 'history', icon: '🏛️' },
  { id: 'nature', icon: '🌿' },
  { id: 'nightlife', icon: '🎶' },
  { id: 'art', icon: '🎨' },
  { id: 'sports', icon: '⚽' },
  { id: 'wellness', icon: '🧘' },
  { id: 'photography', icon: '📷' },
  { id: 'local', icon: '🍜' },
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

  const toggleStyle = (id: string) => {
    setTravelStyle(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
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
          <Text style={styles.headerTitle}>{t('aiPlanner.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <LinearGradient colors={[Colors.primary, '#6B35FF']} style={styles.heroBanner}>
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            <Text style={styles.heroTitle}>{t('aiPlanner.subtitle')}</Text>
            <Text style={styles.heroSub}>{t('aiPlanner.hint')}</Text>
          </LinearGradient>

          <View style={styles.content}>
            {/* Destination */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.destination')}</Text>
              <View style={styles.optionGrid}>
                {DESTINATIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.optionBtn, destination === d && styles.optionBtnActive]}
                    onPress={() => setDestination(d)}
                  >
                    <Text style={[styles.optionBtnText, destination === d && styles.optionBtnTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Days */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.duration')}</Text>
              <View style={styles.daysRow}>
                {DAYS_OPTIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayBtn, days === d && styles.dayBtnActive]}
                    onPress={() => setDays(d)}
                  >
                    <Text style={[styles.dayBtnNum, days === d && styles.dayBtnNumActive]}>{d}</Text>
                    <Text style={[styles.dayBtnLabel, days === d && styles.dayBtnLabelActive]}>{t('common.nights')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Travel Style */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.travelStyle')}</Text>
              <View style={styles.styleGrid}>
                {TRAVEL_STYLES.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.styleBtn, travelStyle.includes(s.id) && styles.styleBtnActive]}
                    onPress={() => toggleStyle(s.id)}
                  >
                    <Text style={styles.styleEmoji}>{s.icon}</Text>
                    <Text style={[styles.styleBtnText, travelStyle.includes(s.id) && styles.styleBtnTextActive]}>
                      {t(`aiPlanner.styles.${s.id}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Traveler Type */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.travelerType')}</Text>
              <View style={styles.typeRow}>
                {TRAVELER_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeBtn, travelerType === type.id && styles.typeBtnActive]}
                    onPress={() => setTravelerType(type.id)}
                  >
                    <Text style={styles.typeEmoji}>{type.icon}</Text>
                    <Text style={[styles.typeBtnText, travelerType === type.id && styles.typeBtnTextActive]}>
                      {t(`aiPlanner.travelerTypes.${type.id}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.budget')}</Text>
              <View style={styles.budgetRow}>
                {(['budget', 'medium', 'luxury'] as const).map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.budgetBtn, budget === b && styles.budgetBtnActive]}
                    onPress={() => setBudget(b)}
                  >
                    <Text style={[styles.budgetBtnText, budget === b && styles.budgetBtnTextActive]}>{t(`aiPlanner.budgets.${b}`)}</Text>
                    <Text style={styles.budgetSub}>{t(`aiPlanner.budgetDesc.${b}`)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pace */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.pace')}</Text>
              <View style={styles.typeRow}>
                {PACE_OPTIONS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.typeBtn, pace === p.id && styles.typeBtnActive]}
                    onPress={() => setPace(p.id)}
                  >
                    <Text style={styles.typeEmoji}>{p.icon}</Text>
                    <Text style={[styles.typeBtnText, pace === p.id && styles.typeBtnTextActive]}>
                      {t(`aiPlanner.paces.${p.id}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interests */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('aiPlanner.interests')}</Text>
              <View style={styles.styleGrid}>
                {INTEREST_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.styleBtn, interests.includes(item.id) && styles.styleBtnActive]}
                    onPress={() => toggleInterest(item.id)}
                  >
                    <Text style={styles.styleEmoji}>{item.icon}</Text>
                    <Text style={[styles.styleBtnText, interests.includes(item.id) && styles.styleBtnTextActive]}>
                      {t(`aiPlanner.interestsList.${item.id}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AI Notice */}
            <View style={styles.aiNotice}>
              <Ionicons name="flash-outline" size={18} color={Colors.primary} />
              <Text style={styles.aiNoticeText}>{t('aiPlanner.generateHint', { days, nextDays: days + 1 })}</Text>
            </View>

            <Button
              title={t('aiPlanner.generate')}
              onPress={() => router.push({ pathname: '/ai-planner/results', params: { destination, days, travelStyle: travelStyle.join(','), travelerType, budget, pace, interests: interests.join(',') } } as never)}
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
  heroBanner: { margin: Spacing.base, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm, alignItems: 'center' },
  heroTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF', textAlign: 'center', lineHeight: 28 },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  optionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  optionBtnTextActive: { color: '#FFF', fontWeight: '600' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.background, marginHorizontal: 3 },
  dayBtnActive: { backgroundColor: Colors.primary },
  dayBtnNum: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textSecondary },
  dayBtnNumActive: { color: '#FFF' },
  dayBtnLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  dayBtnLabelActive: { color: 'rgba(255,255,255,0.8)' },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  styleBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  styleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  styleEmoji: { fontSize: 16 },
  styleBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  styleBtnTextActive: { color: Colors.primary },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.xs },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeEmoji: { fontSize: 22 },
  typeBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  typeBtnTextActive: { color: Colors.primary },
  budgetRow: { flexDirection: 'row', gap: Spacing.sm },
  budgetBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, gap: 3 },
  budgetBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  budgetBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  budgetBtnTextActive: { color: Colors.primary },
  budgetSub: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  aiNotice: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  aiNoticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 18 },
  });
}
