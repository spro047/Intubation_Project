import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Activity, Sun, Moon, Plus, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { getPredictions, checkLlmStatus } from '@/lib/api';
import { iconSizes } from '@/theme/tokens';
import type { PredictionHistory, LlmStatus } from '@/types';
import AppButton from '@/components/ui/AppButton';
import Card from '@/components/ui/Card';
import Banner from '@/components/ui/Banner';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import StatsCard from '@/components/dashboard/StatsCard';
import MiniHistory from '@/components/dashboard/MiniHistory';
import type { HomeStackParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LlmState = 'checking' | 'connected' | 'offline';

// Port of web src/app/dashboard/page.tsx (header + stats + recent records; form/result in separate screens)
export default function DashboardScreen() {
  const { c, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const reduceMotion = useReduceMotion();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [llmStatus, setLlmStatus] = useState<LlmState>('checking');

  React.useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, reduceMotion]);

  const fetchPredictions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingHistory(true);
    try {
      const data = await getPredictions();
      setPredictions(data);
    } catch {
      // silent (web behavior)
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPredictions();
      checkLlmStatus()
        .then((s: LlmStatus) => setLlmStatus(s.connected ? 'connected' : 'offline'))
        .catch(() => setLlmStatus('offline'));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPredictions]),
  );

  const easyCount = predictions.filter((p) => p.prediction.toLowerCase() === 'easy').length;
  const moderateCount = predictions.filter((p) => p.prediction.toLowerCase() === 'moderate').length;
  const difficultCount = predictions.filter((p) => p.prediction.toLowerCase() === 'difficult').length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.page }}>
      {/* Top bar */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <Activity size={iconSizes.md} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: c.text }]}>Airway Assessment</Text>
            <Text style={[styles.headerSub, { color: c.textMuted }]}>
              {user?.role ?? ''} · {user?.email ?? ''}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* LLM status dot */}
          <View
            style={styles.llmStatus}
            accessibilityRole="image"
            accessibilityLabel={
              llmStatus === 'connected'
                ? 'AI assistant connected'
                : llmStatus === 'offline'
                ? 'AI assistant offline'
                : 'Checking AI assistant'
            }
          >
            {llmStatus === 'checking' ? (
              <ActivityIndicator size={10} color={c.neutral[400]} />
            ) : (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      llmStatus === 'connected' ? c.success[500] : c.neutral[400],
                  },
                ]}
              />
            )}
          </View>
          {/* Theme toggle */}
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeBtn,
              { backgroundColor: c.card, borderColor: isDark ? c.neutral[600] : c.ink },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} color={c.text} /> : <Moon size={16} color={c.neutral[600]} />}
          </Pressable>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPredictions(true)} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats */}
          <StatsCard
            easy={easyCount}
            moderate={moderateCount}
            difficult={difficultCount}
            total={predictions.length}
          />

          {/* Primary CTA */}
          <Card style={styles.ctaCard}>
            <AppButton
              title="New Assessment"
              onPress={() => navigation.navigate('Assessment')}
              icon={<Plus size={16} color="#111111" />}
            />
            <Text style={[styles.ctaSub, { color: c.textFaint }]}>
              Enter patient data to predict airway difficulty
          </Text>
        </Card>

        {/* Recent records */}
        {loadingHistory ? (
          <Card style={{ padding: 16 }}>
            <Skeleton width={120} height={14} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={44} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={44} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={44} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={44} />
          </Card>
        ) : (
          <MiniHistory predictions={predictions} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  headerSub: {
    fontSize: 11,
    textTransform: 'capitalize',
    fontFamily: 'Inter_400Regular',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  llmStatus: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 120,
  },
  ctaCard: {
    alignItems: 'stretch',
  },
  ctaSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
});