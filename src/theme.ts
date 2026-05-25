// ─────────────────────────────────────────────
//  TRAX Global Design Tokens  –  Phase 1
// ─────────────────────────────────────────────

export const colors = {
  // Brand — Amber
  brand:        '#D97706',
  brandLight:   '#F59E0B',
  brandGlow:    'rgba(217,119,6,0.30)',
  brandMuted:   'rgba(217,119,6,0.08)',
  brandBorder:  'rgba(217,119,6,0.18)',

  // Semantic
  danger:       '#F43F5E',
  dangerMuted:  'rgba(244,63,94,0.08)',
  dangerBorder: 'rgba(244,63,94,0.20)',
  dangerGlow:   'rgba(244,63,94,0.30)',

  warning:      '#FBBF24',
  warningMuted: 'rgba(251,191,36,0.08)',
  warningBorder:'rgba(251,191,36,0.20)',

  success:      '#34D399',
  successMuted: 'rgba(52,211,153,0.08)',
  successBorder:'rgba(52,211,153,0.20)',

  // Surfaces
  bg:           '#000000',
  surface:      '#0C0C0C',
  surfaceRaised:'#141414',
  surfaceBorder:'rgba(255,255,255,0.06)',
  surfaceBorderHover:'rgba(255,255,255,0.12)',

  // Text
  textPrimary:  'rgba(255,255,255,0.95)',
  textSecondary:'rgba(255,255,255,0.50)',
  textTertiary: 'rgba(255,255,255,0.28)',
  textInverse:  '#000000',
} as const;

export const radius = {
  sm:   '10px',
  md:   '14px',
  lg:   '18px',
  xl:   '22px',
  full: '999px',
} as const;

export const spacing = {
  pagePad:   '16px',
  cardPad:   '18px',
  sectionGap:'12px',
} as const;
