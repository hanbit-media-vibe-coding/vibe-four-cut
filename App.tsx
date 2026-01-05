import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <StatusBar style="auto" />
    </AppProviders>
  );
}
