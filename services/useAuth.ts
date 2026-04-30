/**
 * useAuth.ts
 *
 * Real AWS Cognito authentication service.
 *
 * Supports:
 *  - Email + password sign-up (with verification code)
 *  - Email + password sign-in
 *  - Google Sign-In via Cognito Hosted UI (OAuth 2.0 / PKCE)
 *  - Forgot password / reset password
 *  - Sign out (clears local token)
 *  - Sign out and forget (clears token + saved credentials)
 *
 * Configuration is read from aws-config.ts — no secrets in this file.
 *
 * Google Sign-In requires:
 *  1. A Google OAuth 2.0 client ID configured in Google Cloud Console
 *  2. Google added as an Identity Provider in your Cognito User Pool
 *  3. The Cognito Hosted UI domain configured in your User Pool
 *  4. Redirect URI `autismpathways://` added to both Google and Cognito
 *
 * See SETUP_GUIDE.md for step-by-step console instructions.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { awsConfig } from '../aws-config';
import { clearCredentials } from './secureCredentials';

// ─── Cognito User Pool ────────────────────────────────────────────────────────

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.userPoolId,
  ClientId: awsConfig.userPoolWebClientId,
});

// ─── Storage keys ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'authToken';
const USER_EMAIL_KEY = 'authUserEmail';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Persist the Cognito ID token so the app can check auth on startup */
async function persistSession(session: CognitoUserSession, email: string) {
  const idToken = session.getIdToken().getJwtToken();
  await AsyncStorage.setItem(TOKEN_KEY, idToken);
  await AsyncStorage.setItem(USER_EMAIL_KEY, email);
}

/** Resolve the current Cognito user's session (refreshes if needed) */
function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) { resolve(null); return; }
    user.getSession((err: any, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) { resolve(null); return; }
      resolve(session);
    });
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(undefined as any);

export function AuthProvider({ children }: any) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // ── Startup: check for an existing valid session ──────────────────────────
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First try to refresh via the Cognito SDK (handles token refresh automatically)
      const session = await getCurrentSession();
      if (session) {
        const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
        setUserEmail(email);
        setIsSignedIn(true);
        // Keep the stored token fresh
        await AsyncStorage.setItem(TOKEN_KEY, session.getIdToken().getJwtToken());
      } else {
        // Fall back to checking the stored token (covers Google sign-in case)
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
          setUserEmail(email);
          setIsSignedIn(true);
        }
      }
    } catch (e) {
      console.error('Auth check failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email + password sign-in ──────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const authDetails = new AuthenticationDetails({
          Username: email.toLowerCase().trim(),
          Password: password,
        });
        const cognitoUser = new CognitoUser({
          Username: email.toLowerCase().trim(),
          Pool: userPool,
        });
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: async (session) => {
            await persistSession(session, email.toLowerCase().trim());
            setUserEmail(email.toLowerCase().trim());
            setIsSignedIn(true);
            resolve({ success: true });
          },
          onFailure: (err) => {
            const msg = err.message || 'Sign in failed. Please check your email and password.';
            setError(msg);
            resolve({ success: false, error: msg });
          },
          newPasswordRequired: () => {
            const msg = 'A new password is required. Please contact support.';
            setError(msg);
            resolve({ success: false, error: msg });
          },
        });
      });
      return result;
    } catch (e: any) {
      const msg = e.message || 'Sign in failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Email + password sign-up ──────────────────────────────────────────────
  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setError(null);
      const attributes: CognitoUserAttribute[] = [];
      if (firstName) attributes.push(new CognitoUserAttribute({ Name: 'given_name', Value: firstName }));
      if (lastName) attributes.push(new CognitoUserAttribute({ Name: 'family_name', Value: lastName }));
      attributes.push(new CognitoUserAttribute({ Name: 'email', Value: email.toLowerCase().trim() }));

      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        userPool.signUp(
          email.toLowerCase().trim(),
          password,
          attributes,
          [],
          (err) => {
            if (err) {
              const msg = err.message || 'Sign up failed';
              setError(msg);
              resolve({ success: false, error: msg });
            } else {
              // Store email for the confirmation step
              AsyncStorage.setItem(USER_EMAIL_KEY, email.toLowerCase().trim());
              resolve({ success: true });
            }
          }
        );
      });
      return result;
    } catch (e: any) {
      const msg = e.message || 'Sign up failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Confirm sign-up with verification code ────────────────────────────────
  const confirmSignUp = async (email: string, code: string) => {
    try {
      setError(null);
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const cognitoUser = new CognitoUser({
          Username: email.toLowerCase().trim(),
          Pool: userPool,
        });
        cognitoUser.confirmRegistration(code, true, (err) => {
          if (err) {
            const msg = err.message || 'Confirmation failed';
            setError(msg);
            resolve({ success: false, error: msg });
          } else {
            resolve({ success: true });
          }
        });
      });
      return result;
    } catch (e: any) {
      const msg = e.message || 'Confirmation failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Resend verification code ──────────────────────────────────────────────
  const resendConfirmationCode = async (email: string) => {
    try {
      setError(null);
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const cognitoUser = new CognitoUser({
          Username: email.toLowerCase().trim(),
          Pool: userPool,
        });
        cognitoUser.resendConfirmationCode((err) => {
          if (err) {
            const msg = err.message || 'Failed to resend code';
            resolve({ success: false, error: msg });
          } else {
            resolve({ success: true });
          }
        });
      });
      return result;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const cognitoUser = new CognitoUser({
          Username: email.toLowerCase().trim(),
          Pool: userPool,
        });
        cognitoUser.forgotPassword({
          onSuccess: () => resolve({ success: true }),
          onFailure: (err) => resolve({ success: false, error: err.message }),
        });
      });
      return result;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // ── Confirm new password ──────────────────────────────────────────────────
  const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    try {
      setError(null);
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const cognitoUser = new CognitoUser({
          Username: email.toLowerCase().trim(),
          Pool: userPool,
        });
        cognitoUser.confirmPassword(code, newPassword, {
          onSuccess: () => resolve({ success: true }),
          onFailure: (err) => resolve({ success: false, error: err.message }),
        });
      });
      return result;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // ── Google Sign-In via Cognito Hosted UI ──────────────────────────────────
  /**
   * Opens the Cognito Hosted UI Google sign-in page in a web browser.
   * On success, exchanges the authorization code for tokens and persists them.
   *
   * IMPORTANT: This requires the Cognito Hosted UI domain to be set in aws-config.ts
   * and Google to be configured as an Identity Provider in your User Pool.
   * See SETUP_GUIDE.md for instructions.
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);

      if (!awsConfig.hostedUiDomain) {
        const msg = 'Google Sign-In is not configured yet. See SETUP_GUIDE.md for instructions.';
        setError(msg);
        return { success: false, error: msg };
      }

      // The redirect URI must match exactly what is registered in both
      // Google Cloud Console and Cognito App Client settings.
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'autismpathways' });

      const authUrl =
        `https://${awsConfig.hostedUiDomain}/oauth2/authorize` +
        `?identity_provider=Google` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=CODE` +
        `&client_id=${awsConfig.userPoolWebClientId}` +
        `&scope=email+openid+profile`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== 'success' || !result.url) {
        return { success: false, error: 'Google sign-in was cancelled.' };
      }

      // Extract the authorization code from the redirect URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      if (!code) {
        return { success: false, error: 'No authorization code received from Google.' };
      }

      // Exchange the code for tokens via Cognito token endpoint
      const tokenResponse = await fetch(
        `https://${awsConfig.hostedUiDomain}/oauth2/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: [
            `grant_type=authorization_code`,
            `client_id=${awsConfig.userPoolWebClientId}`,
            `code=${code}`,
            `redirect_uri=${encodeURIComponent(redirectUri)}`,
          ].join('&'),
        }
      );

      const tokens = await tokenResponse.json();

      if (!tokens.id_token) {
        const msg = tokens.error_description || tokens.error || 'Failed to exchange code for tokens.';
        setError(msg);
        return { success: false, error: msg };
      }

      // Decode the ID token to get the user's email
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
      const email = payload.email || payload['cognito:username'] || 'google-user';

      await AsyncStorage.setItem(TOKEN_KEY, tokens.id_token);
      await AsyncStorage.setItem(USER_EMAIL_KEY, email);
      if (tokens.refresh_token) {
        await AsyncStorage.setItem('authRefreshToken', tokens.refresh_token);
      }

      setUserEmail(email);
      setIsSignedIn(true);
      return { success: true };
    } catch (e: any) {
      const msg = e.message || 'Google sign-in failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      const user = userPool.getCurrentUser();
      user?.signOut();
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('authRefreshToken');
      setIsSignedIn(false);
      setUserEmail(null);
      setError(null);
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  const signOutAndForget = async () => {
    try {
      const user = userPool.getCurrentUser();
      user?.signOut();
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_EMAIL_KEY, 'authRefreshToken']);
      await clearCredentials();
      setIsSignedIn(false);
      setUserEmail(null);
      setError(null);
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const value = {
    isSignedIn,
    isLoading,
    error,
    userEmail,
    signIn,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    signInWithGoogle,
    signOut,
    signOutAndForget,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
