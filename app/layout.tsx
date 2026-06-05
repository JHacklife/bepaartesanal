import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import { WeatherProvider } from '@/components/weather-provider'
import { ThemeInitializer } from '@/components/theme-initializer'
import { ChunkReloadGuard } from '@/components/chunk-reload-guard'
import { RouteLayoutGate } from '@/components/route-layout-gate'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const siteUrl =
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  'https://bepaartesanal.infinitelabs.tech'

const siteName = 'BEPA Artesanal'
const siteDescription =
  'Bitacora electronica de pesca artesanal para pescadores individuales en Argentina. Registra capturas, ubicaciones, especies y variables ambientales de forma simple y segura.'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BEPA Artesanal',
  url: siteUrl,
  logo: `${siteUrl}/placeholder-logo.png`,
  sameAs: [
    'https://www.instagram.com/fundacionvidasilvestre/',
    'https://www.linkedin.com/company/vidasilvestre/',
    'https://www.youtube.com/user/FundVidaSilvestre',
  ],
  parentOrganization: {
    '@type': 'Organization',
    name: 'Fundacion Vida Silvestre Argentina',
    url: 'https://vidasilvestre.org.ar/',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  inLanguage: 'es-AR',
  description: siteDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/guia-especies?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteName,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: siteDescription,
  url: siteUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ARS',
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: 'BEPA Artesanal | Bitacora Electronica de Pesca Artesanal',
    template: '%s | BEPA Artesanal',
  },
  description: siteDescription,
  keywords: [
    'bepa artesanal',
    'bitacora de pesca artesanal',
    'pesca artesanal argentina',
    'registro de capturas',
    'guia de especies marinas',
    'pescadores artesanales',
    'fundacion vida silvestre',
    'trazabilidad pesquera artesanal',
    'registro de lances',
    'sustentabilidad pesquera',
  ],
  category: 'environment',
  classification: 'Pesca artesanal, registro digital, conservacion marina',
  alternates: {
    canonical: '/',
  },
  authors: [
    { name: 'Fundacion Vida Silvestre Argentina', url: 'https://vidasilvestre.org.ar/' },
    { name: 'Infinite Labs', url: 'https://infinitelabs.tech' },
  ],
  creator: 'Fundacion Vida Silvestre Argentina',
  publisher: 'Fundacion Vida Silvestre Argentina',
  generator: 'Infinite Labs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName,
    title: 'BEPA Artesanal | Bitacora Electronica para Pescadores Individuales',
    description: siteDescription,
    images: [
      {
        url: '/placeholder-logo.png',
        width: 1200,
        height: 630,
        alt: 'BEPA Artesanal - Bitacora Electronica de Pesca Artesanal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BEPA Artesanal | Bitacora Electronica de Pesca Artesanal',
    description: siteDescription,
    images: ['/placeholder-logo.png'],
    creator: '@Vida_Silvestre',
  },
  icons: {
    apple: '/favicon.ico',
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e6f4ff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1f2f' },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
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
