// =============================================
// HOOK PARA GESTIÓN DE PERMISOS EN FRONTEND
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { PermissionService, Permission } from '@/application/services/PermissionService'
import { RolUsuario } from '@/src/domain/types/RolUsuario'

interface UsePermissionsReturn {
  permissions: Permission[]
  userRole: RolUsuario | null
  loading: boolean
  error: string | null
  hasPermission: (module: string, action: string) => boolean
  hasAnyPermission: (permissions: { module: string; action: string }[]) => boolean
  hasRole: (roles: RolUsuario | RolUsuario[]) => boolean
  isAdmin: boolean
  canAccess: (resource: string) => boolean
  refreshPermissions: () => Promise<void>
}

interface UserData {
  id_usuario: number
  rol_usuario: RolUsuario
  activo: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userRole, setUserRole] = useState<RolUsuario | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const permissionService = new PermissionService()

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

  /**
   * Carga los permisos del usuario actual
   */
  const loadUserPermissions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Obtener datos del usuario
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data: userInfo, error: userError } = await supabase
        .from('usuarios')
        .select('id_usuario, rol_usuario, activo')
        .eq('id_usuario_auth', user.id)
        .single()

      if (userError || !userInfo) {
        throw new Error('Usuario no encontrado en el sistema')
      }

      setUserData(userInfo)
      setUserRole(userInfo.rol_usuario as RolUsuario)

      // Si el usuario no está activo, no cargar permisos
      if (!userInfo.activo) {
        setPermissions([])
        setError('Usuario desactivado')
        return
      }

      // Cargar permisos del usuario
      const userPermissions = await permissionService.getUserPermissions(userInfo.id_usuario)
      setPermissions(userPermissions)

    } catch (err) {
      console.error('Error cargando permisos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  /**
   * Efecto para cargar permisos cuando cambia el usuario
   */
  useEffect(() => {
    loadUserPermissions()
  }, [loadUserPermissions])

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback((module: string, action: string): boolean => {
    // Los administradores tienen todos los permisos
    if (userRole === RolUsuario.ADMINISTRADOR) {
      return true
    }

    // Usuario inactivo no tiene permisos
    if (!userData?.activo) {
      return false
    }

    return permissions.some(permission => 
      permission.modulo_permiso === module && 
      permission.accion_permiso === action &&
      permission.activo
    )
  }, [permissions, userRole, userData?.activo])

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = useCallback((requiredPermissions: { module: string; action: string }[]): boolean => {
    return requiredPermissions.some(({ module, action }) => hasPermission(module, action))
  }, [hasPermission])

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = useCallback((roles: RolUsuario | RolUsuario[]): boolean => {
    if (!userRole) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(userRole)
  }, [userRole])

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = userRole === RolUsuario.ADMINISTRADOR

  /**
   * Verifica si el usuario puede acceder a un recurso específico
   */
  const canAccess = useCallback((resource: string): boolean => {
    // Mapeo de recursos a permisos
    const resourcePermissions: Record<string, { module: string; action: string }> = {
      'users': { module: 'usuarios', action: 'ver' },
      'users.create': { module: 'usuarios', action: 'crear' },
      'users.edit': { module: 'usuarios', action: 'editar' },
      'users.delete': { module: 'usuarios', action: 'eliminar' },
      
      'risks': { module: 'riesgos', action: 'ver' },
      'risks.create': { module: 'riesgos', action: 'crear' },
      'risks.edit': { module: 'riesgos', action: 'editar' },
      'risks.delete': { module: 'riesgos', action: 'eliminar' },
      'risks.evaluate': { module: 'riesgos', action: 'evaluar' },
      
      'projects': { module: 'proyectos', action: 'ver' },
      'projects.create': { module: 'proyectos', action: 'crear' },
      'projects.edit': { module: 'proyectos', action: 'editar' },
      'projects.delete': { module: 'proyectos', action: 'eliminar' },
      
      'assets': { module: 'activos', action: 'ver' },
      'assets.create': { module: 'activos', action: 'crear' },
      'assets.edit': { module: 'activos', action: 'editar' },
      'assets.delete': { module: 'activos', action: 'eliminar' },
      'assets.classify': { module: 'activos', action: 'clasificar' },
      
      'controls': { module: 'controles', action: 'ver' },
      'controls.create': { module: 'controles', action: 'crear' },
      'controls.edit': { module: 'controles', action: 'editar' },
      'controls.delete': { module: 'controles', action: 'eliminar' },
      'controls.implement': { module: 'controles', action: 'implementar' },
      
      'incidents': { module: 'incidentes', action: 'ver' },
      'incidents.create': { module: 'incidentes', action: 'crear' },
      'incidents.edit': { module: 'incidentes', action: 'editar' },
      'incidents.delete': { module: 'incidentes', action: 'eliminar' },
      'incidents.investigate': { module: 'incidentes', action: 'investigar' },
      
      'audit': { module: 'auditoria', action: 'ver' },
      'audit.create': { module: 'auditoria', action: 'crear' },
      'audit.edit': { module: 'auditoria', action: 'editar' },
      'audit.approve': { module: 'auditoria', action: 'aprobar' },
      
      'reports': { module: 'reportes', action: 'ver' },
      'reports.export': { module: 'reportes', action: 'exportar' },
      'reports.executive': { module: 'reportes', action: 'ejecutivo' }
    }

    const permission = resourcePermissions[resource]
    if (!permission) {
      console.warn(`Recurso no definido: ${resource}`)
      return false
    }

    return hasPermission(permission.module, permission.action)
  }, [hasPermission])

  /**
   * Refresca los permisos del usuario
   */
  const refreshPermissions = useCallback(async () => {
    await loadUserPermissions()
  }, [loadUserPermissions])

  return {
    permissions,
    userRole,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAdmin,
    canAccess,
    refreshPermissions
  }
}

/**
 * Hook para verificar permisos específicos de forma reactiva
 */
export function usePermission(module: string, action: string) {
  const { hasPermission, loading } = usePermissions()
  
  return {
    allowed: hasPermission(module, action),
    loading
  }
}

/**
 * Hook para verificar roles específicos
 */
export function useRole(roles: RolUsuario | RolUsuario[]) {
  const { hasRole, userRole, loading } = usePermissions()
  
  return {
    hasRole: hasRole(roles),
    userRole,
    loading
  }
}

/**
 * Hook para verificar si es administrador
 */
export function useIsAdmin() {
  const { isAdmin, loading } = usePermissions()
  
  return {
    isAdmin,
    loading
  }
}