'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    console.log('Dark mode initialization:', { savedTheme, systemPrefersDark })
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
      console.log('Dark mode enabled')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
      console.log('Light mode enabled')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    console.log('Toggling dark mode from', isDarkMode, 'to', newDarkMode)
    setIsDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      console.log('Dark mode applied to document')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      console.log('Light mode applied to document')
    }
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
} 