// =============================================
// SERVICIO DE GESTIÓN DE PERMISOS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@/domain/types/RolUsuario'

export interface Permission {
  id_permiso: number
  nombre_permiso: string
  descripcion_permiso: string
  modulo_permiso: string
  accion_permiso: string
  activo: boolean
}

export interface UserPermission {
  id_usuario: number
  id_permiso: number
  activo: boolean
  fecha_asignacion: Date
  asignado_por: number
}

export interface RolePermissions {
  rol: RolUsuario
  permisos: Permission[]
}

export class PermissionService {
  private supabase = createClient()

  /**
   * Obtiene todos los permisos disponibles en el sistema
   */
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('permisos')
      .select('*')
      .eq('activo', true)
      .order('modulo_permiso, accion_permiso')

    if (error) {
      throw new Error(`Error obteniendo permisos: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtiene permisos por módulo
   */
  async getPermissionsByModule(module: string): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('permisos')
      .select('*')
      .eq('modulo_permiso', module)
      .eq('activo', true)
      .order('accion_permiso')

    if (error) {
      throw new Error(`Error obteniendo permisos del módulo ${module}: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtiene permisos de un usuario específico
   */
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('permisos_usuario')
      .select(`
        permisos (
          id_permiso,
          nombre_permiso,
          descripcion_permiso,
          modulo_permiso,
          accion_permiso,
          activo
        )
      `)
      .eq('id_usuario', userId)
      .eq('activo', true)

    if (error) {
      throw new Error(`Error obteniendo permisos del usuario: ${error.message}`)
    }

    return data?.flatMap(item => item.permisos).filter(Boolean) || []
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(userId: number, module: string, action: string): Promise<boolean> {
    // Los administradores tienen todos los permisos
    const user = await this.getUserRole(userId)
    if (user === RolUsuario.ADMINISTRADOR) {
      return true
    }

    const { data, error } = await this.supabase
      .from('permisos_usuario')
      .select(`
        permisos!inner (
          modulo_permiso,
          accion_permiso
        )
      `)
      .eq('id_usuario', userId)
      .eq('activo', true)
      .eq('permisos.modulo_permiso', module)
      .eq('permisos.accion_permiso', action)

    if (error) {
      console.error('Error verificando permiso:', error)
      return false
    }

    return (data?.length || 0) > 0
  }

  /**
   * Asigna un permiso a un usuario
   */
  async assignPermission(
    userId: number, 
    permissionId: number, 
    assignedBy: number
  ): Promise<void> {
    // Verificar si ya tiene el permiso
    const { data: existing } = await this.supabase
      .from('permisos_usuario')
      .select('id_usuario')
      .eq('id_usuario', userId)
      .eq('id_permiso', permissionId)
      .single()

    if (existing) {
      // Reactivar si existe pero está inactivo
      const { error } = await this.supabase
        .from('permisos_usuario')
        .update({ 
          activo: true,
          fecha_asignacion: new Date().toISOString(),
          asignado_por: assignedBy
        })
        .eq('id_usuario', userId)
        .eq('id_permiso', permissionId)

      if (error) {
        throw new Error(`Error reactivando permiso: ${error.message}`)
      }
    } else {
      // Crear nuevo permiso
      const { error } = await this.supabase
        .from('permisos_usuario')
        .insert({
          id_usuario: userId,
          id_permiso: permissionId,
          activo: true,
          fecha_asignacion: new Date().toISOString(),
          asignado_por: assignedBy
        })

      if (error) {
        throw new Error(`Error asignando permiso: ${error.message}`)
      }
    }
  }

  /**
   * Revoca un permiso de un usuario
   */
  async revokePermission(userId: number, permissionId: number): Promise<void> {
    const { error } = await this.supabase
      .from('permisos_usuario')
      .update({ activo: false })
      .eq('id_usuario', userId)
      .eq('id_permiso', permissionId)

    if (error) {
      throw new Error(`Error revocando permiso: ${error.message}`)
    }
  }

  /**
   * Asigna múltiples permisos a un usuario
   */
  async assignMultiplePermissions(
    userId: number, 
    permissionIds: number[], 
    assignedBy: number
  ): Promise<void> {
    const assignments = permissionIds.map(permissionId => ({
      id_usuario: userId,
      id_permiso: permissionId,
      activo: true,
      fecha_asignacion: new Date().toISOString(),
      asignado_por: assignedBy
    }))

    const { error } = await this.supabase
      .from('permisos_usuario')
      .upsert(assignments, { 
        onConflict: 'id_usuario,id_permiso',
        ignoreDuplicates: false 
      })

    if (error) {
      throw new Error(`Error asignando múltiples permisos: ${error.message}`)
    }
  }

  /**
   * Obtiene permisos predeterminados por rol
   */
  async getDefaultPermissionsByRole(role: RolUsuario): Promise<Permission[]> {
    const allPermissions = await this.getAllPermissions()
    
    switch (role) {
      case RolUsuario.ADMINISTRADOR:
        return allPermissions // Administradores tienen todos los permisos

      case RolUsuario.GERENTE:
        return allPermissions.filter(p => 
          ['riesgos', 'proyectos'].includes(p.modulo_permiso) &&
          !['eliminar'].includes(p.accion_permiso)
        )

      case RolUsuario.AUDITOR:
        return allPermissions.filter(p => 
          ['riesgos', 'proyectos', 'auditoria'].includes(p.modulo_permiso) &&
          !['eliminar', 'aprobar'].includes(p.accion_permiso)
        )

      default:
        return []
    }
  }

  /**
   * Configura permisos predeterminados para un usuario según su rol
   */
  async setupDefaultPermissions(userId: number, role: RolUsuario, assignedBy: number): Promise<void> {
    const defaultPermissions = await this.getDefaultPermissionsByRole(role)
    const permissionIds = defaultPermissions.map(p => p.id_permiso)
    
    await this.assignMultiplePermissions(userId, permissionIds, assignedBy)
  }

  /**
   * Obtiene el rol de un usuario
   */
  private async getUserRole(userId: number): Promise<RolUsuario | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('rol_usuario')
      .eq('id_usuario', userId)
      .single()

    if (error) {
      console.error('Error obteniendo rol del usuario:', error)
      return null
    }

    return data?.rol_usuario as RolUsuario || null
  }

  /**
   * Obtiene estadísticas de permisos por módulo
   */
  async getPermissionStats(): Promise<{
    totalPermissions: number
    permissionsByModule: { module: string; count: number }[]
    activeUsers: number
    usersWithPermissions: number
  }> {
    // Total de permisos
    const { count: totalPermissions } = await this.supabase
      .from('permisos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    // Permisos por módulo
    const { data: moduleData } = await this.supabase
      .from('permisos')
      .select('modulo_permiso')
      .eq('activo', true)

    const moduleCount = new Map<string, number>()
    moduleData?.forEach(item => {
      const count = moduleCount.get(item.modulo_permiso) || 0
      moduleCount.set(item.modulo_permiso, count + 1)
    })

    const permissionsByModule = Array.from(moduleCount.entries()).map(([module, count]) => ({
      module,
      count
    }))

    // Usuarios activos
    const { count: activeUsers } = await this.supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    // Usuarios con permisos asignados
    const { data: usersWithPerms } = await this.supabase
      .from('permisos_usuario')
      .select('id_usuario')
      .eq('activo', true)

    const uniqueUsers = new Set(usersWithPerms?.map(p => p.id_usuario))
    const usersWithPermissions = uniqueUsers.size

    return {
      totalPermissions: totalPermissions || 0,
      permissionsByModule,
      activeUsers: activeUsers || 0,
      usersWithPermissions
    }
  }

  /**
   * Valida la consistencia de permisos de un usuario
   */
  async validateUserPermissions(userId: number): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    const issues: string[] = []
    const suggestions: string[] = []

    try {
      // Obtener rol y permisos del usuario
      const { data: userData } = await this.supabase
        .from('usuarios')
        .select('rol_usuario')
        .eq('id_usuario', userId)
        .single()

      if (!userData) {
        return {
          isValid: false,
          issues: ['Usuario no encontrado'],
          suggestions: []
        }
      }

      const userRole = userData.rol_usuario as RolUsuario
      const userPermissions = await this.getUserPermissions(userId)
      const defaultPermissions = await this.getDefaultPermissionsByRole(userRole)

      // Verificar permisos faltantes
      const missingPermissions = defaultPermissions.filter(defaultPerm => 
        !userPermissions.some(userPerm => userPerm.id_permiso === defaultPerm.id_permiso)
      )

      if (missingPermissions.length > 0) {
        issues.push(`Faltan ${missingPermissions.length} permisos predeterminados para el rol ${userRole}`)
        suggestions.push('Ejecutar configuración de permisos predeterminados')
      }

      // Verificar permisos excesivos (solo para roles no administrativos)
      if (userRole !== RolUsuario.ADMINISTRADOR) {
        const excessivePermissions = userPermissions.filter(userPerm => 
          !defaultPermissions.some(defaultPerm => defaultPerm.id_permiso === userPerm.id_permiso)
        )

        if (excessivePermissions.length > 0) {
          issues.push(`Tiene ${excessivePermissions.length} permisos adicionales no estándar para su rol`)
          suggestions.push('Revisar permisos adicionales y validar su necesidad')
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions
      }

    } catch (error) {
      return {
        isValid: false,
        issues: [`Error validando permisos: ${error}`],
        suggestions: ['Contactar al administrador del sistema']
      }
    }
  }
}