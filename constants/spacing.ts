export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Semantic aliases for readability in components
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
  // ── Semantic names ──────────────────────────────────────────────
  // Use these names when intent is important for cross-screen consistency.
  // input  → 12  (Radius.md)   — text inputs, dropdowns
  // chip   → 9999 (Radius.full) — filter chips, tags
  // card   → 20  (Radius.xl)   — all cards (hotel, flight, booking)
  // modal  → 24  (Radius.2xl)  — bottom sheets, modal dialogs
  // fab    → 9999 (Radius.full) — floating action buttons
} as const;

// ── Shadow system ─────────────────────────────────────────────────────
// Rule: use ONLY Shadow.sm and Shadow.md.
//   Shadow.sm  → default card shadow (lists, small tiles)
//   Shadow.md  → elevated card / focused element (hero cards, modals)
// Shadow.lg and Shadow.card are kept for backward compatibility only.

export const Shadow = {
  /** Default card shadow — use for all list cards and grid cards */
  sm: {
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  /** Elevated shadow — use for hero cards, summary banners, sticky bars */
  md: {
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  /** @deprecated use Shadow.md */
  lg: {
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  /** @deprecated use Shadow.sm */
  card: {
    shadowColor: '#1BBCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

