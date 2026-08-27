import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, Cpu, Database, Layers, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import AppHeader from '@/components/ui/AppHeader';

// Verbatim content port of web src/app/about/page.tsx (all static data)
const mlModels = [
  {
    name: 'TabTransformer',
    type: 'Deep Learning (Transformer)',
    accuracy: '85.9%',
    auc: '0.970',
    params: '22 categorical + 7 numerical features',
    file: 'tabular_best.pt',
  },
  {
    name: 'XGBoost',
    type: 'Gradient Boosted Trees',
    accuracy: '84.5%',
    auc: '0.962',
    params: 'All 30 tabular features',
    file: 'xgboost_best.json',
  },
  {
    name: 'Random Forest',
    type: 'Ensemble of Decision Trees',
    accuracy: '81.3%',
    auc: '0.953',
    params: 'All 30 tabular features',
    file: 'randomforest_best.pkl',
  },
];

const llmInfo = {
  provider: 'OpenRouter (API)',
  model: 'Qwen 2.5 72B Instruct (via OpenRouter)',
  temperature: '0.3',
  maxTokens: '512',
  purpose:
    'Generates clinical summaries and actionable recommendations based on prediction results and patient profile.',
};

const architecture = [
  { layer: 'Frontend', tech: 'Next.js 14, Tailwind CSS, Recharts', icon: Layers },
  { layer: 'Backend', tech: 'FastAPI, Motor (async MongoDB)', icon: Database },
  { layer: 'ML Engine', tech: 'PyTorch TabTransformer (tabular_best.pt)', icon: Brain },
  { layer: 'LLM Service', tech: 'OpenRouter API + Qwen 2.5 72B', icon: Sparkles },
  { layer: 'Database', tech: 'MongoDB Atlas (cloud)', icon: Cpu },
];

const layerColors = [
  { bg: '#FFFBEA', fg: '#C4A600' },
  { bg: '#E7FBFB', fg: '#0D8388' },
  { bg: '#FFFBEA', fg: '#C4A600' },
  { bg: '#fffbeb', fg: '#a16207' },
  { bg: '#E7FBFB', fg: '#0D8388' },
];

const layerColorsDark = [
  { bg: 'rgba(196,166,0,0.16)', fg: '#FFDE52' },
  { bg: 'rgba(22,194,200,0.16)', fg: '#5ED4D9' },
  { bg: 'rgba(196,166,0,0.16)', fg: '#FFDE52' },
  { bg: 'rgba(234,179,8,0.16)', fg: '#fcd34d' },
  { bg: 'rgba(22,194,200,0.16)', fg: '#5ED4D9' },
];

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.sectionHead}>
      <View style={[styles.sectionIcon, { backgroundColor: c.brand[50] }]}>{icon}</View>
      <View>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>
        <Text style={[styles.sectionSub, { color: c.textFaint }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { c, isDark } = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.page }}>
      <AppHeader title="About" subtitle="System architecture & model information" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ML Models */}
        <SectionHeader
          icon={<Brain size={16} color={c.brand[600]} />}
          title="Machine Learning Models"
          subtitle="Three-class classification: Easy / Moderate / Difficult"
        />

        {mlModels.map((model) => (
          <View key={model.name} style={[styles.modelCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.modelHead}>
              <Text style={[styles.modelName, { color: c.text }]}>{model.name}</Text>
              <View style={[styles.modelTypeTag, { backgroundColor: c.neutral[100] }]}>
                <Text style={[styles.modelTypeText, { color: c.textFaint }]}>
                  {model.type.split(' ')[0]}
                </Text>
              </View>
            </View>
            <Text style={[styles.modelType, { color: c.textMuted }]}>{model.type}</Text>

            <View style={styles.modelStats}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: c.textMuted }]}>Accuracy</Text>
                <Text style={[styles.statValue, { color: c.brand[600] }]}>{model.accuracy}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: c.textMuted }]}>AUC-ROC</Text>
                <Text style={[styles.statValue, { color: c.success[600] }]}>{model.auc}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: c.textMuted }]}>Features</Text>
                <Text style={[styles.statValueSmall, { color: c.textMuted }]}>{model.params}</Text>
              </View>
            </View>

            <View style={[styles.fileTag, { borderTopColor: c.border }]}>
              <Text style={[styles.fileText, { color: c.textFaint }]}>{model.file}</Text>
            </View>
          </View>
        ))}

        {/* LLM Assistant */}
        <SectionHeader
          icon={<Sparkles size={16} color={c.brand[600]} />}
          title="LLM Assistant"
          subtitle="AI-powered clinical decision support"
        />

        <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: c.textFaint }]}>Provider</Text>
              <Text style={[styles.infoValue, { color: c.text }]}>{llmInfo.provider}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: c.textFaint }]}>Model</Text>
              <Text style={[styles.infoValue, { color: c.text }]}>{llmInfo.model}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: c.textFaint }]}>Temperature</Text>
              <Text style={[styles.infoValue, { color: c.text }]}>{llmInfo.temperature}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: c.textFaint }]}>Max Tokens</Text>
              <Text style={[styles.infoValue, { color: c.text }]}>{llmInfo.maxTokens}</Text>
            </View>
          </View>
          <View style={[styles.infoPurpose, { borderTopColor: c.border }]}>
            <Text style={[styles.infoLabel, { color: c.textFaint }]}>Purpose</Text>
            <Text style={[styles.infoValue, { color: c.textMuted }]}>{llmInfo.purpose}</Text>
          </View>
        </View>

        {/* System Architecture */}
        <SectionHeader
          icon={<Layers size={16} color={c.neutral[600]} />}
          title="System Architecture"
          subtitle="End-to-end technology stack"
        />

        <View style={[styles.archCard, { backgroundColor: c.card, borderColor: c.border }]}>
          {architecture.map((layer, i) => {
            const Icon = layer.icon;
            const palette = isDark ? layerColorsDark : layerColors;
const lc = palette[i % palette.length];
            return (
              <View
                key={layer.layer}
                style={[
                  styles.archRow,
                  i > 0 && { borderTopWidth: 1, borderTopColor: c.border },
                ]}
              >
                <View style={[styles.archIcon, { backgroundColor: lc.bg }]}>
                  <Icon size={16} color={lc.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.archLayer, { color: c.text }]}>{layer.layer}</Text>
                  <Text style={[styles.archTech, { color: c.textMuted }]}>{layer.tech}</Text>
                </View>
              </View>
            );
          })}
        </View>
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
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  modelCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  modelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  modelTypeTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modelTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
  modelType: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  modelStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  statValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'Inter_500Medium',
  },
  fileTag: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  fileText: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_400Regular',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    gap: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontFamily: 'Inter_400Regular',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  infoPurpose: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 4,
  },
  archCard: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  archRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  archIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archLayer: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  archTech: {
    fontSize: 11,
    marginTop: 1,
    fontFamily: 'Inter_400Regular',
  },
});