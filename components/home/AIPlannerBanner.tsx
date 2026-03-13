import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

interface AIPlannerBannerProps {
  onPress: () => void;
}

export function AIPlannerBanner({ onPress }: AIPlannerBannerProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  return (
  <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
    <LinearGradient
      colors={['#1BBCD4', '#0D8FA0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.left}>
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>{t('components.aiBanner.tag')}</Text>
        </View>
        <Text style={styles.title}>{t('components.aiBanner.title')}</Text>
        <Text style={styles.subtitle}>{t('components.aiBanner.subtitle')}</Text>
        <TouchableOpacity style={styles.cta} onPress={onPress}>
          <Text style={styles.ctaText}>{t('components.aiBanner.cta')}</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.right}>
        <View style={styles.iconCircle}>
          <Ionicons name="globe-outline" size={48} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={styles.floatingCard}>
          <Text style={styles.floatingEmoji}>🗓️</Text>
          <Text style={styles.floatingText}>{t('components.aiBanner.badge')}</Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    ...Shadow.card,
  },
  gradient: {
    flexDirection: 'row',
    padding: Spacing.lg,
    minHeight: 165,
    alignItems: 'center',
  },
  left: { flex: 1, gap: Spacing.sm },
  aiTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  aiTagText: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  right: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCard: {
    position: 'absolute',
    bottom: -8,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  floatingEmoji: { fontSize: 18 },
  floatingText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 14,
  },
  });
}
