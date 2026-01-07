'use client';

import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'react-hot-toast';

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--toast-border)',
          },
        }}
      />
      <style jsx global>{`
        :root {
          --toast-bg: #fff;
          --toast-color: #374151;
          --toast-border: #e5e7eb;
        }
        .dark {
          --toast-bg: #374151;
          --toast-color: #f9fafb;
          --toast-border: #4b5563;
        }
      `}</style>
    </ThemeProvider>
  );
}