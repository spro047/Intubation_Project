import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  mono?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export default function AppInput({
  label,
  error,
  mono = false,
  containerStyle,
  required = false,
  style,
  ...inputProps
}: AppInputProps) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? c.danger[300]
    : focused
    ? c.brand[400]
    : c.ink;

  return (
    <View style={[{ marginBottom: 12 }, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: c.textMuted }]}>
          {label}
          {required ? <Text style={{ color: c.danger[500] }}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        {...inputProps}
        onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
        placeholderTextColor={c.neutral[400]}
        style={[
          {
            backgroundColor: c.card,
            borderWidth: 2,
            borderColor,
            borderRadius: radii.sm,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            color: c.text,
            fontFamily: mono ? 'JetBrainsMono_400Regular' : 'Inter_500Medium',
            shadowColor: '#111111',
            shadowOffset: { width: 5, height: 5 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
          },
          style,
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: c.danger[500] }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'Inter_600SemiBold',
  },
  error: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
});