import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { format, parseISO } from 'date-fns';
import {
  History as HistoryIcon,
  Search,
  Download,
  Eye,
  Trash2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { getPredictions, deletePrediction, exportCsv } from '@/lib/api';
import { cachePredictions, getCachedPredictions } from '@/lib/storage';
import { iconSizes } from '@/theme/tokens';
import type { PredictionHistory as PredictionHistoryType } from '@/types';
import Badge from '@/components/ui/Badge';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import SegmentedTabs from '@/components/ui/SegmentedTabs';
import Banner from '@/components/ui/Banner';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { HistoryStackParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type FilterKey = 'all' | 'easy' | 'moderate' | 'difficult';

// Port of web src/app/history/page.tsx + src/components/PatientHistory.tsx (table â†’ card list)
export default function HistoryScreen() {
  const { c } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const reduceMotion = useReduceMotion();
  const entrance = useRef(new Animated.Value(0)).current;

  const [predictions, setPredictions] = useState<PredictionHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [offline, setOffline] = useState(false);

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

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getPredictions();
      setPredictions(data);
      setOffline(false);
      cachePredictions(data).catch(() => {});
    } catch {
      // Offline fallback: use cached data
      const cached = await getCachedPredictions<PredictionHistoryType[]>();
      if (cached) {
        setPredictions(cached);
        setOffline(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let result = predictions;
    if (filter !== 'all') {
      result = result.filter((p) => p.prediction.toLowerCase() === filter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => p.patient_id.toLowerCase().includes(term));
    }
    return result;
  }, [predictions, searchTerm, filter]);

  const counts = useMemo(
    () => ({
      all: predictions.length,
      easy: predictions.filter((p) => p.prediction.toLowerCase() === 'easy').length,
      moderate: predictions.filter((p) => p.prediction.toLowerCase() === 'moderate').length,
      difficult: predictions.filter((p) => p.prediction.toLowerCase() === 'difficult').length,
    }),
    [predictions],
  );

  const handleDelete = (pred: PredictionHistoryType) => {
    if (!user || user.role !== 'admin') return;
    Alert.alert(
      'Delete record',
      `Delete record for ${pred.patient_id}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionError('');
            setDeletingId(pred.id);
            try {
              await deletePrediction(pred.id);
              await fetchData();
            } catch (err) {
              setActionError(err instanceof Error ? err.message : 'Failed to delete record');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    setExporting(true);
    setActionError('');
    try {
      const path = await exportCsv();
      await Sharing.shareAsync(path, { mimeType: 'text/csv' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateStr;
    }
  };

  const isDoctor = user && (user.role === 'doctor' || user.role === 'admin');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.page }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: c.brand[50] }]}>
            <HistoryIcon size={16} color={c.brand[600]} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: c.text }]}>Patient Records</Text>
            <Text style={[styles.headerSub, { color: c.textFaint }]}>
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        {isDoctor ? (
          <AppButton
            title={exporting ? 'Exporting...' : 'Export CSV'}
            variant="secondary"
            small
            onPress={handleExport}
            disabled={exporting || predictions.length === 0}
            icon={<Download size={14} color={c.neutral[700]} />}
          />
        ) : null}
      </View>

      <Animated.View style={{ flex: 1, opacity: entrance }}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
          }
          showsVerticalScrollIndicator={false}
        >
        {offline ? (
          <Banner variant="warning" icon={<AlertCircle size={16} color={c.warning[600]} />}>
            Offline â€” showing cached data
          </Banner>
        ) : null}
        {actionError ? (
          <Banner variant="danger" icon={<AlertCircle size={16} color={c.danger[500]} />}>
            {actionError}
          </Banner>
        ) : null}

        {/* Filter tabs */}
        <SegmentedTabs
          tabs={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'easy', label: 'Easy', count: counts.easy },
            { key: 'moderate', label: 'Moderate', count: counts.moderate },
            { key: 'difficult', label: 'Difficult', count: counts.difficult },
          ]}
          activeKey={filter}
          onChange={(k) => setFilter(k as FilterKey)}
          disabledKeys={[
            ...(counts.easy === 0 ? ['easy'] : []),
            ...(counts.moderate === 0 ? ['moderate'] : []),
            ...(counts.difficult === 0 ? ['difficult'] : []),
          ]}
        />

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={16} color={c.neutral[400]} style={styles.searchIcon} />
          <View style={styles.searchInputWrap}>
            <AppInput
              placeholder="Search by Patient ID..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              containerStyle={{ marginBottom: 0 }}
              style={{ paddingLeft: 36 }}
            />
          </View>
        </View>

        {loading ? (
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height={48} style={{ marginBottom: 10 }} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <EmptyState
              icon={<Clock size={28} color={c.neutral[300]} />}
              title={searchTerm ? 'No records match your search' : 'No assessment history yet'}
              subtitle={
                searchTerm ? 'Try a different patient ID' : 'Run an assessment to see results'
              }
              actionLabel={searchTerm ? undefined : 'Go to Dashboard'}
              onAction={searchTerm ? undefined : () => navigation.getParent()?.navigate('Home')}
            />
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {filtered.map((pred, idx) => (
              <Pressable
                key={pred.id}
                onPress={() => navigation.navigate('ReportDetail', { prediction: pred })}
                style={({ pressed }) => [
                  styles.row,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: c.neutral[50] },
                  pressed && { backgroundColor: c.neutral[50] },
                ]}
              >
                <View style={styles.rowMain}>
                  <Text numberOfLines={1} style={[styles.patientId, { color: c.text }]}>
                    {pred.patient_id}
                  </Text>
                  <Text style={[styles.date, { color: c.textFaint }]}>
                    {formatDate(pred.created_at)}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Badge prediction={pred.prediction} size="sm" />
                    <Text style={[styles.confidence, { color: c.textMuted }]}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <Pressable
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel="View report"
                    onPress={() => navigation.navigate('ReportDetail', { prediction: pred })}
                  >
                    <Eye size={14} color={c.neutral[400]} />
                  </Pressable>
                  {user?.role === 'admin' ? (
                    <Pressable
                      style={styles.actionBtn}
                      disabled={deletingId === pred.id}
                      accessibilityRole="button"
                      accessibilityLabel="Delete record"
                      onPress={() => handleDelete(pred)}
                    >
                      {deletingId === pred.id ? (
                        <Loader2 size={14} color={c.danger[500]} />
                      ) : (
                        <Trash2 size={14} color={c.neutral[400]} />
                      )}
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
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
    flex: 1,
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
    fontFamily: 'Inter_400Regular',
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  searchWrap: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  searchInputWrap: {
    // paddingLeft applied via AppInput style
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  rowMain: {
    flex: 1,
    gap: 3,
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  confidence: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono_400Regular',
    fontVariant: ['tabular-nums'],
  },
  rowActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});