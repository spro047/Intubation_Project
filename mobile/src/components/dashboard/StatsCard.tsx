import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

interface StatsCardProps {
  easy: number;
  moderate: number;
  difficult: number;
  total: number;
}

// Port of web src/components/StatsCard.tsx
export default function StatsCard({ easy, moderate, difficult, total }: StatsCardProps) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: radii.lg,
        },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Activity size={16} color={c.brand[500]} />
        <Text style={[styles.headerLabel, { color: c.textMuted }]}>Overview</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={[styles.number, { color: c.success[500] }]}>{easy}</Text>
            <Text style={[styles.colLabel, { color: c.textFaint }]}>Easy</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.number, { color: c.warning[500] }]}>{moderate}</Text>
            <Text style={[styles.colLabel, { color: c.textFaint }]}>Moderate</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.number, { color: c.danger[500] }]}>{difficult}</Text>
            <Text style={[styles.colLabel, { color: c.textFaint }]}>Difficult</Text>
          </View>
        </View>
        {total > 0 ? (
          <View style={[styles.totalRow, { borderTopColor: c.border }]}>
            <Text style={[styles.totalLabel, { color: c.textFaint }]}>Total assessments</Text>
            <Text style={[styles.totalValue, { color: c.text }]}>{total}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  number: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    fontVariant: ['tabular-nums'],
  },
  colLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
});