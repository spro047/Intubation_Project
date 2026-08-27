import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet, Modal, FlatList, ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  required?: boolean;
}

// Custom bottom-sheet select styled to match the web <select> (bordered, hard shadow)
export default function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  containerStyle,
  required = false,
}: SelectProps) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => String(o.value) === String(value));
  const borderColor = error ? c.danger[300] : c.ink;

  return (
    <View style={[{ marginBottom: 12 }, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: c.textMuted }]}>
          {label}
          {required ? <Text style={{ color: c.danger[500] }}> *</Text> : null}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          {
            width: '100%',
            backgroundColor: c.card,
            borderWidth: 2,
            borderColor,
            borderRadius: radii.sm,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#111111',
            shadowOffset: { width: 5, height: 5 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Select'}
      >
        <Text
          style={{
            fontSize: 14,
            color: selected ? c.text : c.neutral[400],
            fontFamily: 'Inter_500Medium',
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color={c.neutral[400]} />
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: c.danger[500] }]}>{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: c.card, borderColor: c.ink }]}>
            <View style={[styles.sheetHandle, { backgroundColor: c.neutral[200] }]} />
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.value)}
              renderItem={({ item }) => {
                const isActive = String(item.value) === String(value);
                return (
                  <Pressable
                    onPress={() => { onChange(item.value); setOpen(false); }}
                    style={[
                      styles.option,
                      isActive && { backgroundColor: c.brand[50] },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: isActive ? c.brand[800] : c.text,
                        fontFamily: 'Inter_600SemiBold',
                      }}
                    >
                      {item.label}
                    </Text>
                    {isActive ? (
                      <View style={[styles.activeDot, { backgroundColor: c.brand[500] }]} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderWidth: 2,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '60%',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});