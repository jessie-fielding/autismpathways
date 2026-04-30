import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCredentials } from './secureCredentials';

const AuthContext = createContext(undefined as any);

export function AuthProvider({ children }: any) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null as any);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsSignedIn(!!token);
    } catch (e) {
      console.error('Auth check failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: any, password: any) => {
    try {
      setError(null);
      // TODO: Replace 'demo-token' with a real API call to your auth backend.
      // The token returned here should be a JWT or session token from your server.
      await AsyncStorage.setItem('authToken', 'demo-token');
      setIsSignedIn(true);
      return { success: true };
    } catch (e: any) {
      const message = e.message || 'Sign in failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const signUp = async (email: any, password: any) => {
    try {
      setError(null);
      // TODO: Call your sign-up API endpoint here
      return { success: true };
    } catch (e: any) {
      const message = e.message || 'Sign up failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const confirmSignUp = async (email: any, code: any) => {
    try {
      setError(null);
      await AsyncStorage.setItem('authToken', 'demo-token');
      setIsSignedIn(true);
      return { success: true };
    } catch (e: any) {
      const message = e.message || 'Confirmation failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      // Clear saved credentials from the secure keychain on explicit sign-out
      // NOTE: We only clear the token, not the saved email/password, so that
      // "Remember me" still auto-fills on the next sign-in. If you want to
      // fully clear credentials on sign-out, call clearCredentials() here.
      setIsSignedIn(false);
      setError(null);
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  /**
   * Full sign-out: clears both the auth token AND the saved credentials.
   * Use this when the user explicitly chooses "Sign out and forget me".
   */
  const signOutAndForget = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await clearCredentials();
      setIsSignedIn(false);
      setError(null);
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  const value = { isSignedIn, isLoading, signIn, signUp, confirmSignUp, signOut, signOutAndForget, error };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
