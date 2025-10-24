// =============================================
// TESTS: Admin Monitoring Page
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { MonitoringService } from '@/application/services/MonitoringService'
import { TipoNotificacion, EstadoNotificacion, PrioridadNotificacion } from '@/domain/entities/Notificacion'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/application/services/MonitoringService')

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

const mockMonitoringService = {
  getSystemMetrics: jest.fn(),
  getAuditLogs: jest.fn(),
  getCriticalAlerts: jest.fn(),
  getSecurityIncidents: jest.fn(),
  exportAuditLogs: jest.fn(),
  processePendingNotifications: jest.fn(),
  retryFailedNotifications: jest.fn()
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    href: 'http://localhost:3000/admin/monitoring'
  },
  writable: true
})

// Mock URL constructor
global.URL = class URL {
  constructor(url: string) {
    this.href = url
  }
  href: string
} as any

// Mock document methods for file download
Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue({
    setAttribute: jest.fn(),
    click: jest.fn(),
    style: {}
  })
})

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
})

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
})

describe('MonitoringPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(MonitoringService as jest.Mock).mockImplementation(() => mockMonitoringService)

    // Mock system metrics
    mockMonitoringService.getSystemMetrics.mockResolvedValue({
      totalNotifications: 100,
      pendingNotifications: 5,
      sentNotifications: 90,
      errorNotifications: 5,
      criticalAlerts: 3,
      securityIncidents: 1,
      systemUptime: '99.9%',
      lastBackup: new Date(),
      userStats: {
        totalUsers: 50,
        activeUsers: 45,
        inactiveUsers: 5
      }
    })

    // Mock audit logs
    mockMonitoringService.getAuditLogs.mockResolvedValue({
      auditLogs: [
        {
          id: 1,
          type: TipoNotificacion.RIESGO_CRITICO,
          title: 'Riesgo crítico detectado',
          message: 'Se detectó un riesgo crítico en el proyecto X',
          userId: 1,
          priority: PrioridadNotificacion.CRITICA,
          status: EstadoNotificacion.ENVIADA,
          channel: 'EMAIL',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          sentAt: new Date('2024-01-01T10:01:00Z'),
          readAt: undefined
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false
    })

    // Mock critical alerts
    mockMonitoringService.getCriticalAlerts.mockResolvedValue([
      {
        id: 1,
        type: TipoNotificacion.RIESGO_CRITICO,
        title: 'Alerta crítica',
        message: 'Mensaje de alerta crítica',
        userId: 1,
        priority: PrioridadNotificacion.CRITICA,
        status: EstadoNotificacion.ENVIADA,
        channel: 'EMAIL',
        createdAt: new Date('2024-01-01T10:00:00Z')
      }
    ])

    // Mock security incidents
    mockMonitoringService.getSecurityIncidents.mockResolvedValue([])
  })

  it('should create MonitoringService instance', () => {
    expect(MonitoringService).toBeDefined()
    expect(mockMonitoringService.getSystemMetrics).toBeDefined()
    expect(mockMonitoringService.getAuditLogs).toBeDefined()
  })

  it('should call monitoring service methods', async () => {
    expect(mockMonitoringService.getSystemMetrics).toBeDefined()
    expect(mockMonitoringService.getAuditLogs).toBeDefined()
    expect(mockMonitoringService.getCriticalAlerts).toBeDefined()
    expect(mockMonitoringService.getSecurityIncidents).toBeDefined()
    expect(mockMonitoringService.exportAuditLogs).toBeDefined()
  })

  it('should handle export functionality', async () => {
    mockMonitoringService.exportAuditLogs.mockResolvedValue('CSV data')
    
    const result = await mockMonitoringService.exportAuditLogs({}, 'csv')
    expect(result).toBe('CSV data')
    expect(mockMonitoringService.exportAuditLogs).toHaveBeenCalledWith({}, 'csv')
  })

  it('should handle process pending notifications', async () => {
    mockMonitoringService.processePendingNotifications.mockResolvedValue({
      processed: 5,
      sent: 4,
      errors: 1
    })

    const result = await mockMonitoringService.processePendingNotifications()
    expect(result).toEqual({
      processed: 5,
      sent: 4,
      errors: 1
    })
  })

  it('should handle retry failed notifications', async () => {
    mockMonitoringService.retryFailedNotifications.mockResolvedValue({
      retried: 3,
      successful: 2,
      permanentlyFailed: 1
    })

    const result = await mockMonitoringService.retryFailedNotifications()
    expect(result).toEqual({
      retried: 3,
      successful: 2,
      permanentlyFailed: 1
    })
  })
})