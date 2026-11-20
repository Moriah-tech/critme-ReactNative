import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { AuthError } from '../../auth/types';
import { FieldErrors, hasErrors, validateSignIn } from '../../auth/validation';
import { AuthButton, AuthField, AuthFormError, AuthPage, AuthTitle, auth } from '../../components/auth/AuthParts';

/**
 * 2.2 Log In. Username / email / mobile + password, Forgot Password?, Log In,
 * OR divider, and a link to Create Account.
 *
 * Forgot Password is in the design but no Forgot/Reset Password screens were
 * supplied (and there is no backend), so it only shows a "coming soon" notice.
 */
type Props = { onSignUp: () => void };
type Keys = 'identifier' | 'password';

export function LogInScreen({ onSignUp }: Props) {
  const { signIn } = useAuth();
  const [v, setV] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Keys>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const pass = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => () => void (mounted.current = false), []);

  const set = (k: Keys) => (t: string) => {
    setV((s) => ({ ...s, [k]: t }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async () => {
    if (busy) return;
    const e = validateSignIn(v);
    setErrors(e);
    setFormError(null);
    if (hasErrors(e)) return;
    setBusy(true);
    try {
      await signIn({ identifier: v.identifier.trim(), password: v.password });
    } catch (err) {
      if (mounted.current) setFormError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <AuthPage>
      <AuthTitle>Log In</AuthTitle>

      <AuthField
        label="Username, Email or Mobile Number"
        placeholder="Enter username, email or number"
        value={v.identifier}
        onChangeText={set('identifier')}
        error={errors.identifier}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        onSubmitEditing={() => pass.current?.focus()}
        submitBehavior="submit"
      />
      <AuthField
        ref={pass}
        label="Password"
        placeholder="Enter password"
        value={v.password}
        onChangeText={set('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <View style={styles.forgotRow}>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          onPress={() => Alert.alert('Coming soon', 'Password reset is not available yet.')}
        >
          <Text style={styles.forgot}>Forgot Password?</Text>
        </Pressable>
      </View>

      <AuthFormError message={formError} />
      <AuthButton label="Log In" onPress={submit} loading={busy} style={{ marginBottom: 20 }} />

      <View style={styles.or}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      <Text style={styles.switchRow}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={onSignUp} accessibilityRole="link" suppressHighlighting>
          Sign Up
        </Text>
      </Text>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  forgotRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: -8, marginBottom: 22 },
  forgot: { fontSize: 12, fontWeight: '500', color: 'rgba(250,250,250,0.85)' },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  orText: { fontSize: 10, letterSpacing: 1, color: 'rgba(161,161,170,0.4)' },
  switchRow: { textAlign: 'center', fontSize: 13, color: auth.muted },
  link: { color: auth.text, fontWeight: '600' },
});
