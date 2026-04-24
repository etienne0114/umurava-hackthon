'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';
import { fetchProfile, clearLoading } from '@/store/slices/authSlice';

function AuthHydrator() {
  useEffect(() => {
    // If a token exists in localStorage, re-hydrate the user profile into Redux
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      store.dispatch(fetchProfile()).catch(() => {
        // Profile fetch failed, token is likely invalid
        // The auth slice will handle clearing the token and setting loading to false
      });
    } else {
      // No token, ensure loading state is false
      const currentState = store.getState().auth;
      if (currentState.loading) {
        store.dispatch(clearLoading());
      }
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
