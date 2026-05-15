const PUBLIC_ROUTE_PREFIXES = ["/auth"]

const PUBLIC_EXACT_PATHS = ["/"]

const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/nueva-entrada",
  "/mis-datos",
  "/guia-especies",
  "/profile",
  "/themes",
  "/settings",
  "/feedback",
]

export function isPublicRoute(pathname: string) {
  return (
    PUBLIC_EXACT_PATHS.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}

export function isPrivateRoute(pathname: string) {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export const routeAccess = {
  publicExactPaths: PUBLIC_EXACT_PATHS,
  publicRoutePrefixes: PUBLIC_ROUTE_PREFIXES,
  privateRoutePrefixes: PRIVATE_ROUTE_PREFIXES,
}
