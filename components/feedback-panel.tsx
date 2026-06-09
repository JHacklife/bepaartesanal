"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useApiError } from "@/hooks/use-api-error"
import { toast } from "sonner"
import { MessageSquare, Send, Star, CheckCircle, RefreshCw } from "lucide-react"

type FeedbackType = "bug" | "feature" | "improvement" | "general"

type FeedbackItem = {
  id: string
  type: FeedbackType
  message: string
  status: string
  response?: string | null
  createdAt: string
}

const typeLabels: Record<FeedbackType, string> = {
  bug: "Error",
  feature: "Función",
  improvement: "Mejora",
  general: "General",
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("es-AR")
}

export function FeedbackPanel() {
  const { handleApiError } = useApiError()
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [type, setType] = useState<FeedbackType | "">("")
  const [message, setMessage] = useState("")

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/feedback", { cache: "no-store" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw payload
      }

      const payload = (await response.json()) as { items?: FeedbackItem[] }
      setItems(Array.isArray(payload.items) ? payload.items : [])
    } catch (error) {
      handleApiError(error, "Error al cargar comentarios", "No se pudo cargar tu historial de comentarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canSend = useMemo(() => {
    return type.length > 0 && message.trim().length >= 10 && !sending
  }, [message, sending, type])

  const handleSubmit = async () => {
    if (!type) {
      toast.error("Falta el tipo", { description: "Selecciona el tipo de comentario." })
      return
    }

    const normalizedMessage = message.trim()
    if (normalizedMessage.length < 10) {
      toast.error("Mensaje muy corto", { description: "Escribe al menos 10 caracteres." })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: normalizedMessage }),
      })

      const payload = (await response.json()) as {
        message?: string
        item?: FeedbackItem
        title?: string
      }

      if (!response.ok) {
        throw payload
      }

      if (payload.item) {
        setItems((prev) => [payload.item as FeedbackItem, ...prev])
      } else {
        await loadFeedback()
      }

      setType("")
      setMessage("")

      toast.success("Comentario enviado", {
        description: "Tu comentario fue guardado correctamente.",
      })
    } catch (error) {
      handleApiError(error, "Error al enviar comentario", "No se pudo enviar tu comentario")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Comentarios y sugerencias</h2>
        <p className="text-sm sm:text-base text-gray-600">Tu opinión nos ayuda a mejorar BEPA continuamente</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Enviar comentario
          </CardTitle>
          <CardDescription className="text-sm">Comparte tu experiencia, reporta errores o sugiere mejoras</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div>
            <Label htmlFor="feedback-type" className="text-sm sm:text-base">Tipo de comentario</Label>
            <Select value={type} onValueChange={(value) => setType(value as FeedbackType)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Reporte de error</SelectItem>
                <SelectItem value="feature">Solicitud de función</SelectItem>
                <SelectItem value="improvement">Mejora</SelectItem>
                <SelectItem value="general">Comentario general</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback-message" className="text-sm sm:text-base">Tu mensaje</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe tu experiencia, problema o sugerencia en detalle..."
              className="min-h-24 sm:min-h-32 mt-2 text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button className="w-full sm:w-auto" disabled={!canSend} onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Enviando..." : "Enviar comentario"}
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">Responderemos en 2-3 días hábiles</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">Historial de comentarios</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                {items.length} comentarios enviados
              </Badge>
              <Button variant="outline" size="sm" onClick={loadFeedback} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm">Seguimiento de tus comentarios y nuestras respuestas</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no enviaste comentarios.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {items.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">{typeLabels[feedback.type] || feedback.type}</Badge>
                      <span className="text-xs sm:text-sm text-gray-500">{formatDate(feedback.createdAt)}</span>
                    </div>
                    <Badge
                      variant={
                        feedback.status === "Resuelto"
                          ? "secondary"
                          : feedback.status === "Planificado"
                            ? "default"
                            : "destructive"
                      }
                      className={
                        feedback.status === "Resuelto"
                          ? "bg-green-100 text-green-800 text-xs"
                          : feedback.status === "Planificado"
                            ? "bg-blue-100 text-blue-800 text-xs"
                            : "text-xs"
                      }
                    >
                      {feedback.status === "Resuelto" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {feedback.status}
                    </Badge>
                  </div>

                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.message}</p>

                  {feedback.response && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Respuesta del equipo:</p>
                      <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">{feedback.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Proyecto piloto
          </CardTitle>
          <CardDescription className="text-sm">
            Información sobre el programa piloto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2 text-sm sm:text-base">¡Eres parte del piloto!</h4>
            <p className="text-xs sm:text-sm text-yellow-800 mb-3 leading-relaxed">
              Tu participación es fundamental para validar y mejorar BEPA. Tus comentarios tienen prioridad y ayudan a
              definir el futuro de la aplicación.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-medium">Zona piloto:</span>
                <p className="text-gray-700">Península Valdés</p>
              </div>
              <div>
                <span className="font-medium">Duración:</span>
                <p className="text-gray-700">6 meses (Ene-Jun 2024)</p>
              </div>
              <div>
                <span className="font-medium">Participantes:</span>
                <p className="text-gray-700">25 pescadores</p>
              </div>
              <div>
                <span className="font-medium">Objetivo:</span>
                <p className="text-gray-700">Validar funcionalidades</p>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base">
            Ver cronograma del piloto
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
