import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { FileText, Clock, Stethoscope, ChevronRight, Loader2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { getPredictions, getPredictionReport } from '@/lib/api';
import type { PredictionHistory, LLMReport } from '@/types';
import { classStyleFor, radii } from '@/theme/tokens';
import Badge from '@/components/ui/Badge';
import Banner from '@/components/ui/Banner';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { ReportsStackParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Port of web src/app/reports/page.tsx (list + lazy report loading)
export default function ReportsScreen() {
  const { c, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const reduceMotion = useReduceMotion();
  const entrance = useRef(new Animated.Value(0)).current;

  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Record<string, LLMReport>>({});
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      entrance.setValue(1);
      return;
    }
    Animated.timing(entrance, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [entrance, reduceMotion]);

  const fetchPredictions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getPredictions();
      setPredictions(data);
    } catch {
      // silent (web behavior)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const openReport = async (pred: PredictionHistory) => {
    navigation.navigate('ReportDetail', { prediction: pred });
    // Preload/cache the report for instant detail view (web parity: reports state map)
    if (!reports[pred.id]) {
      setLoadingReport(pred.id);
      try {
        const report = await getPredictionReport(pred.id);
        setReports((r) => ({ ...r, [pred.id]: report }));
      } catch {
        // silent
      } finally {
        setLoadingReport(null);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

return (
<SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.page }}>
{/* Header */}
<View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
<View style={[styles.headerIcon, { backgroundColor: c.neutral[100] }]}>
<FileText size={16} color={c.neutral[500]} />
</View>
<View>
<Text style={[styles.headerTitle, { color: c.text }]}>Clinical Reports</Text>
<Text style={[styles.headerSub, { color: c.textFaint }]}>
{user?.role ?? ''} Â· {user?.username ?? ''}
</Text>
</View>
</View>

<Animated.View style={{ flex: 1, opacity: entrance }}>
<ScrollView
contentContainerStyle={styles.content}
refreshControl={
<RefreshControl refreshing={refreshing} onRefresh={() => fetchPredictions(true)} />
}
showsVerticalScrollIndicator={false}
>
        {loading ? (
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Skeleton width={140} height={16} style={{ marginBottom: 16 }} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height={64} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : predictions.length === 0 ? (
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <EmptyState
              icon={<FileText size={28} color={c.neutral[300]} />}
              title="No reports yet"
              subtitle="Run an assessment to generate a clinical report"
            />
          </View>
        ) : (
          predictions.map((pred) => {
            const cs = classStyleFor(pred.prediction);
            return (
              <Pressable
                key={pred.id}
                onPress={() => openReport(pred)}
                style={({ pressed }) => [
                  styles.reportCard,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    borderRadius: radii.lg,
                  },
                  pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                ]}
              >
                <View style={styles.reportMain}>
                  <View
                    style={[
                      styles.reportIcon,
                      { backgroundColor: isDark ? cs.bg : cs.bg },
                    ]}
                  >
                    <Stethoscope size={18} color={isDark ? cs.accentDark : cs.text} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.reportTitleRow}>
                      <Text numberOfLines={1} style={[styles.patientId, { color: c.text }]}>
                        {pred.patient_id}
                      </Text>
                      <Badge prediction={pred.prediction} size="sm" />
                    </View>
                    <View style={styles.reportMeta}>
                      <Text style={[styles.date, { color: c.textFaint }]}>
                        <Clock size={10} /> {formatDate(pred.created_at)}
                      </Text>
                      <Text style={[styles.confidence, { color: c.textFaint }]}>
                        {(pred.confidence * 100).toFixed(0)}% confidence
                      </Text>
                    </View>
                  </View>
                  {loadingReport === pred.id ? (
                    <Loader2 size={16} color={c.neutral[400]} />
                  ) : (
                    <ChevronRight size={16} color={c.neutral[300]} />
                  )}
                </View>
              </Pressable>
            );
          })
)}
</ScrollView>
</Animated.View>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  headerSub: {
    fontSize: 11,
    textTransform: 'capitalize',
    fontFamily: 'Inter_400Regular',
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  reportCard: {
    borderWidth: 1,
    padding: 14,
  },
  reportMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  confidence: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
});