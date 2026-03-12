import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { continueAsGuest } = useAuthStore();
  const { t } = useTranslation();

  const SLIDES = [
    {
      id: '1',
      titleBefore: t('welcome.slide1.titleBefore'),
      titleAccent: t('welcome.slide1.titleAccent'),
      subtitle: t('welcome.slide1.subtitle'),
      image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    },
    {
      id: '2',
      titleBefore: t('welcome.slide2.titleBefore'),
      titleAccent: t('welcome.slide2.titleAccent'),
      subtitle: t('welcome.slide2.subtitle'),
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    },
    {
      id: '3',
      titleBefore: t('welcome.slide3.titleBefore'),
      titleAccent: t('welcome.slide3.titleAccent'),
      subtitle: t('welcome.slide3.subtitle'),
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    },
    {
      id: '4',
      titleBefore: t('welcome.slide4.titleBefore'),
      titleAccent: t('welcome.slide4.titleAccent'),
      subtitle: t('welcome.slide4.subtitle'),
      image: 'https://images.unsplash.com/photo-1552201133-08fd8e8c0fd6?w=800',
    },
  ];

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleGuest = async () => {
    await continueAsGuest();
    router.replace('/(tabs)');
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <View style={styles.container}>
      {/* Photo slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.bgImage} resizeMode="cover" />
            <View style={styles.slideBottomFade} />
          </View>
        )}
        style={styles.slideList}
      />

      {/* White bottom panel — Travenor style */}
      <View style={styles.bottomPanel}>
        {/* Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.skipText}>{t('welcome.skip')}</Text>
        </TouchableOpacity>

        {/* Title with orange accent word */}
        <Text style={styles.panelTitle}>
          {currentSlide.titleBefore}
          <Text style={styles.panelTitleAccent}>{currentSlide.titleAccent}</Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.panelSubtitle}>{currentSlide.subtitle}</Text>

        {/* Progress dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>
            {activeIndex === SLIDES.length - 1 ? t('welcome.start') : t('common.next')}
          </Text>
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>
            {t('welcome.alreadyHaveAccount')}{'  '}
            <Text style={styles.loginLink}>{t('welcome.login')}</Text>
          </Text>
        </TouchableOpacity>

        {/* Guest */}
        <TouchableOpacity onPress={handleGuest}>
          <Text style={styles.guestText}>{t('welcome.guestBrowse')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  slideList: { flexGrow: 0, height: height * 0.56 },
  slide: { width, height: height * 0.56, overflow: 'hidden' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  slideBottomFade: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  bottomPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    marginTop: -Radius['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  skipBtn: { alignSelf: 'flex-end' },
  skipText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },

  panelTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  panelTitleAccent: { color: Colors.accent, fontWeight: '800' },

  panelSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  dots: { flexDirection: 'row', gap: Spacing.xs, marginVertical: 2 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  dotInactive: { width: 6, backgroundColor: Colors.border },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  loginText: { textAlign: 'center', fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '700' },
  guestText: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});

