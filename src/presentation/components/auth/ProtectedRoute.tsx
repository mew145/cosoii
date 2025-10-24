// =============================================
// COMPONENTE DE PROTECCIÓN DE RUTAS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { usePermissions } from '@/presentation/hooks/usePermissions'
import { RolUsuario } from '@/src/domain/types/RolUsuario'
import { Card, CardContent } from '@/components/ui/card'
// Simple Alert component inline
const Alert = ({ children, className = "", variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
  <div className={`border border-red-200 bg-red-50 p-4 rounded-md ${className}`}>
    {children}
  </div>
)

const AlertDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm text-red-700 ${className || ''}`}>{children}</div>
)
import { Button } from '@/components/ui/button'
import { Loader2, Shield, AlertTriangle, ArrowLeft } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: {
    module: string
    action: string
  }[]
  requiredRoles?: RolUsuario[]
  requireAnyPermission?: boolean // Si true, requiere al menos uno de los permisos
  fallback?: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAnyPermission = false,
  fallback,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasRole, 
    userRole, 
    loading, 
    error 
  } = usePermissions()

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Mostrar loading mientras se cargan los permisos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Verificando permisos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error al verificar permisos: {error}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirigir si no está autenticado
  if (!user) {
    return null // El useEffect se encarga de la redirección
  }

  // Verificar roles requeridos
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return fallback || (
      <AccessDenied 
        reason="Rol insuficiente"
        details={`Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`}
        currentRole={userRole}
      />
    )
  }

  // Verificar permisos requeridos
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAnyPermission
      ? hasAnyPermission(requiredPermissions)
      : requiredPermissions.every(({ module, action }) => hasPermission(module, action))

    if (!hasRequiredPermissions) {
      return fallback || (
        <AccessDenied 
          reason="Permisos insuficientes"
          details={`Se requiere${requireAnyPermission ? ' al menos uno de' : 'n'} los siguientes permisos: ${
            requiredPermissions.map(p => `${p.module}:${p.action}`).join(', ')
          }`}
          currentRole={userRole}
        />
      )
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>
}

/**
 * Componente para mostrar cuando se deniega el acceso
 */
function AccessDenied({ 
  reason, 
  details, 
  currentRole 
}: { 
  reason: string
  details: string
  currentRole: RolUsuario | null 
}) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-destructive/10 p-3">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acceso Denegado
          </h1>
          
          <p className="text-muted-foreground mb-4">
            {reason}
          </p>
          
          <Alert className="mb-6 text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Detalles:</strong> {details}
              {currentRole && (
                <>
                  <br />
                  <strong>Tu rol actual:</strong> {currentRole}
                </>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * HOC para proteger componentes con permisos específicos
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: { module: string; action: string }[],
  requiredRoles?: RolUsuario[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute 
        requiredPermissions={requiredPermissions}
        requiredRoles={requiredRoles}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 */
interface ConditionalRenderProps {
  children: ReactNode
  permission?: { module: string; action: string }
  permissions?: { module: string; action: string }[]
  roles?: RolUsuario[]
  requireAnyPermission?: boolean
  fallback?: ReactNode
  showFallback?: boolean
}

export function ConditionalRender({
  children,
  permission,
  permissions = [],
  roles = [],
  requireAnyPermission = false,
  fallback = null,
  showFallback = false
}: ConditionalRenderProps) {
  const { hasPermission, hasAnyPermission, hasRole, loading } = usePermissions()

  // Mostrar loading si está cargando
  if (loading) {
    return showFallback ? fallback : null
  }

  // Construir array de permisos
  const allPermissions = permission ? [permission, ...permissions] : permissions

  // Verificar roles
  if (roles.length > 0 && !hasRole(roles)) {
    return showFallback ? fallback : null
  }

  // Verificar permisos
  if (allPermissions.length > 0) {
    const hasRequiredPermissions = requireAnyPermission
      ? hasAnyPermission(allPermissions)
      : allPermissions.every(({ module, action }) => hasPermission(module, action))

    if (!hasRequiredPermissions) {
      return showFallback ? fallback : null
    }
  }

  return <>{children}</>
}