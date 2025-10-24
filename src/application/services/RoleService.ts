// =============================================
// SERVICIO DE GESTIÓN DE ROLES
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@/domain/entities/Usuario'
import { PermissionService, Permission } from './PermissionService'

export interface RoleInfo {
  rol: RolUsuario
  nombre: string
  descripcion: string
  permisos: Permission[]
  usuariosCount: number
  nivel: number
}

export interface RoleAssignment {
  userId: number
  previousRole: RolUsuario
  newRole: RolUsuario
  assignedBy: number
  reason?: string
}

export interface RoleHierarchy {
  rol: RolUsuario
  nivel: number
  subordinados: RolUsuario[]
  superiores: RolUsuario[]
}

export class RoleService {
  private supabase = createClient()
  private permissionService = new PermissionService()

  // Definición de roles con información detallada
  private readonly roleDefinitions: Record<RolUsuario, Omit<RoleInfo, 'permisos' | 'usuariosCount'>> = {
    [RolUsuario.ADMINISTRADOR]: {
      rol: RolUsuario.ADMINISTRADOR,
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema. Gestiona usuarios, configuraciones y tiene permisos sobre todos los módulos.',
      nivel: 1
    },
    [RolUsuario.AUDITOR_SENIOR]: {
      rol: RolUsuario.AUDITOR_SENIOR,
      nombre: 'Auditor Senior',
      descripcion: 'Supervisa auditorías, aprueba evaluaciones de riesgos y gestiona equipos de auditoría.',
      nivel: 2
    },
    [RolUsuario.OFICIAL_SEGURIDAD]: {
      rol: RolUsuario.OFICIAL_SEGURIDAD,
      nombre: 'Oficial de Seguridad',
      descripcion: 'Especialista en ISO 27001. Gestiona activos, controles e incidentes de seguridad.',
      nivel: 2
    },
    [RolUsuario.AUDITOR_JUNIOR]: {
      rol: RolUsuario.AUDITOR_JUNIOR,
      nombre: 'Auditor Junior',
      descripcion: 'Ejecuta auditorías, registra hallazgos y apoya en evaluaciones de riesgos.',
      nivel: 3
    },
    [RolUsuario.GERENTE_PROYECTO]: {
      rol: RolUsuario.GERENTE_PROYECTO,
      nombre: 'Gerente de Proyecto',
      descripcion: 'Gestiona proyectos específicos y los riesgos asociados a los mismos.',
      nivel: 3
    },
    [RolUsuario.ANALISTA_RIESGOS]: {
      rol: RolUsuario.ANALISTA_RIESGOS,
      nombre: 'Analista de Riesgos',
      descripcion: 'Especialista en análisis de riesgos y generación de reportes.',
      nivel: 4
    },
    [RolUsuario.CONSULTOR]: {
      rol: RolUsuario.CONSULTOR,
      nombre: 'Consultor',
      descripcion: 'Consultor externo con acceso limitado para análisis específicos.',
      nivel: 5
    }
  }

  /**
   * Obtiene información completa de todos los roles
   */
  async getAllRoles(): Promise<RoleInfo[]> {
    try {
      const roles: RoleInfo[] = []

      for (const [rol, definition] of Object.entries(this.roleDefinitions)) {
        const roleEnum = rol as RolUsuario
        
        // Obtener permisos del rol
        const permisos = await this.permissionService.getDefaultPermissionsByRole(roleEnum)
        
        // Contar usuarios con este rol
        const { count: usuariosCount } = await this.supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('rol_usuario', roleEnum)
          .eq('activo', true)

        roles.push({
          ...definition,
          permisos,
          usuariosCount: usuariosCount || 0
        })
      }

      // Ordenar por nivel
      return roles.sort((a, b) => a.nivel - b.nivel)

    } catch (error) {
      console.error('Error obteniendo roles:', error)
      throw error
    }
  }

  /**
   * Obtiene información de un rol específico
   */
  async getRoleInfo(rol: RolUsuario): Promise<RoleInfo | null> {
    try {
      const definition = this.roleDefinitions[rol]
      if (!definition) {
        return null
      }

      // Obtener permisos del rol
      const permisos = await this.permissionService.getDefaultPermissionsByRole(rol)
      
      // Contar usuarios con este rol
      const { count: usuariosCount } = await this.supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol_usuario', rol)
        .eq('activo', true)

      return {
        ...definition,
        permisos,
        usuariosCount: usuariosCount || 0
      }

    } catch (error) {
      console.error('Error obteniendo información del rol:', error)
      throw error
    }
  }

  /**
   * Asigna un rol a un usuario
   */
  async assignRole(assignment: RoleAssignment): Promise<void> {
    try {
      // Verificar que el rol de destino existe
      if (!this.roleDefinitions[assignment.newRole]) {
        throw new Error('Rol de destino no válido')
      }

      // Verificar que el usuario existe
      const { data: userData, error: userError } = await this.supabase
        .from('usuarios')
        .select('rol_usuario')
        .eq('id_usuario', assignment.userId)
        .single()

      if (userError || !userData) {
        throw new Error('Usuario no encontrado')
      }

      // Verificar que el rol actual coincide
      if (userData.rol_usuario !== assignment.previousRole) {
        throw new Error('El rol actual del usuario no coincide')
      }

      // Actualizar rol del usuario
      const { error: updateError } = await this.supabase
        .from('usuarios')
        .update({
          rol_usuario: assignment.newRole,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', assignment.userId)

      if (updateError) {
        throw new Error(`Error actualizando rol: ${updateError.message}`)
      }

      // Configurar permisos predeterminados para el nuevo rol
      await this.permissionService.setupDefaultPermissions(
        assignment.userId,
        assignment.newRole,
        assignment.assignedBy
      )

      // Registrar el cambio de rol en auditoría
      await this.logRoleChange(assignment)

    } catch (error) {
      console.error('Error asignando rol:', error)
      throw error
    }
  }

  /**
   * Obtiene la jerarquía de roles
   */
  getRoleHierarchy(): RoleHierarchy[] {
    const hierarchy: RoleHierarchy[] = []

    for (const [rol, definition] of Object.entries(this.roleDefinitions)) {
      const roleEnum = rol as RolUsuario
      
      // Determinar subordinados (roles con nivel mayor)
      const subordinados = Object.entries(this.roleDefinitions)
        .filter(([_, def]) => def.nivel > definition.nivel)
        .map(([r, _]) => r as RolUsuario)

      // Determinar superiores (roles con nivel menor)
      const superiores = Object.entries(this.roleDefinitions)
        .filter(([_, def]) => def.nivel < definition.nivel)
        .map(([r, _]) => r as RolUsuario)

      hierarchy.push({
        rol: roleEnum,
        nivel: definition.nivel,
        subordinados,
        superiores
      })
    }

    return hierarchy.sort((a, b) => a.nivel - b.nivel)
  }

  /**
   * Verifica si un rol puede asignar otro rol
   */
  canAssignRole(assignerRole: RolUsuario, targetRole: RolUsuario): boolean {
    const assignerLevel = this.roleDefinitions[assignerRole]?.nivel
    const targetLevel = this.roleDefinitions[targetRole]?.nivel

    if (!assignerLevel || !targetLevel) {
      return false
    }

    // Solo administradores pueden asignar cualquier rol
    if (assignerRole === RolUsuario.ADMINISTRADOR) {
      return true
    }

    // Los roles solo pueden asignar roles de nivel igual o inferior
    return assignerLevel <= targetLevel
  }

  /**
   * Obtiene roles que un usuario puede asignar
   */
  getAssignableRoles(assignerRole: RolUsuario): RolUsuario[] {
    const assignerLevel = this.roleDefinitions[assignerRole]?.nivel

    if (!assignerLevel) {
      return []
    }

    // Administradores pueden asignar cualquier rol
    if (assignerRole === RolUsuario.ADMINISTRADOR) {
      return Object.keys(this.roleDefinitions) as RolUsuario[]
    }

    // Otros roles pueden asignar roles de nivel igual o inferior
    return Object.entries(this.roleDefinitions)
      .filter(([_, definition]) => definition.nivel >= assignerLevel)
      .map(([rol, _]) => rol as RolUsuario)
  }

  /**
   * Obtiene estadísticas de roles
   */
  async getRoleStats(): Promise<{
    totalRoles: number
    distribucionUsuarios: { rol: RolUsuario; count: number; porcentaje: number }[]
    rolesVacios: RolUsuario[]
    cambiosRecientes: any[]
  }> {
    try {
      const totalRoles = Object.keys(this.roleDefinitions).length

      // Distribución de usuarios por rol
      const { data: userData } = await this.supabase
        .from('usuarios')
        .select('rol_usuario')
        .eq('activo', true)

      const { count: totalUsuarios } = await this.supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      const roleCount = new Map<RolUsuario, number>()
      userData?.forEach(row => {
        const rol = row.rol_usuario as RolUsuario
        const count = roleCount.get(rol) || 0
        roleCount.set(rol, count + 1)
      })

      const distribucionUsuarios = Object.keys(this.roleDefinitions).map(rol => {
        const roleEnum = rol as RolUsuario
        const count = roleCount.get(roleEnum) || 0
        const porcentaje = totalUsuarios ? (count / (totalUsuarios || 1)) * 100 : 0
        
        return {
          rol: roleEnum,
          count,
          porcentaje: Math.round(porcentaje * 100) / 100
        }
      })

      // Roles sin usuarios
      const rolesVacios = distribucionUsuarios
        .filter(item => item.count === 0)
        .map(item => item.rol)

      // Cambios recientes de rol (últimos 10)
      const { data: cambiosData } = await this.supabase
        .from('auditoria_logs')
        .select('*')
        .eq('accion', 'cambio_rol')
        .order('fecha_accion', { ascending: false })
        .limit(10)

      const cambiosRecientes = cambiosData || []

      return {
        totalRoles,
        distribucionUsuarios,
        rolesVacios,
        cambiosRecientes
      }

    } catch (error) {
      console.error('Error obteniendo estadísticas de roles:', error)
      throw error
    }
  }

  /**
   * Valida una asignación de rol
   */
  async validateRoleAssignment(assignment: RoleAssignment): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Verificar que los roles existen
      if (!this.roleDefinitions[assignment.previousRole]) {
        errors.push('Rol anterior no válido')
      }

      if (!this.roleDefinitions[assignment.newRole]) {
        errors.push('Rol nuevo no válido')
      }

      // Verificar que el usuario existe
      const { data: userData, error: userError } = await this.supabase
        .from('usuarios')
        .select('rol_usuario, activo')
        .eq('id_usuario', assignment.userId)
        .single()

      if (userError || !userData) {
        errors.push('Usuario no encontrado')
      } else {
        // Verificar que el usuario está activo
        if (!userData.activo) {
          warnings.push('El usuario está desactivado')
        }

        // Verificar que el rol actual coincide
        if (userData.rol_usuario !== assignment.previousRole) {
          errors.push('El rol actual del usuario no coincide con el especificado')
        }
      }

      // Verificar que el asignador existe
      const { data: assignerData, error: assignerError } = await this.supabase
        .from('usuarios')
        .select('rol_usuario')
        .eq('id_usuario', assignment.assignedBy)
        .single()

      if (assignerError || !assignerData) {
        errors.push('Usuario asignador no encontrado')
      } else {
        // Verificar permisos de asignación
        if (!this.canAssignRole(assignerData.rol_usuario as RolUsuario, assignment.newRole)) {
          errors.push('El usuario asignador no tiene permisos para asignar este rol')
        }
      }

      // Advertencias adicionales
      if (assignment.previousRole === assignment.newRole) {
        warnings.push('El rol nuevo es igual al rol actual')
      }

      const previousLevel = this.roleDefinitions[assignment.previousRole]?.nivel
      const newLevel = this.roleDefinitions[assignment.newRole]?.nivel

      if (previousLevel && newLevel && previousLevel < newLevel) {
        warnings.push('Se está reduciendo el nivel de privilegios del usuario')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }

    } catch (error) {
      console.error('Error validando asignación de rol:', error)
      return {
        isValid: false,
        errors: ['Error interno validando asignación'],
        warnings: []
      }
    }
  }

  /**
   * Obtiene el nombre descriptivo de un rol
   */
  getRoleName(rol: RolUsuario): string {
    return this.roleDefinitions[rol]?.nombre || rol
  }

  /**
   * Obtiene la descripción de un rol
   */
  getRoleDescription(rol: RolUsuario): string {
    return this.roleDefinitions[rol]?.descripcion || ''
  }

  /**
   * Obtiene el nivel jerárquico de un rol
   */
  getRoleLevel(rol: RolUsuario): number {
    return this.roleDefinitions[rol]?.nivel || 999
  }

  // =============================================
  // MÉTODOS PRIVADOS
  // =============================================

  /**
   * Registra un cambio de rol en auditoría
   */
  private async logRoleChange(assignment: RoleAssignment): Promise<void> {
    try {
      await this.supabase
        .from('auditoria_logs')
        .insert({
          id_usuario: assignment.assignedBy,
          accion: 'cambio_rol',
          tabla_afectada: 'usuarios',
          id_registro_afectado: assignment.userId,
          valores_anteriores: { rol: assignment.previousRole },
          valores_nuevos: { rol: assignment.newRole },
          detalles_adicionales: assignment.reason || 'Cambio de rol',
          fecha_accion: new Date().toISOString(),
          ip_usuario: null // Se puede obtener del request si está disponible
        })

    } catch (error) {
      console.error('Error registrando cambio de rol en auditoría:', error)
      // No lanzar error para no afectar la operación principal
    }
  }
}