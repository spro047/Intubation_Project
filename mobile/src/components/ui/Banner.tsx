import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

type BannerVariant = 'danger' | 'warning' | 'info' | 'success';

interface BannerProps {
  variant?: BannerVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  bordered?: boolean;
}

// Port of the web error/info banners (AlertCircle red banner, slow-LLM warning, fallback warning)
export default function Banner({
  variant = 'danger',
  icon,
  children,
  style,
  bordered = false,
}: BannerProps) {
  const { c } = useTheme();

  const colors = {
    danger: { bg: c.danger[50], border: c.danger[200], text: c.danger[700] },
    warning: { bg: c.warning[50], border: c.warning[200], text: c.warning[700] },
    info: { bg: c.brand[50], border: c.brand[200], text: c.brand[800] },
    success: { bg: c.success[50], border: c.success[200], text: c.success[700] },
  }[variant];

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          borderWidth: bordered ? 2 : 1,
          borderColor: bordered ? c.ink : colors.border,
          borderRadius: radii.sm,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
        },
        style,
      ]}
      accessibilityLiveRegion="polite"
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.text, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Inter_500Medium',
  },
});