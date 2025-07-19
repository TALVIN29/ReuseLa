'use client'

import { Home, Search, PlusCircle, List, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/browse', icon: Search, label: 'Browse' },
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
    <>
      {/* Top Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10 rounded-b-xl">
        <h1 className="text-2xl font-bold text-green-700">ReuseLa</h1>
        <div className="text-sm text-gray-700 font-medium">
          Reusing for a Sustainable Malaysia
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 flex justify-around items-center rounded-t-xl z-20">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-green-600 bg-green-50 font-semibold' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-gray-100 font-medium'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
} 