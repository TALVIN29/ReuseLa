'use client'

import { useDarkMode } from '@/contexts/DarkModeContext'
import { Moon, Sun } from 'lucide-react'

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleToggle = () => {
    console.log('Dark mode toggle clicked, current state:', isDarkMode)
    toggleDarkMode()
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  )
} 