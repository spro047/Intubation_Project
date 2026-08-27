import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface SegmentedTabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  disabledKeys?: string[];
  style?: ViewStyle;
}

// Port of the web segmented pill (PatientForm section tabs / PatientHistory filter tabs)
export default function SegmentedTabs({
  tabs,
  activeKey,
  onChange,
  disabledKeys = [],
  style,
}: SegmentedTabsProps) {
  const { c } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: c.neutral[100],
          borderWidth: 2,
          borderColor: c.ink,
          borderRadius: 5,
          padding: 2,
          gap: 2,
        },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        const isDisabled = disabledKeys.includes(tab.key);
        return (
          <Pressable
            key={tab.key}
            onPress={() => !isDisabled && onChange(tab.key)}
            disabled={isDisabled}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? c.card : 'transparent',
                borderRadius: radii.sm,
                opacity: isDisabled && !isActive ? 0.4 : 1,
              },
              isActive && {
                shadowColor: '#111111',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 0,
                elevation: 2,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                fontWeight: '600',
                fontFamily: 'Inter_600SemiBold',
                color: isActive ? c.brand[700] : c.textMuted,
                flexShrink: 1,
              }}
            >
              {tab.label}
            </Text>
            {typeof tab.count === 'number' ? (
              <View
                style={[
                  styles.count,
                  { backgroundColor: isActive ? c.neutral[200] : 'transparent' },
                ]}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: isActive ? c.neutral[800] : c.neutral[400],
                    fontFamily: 'Inter_700Bold',
                  }}
                >
                  {tab.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 3,
    gap: 3,
    minWidth: 0,
  },
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});