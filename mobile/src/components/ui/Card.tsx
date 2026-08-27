import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, shadows } from '@/theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
  borderColor?: string;
}

export default function Card({
  children,
  style,
  elevated = false,
  padded = true,
  borderColor,
}: CardProps) {
  const { c } = useTheme();
  const shadow = elevated ? shadows.elevated : shadows.card;
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: borderColor ?? c.border,
          borderRadius: radii.lg,
          padding: padded ? 16 : 0,
          shadowColor: shadow?.color ?? '#111111',
          shadowOffset: shadow?.offset ?? { width: 5, height: 5 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: elevated ? 6 : 5,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}