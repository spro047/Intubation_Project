import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { classStyleFor } from '@/theme/tokens';

interface BadgeProps {
  prediction: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function Badge({ prediction, showDot = true, size = 'md' }: BadgeProps) {
  const { c, isDark } = useTheme();
  const cs = classStyleFor(prediction);

  const bg = isDark ? cs.bg : cs.bg;
  const border = isDark ? cs.accent : cs.border;
  const text = isDark ? cs.accentDark : cs.text;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: size === 'md' ? 4 : 2,
          paddingHorizontal: size === 'md' ? 8 : 6,
        },
      ]}
    >
      {showDot ? (
        <View style={[styles.dot, { backgroundColor: cs.accent }]} />
      ) : null}
      <Text
        style={[
          {
            color: text,
            fontSize: size === 'md' ? 12 : 10,
            fontFamily: 'Inter_700Bold',
          },
          size === 'md' && styles.mdText,
        ]}
      >
        {prediction}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
  mdText: {
    textTransform: 'capitalize',
  },
});