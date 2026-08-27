import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import Badge from '@/components/ui/Badge';
import type { PredictionHistory } from '@/types';
import type { HomeStackParamList, TabParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

interface MiniHistoryProps {
  predictions: PredictionHistory[];
}

// Port of web src/components/MiniHistory.tsx (last 5 records on dashboard)
export default function MiniHistory({ predictions }: MiniHistoryProps) {
  const { c } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const recent = predictions.slice(0, 5);

  const openReport = (pred: PredictionHistory) => {
    navigation.navigate('ReportDetail', { prediction: pred });
  };

  const goToRecordsTab = () => {
    navigation.getParent<BottomTabNavigationProp<TabParamList>>()?.navigate('Records');
  };

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
        <View style={styles.headerLeft}>
          <Clock size={16} color={c.brand[500]} />
          <Text style={[styles.headerLabel, { color: c.textMuted }]}>Recent Records</Text>
        </View>
        {predictions.length > 5 ? (
          <Pressable onPress={goToRecordsTab}>
            <Text style={[styles.viewAll, { color: c.brand[600] }]}>View all →</Text>
          </Pressable>
        ) : null}
      </View>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Clock size={32} color={c.neutral[300]} />
          <Text style={[styles.emptyTitle, { color: c.textMuted }]}>No records yet</Text>
          <Text style={[styles.emptySub, { color: c.textFaint }]}>
            Assess a patient to see results here
          </Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16 }}>
          {recent.map((pred) => {
            let dateStr = pred.created_at;
            try {
              dateStr = format(parseISO(pred.created_at), 'MMM dd');
            } catch {
              // keep raw
            }
            return (
              <Pressable
                key={pred.id}
                onPress={() => openReport(pred)}
                style={({ pressed }) => [
                  styles.row,
                  { borderBottomColor: c.neutral[100] },
                  pressed && { backgroundColor: c.neutral[50] },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text
                    numberOfLines={1}
                    style={[styles.patientId, { color: c.text }]}
                  >
                    {pred.patient_id}
                  </Text>
                  <Badge prediction={pred.prediction} size="sm" />
                </View>
                <View style={styles.rowRight}>
                  <Text style={[styles.date, { color: c.textFaint }]}>{dateStr}</Text>
                  <ChevronRight size={12} color={c.neutral[300]} />
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySub: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
});