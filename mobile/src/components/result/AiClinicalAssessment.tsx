import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Stethoscope, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { urgencyFor, radii } from '@/theme/tokens';
import { parseBullets } from '@/utils/parseBullets';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import Skeleton from '@/components/ui/Skeleton';

const LOADING_TIPS = [
  'Analyzing airway risk factors…',
  'Correlating clinical findings…',
  'Preparing recommendations…',
  'Reviewing patient profile…',
  'Finalizing clinical guidance…',
];

interface AiClinicalAssessmentProps {
  summary: string;
  recommendations: string;
  loading: boolean;
  prediction?: string;
  slow?: boolean;
  sources?: { summary?: string; recommendations?: string };
}

// Port of web src/components/AiClinicalAssessment.tsx
export default function AiClinicalAssessment({
  summary,
  recommendations,
  loading,
  prediction,
  slow = false,
  sources,
}: AiClinicalAssessmentProps) {
  const { c } = useTheme();
  const reduceMotion = useReduceMotion();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!loading || reduceMotion) return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading, reduceMotion]);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        {slow ? (
          <View
            style={[
              styles.slowBanner,
              { backgroundColor: c.warning[50], borderColor: c.ink },
            ]}
          >
            <Loader2 size={16} color={c.warning[600]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.slowText, { color: c.warning[700] }]}>
                The LLM response is taking longer than usual. Please wait…
              </Text>
              <Text style={[styles.slowTip, { color: c.warning[600] }]}>
                {LOADING_TIPS[tipIndex]}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.skeletonHeader}>
          <Skeleton width={36} height={36} radius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width={176} height={14} />
            <Skeleton width={112} height={12} />
          </View>
          <Skeleton width={96} height={24} />
        </View>
        <View style={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            <View style={styles.skeletonRow}>
              <Skeleton width={24} height={24} radius={6} />
              <Skeleton width={96} height={14} />
            </View>
            <Skeleton width="100%" height={12} />
            <Skeleton width="100%" height={12} />
            <Skeleton width="100%" height={12} />
          </View>
          <View style={{ gap: 8 }}>
            <View style={styles.skeletonRow}>
              <Skeleton width={24} height={24} radius={6} />
              <Skeleton width={128} height={14} />
            </View>
            <Skeleton width="100%" height={12} />
            <Skeleton width="100%" height={12} />
            <Skeleton width="100%" height={12} />
          </View>
        </View>
      </View>
    );
  }

  if (!summary && !recommendations) {
    return (
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: c.brand[50] }]}>
            <Sparkles size={16} color={c.brand[600]} />
          </View>
          <View>
            <Text style={[styles.title, { color: c.text }]}>AI Clinical Assessment</Text>
            <Text style={[styles.titleSub, { color: c.textFaint }]}>
              Clinical analysis — real-time
            </Text>
          </View>
        </View>
        <View style={styles.emptyBody}>
          <Stethoscope size={40} color={c.neutral[300]} />
          <Text style={[styles.emptyText, { color: c.textFaint }]}>
            Assess a patient to see the AI-generated clinical analysis.
          </Text>
        </View>
      </View>
    );
  }

  const summaryBullets = parseBullets(summary);
  const recBullets = parseBullets(recommendations);
  const urgency = urgencyFor(prediction);

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Header */}
      <View style={[styles.cardHeader, { borderBottomColor: c.border }]}>
        <View style={styles.titleRow}>
          <View style={styles.headerLogo}>
            <Sparkles size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.title, { color: c.text }]}>AI Clinical Assessment</Text>
            <Text style={[styles.titleSub, { color: c.textFaint }]}>
              Clinical analysis — real-time
            </Text>
          </View>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: urgency.color, borderColor: c.ink }]}>
          <View style={styles.pulseDot} />
          <Text style={[styles.urgencyText, { color: c.ink }]}>{urgency.level} Urgency</Text>
        </View>
      </View>

      {/* LLM fallback warning */}
      {(sources?.summary === 'fallback' || sources?.recommendations === 'fallback') && (
        <View style={[styles.fallbackBanner, { backgroundColor: c.danger[50], borderBottomColor: c.ink }]}>
          <AlertTriangle size={16} color={c.danger[500]} />
          <Text style={[styles.fallbackText, { color: c.danger[700] }]}>
            AI assistant unavailable — showing standard guidance.
          </Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Clinical Summary */}
        <View style={[styles.section, { backgroundColor: c.brand[50], borderColor: c.brand[100] }]}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: c.brand[100] }]}>
              <Stethoscope size={14} color={c.brand[600]} />
            </View>
            <Text style={[styles.sectionTitle, { color: c.brand[800] }]}>Assessment</Text>
          </View>
          {summaryBullets.length > 0 ? (
            <View style={{ gap: 10 }}>
              {summaryBullets.map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: c.brand[400] }]} />
                  <Text style={[styles.bulletText, { color: c.textMuted }]}>{bullet}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.rawText, { color: c.textMuted }]}>{summary}</Text>
          )}
        </View>

        {/* Recommendations */}
        <View style={[styles.section, { backgroundColor: c.success[50], borderColor: c.success[100] }]}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: c.success[100] }]}>
              <Lightbulb size={14} color={c.success[600]} />
            </View>
            <Text style={[styles.sectionTitle, { color: c.success[700] }]}>Recommendations</Text>
          </View>
          {recBullets.length > 0 ? (
            <View style={{ gap: 10 }}>
              {recBullets.map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: c.success[400] }]} />
                  <Text style={[styles.bulletText, { color: c.textMuted }]}>{bullet}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.rawText, { color: c.textMuted }]}>{recommendations}</Text>
          )}
        </View>

        {/* Risk factors banner */}
        <View style={[styles.riskBanner, { backgroundColor: c.warning[50], borderColor: c.warning[100] }]}>
          <View style={[styles.riskIcon, { backgroundColor: c.warning[100] }]}>
            <AlertTriangle size={16} color={c.warning[500]} />
          </View>
          <Text style={[styles.riskText, { color: c.warning[700] }]}>
            {prediction?.toLowerCase() === 'difficult'
              ? 'Difficult airway anticipated — ensure difficult airway cart and experienced clinician available.'
              : prediction?.toLowerCase() === 'moderate'
              ? 'Moderate risk — prepare alternative airway devices and have backup plan ready.'
              : 'Low risk — standard intubation protocol is likely sufficient.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  titleSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#111111',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#111111',
    opacity: 0.8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    fontFamily: 'Inter_500Medium',
  },
  slowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderRadius: 6,
  },
  slowText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    fontFamily: 'Inter_500Medium',
  },
  slowTip: {
    fontSize: 11,
    marginTop: 3,
    fontFamily: 'Inter_400Regular',
  },
  body: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    marginTop: 7,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontFamily: 'Inter_400Regular',
  },
  rawText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  riskIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    flex: 1,
    paddingTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  emptyBody: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
});