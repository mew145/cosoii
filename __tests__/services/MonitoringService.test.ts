// =============================================
// TESTS: MonitoringService
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { MonitoringService, SystemMetrics, MonitoringFilters } from '@/application/services/MonitoringService'
import { TipoNotificacion, EstadoNotificacion, PrioridadNotificacion } from '@/domain/entities/Notificacion'

// Mock the dependencies
jest.mock('@/lib/supabase/client')
jest.mock('@/application/services/UserService')
jest.mock('@/infrastructure/repositories/NotificacionRepository')
jest.mock('@/infrastructure/repositories/UsuarioRepository')
jest.mock('@/infrastructure/email/EmailService')

describe('MonitoringService', () => {
  let monitoringService: MonitoringService
  let mockSupabase: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis()
    }

    // Mock the createClient function
    require('@/lib/supabase/client').createClient = jest.fn().mockReturnValue(mockSupabase)

    monitoringService = new MonitoringService()
  })

  describe('getSystemMetrics', () => {
    it('should return system metrics successfully', async () => {
      // Mock UserService.getUserStats
      const mockUserStats = {
        totalUsuarios: 100,
        usuariosActivos: 85,
        usuariosInactivos: 15,
        distribucionPorRol: [],
        distribucionPorDepartamento: [],
        usuariosRecientes: [],
        usuariosSinConexion: []
      }

      const mockUserService = {
        getUserStats: jest.fn().mockResolvedValue(mockUserStats)
      }
      
      // Replace the userService instance
      ;(monitoringService as any).userService = mockUserService

      // Mock Supabase queries for notifications
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'notificaciones') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                count: 50 // Mock total notifications
              }),
              eq: jest.fn().mockImplementation((field: string, value: any) => {
                switch (value) {
                  case EstadoNotificacion.PENDIENTE:
                    return { count: 5 }
                  case EstadoNotificacion.ENVIADA:
                    return { 
                      gte: jest.fn().mockReturnValue({ count: 40 })
                    }
                  case EstadoNotificacion.ERROR:
                    return { count: 2 }
                  case PrioridadNotificacion.CRITICA:
                    return { 
                      gte: jest.fn().mockReturnValue({ count: 3 })
                    }
                  case TipoNotificacion.INCIDENTE_SEGURIDAD:
                    return { 
                      gte: jest.fn().mockReturnValue({ count: 1 })
                    }
                  default:
                    return { count: 0 }
                }
              })
            })
          }
        }
        return mockSupabase
      })

      const metrics = await monitoringService.getSystemMetrics()

      expect(metrics).toEqual({
        totalNotifications: 50,
        pendingNotifications: 5,
        sentNotifications: 40,
        errorNotifications: 2,
        criticalAlerts: 3,
        securityIncidents: 1,
        systemUptime: '99.9%',
        lastBackup: expect.any(Date),
        userStats: {
          totalUsers: 100,
          activeUsers: 85,
          inactiveUsers: 15
        }
      })

      expect(mockUserService.getUserStats).toHaveBeenCalled()
    })

    it('should handle errors when getting system metrics', async () => {
      // Mock UserService to throw error
      const mockUserService = {
        getUserStats: jest.fn().mockRejectedValue(new Error('Database error'))
      }
      
      ;(monitoringService as any).userService = mockUserService

      await expect(monitoringService.getSystemMetrics()).rejects.toThrow('Error obteniendo métricas')
    })
  })

  describe('getAuditLogs', () => {
    it('should return audit logs with pagination', async () => {
      const mockNotificationData = [
        {
          id_notificacion: 1,
          tipo_notificacion: TipoNotificacion.RIESGO_CRITICO,
          titulo_notificacion: 'Riesgo crítico detectado',
          mensaje_notificacion: 'Se ha detectado un riesgo crítico en el proyecto X',
          id_usuario_destino: 1,
          prioridad_notificacion: PrioridadNotificacion.CRITICA,
          estado_notificacion: EstadoNotificacion.ENVIADA,
          canal_notificacion: 'EMAIL',
          fecha_creacion_notificacion: '2024-01-01T10:00:00Z',
          fecha_envio_notificacion: '2024-01-01T10:01:00Z',
          fecha_leida_notificacion: null,
          metadatos_notificacion: { riesgoId: 123 }
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: mockNotificationData,
              error: null,
              count: 1
            })
          })
        })
      })

      const filters: MonitoringFilters = {
        tipoNotificacion: TipoNotificacion.RIESGO_CRITICO,
        dateRange: 'today'
      }

      const result = await monitoringService.getAuditLogs(filters, 1, 20)

      expect(result).toEqual({
        auditLogs: [{
          id: 1,
          type: TipoNotificacion.RIESGO_CRITICO,
          title: 'Riesgo crítico detectado',
          message: 'Se ha detectado un riesgo crítico en el proyecto X',
          userId: 1,
          priority: PrioridadNotificacion.CRITICA,
          status: EstadoNotificacion.ENVIADA,
          channel: 'EMAIL',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          sentAt: new Date('2024-01-01T10:01:00Z'),
          readAt: undefined,
          metadata: { riesgoId: 123 }
        }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      })
    })

    it('should handle search term filtering', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0
            })
          })
        })
      })

      const filters: MonitoringFilters = {
        searchTerm: 'riesgo crítico'
      }

      await monitoringService.getAuditLogs(filters, 1, 20)

      expect(mockSupabase.from).toHaveBeenCalledWith('notificaciones')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
              count: 0
            })
          })
        })
      })

      await expect(monitoringService.getAuditLogs({}, 1, 20))
        .rejects.toThrow('Error obteniendo logs')
    })
  })

  describe('getCriticalAlerts', () => {
    it('should return critical alerts', async () => {
      const mockCriticalAlerts = [
        {
          id_notificacion: 1,
          tipo_notificacion: TipoNotificacion.RIESGO_CRITICO,
          titulo_notificacion: 'Alerta crítica',
          mensaje_notificacion: 'Mensaje de alerta crítica',
          id_usuario_destino: 1,
          prioridad_notificacion: PrioridadNotificacion.CRITICA,
          estado_notificacion: EstadoNotificacion.ENVIADA,
          canal_notificacion: 'EMAIL',
          fecha_creacion_notificacion: '2024-01-01T10:00:00Z',
          fecha_envio_notificacion: null,
          fecha_leida_notificacion: null,
          metadatos_notificacion: null
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockCriticalAlerts,
                error: null
              })
            })
          })
        })
      })

      const alerts = await monitoringService.getCriticalAlerts(5)

      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toEqual({
        id: 1,
        type: TipoNotificacion.RIESGO_CRITICO,
        title: 'Alerta crítica',
        message: 'Mensaje de alerta crítica',
        userId: 1,
        priority: PrioridadNotificacion.CRITICA,
        status: EstadoNotificacion.ENVIADA,
        channel: 'EMAIL',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sentAt: undefined,
        readAt: undefined,
        metadata: null
      })
    })
  })

  describe('getSecurityIncidents', () => {
    it('should return security incidents', async () => {
      const mockIncidents = [
        {
          id_notificacion: 2,
          tipo_notificacion: TipoNotificacion.INCIDENTE_SEGURIDAD,
          titulo_notificacion: 'Incidente de seguridad',
          mensaje_notificacion: 'Intento de acceso no autorizado',
          id_usuario_destino: 1,
          prioridad_notificacion: PrioridadNotificacion.ALTA,
          estado_notificacion: EstadoNotificacion.ENVIADA,
          canal_notificacion: 'EMAIL',
          fecha_creacion_notificacion: '2024-01-01T11:00:00Z',
          fecha_envio_notificacion: '2024-01-01T11:01:00Z',
          fecha_leida_notificacion: null,
          metadatos_notificacion: { ip: '192.168.1.100' }
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockIncidents,
                error: null
              })
            })
          })
        })
      })

      const incidents = await monitoringService.getSecurityIncidents(5)

      expect(incidents).toHaveLength(1)
      expect(incidents[0].type).toBe(TipoNotificacion.INCIDENTE_SEGURIDAD)
      expect(incidents[0].title).toBe('Incidente de seguridad')
    })
  })

  describe('getNotificationStatsByType', () => {
    it('should return statistics by notification type', async () => {
      const mockStatsData = [
        {
          tipo_notificacion: TipoNotificacion.RIESGO_CRITICO,
          estado_notificacion: EstadoNotificacion.ENVIADA
        },
        {
          tipo_notificacion: TipoNotificacion.RIESGO_CRITICO,
          estado_notificacion: EstadoNotificacion.PENDIENTE
        },
        {
          tipo_notificacion: TipoNotificacion.INCIDENTE_SEGURIDAD,
          estado_notificacion: EstadoNotificacion.ERROR
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockStatsData,
          error: null
        })
      })

      const stats = await monitoringService.getNotificationStatsByType()

      expect(stats).toHaveLength(2)
      expect(stats.find(s => s.type === TipoNotificacion.RIESGO_CRITICO)).toEqual({
        type: TipoNotificacion.RIESGO_CRITICO,
        total: 2,
        pending: 1,
        sent: 1,
        error: 0
      })
    })
  })

  describe('exportAuditLogs', () => {
    it('should export audit logs as CSV', async () => {
      // Mock getAuditLogs method
      const mockAuditLogs = [
        {
          id: 1,
          type: TipoNotificacion.RIESGO_CRITICO,
          title: 'Test Alert',
          message: 'Test message',
          userId: 1,
          priority: PrioridadNotificacion.CRITICA,
          status: EstadoNotificacion.ENVIADA,
          channel: 'EMAIL',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          sentAt: new Date('2024-01-01T10:01:00Z'),
          readAt: undefined
        }
      ]

      jest.spyOn(monitoringService, 'getAuditLogs').mockResolvedValue({
        auditLogs: mockAuditLogs,
        total: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      })

      const csvData = await monitoringService.exportAuditLogs({}, 'csv')

      expect(csvData).toContain('ID,Tipo,Título,Mensaje,Usuario ID,Prioridad,Estado,Canal,Fecha Creación,Fecha Envío,Fecha Lectura')
      expect(csvData).toContain('1,RIESGO_CRITICO,"Test Alert","Test message",1,CRITICA,ENVIADA,EMAIL,2024-01-01T10:00:00.000Z,2024-01-01T10:01:00.000Z,')
    })

    it('should export audit logs as JSON', async () => {
      const mockAuditLogs = [
        {
          id: 1,
          type: TipoNotificacion.RIESGO_CRITICO,
          title: 'Test Alert',
          message: 'Test message',
          userId: 1,
          priority: PrioridadNotificacion.CRITICA,
          status: EstadoNotificacion.ENVIADA,
          channel: 'EMAIL',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          sentAt: new Date('2024-01-01T10:01:00Z'),
          readAt: undefined
        }
      ]

      jest.spyOn(monitoringService, 'getAuditLogs').mockResolvedValue({
        auditLogs: mockAuditLogs,
        total: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      })

      const jsonData = await monitoringService.exportAuditLogs({}, 'json')
      const parsedData = JSON.parse(jsonData)

      expect(parsedData).toHaveLength(1)
      expect(parsedData[0].id).toBe(1)
      expect(parsedData[0].type).toBe(TipoNotificacion.RIESGO_CRITICO)
    })
  })

  describe('processePendingNotifications', () => {
    it('should process pending notifications successfully', async () => {
      // Mock the notification repository method
      const mockNotificationRepository = {
        procesarNotificacionesPendientes: jest.fn().mockResolvedValue({
          procesadas: 10,
          enviadas: 8,
          errores: 2
        })
      }

      ;(monitoringService as any).notificationRepository = mockNotificationRepository

      const result = await monitoringService.processePendingNotifications()

      expect(result).toEqual({
        processed: 10,
        sent: 8,
        errors: 2
      })

      expect(mockNotificationRepository.procesarNotificacionesPendientes).toHaveBeenCalled()
    })
  })

  describe('retryFailedNotifications', () => {
    it('should retry failed notifications successfully', async () => {
      const mockNotificationRepository = {
        reintentarNotificacionesFallidas: jest.fn().mockResolvedValue({
          reintentadas: 5,
          exitosas: 3,
          fallidaDefinitivamente: 2
        })
      }

      ;(monitoringService as any).notificationRepository = mockNotificationRepository

      const result = await monitoringService.retryFailedNotifications()

      expect(result).toEqual({
        retried: 5,
        successful: 3,
        permanentlyFailed: 2
      })
    })
  })

  describe('cleanOldNotifications', () => {
    it('should clean old notifications successfully', async () => {
      const mockNotificationRepository = {
        limpiarNotificacionesAntiguas: jest.fn().mockResolvedValue({
          usuariosLimpiados: 25,
          notificacionesEliminadas: 150
        })
      }

      ;(monitoringService as any).notificationRepository = mockNotificationRepository

      const result = await monitoringService.cleanOldNotifications(90)

      expect(result).toEqual({
        usersProcessed: 25,
        notificationsDeleted: 150
      })

      expect(mockNotificationRepository.limpiarNotificacionesAntiguas).toHaveBeenCalledWith(90)
    })
  })
})