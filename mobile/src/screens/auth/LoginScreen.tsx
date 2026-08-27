import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Stethoscope, Eye, EyeOff, AlertCircle, LogIn, Settings as SettingsIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { radii, iconSizes } from '@/theme/tokens';
import { getBaseUrl, setBaseUrlOverride, checkHealth } from '@/lib/api';
import { setApiBaseUrl } from '@/lib/storage';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import Banner from '@/components/ui/Banner';

// Port of web src/app/login/page.tsx + mobile server-address field
export default function LoginScreen() {
  const { c, isDark } = useTheme();
  const { signIn } = useAuth();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServer, setShowServer] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [testingServer, setTestingServer] = useState(false);
  const [serverStatus, setServerStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    setServerUrl(getBaseUrl());
  }, []);

  const handleTestServer = async () => {
    const url = serverUrl.trim().replace(/\/+$/, '');
    if (!url) return;
    setApiBaseUrl(url);
    setBaseUrlOverride(url);
    setServerStatus('idle');
    setTestingServer(true);
    try {
      await checkHealth();
      setServerStatus('ok');
    } catch {
      setServerStatus('fail');
    } finally {
      setTestingServer(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    try {
      await signIn(username.trim(), password);
      // RootNavigator auto-switches to MainTabs when token is set — no manual nav
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBorderColor = error ? c.danger[300] : c.neutral[200];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.page }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative brand blocks */}
          <View pointerEvents="none" style={styles.decor}>
            <View style={[styles.decorYellow, { backgroundColor: c.brand[300] }]} />
            <View
              style={[
                styles.decorMagenta,
                { backgroundColor: isDark ? 'rgba(255,0,217,0.15)' : 'rgba(255,0,217,0.25)' },
              ]}
            />
          </View>

          <View style={styles.content}>
            {/* Brand header */}
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Stethoscope size={iconSizes['2xl']} color="#FFFFFF" />
              </View>
              <Text style={[styles.brandTitle, { color: c.text }]}>Airway MD</Text>
              <Text style={[styles.brandSub, { color: c.textMuted }]}>
                Clinical Assessment — Multimodal Airway Prediction
              </Text>
            </View>

            {/* Login card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  shadowColor: isDark ? '#000000' : '#111111',
                },
              ]}
            >
              <View style={styles.cardHead}>
                <Text style={[styles.cardTitle, { color: c.text }]}>Welcome Back</Text>
                <Text style={[styles.cardSub, { color: c.textFaint }]}>
                  Sign in to access the assessment dashboard
                </Text>
              </View>

              {/* Username */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: c.textMuted }]}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => {
                    setUsername(t);
                    if (error) setError('');
                  }}
                  placeholder="Enter your username"
                  placeholderTextColor={c.neutral[400]}
                  autoComplete="username"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      backgroundColor: c.card,
                      borderColor: inputBorderColor,
                      color: c.text,
                      fontFamily: 'Inter_400Regular',
                    },
                  ]}
                />
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: c.textMuted }]}>Password</Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: c.card,
                      borderColor: inputBorderColor,
                    },
                  ]}
                >
                  <TextInput
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (error) setError('');
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={c.neutral[400]}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    style={[
                      styles.inputInner,
                      {
                        color: c.text,
                        fontFamily: 'Inter_400Regular',
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((s) => !s)}
                    style={styles.eyeBtn}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color={c.neutral[400]} />
                    ) : (
                      <Eye size={16} color={c.neutral[400]} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Error */}
              {error ? (
                <Banner variant="danger" icon={<AlertCircle size={16} color={c.danger[500]} />}>
                  {error}
                </Banner>
              ) : null}

              {/* Submit */}
              <AppButton
                title={loading ? 'Signing In...' : 'Sign In'}
                onPress={handleSubmit}
                loading={loading}
                icon={!loading ? <LogIn size={16} color="#111111" /> : undefined}
              />

              {/* Server address (mobile addition — lets you fix the API URL before login) */}
              <Pressable
                onPress={() => setShowServer((s) => !s)}
                style={styles.serverToggle}
              >
                <SettingsIcon size={14} color={c.neutral[400]} />
                <Text style={[styles.serverToggleText, { color: c.neutral[500] }]}>
                  {showServer ? 'Hide server address' : 'Server address'}
                </Text>
              </Pressable>

              {showServer ? (
                <View style={styles.serverBox}>
                  <AppInput
                    label="API URL"
                    value={serverUrl}
                    onChangeText={setServerUrl}
                    onEndEditing={handleTestServer}
                    mono
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="http://192.168.1.50:8000"
                    containerStyle={{ marginBottom: 8 }}
                  />
                  <AppButton
                    title={testingServer ? 'Testing...' : 'Test Connection'}
                    variant="secondary"
                    small
                    onPress={handleTestServer}
                    loading={testingServer}
                  />
                  {serverStatus === 'ok' ? (
                    <Banner variant="success">Connected</Banner>
                  ) : serverStatus === 'fail' ? (
                    <Banner variant="danger">
                      Connection failed — check the address and that the backend is running
                    </Banner>
                  ) : null}
                </View>
              ) : null}

              <View style={[styles.footer, { borderTopColor: c.border }]}>
                <Text style={[styles.footerText, { color: c.textFaint }]}>
                  Secure clinical assessment platform
                </Text>
                <Text style={[styles.versionText, { color: c.textFaint }]}>
                  v{appVersion}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  decor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorYellow: {
    position: 'absolute',
    top: -160,
    right: -160,
    width: 384,
    height: 384,
    borderRadius: 16,
    opacity: 0.9,
  },
  decorMagenta: {
    position: 'absolute',
    bottom: -160,
    left: -160,
    width: 384,
    height: 384,
    borderRadius: 16,
    opacity: 0.25,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#111111',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  brandSub: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cardHead: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
    paddingRight: 44,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 0.5,
  },
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 6,
  },
  serverToggleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  serverBox: {
    marginTop: 12,
    gap: 8,
  },
});