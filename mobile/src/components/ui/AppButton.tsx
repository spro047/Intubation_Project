import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'danger' | 'neutral';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  small?: boolean;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  small = false,
}: AppButtonProps) {
  const { c } = useTheme();
  const [pressed, setPressed] = useState(false);

  const isDisabled = disabled || loading;

  const bg = (() => {
    if (isDisabled) return c.neutral[200];
    switch (variant) {
      case 'primary': return c.brand[500];
      case 'secondary': return c.neutral[50];
      case 'danger': return c.danger[500];
      case 'neutral': return c.neutral[100];
    }
  })();

  const textColor = isDisabled
    ? c.neutral[400]
    : variant === 'primary' || variant === 'danger'
    ? '#111111'
    : c.neutral[700];

  const containerStyle: ViewStyle = {
    backgroundColor: bg,
    borderWidth: 2,
    borderColor: isDisabled ? c.neutral[300] : c.ink,
    borderRadius: radii.xl,
    paddingVertical: small ? 8 : 12,
    paddingHorizontal: small ? 12 : 16,
    minHeight: small ? 44 : 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...(pressed ? { transform: [{ translateX: 2 }, { translateY: 2 }] } : {}),
    shadowColor: '#111111',
    shadowOffset: pressed ? { width: 2, height: 2 } : { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: pressed ? 2 : 4,
    opacity: isDisabled ? 0.9 : 1,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={({ pressed: p }) => [
        containerStyle,
        p && { shadowOffset: { width: 2, height: 2 }, transform: [{ translateX: 2 }, { translateY: 2 }] },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading && <ActivityIndicator size="small" color={textColor} />}
      {icon}
      <Text
        style={[
          {
            color: textColor,
            fontSize: small ? 13 : 15,
            fontWeight: '700',
            fontFamily: 'Inter_700Bold',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}