'use client'

import { Home, Search, PlusCircle, List, User, LogOut, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DarkModeToggle from './DarkModeToggle'
import { useDarkMode } from '@/contexts/DarkModeContext'

// Fallback header styles in case dark mode context fails
const fallbackHeaderStyle = "bg-gradient-to-r from-green-100 to-blue-100 shadow-lg sticky top-0 z-50 border-b-4 border-green-400 relative min-h-[120px]"

export default function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { isDarkMode } = useDarkMode()

  const getActiveNavStyle = (href: string) => {
    switch (href) {
      case '/': return 'text-primary-800 dark:text-primary-200 bg-primary-200 dark:bg-primary-800 border-2 border-primary-600 dark:border-primary-400 shadow-md'
      case '/browse': return 'text-secondary-800 dark:text-secondary-200 bg-secondary-200 dark:bg-secondary-800 border-2 border-secondary-600 dark:border-secondary-400 shadow-md'
      case '/dashboard': return 'text-accent-800 dark:text-accent-200 bg-accent-200 dark:bg-accent-800 border-2 border-accent-600 dark:border-accent-400 shadow-md'
      case '/post': return 'text-success-800 dark:text-success-200 bg-success-200 dark:bg-success-800 border-2 border-success-600 dark:border-success-400 shadow-md'
      case '/requests': return 'text-warning-800 dark:text-warning-200 bg-warning-200 dark:bg-warning-800 border-2 border-warning-600 dark:border-warning-400 shadow-md'
      case '/profile': return 'text-info-800 dark:text-info-200 bg-info-200 dark:bg-info-800 border-2 border-info-600 dark:border-info-400 shadow-md'
      case '/login': return 'text-primary-800 dark:text-primary-200 bg-primary-200 dark:bg-primary-800 border-2 border-primary-600 dark:border-primary-400 shadow-md'
      default: return 'text-primary-800 dark:text-primary-200 bg-primary-200 dark:bg-primary-800 border-2 border-primary-600 dark:border-primary-400 shadow-md'
    }
  }

  const getInactiveNavStyle = (href: string) => {
    switch (href) {
      case '/': return 'text-gray-700 dark:text-gray-300 hover:text-primary-800 dark:hover:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900 font-medium'
      case '/browse': return 'text-gray-700 dark:text-gray-300 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-900 font-medium'
      case '/dashboard': return 'text-gray-700 dark:text-gray-300 hover:text-accent-800 dark:hover:text-accent-200 hover:bg-accent-100 dark:hover:bg-accent-900 font-medium'
      case '/post': return 'text-gray-700 dark:text-gray-300 hover:text-success-800 dark:hover:text-success-200 hover:bg-success-100 dark:hover:bg-success-900 font-medium'
      case '/requests': return 'text-gray-700 dark:text-gray-300 hover:text-warning-800 dark:hover:text-warning-200 hover:bg-warning-100 dark:hover:bg-warning-900 font-medium'
      case '/profile': return 'text-gray-700 dark:text-gray-300 hover:text-info-800 dark:hover:text-info-200 hover:bg-info-100 dark:hover:bg-info-900 font-medium'
      case '/login': return 'text-gray-700 dark:text-gray-300 hover:text-primary-800 dark:hover:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900 font-medium'
      default: return 'text-gray-700 dark:text-gray-300 hover:text-primary-800 dark:hover:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900 font-medium'
    }
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/browse', icon: Search, label: 'Browse' },
    { href: '/dashboard', icon: BarChart3, label: 'Impact' },
    ...(user ? [
      { href: '/post', icon: PlusCircle, label: 'Post' },
      { href: '/requests', icon: List, label: 'Requests' },
    ] : []),
    ...(user ? [
      { href: '/profile', icon: User, label: 'Profile' },
    ] : [
      { href: '/login', icon: User, label: 'Login' },
    ]),
  ]

  return (
    <header className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-gray-800 dark:to-gray-900 shadow-lg sticky top-0 z-50 border-b-4 border-primary-400 dark:border-primary-600 transition-colors duration-300 relative min-h-[120px]">
      {/* Top Header with Logo */}
      <div className="p-4 flex items-center justify-between animate-fade-in-down">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-800 to-secondary-800 dark:from-primary-200 dark:to-secondary-200 bg-clip-text text-transparent hover-scale">ReuseLa</h1>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md border border-gray-300 dark:border-gray-600 transition-colors duration-300">
            Reusing for a Sustainable Malaysia
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </div>
          <DarkModeToggle />
        </div>
      </div>

      {/* Top Navigation */}
      <nav className="p-3 flex justify-around items-center animate-fade-in-up bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-t-xl mx-2 mb-2 shadow-md transition-colors duration-300">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex flex-col items-center p-3 rounded-xl transition-all duration-200 hover-scale ${
                isActive 
                  ? getActiveNavStyle(item.href) + ' font-semibold animate-bounce-in' 
                  : getInactiveNavStyle(item.href) + ' font-medium'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
} 