import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Sizes.sm,
    borderRadius: Sizes.radiusMd,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variantes
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline: { backgroundColor: Colors.transparent, borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.error },

  // Tailles
  size_sm: { paddingVertical: 8, paddingHorizontal: Sizes.md, height: Sizes.buttonHeightSm },
  size_md: { paddingVertical: 14, paddingHorizontal: Sizes.lg, height: Sizes.buttonHeight },
  size_lg: { paddingVertical: 16, paddingHorizontal: Sizes.xl, height: Sizes.buttonHeightLg },

  // Textes
  text: { fontWeight: '700', letterSpacing: 0.3 },
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.white },
  text_outline: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.white },

  textSize_sm: { fontSize: Sizes.fontSm },
  textSize_md: { fontSize: Sizes.fontMd },
  textSize_lg: { fontSize: Sizes.fontLg },
});
