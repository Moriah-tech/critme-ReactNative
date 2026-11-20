import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { AuthError } from '../../auth/types';
import { FieldErrors, hasErrors, validateSignUp } from '../../auth/validation';
import { AuthButton, AuthField, AuthFormError, AuthPage, AuthTitle, auth } from '../../components/auth/AuthParts';

/**
 * 2.1 Create Account. Email, Full Name, Username, Password, Sign Up, and a link
 * to Log In. A successful sign-up authenticates the user directly (no second
 * login). The design has no confirm-password field, so none is added.
 */
type Props = { onLogIn: () => void };
type Keys = 'email' | 'fullName' | 'username' | 'password';

export function CreateAccountScreen({ onLogIn }: Props) {
  const { signUp } = useAuth();
  const [v, setV] = useState({ email: '', fullName: '', username: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Keys>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const name = useRef<ComponentRef<typeof TextInput>>(null);
  const user = useRef<ComponentRef<typeof TextInput>>(null);
  const pass = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => () => void (mounted.current = false), []);

  const set = (k: Keys) => (t: string) => {
    setV((s) => ({ ...s, [k]: t }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async () => {
    if (busy) return;
    const e = validateSignUp(v);
    setErrors(e);
    setFormError(null);
    if (hasErrors(e)) return;
    setBusy(true);
    try {
      await signUp({ email: v.email.trim(), fullName: v.fullName.trim(), username: v.username.trim(), password: v.password });
      // Signed in: the app swaps to Home, so there is nothing more to do here.
    } catch (err) {
      if (mounted.current) setFormError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <AuthPage
      footer={
        <Text style={styles.terms}>
          By continuing you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      }
    >
      <AuthTitle>Create account</AuthTitle>

      <AuthField
        label="Email"
        placeholder="Enter your email"
        value={v.email}
        onChangeText={set('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => name.current?.focus()}
        submitBehavior="submit"
      />
      <AuthField
        ref={name}
        label="Full Name"
        placeholder="Enter your full name"
        value={v.fullName}
        onChangeText={set('fullName')}
        error={errors.fullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => user.current?.focus()}
        submitBehavior="submit"
      />
      <AuthField
        ref={user}
        label="Username"
        placeholder="Choose a username"
        value={v.username}
        onChangeText={set('username')}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        returnKeyType="next"
        onSubmitEditing={() => pass.current?.focus()}
        submitBehavior="submit"
      />
      <AuthField
        ref={pass}
        label="Password"
        placeholder="Create a password"
        value={v.password}
        onChangeText={set('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <AuthFormError message={formError} />
      <AuthButton label="Sign Up" onPress={submit} loading={busy} style={{ marginTop: 8, marginBottom: 20 }} />

      <Text style={styles.switchRow}>
        Have an account?{' '}
        <Text style={styles.link} onPress={onLogIn} accessibilityRole="link" suppressHighlighting>
          Log in
        </Text>
      </Text>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  switchRow: { textAlign: 'center', fontSize: 13, color: auth.muted },
  link: { color: auth.text, fontWeight: '600' },
  terms: { textAlign: 'center', fontSize: 10.5, lineHeight: 17, color: 'rgba(161,161,170,0.42)', paddingHorizontal: 8 },
  termsLink: { color: 'rgba(148,163,184,0.8)', fontWeight: '500' },
});
