"use client"

import { useRef, type ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Upload, X, Plus, Fish, Loader2, CheckCircle2 } from "lucide-react"
import { useApiError } from "@/hooks/use-api-error"
import { toast } from "sonner"
import { addSpeciesSchema, type AddSpeciesFormValues } from "@/lib/validations/species"

interface AddSpeciesFormProps {
  onClose: () => void
  onSaved: () => void
}

const FILE_SENTINEL = "__file__"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const textToArray = (text = ""): string[] =>
  text.split("\n").map((l) => l.trim()).filter(Boolean)

const csvToArray = (text = ""): string[] =>
  text.split(",").map((l) => l.trim()).filter(Boolean)

export function AddSpeciesForm({ onClose, onSaved }: AddSpeciesFormProps) {
  const { handleApiError } = useApiError()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // imageFile vive fuera de react-hook-form porque File no es serializable por Yup
  const imageFileRef = useRef<File | null>(null)
  const imagePreviewRef = useRef<string>("")

  const form = useForm<AddSpeciesFormValues>({
    resolver: yupResolver(addSpeciesSchema),
    mode: "onChange",
    defaultValues: {
      commonName: "",
      scientificName: "",
      category: undefined,
      commercialValue: "media",
      description: "",
      physicalChars: "",
      habitatText: "",
      regionText: "",
      identificationNotes: "",
      keyDifferences: "",
      similarSpeciesText: "",
      averageSize: "",
      averageWeight: "",
      minSize: "",
      seasonText: "",
      fishingMethodText: "",
      imageSource: "",
    },
  })

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = form

  const imageSource = watch("imageSource")
  const habitatText = watch("habitatText") ?? ""
  const regionText = watch("regionText") ?? ""

  // ── Image handlers ──────────────────────────────────────────────────────────
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipo de archivo no permitido", { description: "Solo se permiten JPEG, PNG y WebP." })
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Archivo muy grande", { description: "El tamaño máximo es 5 MB." })
      return
    }

    imageFileRef.current = file
    const reader = new FileReader()
    reader.onload = () => {
      imagePreviewRef.current = reader.result as string
      setValue("imageSource", FILE_SENTINEL, { shouldValidate: true })
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    imageFileRef.current = null
    imagePreviewRef.current = ""
    setValue("imageSource", "", { shouldValidate: true })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const previewSrc =
    imageSource === FILE_SENTINEL ? imagePreviewRef.current : imageSource || ""

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (values: AddSpeciesFormValues) => {
    const formData = new FormData()

    if (imageFileRef.current) {
      formData.append("image", imageFileRef.current)
    } else {
      formData.append("imageUrl", values.imageSource)
    }

    formData.append("commonName", values.commonName)
    formData.append("scientificName", values.scientificName)
    formData.append("category", values.category)
    formData.append("commercialValue", values.commercialValue ?? "media")
    formData.append("description", values.description)
    if (values.averageSize) formData.append("averageSize", values.averageSize)
    if (values.averageWeight) formData.append("averageWeight", values.averageWeight)
    if (values.minSize) formData.append("minSize", values.minSize)

    const keyDiffs = [
      ...textToArray(values.physicalChars ?? ""),
      ...textToArray(values.keyDifferences ?? ""),
    ]

    formData.append("habitat", JSON.stringify(csvToArray(values.habitatText)))
    formData.append("region", JSON.stringify(csvToArray(values.regionText)))
    formData.append("identificationTips", JSON.stringify(textToArray(values.identificationNotes)))
    formData.append("keyDifferences", JSON.stringify(keyDiffs))
    formData.append("season", JSON.stringify(csvToArray(values.seasonText ?? "")))
    formData.append("fishingMethod", JSON.stringify(csvToArray(values.fishingMethodText ?? "")))
    formData.append("similarSpecies", JSON.stringify(csvToArray(values.similarSpeciesText ?? "")))

    try {
      const res = await fetch("/api/species", { method: "POST", body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw body
      }
      toast.success("Especie guardada", {
        description: `"${values.commonName}" fue agregada al catálogo.`,
      })
      setTimeout(() => onSaved(), 900)
    } catch (err) {
      handleApiError(err, "Error al guardar la especie")
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Sugerir especie</h3>
          <p className="text-sm text-muted-foreground">Completa la ficha para agregar la especie al catálogo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna izquierda ──────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Imagen */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Imagen de referencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative w-full aspect-square rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                  {previewSrc ? (
                    <>
                      <img src={previewSrc} alt="Preview" className="w-full h-full object-cover"
                        onError={() => setValue("imageSource", "", { shouldValidate: true })} />
                      <button type="button" onClick={clearImage}
                        className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Fish className="w-12 h-12 opacity-30" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleFileChange} />

                <Button type="button" variant="outline" className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!(imageSource && imageSource !== FILE_SENTINEL)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir imagen
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">o pegar URL</span>
                  </div>
                </div>

                <FormField
                  control={control}
                  name="imageSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          value={field.value === FILE_SENTINEL ? "" : field.value}
                          onChange={(e) => { clearImage(); field.onChange(e.target.value) }}
                          disabled={field.value === FILE_SENTINEL}
                          className="themed-input text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Clasificación */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Clasificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField control={control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Categoría <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger className="themed-input"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pez">Pez</SelectItem>
                        <SelectItem value="molusco">Molusco</SelectItem>
                        <SelectItem value="crustaceo">Crustáceo</SelectItem>
                        <SelectItem value="equinodermo">Equinodermo</SelectItem>
                        <SelectItem value="alga">Alga</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={control} name="commercialValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Valor comercial</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "media"}>
                      <FormControl>
                        <SelectTrigger className="themed-input"><SelectValue placeholder="Seleccionar valor" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="alta">Alto</SelectItem>
                        <SelectItem value="media">Medio</SelectItem>
                        <SelectItem value="baja">Bajo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Biométricos */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Datos biométricos</CardTitle>
                <CardDescription className="text-xs">Opcionales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField control={control} name="averageSize" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Talla promedio</FormLabel>
                    <FormControl><Input placeholder="Ej: 30–45 cm" {...field} className="themed-input text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="averageWeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Peso promedio</FormLabel>
                    <FormControl><Input placeholder="Ej: 0.5–2 kg" {...field} className="themed-input text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="minSize" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Talla mínima legal</FormLabel>
                    <FormControl><Input placeholder="Ej: 25 cm" {...field} className="themed-input text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Pesca */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pesca</CardTitle>
                <CardDescription className="text-xs">Separar con comas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField control={control} name="seasonText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Temporadas</FormLabel>
                    <FormControl><Input placeholder="Ej: Primavera, Verano" {...field} className="themed-input text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="fishingMethodText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Artes de pesca</FormLabel>
                    <FormControl><Input placeholder="Ej: Buceo, Palangre" {...field} className="themed-input text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* ── Columna derecha ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Nombres */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Identificación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={control} name="commonName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nombre común <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Ej: Merluza común" {...field} className="themed-input" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={control} name="scientificName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nombre científico <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Ej: Merluccius hubbsi" {...field} className="themed-input italic" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* Descripción */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Descripción general <span className="text-destructive">*</span></CardTitle>
                <CardDescription className="text-xs">Breve presentación de la especie</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Describe la especie, su importancia ecológica y comercial..."
                        {...field} rows={4} className="themed-input resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Características físicas */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Características físicas</CardTitle>
                <CardDescription className="text-xs">Una característica por línea</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={control} name="physicalChars" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={"Cuerpo fusiforme, alargado\nColoración plateada con reflejos azulados\nAleta caudal bifurcada"}
                        {...field} rows={4} className="themed-input resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Hábitat y distribución */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Hábitat y distribución <span className="text-destructive">*</span></CardTitle>
                <CardDescription className="text-xs">Separar con comas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField control={control} name="habitatText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tipo de hábitat</FormLabel>
                    <FormControl><Input placeholder="Ej: Pelágico, Demersal, Costero" {...field} className="themed-input" /></FormControl>
                    {habitatText && (
                      <div className="flex flex-wrap gap-1">
                        {csvToArray(habitatText).map((h, i) => <Badge key={i} variant="outline" className="text-xs">{h}</Badge>)}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="regionText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Regiones / zonas de distribución</FormLabel>
                    <FormControl><Input placeholder="Ej: Golfo San Jorge, Golfo Nuevo, Patagonia" {...field} className="themed-input" /></FormControl>
                    {regionText && (
                      <div className="flex flex-wrap gap-1">
                        {csvToArray(regionText).map((r, i) => <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>)}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Notas de identificación */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Notas para guía de identificación <span className="text-destructive">*</span></CardTitle>
                <CardDescription className="text-xs">Una nota por línea — aparecerán como lista en la ficha</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={control} name="identificationNotes" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={"Observar la boca con dientes pequeños y afilados\nComparar con Merluccius australis por la coloración\nLa línea lateral es continua hasta la aleta caudal"}
                        {...field} rows={5} className="themed-input resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Diferencias clave */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Diferencias clave con especies similares</CardTitle>
                <CardDescription className="text-xs">Opcionales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField control={control} name="keyDifferences" render={({ field }) => (
                  <FormItem>
                    <FormDescription className="text-xs">Una diferencia por línea</FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder={"A diferencia de M. australis, esta especie tiene aleta dorsal más corta\nLa pigmentación del peritoneo es gris oscuro, no negro"}
                        {...field} rows={3} className="themed-input resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="similarSpeciesText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Especies similares (separar con comas)</FormLabel>
                    <FormControl><Input placeholder="Ej: Merluza austral, Merluza de cola" {...field} className="themed-input" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isSubmitSuccessful} className="min-w-36">
            {isSubmitSuccessful ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" />Guardado</>
            ) : isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando…</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" />Agregar especie</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
