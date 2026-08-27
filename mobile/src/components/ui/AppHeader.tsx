import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, showBack = true, onBack, right }: AppHeaderProps) {
  const { c } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.card }}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: c.card,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          },
        ]}
      >
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              onPress={onBack ?? (() => navigation.goBack())}
              style={[
                styles.backBtn,
                {
                  backgroundColor: c.neutral[50],
                  borderColor: c.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={18} color={c.textMuted} />
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <View style={{ flexShrink: 1 }}>
            <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>{title}</Text>
            {subtitle ? (
              <Text numberOfLines={1} style={[styles.subtitle, { color: c.textFaint }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
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
    gap: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
    fontFamily: 'Inter_500Medium',
    textTransform: 'capitalize',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});