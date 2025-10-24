import { useState, useEffect, useCallback } from 'react'
import { TipoNotificacion, CanalNotificacion, PrioridadNotificacion, EstadoNotificacion } from '@/domain/entities/Notificacion'
import { NOTIFICATION_MESSAGES } from '@/lib/constants/notifications'

export interface NotificationData {
    id: number
    tipo: TipoNotificacion
    titulo: string
    mensaje: string
    estado: EstadoNotificacion
    canal: CanalNotificacion
    prioridad: PrioridadNotificacion
    fechaCreacion: string
    fechaEnvio?: string
    fechaLeida?: string
    fechaVencimiento?: string
    idRiesgo?: number
    idProyecto?: number
    idAuditoria?: number
    idHallazgo?: number
    idActividad?: number
    idIncidente?: number
    idControl?: number
    metadatos?: Record<string, any>
    esPendiente: boolean
    esEnviada: boolean
    esLeida: boolean
    esCritica: boolean
    esVencida: boolean
}

export interface NotificationFilters {
    soloNoLeidas?: boolean
    tipo?: TipoNotificacion
    prioridad?: PrioridadNotificacion
    limite?: number
    offset?: number
}

export interface NotificationPreference {
    id?: number
    tipo: TipoNotificacion
    canal: CanalNotificacion
    activa: boolean
    frecuenciaMinutos?: number
    horaInicio?: string
    horaFin?: string
    diasSemana?: number[]
    prioridadMinima?: PrioridadNotificacion
    esRecurrente?: boolean
    tieneRestriccionHoraria?: boolean
    tieneRestriccionDias?: boolean
}

export interface SendNotificationRequest {
    tipo: TipoNotificacion
    idUsuarioDestino: number
    contexto: Record<string, any>
    forzarEnvio?: boolean
    canalEspecifico?: CanalNotificacion
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    const [preferences, setPreferences] = useState<NotificationPreference[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isMarkingRead, setIsMarkingRead] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Obtener notificaciones
    const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
        try {
            setIsLoading(true)
            setError(null)

            const params = new URLSearchParams()
            if (filters?.soloNoLeidas) params.append('soloNoLeidas', 'true')
            if (filters?.tipo) params.append('tipo', filters.tipo)
            if (filters?.prioridad) params.append('prioridad', filters.prioridad)
            if (filters?.limite) params.append('limite', filters.limite.toString())
            if (filters?.offset) params.append('offset', filters.offset.toString())

            const response = await fetch(`/api/notifications?${params}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error al obtener notificaciones')
            }

            setNotifications(result.data.notificaciones)
            setUnreadCount(result.data.noLeidas)
            setTotalCount(result.data.total)

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error desconocido')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Enviar notificación
    const sendNotification = useCallback(async (request: SendNotificationRequest): Promise<{
        success: boolean
        error?: string
    }> => {
        try {
            setIsSending(true)
            setError(null)

            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || NOTIFICATION_MESSAGES.SEND.ERROR)
            }

            // Refrescar notificaciones después de enviar
            await fetchNotifications()

            return { success: true }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : NOTIFICATION_MESSAGES.SEND.ERROR
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsSending(false)
        }
    }, [fetchNotifications])

    // Marcar como leídas
    const markAsRead = useCallback(async (ids?: number[]): Promise<{
        success: boolean
        error?: string
    }> => {
        try {
            setIsMarkingRead(true)
            setError(null)

            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || NOTIFICATION_MESSAGES.MARK_READ.ERROR)
            }

            // Actualizar estado local
            if (ids) {
                setNotifications(prev => prev.map(notification => 
                    ids.includes(notification.id) 
                        ? { ...notification, esLeida: true, fechaLeida: new Date().toISOString() }
                        : notification
                ))
                setUnreadCount(prev => Math.max(0, prev - ids.length))
            } else {
                setNotifications(prev => prev.map(notification => ({
                    ...notification,
                    esLeida: true,
                    fechaLeida: new Date().toISOString()
                })))
                setUnreadCount(0)
            }

            return { success: true }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : NOTIFICATION_MESSAGES.MARK_READ.ERROR
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsMarkingRead(false)
        }
    }, [])

    // Obtener preferencias
    const fetchPreferences = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/notifications/preferences')
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error al obtener preferencias')
            }

            setPreferences(result.data.preferencias)

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error desconocido')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Actualizar preferencias
    const updatePreferences = useCallback(async (
        newPreferences: Partial<NotificationPreference>[],
        initialize = false
    ): Promise<{
        success: boolean
        error?: string
    }> => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/notifications/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferencias: newPreferences,
                    inicializar: initialize
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || NOTIFICATION_MESSAGES.PREFERENCES.ERROR)
            }

            setPreferences(result.data.preferencias)

            return { success: true }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : NOTIFICATION_MESSAGES.PREFERENCES.ERROR
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Inicializar preferencias por defecto
    const initializePreferences = useCallback(async (): Promise<{
        success: boolean
        error?: string
    }> => {
        return updatePreferences([], true)
    }, [updatePreferences])

    // Obtener notificaciones no leídas
    const fetchUnreadNotifications = useCallback(async () => {
        return fetchNotifications({ soloNoLeidas: true })
    }, [fetchNotifications])

    // Obtener notificaciones por tipo
    const fetchNotificationsByType = useCallback(async (tipo: TipoNotificacion) => {
        return fetchNotifications({ tipo })
    }, [fetchNotifications])

    // Obtener notificaciones por prioridad
    const fetchNotificationsByPriority = useCallback(async (prioridad: PrioridadNotificacion) => {
        return fetchNotifications({ prioridad })
    }, [fetchNotifications])

    // Métodos de conveniencia para envío de notificaciones específicas
    const notifyActivityDue = useCallback(async (
        idUsuarioDestino: number,
        idActividad: number,
        descripcionActividad: string,
        fechaVencimiento: Date
    ) => {
        return sendNotification({
            tipo: TipoNotificacion.VENCIMIENTO_ACTIVIDAD,
            idUsuarioDestino,
            contexto: {
                idActividad,
                descripcionActividad,
                fechaVencimiento: fechaVencimiento.toISOString(),
                diasRestantes: Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            }
        })
    }, [sendNotification])

    const notifyCriticalRisk = useCallback(async (
        idUsuarioDestino: number,
        idRiesgo: number,
        nombreRiesgo: string,
        nivelRiesgo: number
    ) => {
        return sendNotification({
            tipo: TipoNotificacion.RIESGO_CRITICO,
            idUsuarioDestino,
            contexto: {
                idRiesgo,
                nombreRiesgo,
                nivelRiesgo
            },
            forzarEnvio: true
        })
    }, [sendNotification])

    const notifySecurityIncident = useCallback(async (
        idUsuarioDestino: number,
        idIncidente: number,
        descripcionIncidente: string,
        severidad: string
    ) => {
        return sendNotification({
            tipo: TipoNotificacion.INCIDENTE_SEGURIDAD,
            idUsuarioDestino,
            contexto: {
                idIncidente,
                descripcionIncidente,
                severidad
            },
            forzarEnvio: true
        })
    }, [sendNotification])

    const notifyNewEvidence = useCallback(async (
        idUsuarioDestino: number,
        nombreArchivo: string,
        contextoEntidad: {
            idRiesgo?: number
            nombreRiesgo?: string
            idAuditoria?: number
            nombreAuditoria?: string
        }
    ) => {
        return sendNotification({
            tipo: TipoNotificacion.NUEVA_EVIDENCIA,
            idUsuarioDestino,
            contexto: {
                nombreArchivo,
                ...contextoEntidad
            }
        })
    }, [sendNotification])

    // Utilidades
    const getNotificationById = useCallback((id: number): NotificationData | undefined => {
        return notifications.find(n => n.id === id)
    }, [notifications])

    const getUnreadNotifications = useCallback((): NotificationData[] => {
        return notifications.filter(n => !n.esLeida)
    }, [notifications])

    const getCriticalNotifications = useCallback((): NotificationData[] => {
        return notifications.filter(n => n.esCritica)
    }, [notifications])

    const getExpiredNotifications = useCallback((): NotificationData[] => {
        return notifications.filter(n => n.esVencida)
    }, [notifications])

    const getPreferenceByType = useCallback((tipo: TipoNotificacion, canal: CanalNotificacion): NotificationPreference | undefined => {
        return preferences.find(p => p.tipo === tipo && p.canal === canal)
    }, [preferences])

    // Auto-refresh de notificaciones cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications({ soloNoLeidas: true })
        }, 30000)

        return () => clearInterval(interval)
    }, [fetchNotifications])

    return {
        // Estado
        notifications,
        preferences,
        unreadCount,
        totalCount,
        isLoading,
        isSending,
        isMarkingRead,
        error,

        // Funciones principales
        fetchNotifications,
        sendNotification,
        markAsRead,
        fetchPreferences,
        updatePreferences,
        initializePreferences,

        // Funciones de conveniencia
        fetchUnreadNotifications,
        fetchNotificationsByType,
        fetchNotificationsByPriority,

        // Notificaciones específicas
        notifyActivityDue,
        notifyCriticalRisk,
        notifySecurityIncident,
        notifyNewEvidence,

        // Utilidades
        getNotificationById,
        getUnreadNotifications,
        getCriticalNotifications,
        getExpiredNotifications,
        getPreferenceByType,

        // Limpiar error
        clearError: () => setError(null)
    }
}