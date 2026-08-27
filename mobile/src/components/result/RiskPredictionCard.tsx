import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { classStyleFor, radii } from '@/theme/tokens';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = CIRCUMFERENCE * 0.75; // 270° gauge arc

// Animatable SVG circle (react-native-svg supports createAnimatedComponent)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RiskPredictionCardProps {
  riskScore: number;
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

// Port of web src/components/RiskPredictionCard.tsx
export default function RiskPredictionCard({
  riskScore,
  prediction,
  confidence,
  probabilities,
}: RiskPredictionCardProps) {
  const { c, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const cs = classStyleFor(prediction);

  const score = Math.min(100, Math.max(0, riskScore * 100));
  const progress = (score / 100) * ARC_LENGTH;

  const gaugeSize = Math.min(224, width - 56);
  const glowSize = gaugeSize * 0.7;

  // Sweep the gauge arc in on first mount
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayScore(score);
      return;
    }
    const listener = scoreAnim.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    return () => scoreAnim.removeListener(listener);
  }, [scoreAnim, reduceMotion, score]);

  useEffect(() => {
    if (reduceMotion) {
      setMounted(true);
      return;
    }
    const raf = requestAnimationFrame(() => setMounted(true));
    Animated.timing(anim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: false,
    }).start();
    Animated.timing(scoreAnim, {
      toValue: score,
      duration: 1000,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: false,
    }).start();
    return () => cancelAnimationFrame(raf);
  }, [anim, scoreAnim, score, reduceMotion]);

  // strokeDashoffset: start fully hidden, end at ARC_LENGTH - progress
  const dashOffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [ARC_LENGTH, ARC_LENGTH - progress],
  });

  const order = ['Easy', 'Moderate', 'Difficult'];
  const barColor = (key: string) =>
    key === 'Easy' ? c.success[500] : key === 'Moderate' ? c.warning[500] : c.danger[500];
  const gaugeStroke = isDark ? cs.accentDark : cs.accent;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderRadius: radii.xl,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerLabel, { color: c.textFaint }]}>
            Airway Risk Score
          </Text>
          <Text style={[styles.headerSub, { color: c.textFaint }]}>
            Predicted intubation difficulty
          </Text>
        </View>
        <Text style={[styles.scoreText, { color: c.textFaint }]}>
          {score.toFixed(0)} / 100
        </Text>
      </View>

      {/* Radial gauge */}
      <View style={styles.gaugeWrap}>
        <View style={{ width: gaugeSize, height: gaugeSize }}>
          <View
            style={[
              styles.gaugeGlow,
              {
                backgroundColor: cs.accent,
                width: glowSize,
                height: glowSize,
                top: (gaugeSize - glowSize) / 2,
                left: (gaugeSize - glowSize) / 2,
                borderRadius: glowSize / 2,
                shadowColor: cs.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.45,
                shadowRadius: glowSize * 0.22,
                elevation: glowSize * 0.1,
              },
            ]}
          />
          <Svg viewBox="0 0 120 120" style={styles.gauge}>
            {/* Track */}
            <Circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="11"
              stroke={isDark ? c.neutral[800] : c.neutral[100]}
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              transform="rotate(135 60 60)"
            />
            {/* Progress arc (animated via strokeDashoffset) */}
            <AnimatedCircle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="11"
              stroke={gaugeStroke}
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              strokeDashoffset={mounted ? dashOffset : ARC_LENGTH}
              strokeLinecap="round"
              transform="rotate(135 60 60)"
            />
          </Svg>
          {/* Center readout */}
          <View style={styles.center}>
            <Text style={[styles.bigNumber, { color: c.text }]}>{displayScore}</Text>
            <Text style={[styles.riskLabel, { color: c.textFaint }]}>% Risk</Text>
          </View>
        </View>
      </View>

      {/* Badge + bars */}
      <View style={styles.bottom}>
        <View style={[styles.badge, { backgroundColor: cs.bg, borderColor: cs.border }]}>
          <Text style={[styles.badgeText, { color: isDark ? cs.accentDark : cs.text }]}>
            {cs.label}
          </Text>
        </View>

        {/* Confidence bar */}
        <View>
          <View style={styles.barLabelRow}>
            <Text style={[styles.barLabel, { color: c.textFaint }]}>Confidence</Text>
            <Text style={[styles.barValue, { color: c.textMuted }]}>
              {(confidence * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.barTrack, { backgroundColor: c.neutral[100] }]}>
            <View
              style={[
                styles.barFill,
                { backgroundColor: cs.accent, width: `${Math.min(100, confidence * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Probability distribution */}
        <View style={{ gap: 10 }}>
          <Text style={[styles.barLabel, { color: c.textFaint }]}>
            Probability Distribution
          </Text>
          <View style={[styles.segTrack, { backgroundColor: c.neutral[100] }]}>
            {order.map((key) => {
              const val = probabilities?.[key] ?? 0;
              const widthPct = Math.max(1, Math.min(100, val * 100));
              return (
                <View
                  key={key}
                  style={[styles.seg, { backgroundColor: barColor(key), width: `${widthPct}%` }]}
                />
              );
            })}
          </View>
          <View style={styles.legend}>
            {order.map((key) => {
              const val = probabilities?.[key] ?? 0;
              return (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: barColor(key) }]} />
                  <Text style={[styles.legendKey, { color: c.textMuted }]}>{key}</Text>
                  <Text style={[styles.legendVal, { color: c.textMuted }]}>
                    {(val * 100).toFixed(1)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 0,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'JetBrainsMono_400Regular',
  },
  gaugeWrap: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  gaugeGlow: {
    position: 'absolute',
    opacity: 0.12,
  },
  gauge: {
    width: '100%',
    height: '100%',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 52,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  bottom: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  badge: {
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 12,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Inter_700Bold',
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  barValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono_400Regular',
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  segTrack: {
    height: 14,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  seg: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendKey: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  legendVal: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono_400Regular',
    fontVariant: ['tabular-nums'],
  },
});