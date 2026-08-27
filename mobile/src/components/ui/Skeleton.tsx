import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import { useReduceMotion } from '@/hooks/useReduceMotion';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

// Shimmer-ish skeleton (opacity pulse) matching web `skeleton` classes
export default function Skeleton({ width = '100%', height = 14, radius, style }: SkeletonProps) {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0.4)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? radii.sm,
          backgroundColor: c.neutral[200],
          opacity: reduceMotion ? 1 : opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonList({ rows = 4, rowHeight = 12, gap = 8 }: { rows?: number; rowHeight?: number; gap?: number }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={rowHeight} width={i % 2 === 0 ? '100%' : '85%'} />
      ))}
    </View>
  );
}