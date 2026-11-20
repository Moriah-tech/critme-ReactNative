import React from 'react';
import { useScreenStack } from '../navigation/useScreenStack';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { LogInScreen } from '../screens/auth/LogInScreen';

/**
 * Signed-out flow: 1.1 Onboarding → 2.1 Create Account ⇄ 2.2 Log In.
 * Onboarding is always the entry. Create Account and Log In link to each other
 * (replacing, not stacking, so the stack never grows); Android back returns to
 * Onboarding and, from there, leaves the app. Once the user signs in, App stops
 * rendering this flow, so there is no way back into it.
 */
type Route = { name: 'onboarding' } | { name: 'signup' } | { name: 'login' };

export function AuthFlow() {
  const nav = useScreenStack<Route>({ name: 'onboarding' });
  const swap = (name: 'signup' | 'login') => {
    nav.pop();
    nav.push({ name });
  };

  switch (nav.top.name) {
    case 'signup':
      return <CreateAccountScreen onLogIn={() => swap('login')} />;
    case 'login':
      return <LogInScreen onSignUp={() => swap('signup')} />;
    default:
      return <OnboardingScreen onNext={() => nav.push({ name: 'signup' })} />;
  }
}
