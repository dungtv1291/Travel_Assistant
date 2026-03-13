import { useThemeStore } from '../store/theme.store';
import { LightColors, DarkColors, ColorPalette } from '../constants/colors';

export function useThemeColors(): ColorPalette {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? DarkColors : LightColors;
}
