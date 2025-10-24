// =============================================
// MIDDLEWARE DE AUTORIZACIÓN AVANZADO
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RolUsuario } from '@/src/domain/types/RolUsuario'

export interface PermissionConfig {
  module: string
  action: string
  requiredRoles?: readonly RolUsuario[]
  resourceOwnerCheck?: (userId: string, resourceId: string) => Promise<boolean>
}

export class AuthorizationMiddleware {

  /**
   * Verifica si un usuario tiene permisos para acceder a un recurso específico
   */
  async checkPermission(
    request: NextRequest,
    config: PermissionConfig
  ): Promise<{ authorized: boolean; response?: NextResponse }> {
    try {
      // Obtener el usuario autenticado
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'No autorizado - Usuario no autenticado' },
            { status: 401 }
          )
        }
      }

      // Obtener información del usuario desde la base de datos
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id_usuario, rol_usuario, activo')
        .eq('id_usuario_auth', user.id)
        .single()

      if (userError || !userData) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Usuario no encontrado en el sistema' },
            { status: 403 }
          )
        }
      }

      // Verificar si el usuario está activo
      if (!userData.activo) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Usuario desactivado' },
            { status: 403 }
          )
        }
      }

      // Los administradores tienen acceso completo
      if (userData.rol_usuario === RolUsuario.ADMINISTRADOR) {
        return { authorized: true }
      }

      // Verificar roles requeridos si están especificados
      if (config.requiredRoles && config.requiredRoles.length > 0) {
        if (!config.requiredRoles.includes(userData.rol_usuario as RolUsuario)) {
          return {
            authorized: false,
            response: NextResponse.json(
              { error: `Acceso denegado - Rol requerido: ${config.requiredRoles.join(' o ')}` },
              { status: 403 }
            )
          }
        }
      }

      // Verificar permisos específicos del módulo
      const hasModulePermission = await this.checkModulePermission(
        userData.id_usuario,
        config.module,
        config.action
      )

      if (!hasModulePermission) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: `Sin permisos para ${config.action} en módulo ${config.module}` },
            { status: 403 }
          )
        }
      }

      // Verificar propiedad del recurso si es necesario
      if (config.resourceOwnerCheck) {
        const resourceId = this.extractResourceId(request)
        if (resourceId) {
          const isOwner = await config.resourceOwnerCheck(userData.id_usuario.toString(), resourceId)
          if (!isOwner) {
            return {
              authorized: false,
              response: NextResponse.json(
                { error: 'Sin permisos para acceder a este recurso específico' },
                { status: 403 }
              )
            }
          }
        }
      }

      return { authorized: true }

    } catch (error) {
      console.error('Error en verificación de permisos:', error)
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Error interno del servidor' },
          { status: 500 }
        )
      }
    }
  }

  /**
   * Verifica permisos específicos del módulo en la base de datos
   */
  private async checkModulePermission(
    userId: number,
    module: string,
    action: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('permisos_usuario')
        .select(`
          permisos (
            modulo_permiso,
            accion_permiso
          )
        `)
        .eq('id_usuario', userId)
        .eq('activo', true)

      if (error) {
        console.error('Error consultando permisos:', error)
        return false
      }

      // Verificar si tiene el permiso específico
      return data?.some(permission => 
        permission.permisos?.some((p: any) => 
          p.modulo_permiso === module && p.accion_permiso === action
        )
      ) || false

    } catch (error) {
      console.error('Error verificando permisos de módulo:', error)
      return false
    }
  }

  /**
   * Extrae el ID del recurso de la URL
   */
  private extractResourceId(request: NextRequest): string | null {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    
    // Buscar un segmento que parezca un ID (número o UUID)
    for (const segment of pathSegments) {
      if (/^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return segment
      }
    }
    
    return null
  }

  /**
   * Middleware para verificar acceso a módulos específicos
   */
  static createModuleMiddleware(config: PermissionConfig) {
    return async (request: NextRequest) => {
      const authMiddleware = new AuthorizationMiddleware()
      const result = await authMiddleware.checkPermission(request, config)
      
      if (!result.authorized && result.response) {
        return result.response
      }
      
      return NextResponse.next()
    }
  }
}

// =============================================
// CONFIGURACIONES DE PERMISOS POR MÓDULO
// =============================================

export const ModulePermissions = {
  // Módulo de Usuarios
  USERS: {
    VIEW: { module: 'usuarios', action: 'ver', requiredRoles: [RolUsuario.ADMINISTRADOR] },
    CREATE: { module: 'usuarios', action: 'crear', requiredRoles: [RolUsuario.ADMINISTRADOR] },
    EDIT: { module: 'usuarios', action: 'editar', requiredRoles: [RolUsuario.ADMINISTRADOR] },
    DELETE: { module: 'usuarios', action: 'eliminar', requiredRoles: [RolUsuario.ADMINISTRADOR] }
  },

  // Módulo de Riesgos COSO
  RISKS: {
    VIEW: { module: 'riesgos', action: 'ver' },
    CREATE: { module: 'riesgos', action: 'crear', requiredRoles: [RolUsuario.AUDITOR_SENIOR, RolUsuario.GERENTE_PROYECTO] },
    EDIT: { module: 'riesgos', action: 'editar' },
    DELETE: { module: 'riesgos', action: 'eliminar', requiredRoles: [RolUsuario.AUDITOR_SENIOR] },
    EVALUATE: { module: 'riesgos', action: 'evaluar', requiredRoles: [RolUsuario.AUDITOR_SENIOR, RolUsuario.GERENTE_PROYECTO] }
  },

  // Módulo de Proyectos
  PROJECTS: {
    VIEW: { module: 'proyectos', action: 'ver' },
    CREATE: { module: 'proyectos', action: 'crear', requiredRoles: [RolUsuario.AUDITOR_SENIOR] },
    EDIT: { module: 'proyectos', action: 'editar' },
    DELETE: { module: 'proyectos', action: 'eliminar', requiredRoles: [RolUsuario.AUDITOR_SENIOR] }
  },

  // Módulo de Activos ISO 27001
  ASSETS: {
    VIEW: { module: 'activos', action: 'ver' },
    CREATE: { module: 'activos', action: 'crear', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] },
    EDIT: { module: 'activos', action: 'editar' },
    DELETE: { module: 'activos', action: 'eliminar', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] },
    CLASSIFY: { module: 'activos', action: 'clasificar', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] }
  },

  // Módulo de Controles ISO 27001
  CONTROLS: {
    VIEW: { module: 'controles', action: 'ver' },
    CREATE: { module: 'controles', action: 'crear', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] },
    EDIT: { module: 'controles', action: 'editar' },
    DELETE: { module: 'controles', action: 'eliminar', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] },
    IMPLEMENT: { module: 'controles', action: 'implementar' }
  },

  // Módulo de Incidentes de Seguridad
  INCIDENTS: {
    VIEW: { module: 'incidentes', action: 'ver' },
    CREATE: { module: 'incidentes', action: 'crear' }, // Todos pueden reportar incidentes
    EDIT: { module: 'incidentes', action: 'editar', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] },
    DELETE: { module: 'incidentes', action: 'eliminar', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] },
    INVESTIGATE: { module: 'incidentes', action: 'investigar', requiredRoles: [RolUsuario.OFICIAL_SEGURIDAD] }
  },

  // Módulo de Auditoría
  AUDIT: {
    VIEW: { module: 'auditoria', action: 'ver', requiredRoles: [RolUsuario.AUDITOR_SENIOR, RolUsuario.AUDITOR_JUNIOR] },
    CREATE: { module: 'auditoria', action: 'crear', requiredRoles: [RolUsuario.AUDITOR_SENIOR] },
    EDIT: { module: 'auditoria', action: 'editar', requiredRoles: [RolUsuario.AUDITOR_SENIOR] },
    APPROVE: { module: 'auditoria', action: 'aprobar', requiredRoles: [RolUsuario.AUDITOR_SENIOR] }
  },

  // Módulo de Reportes
  REPORTS: {
    VIEW: { module: 'reportes', action: 'ver' },
    EXPORT: { module: 'reportes', action: 'exportar' },
    EXECUTIVE: { module: 'reportes', action: 'ejecutivo', requiredRoles: [RolUsuario.AUDITOR_SENIOR] }
  }
} as const

// =============================================
// FUNCIONES DE VERIFICACIÓN DE PROPIEDAD
// =============================================

export const ResourceOwnerChecks = {
  /**
   * Verifica si el usuario es propietario de un riesgo
   */
  riskOwner: async (userId: string, riskId: string): Promise<boolean> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('riesgos')
      .select('id_propietario_riesgo')
      .eq('id_riesgo', riskId)
      .single()

    return !error && data?.id_propietario_riesgo?.toString() === userId
  },

  /**
   * Verifica si el usuario es gerente de un proyecto
   */
  projectManager: async (userId: string, projectId: string): Promise<boolean> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('proyectos')
      .select('id_gerente_proyecto')
      .eq('id_proyecto', projectId)
      .single()

    return !error && data?.id_gerente_proyecto?.toString() === userId
  },

  /**
   * Verifica si el usuario es propietario o custodio de un activo
   */
  assetOwner: async (userId: string, assetId: string): Promise<boolean> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('activos_informacion')
      .select('propietario_activo, custodio_activo')
      .eq('id_activo', assetId)
      .single()

    return !error && (
      data?.propietario_activo?.toString() === userId ||
      data?.custodio_activo?.toString() === userId
    )
  },

  /**
   * Verifica si el usuario es responsable de un control
   */
  controlResponsible: async (userId: string, controlId: string): Promise<boolean> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('controles_iso27001')
      .select('responsable_control')
      .eq('id_control', controlId)
      .single()

    return !error && data?.responsable_control?.toString() === userId
  },

  /**
   * Verifica si el usuario reportó o está asignado a un incidente
   */
  incidentInvolved: async (userId: string, incidentId: string): Promise<boolean> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('incidentes_seguridad')
      .select('reportado_por, asignado_a')
      .eq('id_incidente', incidentId)
      .single()

    return !error && (
      data?.reportado_por?.toString() === userId ||
      data?.asignado_a?.toString() === userId
    )
  }
}