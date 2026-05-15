'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Waves, Fish, Anchor, Compass } from 'lucide-react'
import { ThemeManager } from '@/components/theme-manager'

export function MaritimeShowcase() {
  return (
    <div className="min-h-screen ocean-animation p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con controles de tema */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Sistema de Temas Marítimo
            </h1>
            <p className="text-muted-foreground text-lg">
              Explora diferentes paletas de colores y efectos visuales
            </p>
          </div>
          <ThemeManager />
        </div>

        {/* Grid de características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card con efecto glass */}
          <Card className="glass-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-primary" />
                Efectos Glass
              </CardTitle>
              <CardDescription>
                Transparencias y desenfoques modernos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="glass p-4 rounded-lg">
                  <p className="text-sm">Efecto glassmorphism aplicado</p>
                </div>
                <Badge variant="secondary" className="maritime-shadow">
                  Sombra marítima
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card con animaciones */}
          <Card className="card-hover wave-pattern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary float-animation" />
                Animaciones
              </CardTitle>
              <CardDescription>
                Efectos de movimiento suaves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full maritime-gradient">
                  Gradiente Marítimo
                </Button>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-primary animate-wave"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card con colores personalizados */}
          <Card className="card-hover maritime-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                Paleta de Colores
              </CardTitle>
              <CardDescription>
                Colores inspirados en el océano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-ocean-500 rounded-lg"></div>
                <div className="aspect-square bg-coral-500 rounded-lg"></div>
                <div className="aspect-square bg-seaweed-500 rounded-lg"></div>
                <div className="aspect-square bg-primary rounded-lg"></div>
                <div className="aspect-square bg-accent rounded-lg"></div>
                <div className="aspect-square bg-secondary rounded-lg"></div>
              </div>
            </CardContent>
          </Card>

          {/* Card con navegación */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Navegación
              </CardTitle>
              <CardDescription>
                Elementos de interfaz adaptados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Botón Outline
                </Button>
                <Button variant="secondary" className="w-full">
                  Botón Secondary
                </Button>
                <Button variant="destructive" className="w-full">
                  Botón Destructive
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card de información */}
          <Card className="md:col-span-2 card-hover">
            <CardHeader>
              <CardTitle>Características del Sistema</CardTitle>
              <CardDescription>
                Funcionalidades avanzadas del manejo de temas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Temas Disponibles</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Marítimo (predeterminado)</li>
                    <li>• Bosque</li>
                    <li>• Atardecer</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Efectos Visuales</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Glassmorphism</li>
                    <li>• Animaciones fluidas</li>
                    <li>• Sombras personalizadas</li>
                    <li>• Gradientes adaptativos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de demostración de colores */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Paleta de Colores Completa</CardTitle>
            <CardDescription>
              Visualización de todos los colores disponibles en el tema actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Primary', class: 'bg-primary text-primary-foreground' },
                { name: 'Secondary', class: 'bg-secondary text-secondary-foreground' },
                { name: 'Accent', class: 'bg-accent text-accent-foreground' },
                { name: 'Muted', class: 'bg-muted text-muted-foreground' },
                { name: 'Card', class: 'bg-card text-card-foreground border' },
                { name: 'Destructive', class: 'bg-destructive text-destructive-foreground' },
              ].map((color) => (
                <div key={color.name} className={`${color.class} p-4 rounded-lg text-center`}>
                  <p className="font-medium">{color.name}</p>
                  <p className="text-xs opacity-80">Color</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
