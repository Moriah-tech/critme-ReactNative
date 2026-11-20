import React, { ComponentRef, forwardRef, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFrame } from '../../layout';
import { useKeyboardInset } from '../../useKeyboardInset';
import { fonts } from '../../theme';

/**
 * Shared pieces of the three auth screens (1.1 Onboarding, 2.1 Create Account,
 * 2.2 Log In). Values come from the shared stylesheet in the reference HTML.
 */
export const auth = {
  bg: '#050506',
  text: '#FAFAFA',
  muted: 'rgba(161,161,170,0.55)',
  label: 'rgba(161,161,170,0.5)',
  error: '#F87171',
  /** .login-btn / .next-btn: 120deg, #1A5F6E → #5B3A6E */
  button: ['#1A5F6E', '#5B3A6E'] as const,
};

/** .bg: 148deg #0C0C0E → #050506 (45%) → #09090B. */
export function AuthBackground() {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={['#0C0C0E', '#050506', '#09090B']}
      locations={[0, 0.45, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

/**
 * Scrolling form page: dark background, content starting at the design's 120 px
 * line, bottom padding that follows the keyboard so a focused input is never covered.
 */
export function AuthPage({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const frame = useFrame();
  const root = useRef<ComponentRef<typeof View>>(null);
  const kb = useKeyboardInset(root);
  return (
    <View ref={root} style={styles.page} collapsable={false}>
      <StatusBar style="light" />
      <AuthBackground />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: frame.top(120),
          paddingHorizontal: 26,
          paddingBottom: Math.max(kb, frame.bottom(36)) + 8,
        }}
      >
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </View>
  );
}

export const AuthTitle = ({ children }: { children: string }) => <Text style={styles.title}>{children}</Text>;

type FieldProps = TextInputProps & { label: string; error?: string };

/** .field-label + .field-input (50 px, 14 px radius, 3 % white fill, 7 % border). */
export const AuthField = forwardRef<ComponentRef<typeof TextInput>, FieldProps>(function AuthField({ label, error, style, onFocus, onBlur, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={auth.muted}
        selectionColor="#67A8B8"
        keyboardAppearance="dark"
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  /** Space Grotesk (Onboarding "Next") or the system font (Log In / Sign Up). */
  grotesk?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** .login-btn / .next-btn: 52 px tall pill, teal → plum gradient. */
export function AuthButton({ label, onPress, loading, grotesk, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btnWrap, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }, style]}
    >
      <LinearGradient colors={auth.button} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.8 }} style={styles.btn}>
        {loading ? (
          <ActivityIndicator color={auth.text} />
        ) : (
          <Text style={[styles.btnLabel, grotesk && { fontFamily: fonts.groteskBold, fontWeight: undefined }]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/** Message shown above the submit button when the server (or the missing backend) rejects the attempt. */
export const AuthFormError = ({ message }: { message: string | null }) =>
  message ? (
    <Text style={styles.formError} accessibilityLiveRegion="polite">
      {message}
    </Text>
  ) : null;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: auth.bg },
  footer: { marginTop: 'auto', paddingTop: 24 },
  title: { fontFamily: fonts.groteskBold, fontSize: 26, color: auth.text, marginBottom: 34 },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 10, color: auth.label, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 7 },
  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 13.5,
    color: auth.text,
  },
  inputFocused: { borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.045)' },
  inputError: { borderColor: 'rgba(248,113,113,0.6)' },
  error: { fontSize: 11, color: auth.error, marginTop: 6, marginLeft: 4 },
  btnWrap: { borderRadius: 26, boxShadow: '0 8px 18px rgba(0,0,0,0.25)' },
  btn: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  btnLabel: { fontSize: 15, fontWeight: '700', color: auth.text },
  formError: { fontSize: 12, color: auth.error, textAlign: 'center', marginBottom: 12, lineHeight: 17 },
});
