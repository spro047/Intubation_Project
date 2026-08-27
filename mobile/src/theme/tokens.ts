// Design tokens — verbatim port of the web app's tailwind.config.js palette
// and shadow language into React Native StyleSheet-compatible values.

export const colors = {
  page: { light: '#F5F1DC', dark: '#121212' },
  ink: '#111111',
  card: { light: '#FFFFFF', dark: '#18181B' },
  border: { light: '#E4E4E7', dark: '#3F3F46' },
  brand: {
    50: '#FFFBEA',
    100: '#FFF3C2',
    200: '#FFE88A',
    300: '#FFDE52',
    400: '#FFD900',
    500: '#FFD900',
    600: '#E8C400',
    700: '#C4A600',
    800: '#9E8500',
    900: '#6B5D00',
    950: '#3A3200',
  },
  success: {
    50: '#E7FBFB',
    100: '#C8F3F4',
    200: '#9CE7EA',
    300: '#5ED4D9',
    400: '#2FC6CC',
    500: '#16C2C8',
    600: '#0FA6AB',
    700: '#0D8388',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
  },
  danger: {
    50: '#FFECED',
    100: '#FFD4D6',
    200: '#FFAFB3',
    300: '#FF8A8F',
    400: '#FF6B72',
    500: '#FF5A5F',
    600: '#E04046',
    700: '#BC3338',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  neo: {
    paper: '#F5F1DC',
    ink: '#111111',
    yellow: '#FFD900',
    teal: '#16C2C8',
    magenta: '#FF00D9',
    coral: '#FF7F87',
  },
};

// Hard offset shadows — the signature neo-brutalist look.
export const shadows = {
  sm: { offset: { width: 2, height: 2 }, color: '#111111', radius: 0, opacity: 1 },
  soft: { offset: { width: 4, height: 4 }, color: '#111111', radius: 0, opacity: 1 },
  card: { offset: { width: 5, height: 5 }, color: '#111111', radius: 0, opacity: 1 },
  elevated: { offset: { width: 6, height: 6 }, color: '#111111', radius: 0, opacity: 1 },
  pressed: { offset: { width: 2, height: 2 }, color: '#111111', radius: 0, opacity: 1 },
  none: undefined,
};

export const radii = { sm: 4, md: 6, lg: 8, xl: 10, full: 9999 };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

// Semantic class mapping — matches web RiskPredictionCard / badges
export const CLASS_STYLES: Record<
  string,
  { label: string; accent: string; accentDark: string; bg: string; text: string; border: string }
> = {
  easy: {
    label: 'Easy Airway',
    accent: colors.success[500],
    accentDark: colors.success[400],
    bg: colors.success[50],
    text: colors.success[700],
    border: colors.success[200],
  },
  moderate: {
    label: 'Moderate Airway',
    accent: colors.warning[500],
    accentDark: colors.warning[400],
    bg: colors.warning[50],
    text: colors.warning[700],
    border: colors.warning[200],
  },
  difficult: {
    label: 'Difficult Airway',
    accent: colors.danger[500],
    accentDark: colors.danger[400],
    bg: colors.danger[50],
    text: colors.danger[700],
    border: colors.danger[200],
  },
  unknown: {
    label: 'Unknown',
    accent: colors.neutral[400],
    accentDark: colors.neutral[400],
    bg: colors.neutral[50],
    text: colors.neutral[500],
    border: colors.neutral[200],
  },
};

export function classStyleFor(prediction?: string | null) {
  const p = prediction?.toLowerCase() || '';
  if (p === 'easy') return CLASS_STYLES.easy;
  if (p === 'moderate') return CLASS_STYLES.moderate;
  if (p === 'difficult') return CLASS_STYLES.difficult;
  return CLASS_STYLES.unknown;
}

export function urgencyFor(prediction?: string | null): {
  level: 'Low' | 'Moderate' | 'High';
  color: string;
} {
  const p = prediction?.toLowerCase() || '';
  if (p === 'difficult') return { level: 'High', color: colors.danger[500] };
  if (p === 'moderate') return { level: 'Moderate', color: colors.warning[500] };
  return { level: 'Low', color: colors.success[500] };
}