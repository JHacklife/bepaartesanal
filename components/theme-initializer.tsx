'use client'

import * as React from 'react'
import { useCustomTheme } from './theme-manager'
import { useTheme } from 'next-themes'

export function ThemeInitializer() {
  const { applyCustomTheme } = useCustomTheme()
  const { theme, resolvedTheme } = useTheme()
  const [isClient, setIsClient] = React.useState(false)

  // Marcar cuando estamos en el cliente
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Aplicar tema personalizado solo después de que next-themes esté listo
  React.useEffect(() => {
    if (!isClient || !resolvedTheme) return

    // Pequeño delay para asegurar que DOM está completamente listo
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('custom-theme') || 'maritime'
      applyCustomTheme(savedTheme)
    }, 50)

    return () => clearTimeout(timer)
  }, [isClient, resolvedTheme, applyCustomTheme])

  return null
}