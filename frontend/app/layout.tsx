import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { ClientThemeProvider } from '@/components/ui/ClientThemeProvider'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediCare Pro - AI-Powered Hospital Management',
  description: 'Advanced hospital management system with AI-powered diagnosis and patient care',
  keywords: 'hospital, management, AI, healthcare, diagnosis, patient care',
  authors: [{ name: 'Your Name' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // For notched devices
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MediCare Pro'
  },
  formatDetection: {
    telephone: false, // Prevent auto-detection of phone numbers
  },
  openGraph: {
    title: 'MediCare Pro - AI-Powered Hospital Management',
    description: 'Advanced hospital management system with AI-powered diagnosis and patient care',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider>
          <ClientThemeProvider>
            <Providers>
              {children}
            </Providers>
          </ClientThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}