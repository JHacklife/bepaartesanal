'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Palette, Sun, Moon, Waves } from 'lucide-react'

export interface CustomTheme {
  name: string
  label: string
  description: string
  icon: React.ReactNode
  backgroundImage?: string
  baseColors: {
    hue: number; // Matiz principal del tema (0-360)
    saturation: number; // Saturación base (0-100)
    primaryHue?: number; // Matiz opcional para el color primario
    accentHue?: number; // Matiz opcional para el color de acento
  }
}

// Función para generar colores dinámicos basados en el tema base
function generateThemeColors(baseColors: CustomTheme['baseColors'], isDark: boolean) {
  const { hue, saturation, primaryHue = hue, accentHue = hue + 15 } = baseColors;

  // Función helper para asegurar que el hue esté en el rango 0-360
  const normalizeHue = (h: number) => ((h % 360) + 360) % 360;

  if (isDark) {
    return {
      '--background': `${normalizeHue(hue)} ${Math.max(saturation - 20, 20)}% 8%`,
      '--foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation, 60)}% 92%`,
      '--card': `${normalizeHue(hue)} ${Math.max(saturation - 20, 20)}% 15%`,
      '--card-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation, 60)}% 92%`,
      '--popover': `${normalizeHue(hue)} ${Math.max(saturation - 20, 20)}% 10%`,
      '--popover-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation, 60)}% 92%`,
      '--primary': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 55%`,
      '--primary-foreground': `${normalizeHue(hue)} ${Math.max(saturation - 20, 20)}% 8%`,
      '--secondary': `${normalizeHue(hue + 5)} ${Math.max(saturation - 55, 15)}% 18%`,
      '--secondary-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation, 60)}% 92%`,
      '--muted': `${normalizeHue(hue + 5)} ${Math.max(saturation - 55, 15)}% 18%`,
      '--muted-foreground': `${normalizeHue(hue + 10)} ${Math.max(saturation - 62, 8)}% 65%`,
      '--accent': `${normalizeHue(accentHue)} ${Math.max(saturation - 20, 50)}% 35%`,
      '--accent-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation, 60)}% 92%`,
      '--destructive': '0 75% 45%',
      '--destructive-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation, 60)}% 92%`, '--border': `${normalizeHue(hue + 5)} ${Math.max(saturation - 55, 15)}% 18%`,
      '--input': `${normalizeHue(hue + 5)} ${Math.max(saturation - 45, 20)}% 25%`,
      '--ring': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 55%`,
      '--chart-1': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 55%`,
      '--chart-2': `${normalizeHue(accentHue)} ${Math.max(saturation, 75)}% 65%`,
      '--chart-3': `${normalizeHue(hue - 15)} ${Math.max(saturation - 5, 65)}% 55%`, '--chart-4': `${normalizeHue(hue - 30)} ${Math.max(saturation, 70)}% 60%`,
      '--chart-5': `${normalizeHue(hue - 45)} ${Math.max(saturation + 5, 75)}% 65%`,
      // Sidebar colors - Dark mode
      '--sidebar-background': `${normalizeHue(hue)} ${Math.max(saturation - 20, 30)}% 12%`,
      '--sidebar-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation + 10, 60)}% 92%`,
      '--sidebar-primary': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 55%`,
      '--sidebar-primary-foreground': `${normalizeHue(hue)} ${Math.max(saturation - 20, 30)}% 8%`,
      '--sidebar-accent': `${normalizeHue(accentHue)} ${Math.max(saturation, 75)}% 25%`,
      '--sidebar-accent-foreground': `${normalizeHue(hue + 5)} ${Math.min(saturation + 10, 60)}% 92%`,
      '--sidebar-border': `${normalizeHue(hue + 5)} ${Math.max(saturation - 50, 25)}% 18%`,
      '--sidebar-ring': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 55%`,
    };
  } else {
    return {
      '--background': `${normalizeHue(hue)} ${Math.min(saturation + 25, 90)}% 96%`,
      '--foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 60, 10)}% 20%`,
      '--card': `${normalizeHue(hue)} ${Math.min(saturation + 30, 100)}% 97%`,
      '--card-foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 60, 10)}% 20%`,
      '--popover': `${normalizeHue(hue)} ${Math.min(saturation + 30, 100)}% 97%`,
      '--popover-foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 60, 10)}% 20%`,
      '--primary': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 45%`,
      '--primary-foreground': `${normalizeHue(hue)} ${Math.min(saturation + 30, 100)}% 98%`,
      '--secondary': `${normalizeHue(hue - 5)} ${Math.max(saturation - 30, 40)}% 85%`,
      '--secondary-foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 60, 10)}% 20%`,
      '--muted': `${normalizeHue(hue - 5)} ${Math.max(saturation - 40, 30)}% 88%`,
      '--muted-foreground': `${normalizeHue(hue + 10)} ${Math.max(saturation - 62, 8)}% 45%`,
      '--accent': `${normalizeHue(accentHue)} ${Math.max(saturation - 20, 50)}% 75%`,
      '--accent-foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 60, 10)}% 20%`,
      '--destructive': '0 84% 60%',
      '--destructive-foreground': `${normalizeHue(hue)} ${Math.min(saturation + 30, 100)}% 98%`, '--border': `${normalizeHue(hue - 5)} ${Math.max(saturation - 45, 20)}% 87%`,
      '--input': `${normalizeHue(hue - 5)} ${Math.max(saturation - 15, 40)}% 98%`,
      '--ring': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 45%`,
      '--chart-1': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 45%`,
      '--chart-2': `${normalizeHue(accentHue)} ${Math.max(saturation, 75)}% 55%`,
      '--chart-3': `${normalizeHue(hue - 15)} ${Math.max(saturation - 5, 65)}% 45%`, '--chart-4': `${normalizeHue(hue - 30)} ${Math.max(saturation, 70)}% 50%`,
      '--chart-5': `${normalizeHue(hue - 45)} ${Math.max(saturation + 5, 75)}% 55%`,
      // Sidebar colors - Light mode
      '--sidebar-background': `${normalizeHue(hue)} ${Math.min(saturation + 15, 85)}% 92%`,
      '--sidebar-foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 50, 25)}% 27%`,
      '--sidebar-primary': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 45%`,
      '--sidebar-primary-foreground': `${normalizeHue(hue)} ${Math.min(saturation + 30, 100)}% 98%`,
      '--sidebar-accent': `${normalizeHue(accentHue)} ${Math.max(saturation, 75)}% 82%`,
      '--sidebar-accent-foreground': `${normalizeHue(hue + 5)} ${Math.max(saturation - 50, 25)}% 27%`,
      '--sidebar-border': `${normalizeHue(hue - 5)} ${Math.max(saturation - 50, 35)}% 78%`,
      '--sidebar-ring': `${normalizeHue(primaryHue)} ${Math.min(saturation + 15, 85)}% 45%`,
    };
  }
}

export const customThemes: CustomTheme[] = [
  {
    name: 'maritime',
    label: 'Marítimo',
    description: 'Colores del océano y la vida marina',
    icon: <Waves className="h-4 w-4" />,
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    baseColors: {
      hue: 210, // Azul océano
      saturation: 70,
      primaryHue: 200, // Azul más vibrante para primary
      accentHue: 185  // Azul-verde para accent
    }
  },
  {
    name: 'forest',
    label: 'Bosque',
    description: 'Verdes naturales y tierra',
    icon: <span className="text-green-600">🌲</span>,
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #2d5016 100%)',
    baseColors: {
      hue: 120, // Verde bosque
      saturation: 60,
      primaryHue: 120, // Verde igual
      accentHue: 110  // Verde-amarillo para accent
    }
  },
  {
    name: 'sunset',
    label: 'Atardecer',
    description: 'Colores cálidos del atardecer',
    icon: <span className="text-orange-500">🌅</span>,
    backgroundImage: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    baseColors: {
      hue: 25, // Naranja atardecer
      saturation: 80,
      primaryHue: 20, // Naranja-rojo para primary
      accentHue: 40   // Naranja-amarillo para accent
    }
  }
]

export function useCustomTheme() {
  const { theme, setTheme } = useTheme()
  const [customTheme, setCustomTheme] = React.useState<string>('maritime')

  const applyCustomTheme = React.useCallback((themeName: string) => {
    if (typeof window === 'undefined') return

    const selectedTheme = customThemes.find(t => t.name === themeName)
    if (!selectedTheme) return

    setCustomTheme(themeName)

    const root = document.documentElement
    const isDark = theme === 'dark'

    // Generar colores dinámicamente basados en el tema base
    const colors = generateThemeColors(selectedTheme.baseColors, isDark)    // Aplicar colores CSS
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value as string)
    })

    // Aplicar imagen de fondo si existe
    if (selectedTheme.backgroundImage) {
      root.style.setProperty('--theme-background-image', selectedTheme.backgroundImage)
    }

    // Guardar preferencia
    localStorage.setItem('custom-theme', themeName)
  }, [theme])

  React.useEffect(() => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('custom-theme')
    if (savedTheme && customThemes.find(t => t.name === savedTheme)) {
      applyCustomTheme(savedTheme)
    } else {
      applyCustomTheme('maritime')
    }
  }, [applyCustomTheme])
  React.useEffect(() => {
    // Reaplicar tema cuando cambie entre claro/oscuro
    applyCustomTheme(customTheme)
  }, [theme, customTheme, applyCustomTheme])

  // Efecto para forzar re-aplicación inmediata de cambios
  React.useEffect(() => {
    // Forzar re-aplicación del tema actual para ver cambios inmediatamente
    if (customTheme) {
      applyCustomTheme(customTheme)
    }
  }, [])

  return {
    customTheme,
    applyCustomTheme,
    availableThemes: customThemes
  }
}

export function ThemeManager() {
  const { theme, setTheme } = useTheme()
  const { customTheme, applyCustomTheme, availableThemes } = useCustomTheme()

  // Función para forzar re-aplicación del tema actual
  const forceReapplyTheme = () => {
    applyCustomTheme(customTheme)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Selector Claro/Oscuro */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Cambiar tema</span>
      </Button>

      {/* Selector de Tema Personalizado */}
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Palette className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Seleccionar tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Temas Personalizados</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableThemes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.name}
              onClick={() => applyCustomTheme(themeOption.name)}
              className={`cursor-pointer ${customTheme === themeOption.name ? 'bg-accent' : ''
                }`}
            >
              <div className="flex items-center gap-2">
                {themeOption.icon}
                <div>
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={forceReapplyTheme}>
            <div className="text-xs text-muted-foreground">
              🔄 Aplicar cambios
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  )
}
