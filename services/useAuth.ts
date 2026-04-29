import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      setIsSignedIn(false);
      setError(null);
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  const value = { isSignedIn, isLoading, signIn, signUp, confirmSignUp, signOut, error };

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
