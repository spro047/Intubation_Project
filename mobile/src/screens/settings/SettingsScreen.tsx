import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Settings as SettingsIcon, User, Moon, Sun, Globe, Database, Cpu, Shield, LogOut } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { checkLlmStatus, checkHealth, getBaseUrl, setBaseUrlOverride } from '@/lib/api';
import { setApiBaseUrl } from '@/lib/storage';
import type { LlmStatus } from '@/types';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import Banner from '@/components/ui/Banner';
import type { SettingsStackParamList } from '@/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

function SettingRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, { color: c.textMuted }]}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, { color: valueColor ?? c.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// Port of web src/app/settings/page.tsx + mobile additions (API URL editor + Test Connection)
export default function SettingsScreen() {
  const { c, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const [apiUrl, setApiUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [llmStatus, setLlmStatus] = useState<LlmStatus | null>(null);
  const [healthOk, setHealthOk] = useState(false);

  useEffect(() => {
    setApiUrl(getBaseUrl());
    checkLlmStatus().then(setLlmStatus).catch(() => setLlmStatus(null));
    checkHealth().then(() => setHealthOk(true)).catch(() => setHealthOk(false));
  }, []);

  const handleSaveApiUrl = useCallback(() => {
    const url = apiUrl.trim().replace(/\/+$/, '');
    if (!url) return;
    setApiUrl(url);
    setApiBaseUrl(url);
    setBaseUrlOverride(url);
    setConnStatus('idle');
  }, [apiUrl]);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    try {
      await checkHealth();
      setConnStatus('ok');
    } catch {
      setConnStatus('fail');
    } finally {
      setTesting(false);
    }
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.page }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <View style={[styles.headerIcon, { backgroundColor: c.neutral[100] }]}>
          <SettingsIcon size={16} color={c.neutral[500]} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Settings</Text>
          <Text style={[styles.headerSub, { color: c.textFaint }]}>
            {user?.role ?? ''} Â· {user?.username ?? ''}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.cardHead, { borderBottomColor: c.border }]}>
            <User size={16} color={c.neutral[400]} />
            <Text style={[styles.cardTitle, { color: c.text }]}>Profile</Text>
          </View>
          <View style={styles.cardBody}>
            <SettingRow icon={<User size={14} color={c.neutral[400]} />} label="Username" value={user?.username ?? ''} />
            <SettingRow
              icon={<Shield size={14} color={c.neutral[400]} />}
              label="Role"
              value={(user?.role ?? '').charAt(0).toUpperCase() + (user?.role ?? '').slice(1)}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.cardHead, { borderBottomColor: c.border }]}>
            {isDark ? <Moon size={16} color={c.neutral[400]} /> : <Sun size={16} color={c.neutral[400]} />}
            <Text style={[styles.cardTitle, { color: c.text }]}>Appearance</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: c.textMuted }]}>Dark Mode</Text>
                <Text style={[styles.rowSub, { color: c.textFaint }]}>
                  Toggle dark mode for the dashboard
                </Text>
              </View>
              <Pressable
                onPress={toggleTheme}
                style={[
                  styles.switch,
                  {
                    backgroundColor: isDark ? c.neutral[600] : c.card,
                    borderColor: isDark ? c.neutral[400] : c.ink,
                  },
                ]}
                accessibilityRole="switch"
                accessibilityState={{ checked: isDark }}
              >
                <View
                  style={[
                    styles.switchKnob,
                    {
                      backgroundColor: c.card,
                      borderColor: c.ink,
                      transform: [{ translateX: isDark ? 20 : 0 }],
                    },
                  ]}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* API Connection (mobile addition) */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.cardHead, { borderBottomColor: c.border }]}>
            <Globe size={16} color={c.neutral[400]} />
            <Text style={[styles.cardTitle, { color: c.text }]}>API Connection</Text>
          </View>
          <View style={styles.cardBody}>
            <AppInput
              label="API URL"
              value={apiUrl}
              onChangeText={setApiUrl}
              onEndEditing={handleSaveApiUrl}
              mono
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.1.50:8000"
            />
            <AppButton
              title={testing ? 'Testing...' : 'Test Connection'}
              variant="secondary"
              small
              onPress={handleTestConnection}
              loading={testing}
            />
            {connStatus === 'ok' ? (
              <Banner variant="success">Connected</Banner>
            ) : connStatus === 'fail' ? (
              <Banner variant="danger">
                Connection failed â€” check the URL and that the backend is running
              </Banner>
            ) : null}
            <Text style={[styles.rowSub, { color: c.textFaint }]}>
              Saved automatically when you finish editing.
            </Text>
          </View>
        </View>

        {/* System */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.cardHead, { borderBottomColor: c.border }]}>
            <Cpu size={16} color={c.neutral[400]} />
            <Text style={[styles.cardTitle, { color: c.text }]}>System</Text>
          </View>
          <View style={styles.cardBody}>
            <SettingRow
              icon={<Database size={14} color={c.neutral[400]} />}
              label="MongoDB"
              value={healthOk ? 'Connected' : 'Disconnected'}
              valueColor={healthOk ? c.success[600] : c.danger[500]}
            />
            <SettingRow
              icon={<Cpu size={14} color={c.neutral[400]} />}
              label="LLM Model"
              value={llmStatus?.model ?? 'â€”'}
            />
            <SettingRow
              icon={<Shield size={14} color={c.neutral[400]} />}
              label="ML Model"
              value="TabTransformer (tabular_best.pt)"
            />
          </View>
        </View>

        {/* About link */}
        <AppButton
          title="About â€” Models & Architecture"
          variant="secondary"
          onPress={() => navigation.navigate('About')}
          icon={<SettingsIcon size={16} color={c.neutral[700]} />}
        />

        {/* Sign out */}
        <AppButton
          title="Sign Out"
          variant="danger"
          onPress={() => signOut()}
          icon={<LogOut size={16} color="#111111" />}
        />

        <Text style={[styles.versionText, { color: c.textFaint }]}>Airway MD Â· v{appVersion}</Text>
      </ScrollView>
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
    gap: 16,
    paddingBottom: 120,
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono_400Regular',
    flexShrink: 1,
    textAlign: 'right',
  },
  switch: {
    width: 48,
    height: 28,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 3,
  },
});