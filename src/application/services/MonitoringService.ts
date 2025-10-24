// =============================================
// SERVICIO DE MONITOREO DEL SISTEMA
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { createClient } from '@/lib/supabase/client'
import { NotificationManagementService } from './NotificationManagementService'
import { UserService } from './UserService'
import { 
  Notificacion, 
  TipoNotificacion, 
  EstadoNotificacion, 
  PrioridadNotificacion 
} from '@/domain/entities/Notificacion'
import { FiltrosNotificacion } from '@/domain/repositories/INotificacionRepository'
import { NotificacionRepository, PreferenciaNotificacionRepository } from '@/infrastructure/repositories/NotificacionRepository'
import { UsuarioRepository } from '@/infrastructure/repositories/UsuarioRepository'
import { EmailService } from '@/infrastructure/email/EmailService'

export interface SystemMetrics {
  totalNotifications: number
  pendingNotifications: number
  sentNotifications: number
  errorNotifications: number
  criticalAlerts: number
  securityIncidents: number
  systemUptime: string
  lastBackup: Date
  userStats: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
  }
}

export interface AuditLogEntry {
  id: number
  type: TipoNotificacion
  title: string
  message: string
  userId: number
  priority: PrioridadNotificacion
  status: EstadoNotificacion
  channel: string
  createdAt: Date
  sentAt?: Date
  readAt?: Date
  metadata?: Record<string, any>
}

export interface MonitoringFilters extends Partial<FiltrosNotificacion> {
  dateRange?: 'today' | 'week' | 'month' | 'all'
  searchTerm?: string
}

export interface MonitoringResult {
  auditLogs: AuditLogEntry[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export class MonitoringService {
  private supabase = createClient()
  private notificationRepository: NotificationManagementService
  private userService = new UserService()

  constructor() {
    // Initialize notification management service with repositories
    const notificacionRepo = new NotificacionRepository(this.supabase)
    const preferenciaRepo = new PreferenciaNotificacionRepository(this.supabase)
    const usuarioRepo = new UsuarioRepository()
    
    // Create a basic email config for the EmailService
    const emailConfig = {
      smtpHost: process.env.SMTP_HOST || 'localhost',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER || '',
      smtpPassword: process.env.SMTP_PASSWORD || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@sistema.com',
      fromName: process.env.FROM_NAME || 'Sistema de Gestión de Riesgos'
    }
    const emailService = new EmailService(emailConfig)

    this.notificationRepository = new NotificationManagementService(
      notificacionRepo,
      preferenciaRepo,
      usuarioRepo,
      emailService
    )
  }

  /**
   * Obtiene métricas del sistema en tiempo real
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get user statistics
      const userStats = await this.userService.getUserStats()

      // Get notification statistics from the last 24 hours
      const last24Hours = new Date()
      last24Hours.setHours(last24Hours.getHours() - 24)

      // Get total notifications count
      const { count: totalNotifications } = await this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion_notificacion', last24Hours.toISOString())

      // Get pending notifications
      const { count: pendingNotifications } = await this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('estado_notificacion', EstadoNotificacion.PENDIENTE)

      // Get sent notifications
      const { count: sentNotifications } = await this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('estado_notificacion', EstadoNotificacion.ENVIADA)
        .gte('fecha_creacion_notificacion', last24Hours.toISOString())

      // Get error notifications
      const { count: errorNotifications } = await this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('estado_notificacion', EstadoNotificacion.ERROR)

      // Get critical alerts (last 7 days)
      const last7Days = new Date()
      last7Days.setDate(last7Days.getDate() - 7)

      const { count: criticalAlerts } = await this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('prioridad_notificacion', PrioridadNotificacion.CRITICA)
        .gte('fecha_creacion_notificacion', last7Days.toISOString())

      // Get security incidents (last 7 days)
      const { count: securityIncidents } = await this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_notificacion', TipoNotificacion.INCIDENTE_SEGURIDAD)
        .gte('fecha_creacion_notificacion', last7Days.toISOString())

      return {
        totalNotifications: totalNotifications || 0,
        pendingNotifications: pendingNotifications || 0,
        sentNotifications: sentNotifications || 0,
        errorNotifications: errorNotifications || 0,
        criticalAlerts: criticalAlerts || 0,
        securityIncidents: securityIncidents || 0,
        systemUptime: '99.9%', // This would come from actual system monitoring
        lastBackup: new Date(), // This would come from backup system
        userStats: {
          totalUsers: userStats.totalUsuarios,
          activeUsers: userStats.usuariosActivos,
          inactiveUsers: userStats.usuariosInactivos
        }
      }

    } catch (error) {
      console.error('Error obteniendo métricas del sistema:', error)
      throw new Error(`Error obteniendo métricas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtiene logs de auditoría con filtros y paginación
   */
  async getAuditLogs(
    filters: MonitoringFilters = {},
    page = 1,
    limit = 20
  ): Promise<MonitoringResult> {
    try {
      // Build notification filters
      const notificationFilters: FiltrosNotificacion = {}

      // Apply type filter
      if (filters.tipoNotificacion) {
        notificationFilters.tipoNotificacion = filters.tipoNotificacion
      }

      // Apply status filter
      if (filters.estadoNotificacion) {
        notificationFilters.estadoNotificacion = filters.estadoNotificacion
      }

      // Apply priority filter
      if (filters.prioridadNotificacion) {
        notificationFilters.prioridadNotificacion = filters.prioridadNotificacion
      }

      // Apply date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        switch (filters.dateRange) {
          case 'today':
            notificationFilters.fechaDesde = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            notificationFilters.fechaDesde = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            notificationFilters.fechaDesde = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
        }
      }

      // Apply other filters
      if (filters.idUsuarioDestino) notificationFilters.idUsuarioDestino = filters.idUsuarioDestino
      if (filters.idRiesgo) notificationFilters.idRiesgo = filters.idRiesgo
      if (filters.idProyecto) notificationFilters.idProyecto = filters.idProyecto
      if (filters.idAuditoria) notificationFilters.idAuditoria = filters.idAuditoria
      if (filters.idHallazgo) notificationFilters.idHallazgo = filters.idHallazgo
      if (filters.idActividad) notificationFilters.idActividad = filters.idActividad
      if (filters.idIncidente) notificationFilters.idIncidente = filters.idIncidente
      if (filters.idControl) notificationFilters.idControl = filters.idControl

      // Get notifications using the existing repository
      const offset = (page - 1) * limit
      
      // Build query manually for now since we need to integrate with existing system
      let query = this.supabase
        .from('notificaciones')
        .select('*', { count: 'exact' })

      // Apply filters to query
      if (notificationFilters.tipoNotificacion) {
        query = query.eq('tipo_notificacion', notificationFilters.tipoNotificacion)
      }
      if (notificationFilters.estadoNotificacion) {
        query = query.eq('estado_notificacion', notificationFilters.estadoNotificacion)
      }
      if (notificationFilters.prioridadNotificacion) {
        query = query.eq('prioridad_notificacion', notificationFilters.prioridadNotificacion)
      }
      if (notificationFilters.fechaDesde) {
        query = query.gte('fecha_creacion_notificacion', notificationFilters.fechaDesde.toISOString())
      }
      if (notificationFilters.idUsuarioDestino) {
        query = query.eq('id_usuario_destino', notificationFilters.idUsuarioDestino)
      }
      if (notificationFilters.idRiesgo) {
        query = query.eq('id_riesgo', notificationFilters.idRiesgo)
      }
      if (notificationFilters.idProyecto) {
        query = query.eq('id_proyecto', notificationFilters.idProyecto)
      }
      if (notificationFilters.idAuditoria) {
        query = query.eq('id_auditoria', notificationFilters.idAuditoria)
      }
      if (notificationFilters.idHallazgo) {
        query = query.eq('id_hallazgo', notificationFilters.idHallazgo)
      }
      if (notificationFilters.idActividad) {
        query = query.eq('id_actividad', notificationFilters.idActividad)
      }
      if (notificationFilters.idIncidente) {
        query = query.eq('id_incidente', notificationFilters.idIncidente)
      }
      if (notificationFilters.idControl) {
        query = query.eq('id_control', notificationFilters.idControl)
      }

      // Apply search term if provided
      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`
        query = query.or(`titulo_notificacion.ilike.${searchTerm},mensaje_notificacion.ilike.${searchTerm}`)
      }

      const { data, error, count } = await query
        .order('fecha_creacion_notificacion', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error(`Error obteniendo logs de auditoría: ${error.message}`)
      }

      // Map to audit log entries
      const auditLogs: AuditLogEntry[] = (data || []).map(row => ({
        id: row.id_notificacion,
        type: row.tipo_notificacion as TipoNotificacion,
        title: row.titulo_notificacion,
        message: row.mensaje_notificacion,
        userId: row.id_usuario_destino,
        priority: row.prioridad_notificacion as PrioridadNotificacion,
        status: row.estado_notificacion as EstadoNotificacion,
        channel: row.canal_notificacion,
        createdAt: new Date(row.fecha_creacion_notificacion),
        sentAt: row.fecha_envio_notificacion ? new Date(row.fecha_envio_notificacion) : undefined,
        readAt: row.fecha_leida_notificacion ? new Date(row.fecha_leida_notificacion) : undefined,
        metadata: row.metadatos_notificacion
      }))

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        auditLogs,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }

    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error)
      throw new Error(`Error obteniendo logs: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtiene estadísticas de notificaciones por tipo
   */
  async getNotificationStatsByType(): Promise<{
    type: TipoNotificacion
    total: number
    pending: number
    sent: number
    error: number
  }[]> {
    try {
      const { data, error } = await this.supabase
        .from('notificaciones')
        .select('tipo_notificacion, estado_notificacion')

      if (error) {
        throw new Error(`Error obteniendo estadísticas por tipo: ${error.message}`)
      }

      // Process statistics
      const stats: Record<string, any> = {}
      
      data?.forEach(row => {
        const type = row.tipo_notificacion
        if (!stats[type]) {
          stats[type] = {
            type,
            total: 0,
            pending: 0,
            sent: 0,
            error: 0
          }
        }
        
        stats[type].total++
        
        switch (row.estado_notificacion) {
          case EstadoNotificacion.PENDIENTE:
            stats[type].pending++
            break
          case EstadoNotificacion.ENVIADA:
            stats[type].sent++
            break
          case EstadoNotificacion.ERROR:
            stats[type].error++
            break
        }
      })

      return Object.values(stats)

    } catch (error) {
      console.error('Error obteniendo estadísticas por tipo:', error)
      throw new Error(`Error obteniendo estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtiene alertas críticas recientes
   */
  async getCriticalAlerts(limit = 10): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('notificaciones')
        .select('*')
        .eq('prioridad_notificacion', PrioridadNotificacion.CRITICA)
        .order('fecha_creacion_notificacion', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Error obteniendo alertas críticas: ${error.message}`)
      }

      return (data || []).map(row => ({
        id: row.id_notificacion,
        type: row.tipo_notificacion as TipoNotificacion,
        title: row.titulo_notificacion,
        message: row.mensaje_notificacion,
        userId: row.id_usuario_destino,
        priority: row.prioridad_notificacion as PrioridadNotificacion,
        status: row.estado_notificacion as EstadoNotificacion,
        channel: row.canal_notificacion,
        createdAt: new Date(row.fecha_creacion_notificacion),
        sentAt: row.fecha_envio_notificacion ? new Date(row.fecha_envio_notificacion) : undefined,
        readAt: row.fecha_leida_notificacion ? new Date(row.fecha_leida_notificacion) : undefined,
        metadata: row.metadatos_notificacion
      }))

    } catch (error) {
      console.error('Error obteniendo alertas críticas:', error)
      throw new Error(`Error obteniendo alertas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtiene incidentes de seguridad recientes
   */
  async getSecurityIncidents(limit = 10): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('notificaciones')
        .select('*')
        .eq('tipo_notificacion', TipoNotificacion.INCIDENTE_SEGURIDAD)
        .order('fecha_creacion_notificacion', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Error obteniendo incidentes de seguridad: ${error.message}`)
      }

      return (data || []).map(row => ({
        id: row.id_notificacion,
        type: row.tipo_notificacion as TipoNotificacion,
        title: row.titulo_notificacion,
        message: row.mensaje_notificacion,
        userId: row.id_usuario_destino,
        priority: row.prioridad_notificacion as PrioridadNotificacion,
        status: row.estado_notificacion as EstadoNotificacion,
        channel: row.canal_notificacion,
        createdAt: new Date(row.fecha_creacion_notificacion),
        sentAt: row.fecha_envio_notificacion ? new Date(row.fecha_envio_notificacion) : undefined,
        readAt: row.fecha_leida_notificacion ? new Date(row.fecha_leida_notificacion) : undefined,
        metadata: row.metadatos_notificacion
      }))

    } catch (error) {
      console.error('Error obteniendo incidentes de seguridad:', error)
      throw new Error(`Error obteniendo incidentes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Procesa notificaciones pendientes manualmente
   */
  async processePendingNotifications(): Promise<{
    processed: number
    sent: number
    errors: number
  }> {
    try {
      const result = await this.notificationRepository.procesarNotificacionesPendientes()
      return {
        processed: result.procesadas,
        sent: result.enviadas,
        errors: result.errores
      }
    } catch (error) {
      console.error('Error procesando notificaciones pendientes:', error)
      throw new Error(`Error procesando notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Reintenta notificaciones fallidas
   */
  async retryFailedNotifications(): Promise<{
    retried: number
    successful: number
    permanentlyFailed: number
  }> {
    try {
      const result = await this.notificationRepository.reintentarNotificacionesFallidas()
      return {
        retried: result.reintentadas,
        successful: result.exitosas,
        permanentlyFailed: result.fallidaDefinitivamente
      }
    } catch (error) {
      console.error('Error reintentando notificaciones fallidas:', error)
      throw new Error(`Error reintentando notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Limpia notificaciones antiguas
   */
  async cleanOldNotifications(daysOld = 90): Promise<{
    usersProcessed: number
    notificationsDeleted: number
  }> {
    try {
      const result = await this.notificationRepository.limpiarNotificacionesAntiguas(daysOld)
      return {
        usersProcessed: result.usuariosLimpiados,
        notificationsDeleted: result.notificacionesEliminadas
      }
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error)
      throw new Error(`Error limpiando notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Exporta logs de auditoría
   */
  async exportAuditLogs(
    filters: MonitoringFilters = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    try {
      // Get all matching logs (no pagination for export)
      const result = await this.getAuditLogs(filters, 1, 10000)
      
      if (format === 'json') {
        return JSON.stringify(result.auditLogs, null, 2)
      }

      // CSV format
      const headers = [
        'ID',
        'Tipo',
        'Título',
        'Mensaje',
        'Usuario ID',
        'Prioridad',
        'Estado',
        'Canal',
        'Fecha Creación',
        'Fecha Envío',
        'Fecha Lectura'
      ]

      const csvRows = [
        headers.join(','),
        ...result.auditLogs.map(log => [
          log.id,
          log.type,
          `"${log.title.replace(/"/g, '""')}"`,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId,
          log.priority,
          log.status,
          log.channel,
          log.createdAt.toISOString(),
          log.sentAt?.toISOString() || '',
          log.readAt?.toISOString() || ''
        ].join(','))
      ]

      return csvRows.join('\n')

    } catch (error) {
      console.error('Error exportando logs de auditoría:', error)
      throw new Error(`Error exportando logs: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }
}