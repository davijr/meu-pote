'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Plus, Calendar, User, LogOut, Heart } from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Nova Frase', href: '/frases/nova', icon: Plus },
    { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
    { name: 'Perfil', href: '/perfil', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Meu Pote</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-600">Olá, {user.nome}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-3 mb-3">
                <p className="text-base font-medium text-gray-800">{user.nome}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}