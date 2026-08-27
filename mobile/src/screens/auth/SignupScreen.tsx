import React, { useState } from 'react';
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
import { Stethoscope, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, iconSizes } from '@/theme/tokens';
import AppButton from '@/components/ui/AppButton';
import Banner from '@/components/ui/Banner';

interface SignupScreenProps {
  navigation: any;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const { c, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { register } = await import('@/lib/api');
      await register(email, password);
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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

            {/* Signup card */}
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
                <Text style={[styles.cardTitle, { color: c.text }]}>Create Account</Text>
                <Text style={[styles.cardSub, { color: c.textFaint }]}>
                  Sign up to access the assessment dashboard
                </Text>
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: c.textMuted }]}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={c.neutral[400]}
                  autoComplete="email"
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                    placeholder="Create a password (min 6 characters)"
                    placeholderTextColor={c.neutral[400]}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: c.textMuted }]}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (error) setError('');
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor={c.neutral[400]}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
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

              {/* Error */}
              {error ? (
                <Banner variant="danger" icon={<AlertCircle size={16} color={c.danger[500]} />}>
                  {error}
                </Banner>
              ) : null}

              {/* Sign Up Button */}
              <AppButton
                title={loading ? 'Creating Account...' : 'Sign Up'}
                onPress={handleSubmit}
                loading={loading}
                icon={!loading ? <UserPlus size={16} color="#111111" /> : undefined}
              />

              {/* Sign In Button */}
              <View style={{ marginTop: 12 }}>
                <AppButton
                  title="Sign In"
                  variant="secondary"
                  onPress={() => navigation.navigate('Login')}
                />
              </View>

              <View style={[styles.footer, { borderTopColor: c.border }]}>
                <Text style={[styles.footerText, { color: c.textFaint }]}>
                  Secure clinical assessment platform
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
});
