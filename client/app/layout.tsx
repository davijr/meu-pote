import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meu Pote - Frases Inspiradoras',
  description: 'Sua coleção pessoal de frases inspiradoras e motivacionais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}