'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';
import { fetchProfile } from '@/store/slices/authSlice';

function AuthHydrator() {
  useEffect(() => {
    // If a token exists in localStorage, re-hydrate the user profile into Redux
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      store.dispatch(fetchProfile());
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
