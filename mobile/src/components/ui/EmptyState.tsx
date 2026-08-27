import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { c } = useTheme();
  return (
    <View style={styles.container}>
      {icon ? <View style={[styles.iconWrap, { backgroundColor: c.neutral[100] }]}>{icon}</View> : null}
      <Text style={[styles.title, { color: c.textMuted }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: c.textFaint }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});