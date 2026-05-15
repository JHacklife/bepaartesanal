"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface DelayedComponentProps {
  /** Indica si el contenido aún está cargando */
  loading: boolean
  /** Nodo JSX a mostrar mientras loading === true (opcional) */
  skeleton?: ReactNode
  /** Alto del skeleton cuando no hay medición previa ni skeleton custom */
  skeletonHeight?: number | string
  /** Ancho del skeleton cuando no hay medición previa */
  skeletonWidth?: number | string
  /** Clase para personalizar el skeleton automático */
  skeletonClassName?: string
  /** Si es true, usa la última medida real del contenido para el skeleton */
  preserveLastSize?: boolean
  /** Contenido real a renderizar cuando loading === false */
  children: ReactNode
}

/**
 * Muestra un skeleton mientras loading es true y children cuando termina.
 *
 * Modo 1: pasas skeleton custom.
 * Modo 2: no pasas skeleton y se genera uno automático.
 *
 * Si preserveLastSize es true, el skeleton automático intenta usar
 * el último tamaño real del contenido para evitar saltos visuales.
 *
 * Nota: por defecto es false para no introducir wrappers que puedan
 * afectar el layout/padding de los componentes renderizados.
 */
export function DelayedComponent({
  loading,
  skeleton,
  skeletonHeight = 180,
  skeletonWidth,
  skeletonClassName,
  preserveLastSize = false,
  children,
}: DelayedComponentProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [lastSize, setLastSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (!preserveLastSize || loading || !contentRef.current || typeof ResizeObserver === "undefined") {
      return
    }

    const node = contentRef.current
    const observer = new ResizeObserver(() => {
      const rect = node.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setLastSize({ width: rect.width, height: rect.height })
      }
    })

    observer.observe(node)

    const rect = node.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setLastSize({ width: rect.width, height: rect.height })
    }

    return () => observer.disconnect()
  }, [loading, preserveLastSize])

  if (loading) {
    if (skeleton) {
      return <>{skeleton}</>
    }

    const style: CSSProperties = {
      width: skeletonWidth ?? (preserveLastSize ? lastSize?.width : undefined) ?? "100%",
      height: skeletonHeight ?? (preserveLastSize ? lastSize?.height : undefined) ?? 180,
    }

    return <Skeleton className={cn("rounded-md", skeletonClassName)} style={style} />
  }

  if (!preserveLastSize) {
    return <>{children}</>
  }

  return <div ref={contentRef}>{children}</div>
}
