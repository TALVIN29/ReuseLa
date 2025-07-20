import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

export const metadata: Metadata = {
  title: 'ReuseLa - Community Reuse & Donation Matching',
  description: 'Connecting communities for a greener future. Donate and request pre-loved items for free.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <DarkModeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
} 