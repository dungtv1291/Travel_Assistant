import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
  hero: 36,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

export const Typography = StyleSheet.create({
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: FontSize['5xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: FontSize['4xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: FontSize['3xl'],
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  h5: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  // ── Screen & section structure ──────────────────────────────
  // screenTitle: top-level screen heading (28px bold)
  screenTitle: {
    fontSize: FontSize['5xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  // cardTitle: name/title inside a card (16px semibold)
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // ── Buttons ──────────────────────────────────────────────────
  // Use fontWeight 700 + slight tracking for legibility at small sizes
  button: {
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // ── Prices ───────────────────────────────────────────────────
  // All prices use accent (orange) — NEVER primary (teal)
  // Always formatted via formatKRWPrice / formatVNDPrice from utils/format.ts
  priceLg: {
    fontSize: FontSize['4xl'],   // 24px
    fontWeight: '800',
    color: Colors.accent,
  },
  price: {
    fontSize: FontSize.xl,       // 18px  — card default
    fontWeight: '800',
    color: Colors.accent,
  },
  priceSm: {
    fontSize: FontSize.base,     // 14px  — compact badge
    fontWeight: '700',
    color: Colors.accent,
  },
  priceSuffix: {
    fontSize: FontSize.xs,       // 11px  — "/박", "/일" suffix
    fontWeight: '400',
    color: Colors.textMuted,
  },

  // ── Badges ───────────────────────────────────────────────────
  // badgeText: inside any colored badge pill
  badgeText: {
    fontSize: FontSize.xs,       // 11px
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

