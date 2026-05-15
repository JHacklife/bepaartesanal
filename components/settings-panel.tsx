import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Shield, MapPin, Database, Bell } from "lucide-react"
import Link from "next/link"

export function SettingsPanel() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Configuración</h2>
        <p className="text-sm sm:text-base text-gray-600">Administra tu privacidad y preferencias de la aplicación</p>
      </div>

      {/* Privacy Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Privacidad y datos
          </CardTitle>
          <CardDescription className="text-sm">Controla cómo se utilizan y comparten tus datos de pesca</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">Compartir datos agregados</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Permitir el uso de datos anonimizados para investigación pesquera
              </p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>

          <Separator />

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">Acuerdo de uso de datos</h4>
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-3">
              Tus datos se conservan en el servidor hasta que elimines tu cuenta. Tus datos contribuyen a la investigación y conservación marina. Puedes revisar y modificar estos permisos en cualquier momento.
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Ver acuerdo completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Configuración de ubicación
          </CardTitle>
          <CardDescription className="text-sm">Ajustes relacionados con GPS y mapas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">GPS automático</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Capturar ubicación automáticamente al crear entradas</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">Modo offline</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Guardar datos localmente cuando no hay conexión</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Data Sync Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Sincronización
          </CardTitle>
          <CardDescription className="text-sm">Configuración de respaldo y sincronización de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">Sincronización automática</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Subir datos automáticamente cuando hay conexión</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">Solo WiFi</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Sincronizar únicamente cuando esté conectado a WiFi</p>
            </div>
            <Switch className="flex-shrink-0" />
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            Sincronizar ahora
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Notificaciones
          </CardTitle>
          <CardDescription className="text-sm">Configurar recordatorios y alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">Recordatorios diarios</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Recordar completar la bitácora al final del día</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 pr-4">
              <Label className="text-sm sm:text-base">Actualizaciones de la app</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Notificar sobre nuevas funciones y mejoras</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Perfil y datos personales</CardTitle>
          <CardDescription className="text-sm">
            La edición del perfil de pescador ahora está centralizada en Mi perfil.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Link href="/profile">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              Ir a Mi perfil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
