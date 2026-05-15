"use client"

import { usePathname } from "next/navigation"
import AppLayout from "@/app/app-layout"
import { isPrivateRoute } from "@/lib/route-access"

type RouteLayoutGateProps = {
  children: React.ReactNode
}

export function RouteLayoutGate({ children }: RouteLayoutGateProps) {
  const pathname = usePathname()
  const privateRoute = isPrivateRoute(pathname)

  if (privateRoute) {
    return <AppLayout>{children}</AppLayout>
  }

  return <>{children}</>
}
