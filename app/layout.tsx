import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import { WeatherProvider } from '@/components/weather-provider'
import { ThemeInitializer } from '@/components/theme-initializer'
import { ChunkReloadGuard } from '@/components/chunk-reload-guard'
import { RouteLayoutGate } from '@/components/route-layout-gate'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'BEPA Artesanal',
  description: 'Bitácora electrónica de pesca Argenina artesanal',
  generator: 'Infinite Labs',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Prevenir flash de tema al cargar - ejecutar ANTES de cualquier estilo */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('bepa-theme');
                  const root = document.documentElement;
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }
                  // Forzar aplicación inmediata
                  if (document.readyState !== 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      if (theme === 'dark') {
                        root.classList.add('dark');
                      } else {
                        root.classList.remove('dark');
                      }
                    });
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.className} antialiased`}>
        <ChunkReloadGuard />
        <ThemeProvider>
          <WeatherProvider>
            <ThemeInitializer />
            <RouteLayoutGate>{children}</RouteLayoutGate>
            <Toaster richColors closeButton position="bottom-right" />
          </WeatherProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
