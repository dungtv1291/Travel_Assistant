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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

const SLIDE_HEIGHT = height * 0.56;

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
      {/* Slide photos */}
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
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.35)']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        )}
        style={styles.slideList}
      />

      {/* Floating header: brand pill + skip */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="compass" size={16} color={Colors.primary} />
            <Text style={styles.logoText}>Travenor</Text>
          </View>
          <TouchableOpacity
            style={styles.skipPill}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.skipText}>{t('welcome.skip')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* White bottom panel */}
      <View style={styles.panel}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Title with accent */}
        <Text style={styles.title}>
          {currentSlide.titleBefore}
          <Text style={styles.titleAccent}>{currentSlide.titleAccent}</Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.87}>
          <Text style={styles.ctaText}>
            {activeIndex === SLIDES.length - 1 ? t('welcome.start') : t('common.next')}
          </Text>
          <Ionicons
            name={activeIndex === SLIDES.length - 1 ? 'rocket-outline' : 'arrow-forward'}
            size={18}
            color="#FFF"
          />
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryText}>
            {t('welcome.alreadyHaveAccount')}{'  '}
            <Text style={styles.secondaryLink}>{t('welcome.login')}</Text>
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
  container: { flex: 1, backgroundColor: '#FFF' },

  slideList: { flexGrow: 0, height: SLIDE_HEIGHT },
  slide: { width, height: SLIDE_HEIGHT, overflow: 'hidden' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  logoText: {
    fontSize: FontSize.base,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  skipPill: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  panel: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    marginTop: -Radius['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
  },

  dots: { flexDirection: 'row', gap: Spacing.xs },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 28, backgroundColor: Colors.primary },
  dotInactive: { width: 6, backgroundColor: Colors.border },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  titleAccent: { color: Colors.accent },

  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing.base + 2,
    marginTop: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },

  secondaryText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  secondaryLink: { color: Colors.primary, fontWeight: '700' },

  guestText: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
