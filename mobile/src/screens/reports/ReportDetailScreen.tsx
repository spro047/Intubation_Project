import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { Activity, Brain, Sparkles, AlertCircle, Stethoscope } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { getPredictionReport } from '@/lib/api';
import { classStyleFor, urgencyFor, radii } from '@/theme/tokens';
import { parseBullets } from '@/utils/parseBullets';
import type { LLMReport } from '@/types';
import AppHeader from '@/components/ui/AppHeader';
import Badge from '@/components/ui/Badge';
import Banner from '@/components/ui/Banner';
import Skeleton from '@/components/ui/Skeleton';
import RiskPredictionCard from '@/components/result/RiskPredictionCard';
import type { HistoryStackParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RouteProps = RouteProp<HistoryStackParamList, 'ReportDetail'>;

// Port of the expanded report section in web reports/page.tsx (probabilities + LLM report)
export default function ReportDetailScreen() {
  const { c, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const route = useRoute<RouteProps>();
  const { prediction } = route.params;

  const [report, setReport] = useState<LLMReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPredictionReport(prediction.id);
        if (!cancelled) setReport(data);
      } catch {
        if (!cancelled) setError('No AI report found for this assessment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prediction.id]);

  const cs = classStyleFor(prediction.prediction);
  const urgency = urgencyFor(prediction.prediction);
  const probEntries = Object.entries(prediction.probabilities || {});
  const dateStr = (() => {
    try {
      return format(parseISO(prediction.created_at), 'MMM dd, yyyy HH:mm');
    } catch {
      return prediction.created_at;
    }
  })();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.page }}>
      <AppHeader title={prediction.patient_id} subtitle={dateStr} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary header */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: c.card, borderColor: c.border, borderRadius: radii.lg },
          ]}
        >
          <View style={styles.summaryRow}>
            <View style={[styles.classIcon, { backgroundColor: cs.bg }]}>
              <Stethoscope size={18} color={isDark ? cs.accentDark : cs.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.patientId, { color: c.text }]}>{prediction.patient_id}</Text>
              <Text style={[styles.dateText, { color: c.textFaint }]}>{dateStr}</Text>
            </View>
            <Badge prediction={prediction.prediction} />
          </View>
          <View style={styles.confidenceRow}>
            <View style={[styles.confidenceBadge, { borderColor: urgency.color }]}>
              <Text style={[styles.confidenceText, { color: urgency.color }]}>
                {(prediction.confidence * 100).toFixed(0)}% confidence
              </Text>
            </View>
            <View
              style={[
                styles.urgencyBadge,
                { backgroundColor: urgency.color, borderColor: c.ink },
              ]}
            >
              <Text style={[styles.urgencyText, { color: c.ink }]}>{urgency.level} Urgency</Text>
            </View>
          </View>
        </View>

        {/* Risk score speedometer */}
        <RiskPredictionCard
          riskScore={prediction.risk_score}
          prediction={prediction.prediction}
          confidence={prediction.confidence}
          probabilities={prediction.probabilities}
        />

        {loading ? (
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={12} />
          </View>
        ) : error ? (
          <Banner variant="danger" icon={<AlertCircle size={16} color={c.danger[500]} />}>
            {error}
          </Banner>
        ) : report ? (
          <>
            {/* Probabilities */}
            <View
              style={[
                styles.listCard,
                { backgroundColor: c.card, borderColor: c.border, borderRadius: radii.lg },
              ]}
            >
              <View style={styles.sectionHead}>
                <Activity size={14} color={c.textMuted} />
                <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Probabilities</Text>
              </View>
              <View style={styles.probRow}>
                {probEntries.map(([key, val]) => {
                  const bc =
                    key === 'Easy'
                      ? { bg: c.success[50], border: c.success[200], text: c.success[700] }
                      : key === 'Moderate'
                      ? { bg: c.warning[50], border: c.warning[200], text: c.warning[700] }
                      : { bg: c.danger[50], border: c.danger[200], text: c.danger[700] };
                  return (
                    <View
                      key={key}
                      style={[
                        styles.probChip,
                        { backgroundColor: bc.bg, borderColor: bc.border },
                      ]}
                    >
                      <Text style={[styles.probKey, { color: bc.text }]}>{key}</Text>
                      <Text style={[styles.probVal, { color: bc.text }]}>
                        {(val * 100).toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Clinical Summary */}
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: c.brand[50], borderColor: c.brand[200], borderRadius: radii.lg },
              ]}
            >
              <View style={styles.sectionHead}>
                <Brain size={14} color={c.brand[600]} />
                <Text style={[styles.sectionTitle, { color: c.brand[800] }]}>Clinical Summary</Text>
                {report.summary_source === 'fallback' ? (
                  <View style={[styles.sourceTag, { backgroundColor: c.danger[50] }]}>
                    <Text style={[styles.sourceText, { color: c.danger[600] }]}>fallback</Text>
                  </View>
                ) : null}
              </View>
              {report.summary ? (
                <View style={{ gap: 10 }}>
                  {parseBullets(report.summary).map((line, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: c.brand[400] }]} />
                      <Text style={[styles.bulletText, { color: c.textMuted }]}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noText, { color: c.textFaint }]}>No summary available</Text>
              )}
            </View>

            {/* Recommendations */}
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: c.success[50], borderColor: c.success[200], borderRadius: radii.lg },
              ]}
            >
              <View style={styles.sectionHead}>
                <Sparkles size={14} color={c.success[600]} />
                <Text style={[styles.sectionTitle, { color: c.success[700] }]}>
                  Recommendations
                </Text>
                {report.recommendations_source === 'fallback' ? (
                  <View style={[styles.sourceTag, { backgroundColor: c.danger[50] }]}>
                    <Text style={[styles.sourceText, { color: c.danger[600] }]}>fallback</Text>
                  </View>
                ) : null}
              </View>
              {report.recommendations ? (
                <View style={{ gap: 10 }}>
                  {parseBullets(report.recommendations).map((line, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: c.success[400] }]} />
                      <Text style={[styles.bulletText, { color: c.textMuted }]}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noText, { color: c.textFaint }]}>
                  No recommendations available
                </Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  summaryCard: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono_400Regular',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  listCard: {
    borderWidth: 1,
    padding: 16,
  },
  sectionCard: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  sourceTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'Inter_700Bold',
  },
  probRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  probChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
  },
  probKey: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  probVal: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontFamily: 'Inter_400Regular',
  },
  noText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'Inter_400Regular',
  },
});