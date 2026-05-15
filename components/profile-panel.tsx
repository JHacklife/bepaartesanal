"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useApiError } from "@/hooks/use-api-error"
import { toast } from "sonner"
import { Camera, Award, Fish, Waves, Trophy, AlertTriangle, RefreshCw } from "lucide-react"
import type { EarnedBadge } from "@/lib/config/badges"

interface UserProfile {
  id: string
  name?: string
  email: string
  phoneNumber?: string
  fishingZone?: string
  yearsOfExperience?: number
  boatName?: string
  documentId?: string
  bio?: string
  profileImage?: string
  isProfilePublic?: boolean
  badges?: EarnedBadge[]
  totalEntries?: number
  totalCatchWeight?: number
  favoriteSpecies?: string
}

export function ProfilePanel() {
  const { handleApiError } = useApiError()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [profileLoadIssue, setProfileLoadIssue] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    fishingZone: "",
    yearsOfExperience: "",
    boatName: "",
    documentId: "",
    bio: "",
    isProfilePublic: true,
  })

  const fetchProfile = async () => {
    setLoading(true)
    setProfileLoadIssue(null)

    try {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Error al cargar perfil")
      const { profile } = await response.json()
      setProfile(profile)
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        fishingZone: profile.fishingZone || "",
        yearsOfExperience: profile.yearsOfExperience?.toString() || "",
        boatName: profile.boatName || "",
        documentId: profile.documentId || "",
        bio: profile.bio || "",
        isProfilePublic: profile.isProfilePublic ?? true,
      })
    } catch (error) {
      const offlineNow = typeof navigator !== "undefined" ? !navigator.onLine : false
      const issueMessage = offlineNow
        ? "No hay conexión a internet. No se pudo cargar tu perfil."
        : "No pudimos cargar tu perfil en este momento."

      setProfileLoadIssue(issueMessage)
      handleApiError(error, "Error al cargar perfil", `${issueMessage} Revisa tu conexión y vuelve a intentar.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const syncOnlineState = () => {
      if (typeof navigator !== "undefined") {
        setIsOffline(!navigator.onLine)
      }
    }

    syncOnlineState()
    window.addEventListener("online", syncOnlineState)
    window.addEventListener("offline", syncOnlineState)

    return () => {
      window.removeEventListener("online", syncOnlineState)
      window.removeEventListener("offline", syncOnlineState)
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? (value ? parseInt(value) : "") : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleApiError(
        new Error("offline"),
        "Sin conexión",
        "No tienes internet. Verifica tu conexión para subir la foto de perfil."
      )
      return
    }

    setUploadingPhoto(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const response = await fetch("/api/upload-profile-photo", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al subir la foto")
      }

      const { url } = await response.json()
      setProfile(prev => prev ? { ...prev, profileImage: url } : null)
      toast.success("Foto de perfil actualizada")
    } catch (error) {
      handleApiError(error, "Error", "No se pudo subir la foto de perfil")
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSave = async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleApiError(
        new Error("offline"),
        "Sin conexión",
        "No tienes internet. Verifica tu conexión para guardar los cambios del perfil."
      )
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al guardar perfil")

      const { profile } = await response.json()
      setProfile(profile)
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      handleApiError(error, "Error", "No se pudo actualizar tu perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando perfil...</div>
  }

  if (!profile) {
    return (
      <Card className="glass-card border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            No se pudo cargar el perfil
          </CardTitle>
          <CardDescription>
            {profileLoadIssue || "Hubo un problema al obtener tu información."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Posibles causas:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sin conexión a internet.</li>
            <li>Servidor temporalmente no disponible.</li>
            <li>Sesión expirada o no autorizada.</li>
          </ul>
          <Button onClick={fetchProfile} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const initials = (profile.name || "U").split(" ").map(n => n[0]).join("").toUpperCase()
  const badges = (profile.badges || []) as EarnedBadge[]

  return (
    <div className="space-y-6">
      {isOffline && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
          <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
            Estás sin conexión. Podrás ver la página, pero las acciones de guardar o subir foto pueden fallar hasta recuperar internet.
          </CardContent>
        </Card>
      )}

      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mi Perfil</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Administra tu información personal y ve tus logros
        </p>
      </div>

      {/* Foto de perfil y info básica */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative group">
            <Avatar className="w-24 h-24 cursor-pointer">
              <AvatarImage src={profile.profileImage} alt={profile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handlePhotoClick}
              disabled={uploadingPhoto}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              PNG, JPEG, WebP o GIF. Máximo 5MB.
            </p>
            <Button onClick={handlePhotoClick} disabled={uploadingPhoto} variant="outline">
              {uploadingPhoto ? "Subiendo..." : "Cambiar foto"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información personal */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Información personal</CardTitle>
          <CardDescription>Actualiza tus datos de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+54 9 XXXX XXXXXX"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <h3 className="text-sm font-semibold text-foreground">Perfil de pescador</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Completa esta sección para mejorar tus estadísticas y la trazabilidad de tus registros.
              </p>
            </div>
            <div>
              <Label htmlFor="fishingZone">Zona principal de pesca</Label>
              <Select value={formData.fishingZone} onValueChange={(value) => handleSelectChange("fishingZone", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peninsula-valdes">Península Valdés</SelectItem>
                  <SelectItem value="comodoro-rivadavia">Comodoro Rivadavia</SelectItem>
                  <SelectItem value="golfo-san-jorge">Golfo San Jorge</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yearsOfExperience">Años de experiencia</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                max="80"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="boatName">Nombre de la embarcación</Label>
              <Input
                id="boatName"
                name="boatName"
                value={formData.boatName}
                onChange={handleInputChange}
                placeholder="Ej: Mar del Sur"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="documentId">Cédula/DNI</Label>
              <Input
                id="documentId"
                name="documentId"
                value={formData.documentId}
                onChange={handleInputChange}
                placeholder="XX.XXX.XXX"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Cuéntanos sobre ti y tu experiencia de pesca..."
              className="mt-1 min-h-24"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas</CardTitle>
          <CardDescription>Tu actividad en la bitácora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Fish className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entradas registradas</p>
                <p className="text-2xl font-bold">{profile.totalEntries || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Waves className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peso total capturado</p>
                <p className="text-2xl font-bold">{profile.totalCatchWeight?.toFixed(1) || 0} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Especie favorita</p>
                <p className="text-xl font-bold truncate">{profile.favoriteSpecies || "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insignias */}
      {badges.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5" />
              Insignias ({badges.length})
            </CardTitle>
            <CardDescription>Logros y reconocimientos desbloqueados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="text-4xl">{badge.icon}</div>
                  <h4 className="text-xs font-semibold text-center line-clamp-2">{badge.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
