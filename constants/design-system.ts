/**
 * design-system.ts
 *
 * Travel Assistant — Design System
 * Korean travel app for Vietnam (React Native Expo + Expo Router)
 *
 * This file is the single source of truth for:
 *   § 1  Color tokens          → see constants/colors.ts (imported here for reference)
 *   § 2  Typography scale      → see constants/typography.ts
 *   § 3  Spacing & radius      → see constants/spacing.ts
 *   § 4  Sizing constants      (SIZE)
 *   § 5  Shadow rules          → Shadow.sm | Shadow.md only
 *   § 6  Formatting rules      (FORMAT)
 *   § 7  Component variants    (makeVariantStyles)
 *
 * Usage in any component:
 *   const DS = useMemo(() => makeVariantStyles(Colors), [Colors]);
 *   <TouchableOpacity style={DS.btnPrimary}>
 *     <Text style={DS.btnPrimaryText}>예약하기</Text>
 *   </TouchableOpacity>
 */

import { StyleSheet } from 'react-native';
import { Spacing, Radius, Shadow } from './spacing';
import { FontSize } from './typography';
import { ColorPalette } from './colors';


// ═══════════════════════════════════════════════════════════════════════
// § 1  COLOR TOKENS  (resolved at runtime via useThemeColors)
// ═══════════════════════════════════════════════════════════════════════
//
//  Token              Light value       Dark value        Purpose
//  ─────────────────  ────────────────  ────────────────  ──────────────
//  primary            #1BBCD4           #1BBCD4           Brand teal
//  primaryLight       #E4F9FC           #0D3A40           Soft teal bg
//  accent             #FF6B35           #FF6B35           Prices / CTAs
//  accentLight        #FFF0EB           #3D2010           Soft orange bg
//  star               #FBBF24           #FBBF24           Star ratings
//  textPrimary        #1A1A2E           #F3F4F6           Headings, labels
//  textSecondary      #6B7280           #9CA3AF           Sub-labels, meta
//  textMuted          #9CA3AF           #6B7280           Placeholders
//  border             #E5E7EB           #2D2D44           Dividers, outlines
//  background         #F5F7FA           #0F0F1A           Screen background
//  surface            #FFFFFF           #1A1A2E           Card background
//  surfaceSecondary   #F3F4F6           #252538           Nested surfaces
//  success            #22C55E           #22C55E           Confirmed, free
//  warning            #F59E0B           #F59E0B           Limited, watch out
//  error              #EF4444           #EF4444           Errors, alerts
//
// ── Decision rules ────────────────────────────────────────────────────
//  • Prices always use `accent` (orange).   NEVER `primary` (teal).
//  • Navigation links / "전체 보기" use `primary`.  NEVER `accent`.
//  • Success badges (confirmed) use `success` + `successLight`.
//  • Destructive actions use `error` (#EF4444).


// ═══════════════════════════════════════════════════════════════════════
// § 2  TYPOGRAPHY SCALE
// ═══════════════════════════════════════════════════════════════════════
//
//  Name            px   weight  Usage
//  ──────────────  ───  ──────  ────────────────────────────────────────
//  screenTitle      28   800    Top of every tab / stack screen
//  h2               24   700    Section heading inside a screen
//  h3               22   600    Sub-section heading
//  sectionTitle     20   700    Section label (above horizontal lists)
//  cardTitle        16   700    Hotel name, flight route, trip title
//  body             14   400    Description text, paragraphs
//  subtitle         14   500    Secondary label, date / location meta
//  label            12   600    Form field labels, UPPERCASE caps
//  caption          11   400    Timestamps, fine print
//  priceLg          24   800    Detail screen total price
//  price            18   800    Card price (default)
//  priceSm          14   700    Compact badge price
//  priceSuffix      11   400    "/박", "/일" after price
//  badgeText        11   700    Inside badge pills
//  buttonText       14   700    Primary / secondary button label
//  buttonTextSm     12   700    Small button label
//
// ── Color rules ───────────────────────────────────────────────────────
//  • priceLg / price / priceSm → always Colors.accent
//  • screenTitle / cardTitle   → Colors.textPrimary
//  • label                     → Colors.textSecondary with uppercase + tracking
//  • caption                   → Colors.textMuted
//
// (All exported from constants/typography.ts — Typography.screenTitle etc.)


// ═══════════════════════════════════════════════════════════════════════
// § 3  SPACING & RADIUS SCALE
// ═══════════════════════════════════════════════════════════════════════
//
//  Spacing  4pt rhythm                Radius  Semantic alias
//  ───────  ─────────────────         ───────  ─────────────────────────
//  xs  4    icon gaps, tiny insets    xs   4   none
//  sm  8    between chips, icon+text  sm   8   none
//  md  12   inner card padding        md  12   input (text inputs)
//  base 16  standard horizontal pad   lg  16   none
//  lg  20   section gap               xl  20   card  (all card borders)
//  xl  24   section bottom margin     2xl 24   modal (bottom sheets)
//  2xl 32   screen padding            full 9999 chip / fab / avatar
//  3xl 40   hero block padding
//  4xl 48   —
//  5xl 64   large vertical gap


// ═══════════════════════════════════════════════════════════════════════
// § 4  SIZING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════
// Use these tokens instead of ad-hoc px values in components.
// Touch targets satisfy iOS 44pt / Android 48dp minimums.

export const SIZE = {
  // ── Buttons ────────────────────────────────────────────────────────
  buttonLg: 54,       // Large CTA (booking confirm, hero action)
  buttonMd: 48,       // Standard CTA (예약, 저장, 검색)
  buttonSm: 38,       // Compact actions inside cards

  // ── Chips & pills ──────────────────────────────────────────────────
  chipMd:   34,       // Filter chips, category pills
  chipSm:   26,       // Tag chips, mini-labels

  // ── Inputs ─────────────────────────────────────────────────────────
  inputMd:  50,       // Text inputs

  // ── Icons ──────────────────────────────────────────────────────────
  // Always use one of these — never free-hand icon sizes.
  iconXl: 28,         // Hero / navigation icons
  iconLg: 22,         // Tab bar icons
  iconMd: 18,         // Inline action icons (edit, settings menu)
  iconSm: 14,         // Inside chips, badges, small buttons
  iconXs: 12,         // Meta icons (location pin, clock, rating star)

  // ── Avatars ────────────────────────────────────────────────────────
  avatarLg: 90,       // Profile screen
  avatarMd: 48,       // Header row
  avatarSm: 36,       // List rows
  avatarXs: 28,       // Compact rows

  // ── Card image heights ─────────────────────────────────────────────
  heroImg:          320,   // Destination / hotel hero at top of screen
  featuredCardImg:  180,   // FeaturedDestinationCard horizontal scroll
  listCardImg:      110,   // Horizontal hotel / flight list cards
  gridCardImg:      120,   // 2-column explore grid
  miniCardImg:       80,   // Mini hotel rows in destination detail
} as const;


// ═══════════════════════════════════════════════════════════════════════
// § 5  SHADOW SYSTEM
// ═══════════════════════════════════════════════════════════════════════
// Rule: use ONLY Shadow.sm and Shadow.md.
//   Shadow.sm → lists, grid cards, small tiles
//   Shadow.md → hero cards, summary banners, sticky elevations
// (Imported from constants/spacing.ts)


// ═══════════════════════════════════════════════════════════════════════
// § 6  FORMATTING RULES
// ═══════════════════════════════════════════════════════════════════════
// All format functions live in utils/format.ts. This object records the
// strict display contract so every screen stays consistent.

export const FORMAT = {

  // ── KRW prices ───────────────────────────────────────────────────────
  // Function : formatKRWPrice(n: number): string
  //   0             → "무료"
  //   1 – 9,999     → "₩9,000"          (with thousand separator)
  //   10,000+       → "₩18만 5천"        (만 unit, rest in 천 if needed)
  //   1,000,000+    → "₩185만"
  //   100,000,000+  → "₩1.5억"
  //
  // HARD RULES:
  //   ✗  hotel.pricePerNight * 1350   (wrong — 1350 is USD→KRW, not VND→KRW)
  //   ✗  n.toLocaleString() + '원'    (produces "₩2,497,500,000" bugs)
  //   ✓  formatKRWPrice(hotel.pricePerNight)
  KRW_ZERO:    '무료',
  KRW_SYMBOL:  '₩',

  // ── VND prices ───────────────────────────────────────────────────────
  // Function : formatVNDPrice(n: number): string
  //   0           → "무료"
  //   1 – 9,999   → "9,000₫"
  //   10,000+     → "350K ₫"
  //   1,000,000+  → "1.2M ₫"
  //
  // HARD RULES:
  //   ✗  activity.estimatedCost * 1350   (wrong currency math — stops now)
  //   ✓  formatVNDPrice(activity.estimatedCost)   when currency === 'VND'
  VND_ZERO:          '무료',
  VND_SYMBOL:        '₫',
  VND_K_THRESHOLD:   10_000,
  VND_M_THRESHOLD:   1_000_000,

  // ── Ratings ──────────────────────────────────────────────────────────
  // Always 1 decimal.  "★ 4.7" or "4.7" depending on context.
  //   ✓  value.toFixed(1)
  //   ✗  Math.round(value) / 10   → integer loses precision
  RATING_DECIMALS: 1,
  RATING_STAR:     '★',

  // ── Review / popularity counts ────────────────────────────────────────
  // Function : formatReviewCount(n: number): string
  //   n < 1,000          → "832"
  //   1,000 ≤ n < 10,000 → "1.2천"
  //   n ≥ 10,000         → "2.1만"
  REVIEW_COMPACT_K:  1_000,
  REVIEW_COMPACT_MAN: 10_000,

  // ── Activity / item counts ────────────────────────────────────────────
  // Always suffix "개".   "5개 활동", "3개 명소"
  COUNT_SUFFIX: '개',

  // ── Night / day labels ────────────────────────────────────────────────
  // Template: "{n}박 {n+1}일"   e.g. "4박 5일"
  //   ✓  formatDuration(nights)   from utils/format.ts
  nightsDays: (nights: number): string => `${nights}박 ${nights + 1}일`,

  // ── Temperature labels ────────────────────────────────────────────────
  // Always "{n}°C".  Condition string must come from Korean data field.
  tempC: (temp: number): string => `${temp}°C`,

  // ── Date display ─────────────────────────────────────────────────────
  // Full Korean:   "2026년 4월 15일"  formatDate(dateStr)
  // Dotted:        "2026.04.15"       formatDateDot(dateStr)  ← use in lists
  // Korean short:  "4월 15일"         formatDateKo(dateStr)   ← use inline
  // Range:         "4월 15일 → 4월 19일"
  DATE_RANGE_SEP: ' → ',
} as const;


// ═══════════════════════════════════════════════════════════════════════
// § 7  COMPONENT VARIANTS
// ═══════════════════════════════════════════════════════════════════════
// Theme-aware style factory.  Call once per component with Colors.
// All values below are canonical — do NOT redeclare them inline.
//
// Pattern:
//   const DS = useMemo(() => makeVariantStyles(Colors), [Colors]);

export function makeVariantStyles(Colors: ColorPalette) {
  return StyleSheet.create({

    // ─────────────────────────────────────────────────────────────────
    // BUTTONS
    // ─────────────────────────────────────────────────────────────────

    // Primary — solid teal pill.  Main CTA on every screen.
    // e.g. "예약하기", "검색", "AI 일정 생성하기"
    btnPrimary: {
      height: SIZE.buttonMd,
      paddingHorizontal: Spacing.xl,
      borderRadius: Radius.full,
      backgroundColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    btnPrimaryText: {
      fontSize: FontSize.base,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },

    // Secondary — tinted surface, teal text.  Paired CTA or lower hierarchy.
    // e.g. "다시 생성", "공유", "목록 보기"
    btnSecondary: {
      height: SIZE.buttonMd,
      paddingHorizontal: Spacing.xl,
      borderRadius: Radius.full,
      backgroundColor: Colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    btnSecondaryText: {
      fontSize: FontSize.base,
      fontWeight: '700',
      color: Colors.primary,
      letterSpacing: 0.2,
    },

    // Ghost — outlined, transparent.  Destructive or outline CTA.
    // e.g. "취소", "AI 일정 만들기" (outline variant)
    btnGhost: {
      height: SIZE.buttonMd,
      paddingHorizontal: Spacing.xl,
      borderRadius: Radius.full,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    btnGhostText: {
      fontSize: FontSize.base,
      fontWeight: '700',
      color: Colors.primary,
      letterSpacing: 0.2,
    },

    // Size modifiers (compose onto any button variant)
    btnLg:       { height: SIZE.buttonLg, paddingHorizontal: Spacing['2xl'] },
    btnSm:       { height: SIZE.buttonSm, paddingHorizontal: Spacing.base },
    btnSmText:   { fontSize: FontSize.sm, fontWeight: '700' },
    btnFullWidth:{ width: '100%' as const },
    btnDisabled: { opacity: 0.45 },


    // ─────────────────────────────────────────────────────────────────
    // CHIPS   (filter pills, travel style, category tags)
    // ─────────────────────────────────────────────────────────────────

    // Selected chip — solid teal
    chipSelected: {
      height: SIZE.chipMd,
      paddingHorizontal: Spacing.base,
      borderRadius: Radius.full,
      backgroundColor: Colors.primary,
      borderWidth: 1.5,
      borderColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSelectedText: {
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Unselected chip — surface with border
    chipUnselected: {
      height: SIZE.chipMd,
      paddingHorizontal: Spacing.base,
      borderRadius: Radius.full,
      backgroundColor: Colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipUnselectedText: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: Colors.textSecondary,
    },

    // Small selected chip — soft teal tint
    chipSmSelected: {
      height: SIZE.chipSm,
      paddingHorizontal: Spacing.sm + 2,
      borderRadius: Radius.full,
      backgroundColor: Colors.primaryLight,
      borderWidth: 1,
      borderColor: Colors.primary + '55',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSmSelectedText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: Colors.primary,
    },

    // Small unselected chip — muted
    chipSmUnselected: {
      height: SIZE.chipSm,
      paddingHorizontal: Spacing.sm + 2,
      borderRadius: Radius.full,
      backgroundColor: Colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSmUnselectedText: {
      fontSize: FontSize.xs,
      fontWeight: '600',
      color: Colors.textMuted,
    },


    // ─────────────────────────────────────────────────────────────────
    // BADGES   (status labels, category tags, ratings)
    // ─────────────────────────────────────────────────────────────────

    // Info badge — teal tint.  Category, feature label.
    badgeInfo: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.xs + 2,
      backgroundColor: Colors.primaryLight,
    },
    badgeInfoText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: Colors.primary,
    },

    // Rating badge — amber tint.  "★ 4.7"
    badgeRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.xs + 2,
      backgroundColor: '#FEF3C7',
    },
    badgeRatingText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: '#92400E',
    },

    // Success badge — green.  "예약 확정", "이용 가능"
    badgeSuccess: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.xs + 2,
      backgroundColor: Colors.successLight,
    },
    badgeSuccessText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: Colors.success,
    },

    // Warning badge — amber.  "마감 임박", "잔여 2석"
    badgeWarning: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.xs + 2,
      backgroundColor: Colors.warningLight,
    },
    badgeWarningText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: Colors.warning,
    },

    // Accent badge — solid orange.  Discount %, deal label.
    badgeAccent: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.xs + 2,
      backgroundColor: Colors.accent,
    },
    badgeAccentText: {
      fontSize: FontSize.xs,
      fontWeight: '800',
      color: '#FFFFFF',
    },


    // ─────────────────────────────────────────────────────────────────
    // PRICE BLOCK   (price value + optional suffix)
    // Always format value with formatKRWPrice / formatVNDPrice first.
    // ─────────────────────────────────────────────────────────────────
    priceBlock: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    priceLg: {
      fontSize: FontSize['4xl'],    // 24px — detail screen total
      fontWeight: '800',
      color: Colors.accent,
    },
    price: {
      fontSize: FontSize.xl,        // 18px — card default
      fontWeight: '800',
      color: Colors.accent,
    },
    priceSm: {
      fontSize: FontSize.base,      // 14px — compact / badge
      fontWeight: '700',
      color: Colors.accent,
    },
    priceSuffix: {
      fontSize: FontSize.xs,        // 11px — "/박", "/일"
      fontWeight: '400',
      color: Colors.textMuted,
    },
    priceFree: {
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: Colors.success,
    },


    // ─────────────────────────────────────────────────────────────────
    // SECTION HEADER   (title left + "전체 보기" right)
    // ─────────────────────────────────────────────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.base,
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    sectionAction: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: Colors.primary,        // ALWAYS primary (teal). Never accent.
    },


    // ─────────────────────────────────────────────────────────────────
    // STICKY BOTTOM ACTION BAR
    // Wrap in <SafeAreaView edges={['bottom']}>.
    // ─────────────────────────────────────────────────────────────────
    stickyBar: {
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.sm,
      ...Shadow.md,
    },
    stickyBarInner: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingBottom: Spacing.sm,
    },


    // ─────────────────────────────────────────────────────────────────
    // LIST CARD   (image left + content right)
    // For: bookings, transport list, attraction rows, hotel list rows
    // ─────────────────────────────────────────────────────────────────
    listCard: {
      flexDirection: 'row',
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,       // card = Radius.xl
      overflow: 'hidden',
      marginBottom: Spacing.md,
      ...Shadow.sm,
    },

    // ─────────────────────────────────────────────────────────────────
    // DETAIL CARD   (vertical, padded, full-width)
    // For: summary panels, info grids, weather blocks, booking details
    // ─────────────────────────────────────────────────────────────────
    detailCard: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,
      padding: Spacing.base,
      marginBottom: Spacing.md,
      ...Shadow.sm,
      gap: Spacing.sm,
    },


    // ─────────────────────────────────────────────────────────────────
    // EMPTY STATE   (icon + title + description + optional CTA)
    // ─────────────────────────────────────────────────────────────────
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing['2xl'],
      paddingVertical: Spacing['3xl'],
      gap: Spacing.md,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: Colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
    },
    emptyTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: Colors.textPrimary,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: FontSize.sm,
      color: Colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },


    // ─────────────────────────────────────────────────────────────────
    // SKELETON PLACEHOLDER   (unanimated bone-loader)
    // Wrap in Animated.View and interpolate opacity for shimmer effect.
    // ─────────────────────────────────────────────────────────────────
    skeleton: {
      borderRadius: Radius.sm,
      backgroundColor: Colors.border,
    },
    skeletonText: {
      height: 14,
      borderRadius: Radius.xs,
      backgroundColor: Colors.border,
    },
    skeletonTextSm: {
      height: 10,
      borderRadius: Radius.xs,
      backgroundColor: Colors.border,
    },
    skeletonImage: {
      backgroundColor: Colors.surfaceSecondary,
    },
  });
}
