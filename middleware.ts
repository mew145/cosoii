// =============================================
// MIDDLEWARE PRINCIPAL DE NEXT.JS
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationMiddleware, ModulePermissions, ResourceOwnerChecks } from '@/infrastructure/middleware/AuthorizationMiddleware'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/protected',
  '/dashboard',
  '/users',
  '/risks',
  '/projects',
  '/assets',
  '/controls',
  '/incidents',
  '/audit',
  '/reports'
]

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/callback',
  '/api/auth'
]

// Configuración de permisos por ruta
const routePermissions = {
  // Rutas de usuarios
  '/users': ModulePermissions.USERS.VIEW,
  '/api/users': ModulePermissions.USERS.VIEW,

  // Rutas de riesgos
  '/risks': ModulePermissions.RISKS.VIEW,
  '/api/risks': ModulePermissions.RISKS.VIEW,

  // Rutas de proyectos
  '/projects': ModulePermissions.PROJECTS.VIEW,
  '/api/projects': ModulePermissions.PROJECTS.VIEW,

  // Rutas de activos ISO 27001
  '/assets': ModulePermissions.ASSETS.VIEW,
  '/api/assets': ModulePermissions.ASSETS.VIEW,

  // Rutas de controles ISO 27001
  '/controls': ModulePermissions.CONTROLS.VIEW,
  '/api/controls': ModulePermissions.CONTROLS.VIEW,

  // Rutas de incidentes
  '/incidents': ModulePermissions.INCIDENTS.VIEW,
  '/api/incidents': ModulePermissions.INCIDENTS.VIEW,

  // Rutas de auditoría
  '/audit': ModulePermissions.AUDIT.VIEW,
  '/api/audit': ModulePermissions.AUDIT.VIEW,

  // Rutas de reportes
  '/reports': ModulePermissions.REPORTS.VIEW,
  '/api/reports': ModulePermissions.REPORTS.VIEW
}

// Configuración de verificación de propiedad por ruta
const ownershipChecks = {
  '/api/risks/': ResourceOwnerChecks.riskOwner,
  '/api/projects/': ResourceOwnerChecks.projectManager,
  '/api/assets/': ResourceOwnerChecks.assetOwner,
  '/api/controls/': ResourceOwnerChecks.controlResponsible,
  '/api/incidents/': ResourceOwnerChecks.incidentInvolved
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar autenticación básica para rutas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const authResponse = await checkBasicAuth(request)
    if (authResponse) {
      return authResponse
    }
  }

  // Verificar permisos específicos para rutas de API y páginas
  const permissionResponse = await checkRoutePermissions(request)
  if (permissionResponse) {
    return permissionResponse
  }

  return NextResponse.next()
}

/**
 * Verifica autenticación básica
 */
async function checkBasicAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const response = NextResponse.next()
    const supabase = createServerClient(request, response)

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return null
  } catch (error) {
    console.error('Error en verificación de autenticación:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

/**
 * Verifica permisos específicos por ruta
 */
async function checkRoutePermissions(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  // Buscar configuración de permisos para la ruta
  let permissionConfig = null
  let ownershipCheck = null

  // Verificar rutas exactas
  for (const [route, config] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      permissionConfig = config
      break
    }
  }

  // Verificar verificaciones de propiedad
  for (const [route, check] of Object.entries(ownershipChecks)) {
    if (pathname.startsWith(route)) {
      ownershipCheck = check
      break
    }
  }

  // Si no hay configuración específica, permitir acceso
  if (!permissionConfig) {
    return null
  }

  // Agregar verificación de propiedad si aplica
  if (ownershipCheck) {
    permissionConfig = {
      ...permissionConfig,
      resourceOwnerCheck: ownershipCheck
    }
  }

  // Verificar permisos usando el middleware de autorización
  const authMiddleware = new AuthorizationMiddleware()
  const result = await authMiddleware.checkPermission(request, permissionConfig)

  return result.authorized ? null : result.response || null
}

/**
 * Crea cliente de Supabase para el servidor
 */
function createServerClient(request: NextRequest, response: NextResponse) {
  const { createServerClient } = require('@supabase/ssr')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}

// Configuración del matcher para optimizar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}