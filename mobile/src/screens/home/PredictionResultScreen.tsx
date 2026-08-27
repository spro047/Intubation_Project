import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import AppHeader from '@/components/ui/AppHeader';
import AppButton from '@/components/ui/AppButton';
import RiskPredictionCard from '@/components/result/RiskPredictionCard';
import AiClinicalAssessment from '@/components/result/AiClinicalAssessment';
import type { HomeStackParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RouteProps = RouteProp<HomeStackParamList, 'PredictionResult'>;

// Composes RiskPredictionCard + AiClinicalAssessment (web: dashboard result section)
export default function PredictionResultScreen() {
  const { c } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProps>();
  const { result, input } = route.params;

  const prediction = result?.prediction;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.page }}>
      <AppHeader
        title="Prediction Result"
        subtitle={input?.patient_id}
        onBack={() => navigation.navigate('Dashboard')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {prediction ? (
          <RiskPredictionCard
            riskScore={prediction.risk_score}
            prediction={prediction.prediction}
            confidence={prediction.confidence}
            probabilities={prediction.probabilities}
          />
        ) : null}

        <AiClinicalAssessment
          summary={result?.clinical_summary ?? ''}
          recommendations={result?.recommendations ?? ''}
          loading={false}
          prediction={prediction?.prediction}
          sources={result?.report_sources}
        />

        <AppButton
          title="New Assessment"
          variant="secondary"
          onPress={() => navigation.replace('Assessment', undefined)}
          icon={<Plus size={16} color={c.neutral[700]} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
});