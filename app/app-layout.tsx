"use client"

import { useEffect, useState, useTransition } from "react"
import { Fish, BarChart3, Settings, FileText, MessageSquare, Plus, BookOpen, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DelayedComponent } from "@/components/ui/delayed-component";
import { ThemeManager } from "@/components/theme-manager";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState<string>("Usuario")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [loadingSession, setLoadingSession] = useState(true)
  const [isSigningOut, startSignOutTransition] = useTransition()

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
        })
        const data = response.ok ? await response.json() : null
        window.location.assign(data?.redirectUrl || "/auth/signin")
      } catch {
        window.location.assign("/auth/signin")
      }
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const loadProfileName = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        })

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          const sessionName = sessionData?.user?.name
          const sessionEmail = sessionData?.user?.email
          const sessionImage = sessionData?.user?.image
          if (typeof sessionName === "string" && sessionName.trim().length > 0) {
            setDisplayName(sessionName.trim())
          } else if (typeof sessionEmail === "string" && sessionEmail.includes("@")) {
            setDisplayName(sessionEmail.split("@")[0])
          }
          if (typeof sessionImage === "string" && sessionImage.trim().length > 0) {
            setAvatarUrl(sessionImage)
          }
        }

        const res = await fetch("/api/profile", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        })
        if (!res.ok) return

        const data = await res.json()
        const name = data?.profile?.name
        const image = data?.profile?.image
        if (typeof name === "string" && name.trim().length > 0) {
          setDisplayName(name.trim())
        }
        if (typeof image === "string" && image.trim().length > 0) {
          setAvatarUrl(image)
        }
      } catch {
        // Si falla, mantenemos un fallback neutro en el header.
      } finally {
        if (isMounted) {
          setLoadingSession(false)
        }
      }
    }

    loadProfileName()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  // Sidebar y header siempre presentes
  return (
    <div className="min-h-screen ocean-animation">
      {/* Header Superior */}
      <header className="glass-card px-3 sm:px-6 py-3 sm:py-4 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-base sm:text-lg">BEPA</h1>
              <p className="text-xs text-muted-foreground">Bitácora electrónica de pesca Argentina artesanal</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <DelayedComponent
              loading={loadingSession}
              skeleton={
                <div className="hidden md:flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-1.5">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              }
            >
              <div className="hidden md:flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-1.5">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="max-w-[220px]">
                  <p className="text-xs text-muted-foreground leading-none">Sesion activa</p>
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                </div>
              </div>
            </DelayedComponent>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Puerto Madryn
            </Badge>

            <div className="flex gap-1 sm:gap-2">
              <Link href="/nueva-entrada">
                <Button className="h-9 px-3 maritime-shadow bg-primary text-primary-foreground hover:opacity-95" title="Registrar una nueva entrada">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nueva entrada</span>
                </Button>
              </Link>
              <ThemeManager />
              {/* <Link href="/themes">
                <Button variant="outline" size="icon" title="Ver temas">
                  <Palette className="h-4 w-4" />
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] relative">
        {/* Sidebar */}
        <aside className="fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-border mt-[64px] sm:mt-[80px] lg:mt-0 h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] lg:h-auto flex flex-col">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link href="/mis-datos">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-3" />
                Mis datos
              </Button>
            </Link>
            <Link href="/guia-especies">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-3" />
                Guía de especies
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-3" />
                Mi Perfil
              </Button>
            </Link>
          </nav>
          <div className="p-4 space-y-2 border-t border-border mt-auto">
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-3" />
                Configuración
              </Button>
            </Link>
            <Link href="/feedback">
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-3" />
                Comentarios
              </Button>
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
            </Button>
          </div>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden lg:ml-0">
          <div className="p-3 sm:p-6 h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
