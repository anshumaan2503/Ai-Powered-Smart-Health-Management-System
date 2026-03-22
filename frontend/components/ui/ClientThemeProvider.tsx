'use client';

import { Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeProvider';

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const { actualTheme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: actualTheme === 'dark' ? '#1e293b' : '#fff',
            color: actualTheme === 'dark' ? '#e2e8f0' : '#374151',
            boxShadow: actualTheme === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: actualTheme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
          },
        }}
      />
    </>
  );
}