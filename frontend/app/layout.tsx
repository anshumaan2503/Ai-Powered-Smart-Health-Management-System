import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { ClientThemeProvider } from '@/components/ui/ClientThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediCare Pro - AI-Powered Hospital Management',
  description: 'Advanced hospital management system with AI-powered diagnosis and patient care',
  keywords: 'hospital, management, AI, healthcare, diagnosis, patient care',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <ClientThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ClientThemeProvider>
      </body>
    </html>
  )
}