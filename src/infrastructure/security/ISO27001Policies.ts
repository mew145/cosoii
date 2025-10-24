// =============================================
// POLÍTICAS DE SEGURIDAD ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ClasificacionSeguridad } from '@/domain/entities/ActivoInformacion'
import { SeveridadIncidente } from '@/domain/entities/IncidenteSeguridad'
import { RolUsuario } from '@/src/domain/types/RolUsuario'

/**
 * Políticas de acceso para activos de información según ISO 27001
 */
export class ISO27001AccessPolicies {
  
  /**
   * Determina qué roles pueden acceder a activos según su clasificación
   */
  static getAuthorizedRolesForAssetClassification(classification: ClasificacionSeguridad): RolUsuario[] {
    switch (classification) {
      case ClasificacionSeguridad.PUBLICO:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD,
          RolUsuario.AUDITOR_SENIOR,
          RolUsuario.AUDITOR_JUNIOR,
          RolUsuario.GERENTE_PROYECTO,
          RolUsuario.ANALISTA_RIESGOS,
          RolUsuario.CONSULTOR
        ]

      case ClasificacionSeguridad.INTERNO:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD,
          RolUsuario.AUDITOR_SENIOR,
          RolUsuario.AUDITOR_JUNIOR,
          RolUsuario.GERENTE_PROYECTO,
          RolUsuario.ANALISTA_RIESGOS
        ]

      case ClasificacionSeguridad.CONFIDENCIAL:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD,
          RolUsuario.AUDITOR_SENIOR
        ]

      case ClasificacionSeguridad.RESTRINGIDO:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD
        ]

      default:
        return [RolUsuario.ADMINISTRADOR]
    }
  }

  /**
   * Determina qué roles pueden modificar activos según su clasificación
   */
  static getAuthorizedRolesForAssetModification(classification: ClasificacionSeguridad): RolUsuario[] {
    switch (classification) {
      case ClasificacionSeguridad.PUBLICO:
      case ClasificacionSeguridad.INTERNO:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD,
          RolUsuario.AUDITOR_SENIOR
        ]

      case ClasificacionSeguridad.CONFIDENCIAL:
      case ClasificacionSeguridad.RESTRINGIDO:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD
        ]

      default:
        return [RolUsuario.ADMINISTRADOR]
    }
  }

  /**
   * Determina qué roles pueden acceder a incidentes según su severidad
   */
  static getAuthorizedRolesForIncidentSeverity(severity: SeveridadIncidente): RolUsuario[] {
    switch (severity) {
      case SeveridadIncidente.BAJA:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD,
          RolUsuario.AUDITOR_SENIOR,
          RolUsuario.AUDITOR_JUNIOR
        ]

      case SeveridadIncidente.MEDIA:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD,
          RolUsuario.AUDITOR_SENIOR
        ]

      case SeveridadIncidente.ALTA:
      case SeveridadIncidente.CRITICA:
        return [
          RolUsuario.ADMINISTRADOR,
          RolUsuario.OFICIAL_SEGURIDAD
        ]

      default:
        return [RolUsuario.ADMINISTRADOR]
    }
  }

  /**
   * Verifica si un usuario puede acceder a un activo específico
   */
  static canAccessAsset(
    userRole: RolUsuario,
    assetClassification: ClasificacionSeguridad,
    isOwner: boolean = false,
    isCustodian: boolean = false
  ): boolean {
    // Los propietarios y custodios siempre pueden acceder a sus activos
    if (isOwner || isCustodian) {
      return true
    }

    // Verificar roles autorizados para la clasificación
    const authorizedRoles = this.getAuthorizedRolesForAssetClassification(assetClassification)
    return authorizedRoles.includes(userRole)
  }

  /**
   * Verifica si un usuario puede modificar un activo específico
   */
  static canModifyAsset(
    userRole: RolUsuario,
    assetClassification: ClasificacionSeguridad,
    isOwner: boolean = false,
    isCustodian: boolean = false
  ): boolean {
    // Los propietarios pueden modificar sus activos
    if (isOwner) {
      return true
    }

    // Los custodios pueden modificar activos públicos e internos
    if (isCustodian && [ClasificacionSeguridad.PUBLICO, ClasificacionSeguridad.INTERNO].includes(assetClassification)) {
      return true
    }

    // Verificar roles autorizados para modificación
    const authorizedRoles = this.getAuthorizedRolesForAssetModification(assetClassification)
    return authorizedRoles.includes(userRole)
  }

  /**
   * Verifica si un usuario puede acceder a un incidente específico
   */
  static canAccessIncident(
    userRole: RolUsuario,
    incidentSeverity: SeveridadIncidente,
    isReporter: boolean = false,
    isAssigned: boolean = false
  ): boolean {
    // Los reportadores y asignados siempre pueden acceder
    if (isReporter || isAssigned) {
      return true
    }

    // Verificar roles autorizados para la severidad
    const authorizedRoles = this.getAuthorizedRolesForIncidentSeverity(incidentSeverity)
    return authorizedRoles.includes(userRole)
  }

  /**
   * Determina el tiempo máximo de respuesta para incidentes según severidad
   */
  static getIncidentResponseTime(severity: SeveridadIncidente): number {
    switch (severity) {
      case SeveridadIncidente.CRITICA:
        return 1 // 1 hora
      case SeveridadIncidente.ALTA:
        return 4 // 4 horas
      case SeveridadIncidente.MEDIA:
        return 24 // 24 horas
      case SeveridadIncidente.BAJA:
        return 72 // 72 horas
      default:
        return 24
    }
  }

  /**
   * Determina el tiempo máximo de resolución para incidentes según severidad
   */
  static getIncidentResolutionTime(severity: SeveridadIncidente): number {
    switch (severity) {
      case SeveridadIncidente.CRITICA:
        return 4 // 4 horas
      case SeveridadIncidente.ALTA:
        return 24 // 24 horas
      case SeveridadIncidente.MEDIA:
        return 72 // 72 horas
      case SeveridadIncidente.BAJA:
        return 168 // 1 semana
      default:
        return 72
    }
  }

  /**
   * Verifica si un control requiere aprobación para cambios
   */
  static requiresApprovalForControlChange(controlDomain: string): boolean {
    // Controles críticos que requieren aprobación
    const criticalDomains = [
      'A.5', // Políticas de seguridad de la información
      'A.6', // Organización de la seguridad de la información
      'A.8', // Gestión de activos
      'A.9', // Control de acceso
      'A.10', // Criptografía
      'A.17', // Aspectos de seguridad de la información en la gestión de la continuidad del negocio
      'A.18'  // Cumplimiento
    ]

    return criticalDomains.some(domain => controlDomain.startsWith(domain))
  }

  /**
   * Obtiene los roles que pueden aprobar cambios en controles
   */
  static getControlApprovalRoles(): RolUsuario[] {
    return [
      RolUsuario.ADMINISTRADOR,
      RolUsuario.OFICIAL_SEGURIDAD
    ]
  }

  /**
   * Verifica si se requiere segregación de funciones
   */
  static requiresSegregationOfDuties(action: string, resource: string): boolean {
    // Acciones que requieren segregación de funciones
    const segregatedActions = [
      'approve_control_implementation',
      'approve_risk_treatment',
      'approve_incident_closure',
      'approve_asset_classification_change'
    ]

    return segregatedActions.includes(`${action}_${resource}`)
  }

  /**
   * Obtiene las restricciones de horario para acciones críticas
   */
  static getTimeRestrictions(action: string): {
    allowedHours: { start: number; end: number }
    allowedDays: number[]
    requiresApproval: boolean
  } {
    const criticalActions = [
      'delete_asset',
      'change_asset_classification',
      'close_critical_incident',
      'disable_control'
    ]

    if (criticalActions.includes(action)) {
      return {
        allowedHours: { start: 8, end: 18 }, // 8 AM a 6 PM
        allowedDays: [1, 2, 3, 4, 5], // Lunes a Viernes
        requiresApproval: true
      }
    }

    return {
      allowedHours: { start: 0, end: 23 }, // 24/7
      allowedDays: [0, 1, 2, 3, 4, 5, 6], // Todos los días
      requiresApproval: false
    }
  }

  /**
   * Verifica si una acción está permitida en el horario actual
   */
  static isActionAllowedAtCurrentTime(action: string): boolean {
    const restrictions = this.getTimeRestrictions(action)
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    const isWithinAllowedHours = currentHour >= restrictions.allowedHours.start && 
                                currentHour <= restrictions.allowedHours.end
    const isWithinAllowedDays = restrictions.allowedDays.includes(currentDay)

    return isWithinAllowedHours && isWithinAllowedDays
  }

  /**
   * Obtiene los requisitos de logging para diferentes tipos de acciones
   */
  static getLoggingRequirements(action: string, resource: string): {
    logLevel: 'info' | 'warning' | 'critical'
    includeDetails: boolean
    notifyAdmins: boolean
    retentionDays: number
  } {
    const criticalActions = [
      'delete', 'modify_classification', 'disable_control', 
      'close_incident', 'change_permissions'
    ]

    const sensitiveResources = [
      'assets', 'controls', 'incidents', 'users'
    ]

    const isCritical = criticalActions.some(a => action.includes(a))
    const isSensitive = sensitiveResources.includes(resource)

    if (isCritical || isSensitive) {
      return {
        logLevel: 'critical',
        includeDetails: true,
        notifyAdmins: true,
        retentionDays: 2555 // 7 años
      }
    }

    return {
      logLevel: 'info',
      includeDetails: false,
      notifyAdmins: false,
      retentionDays: 365 // 1 año
    }
  }
}