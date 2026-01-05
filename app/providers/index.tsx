import React, { useEffect } from 'react';
import { app, analytics } from '../../shared/config/firebase';
import { AuthProvider } from '../../shared/contexts/AuthContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Firebase is initialized in firebase.ts
    // Analytics is available for web platform
    if (analytics) {
      console.log('Firebase Analytics initialized');
    }
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
