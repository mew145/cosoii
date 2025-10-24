// =============================================
// CONSTANTES: Sistema de Notificaciones
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { 
    TipoNotificacion, 
    CanalNotificacion, 
    PrioridadNotificacion,
    EstadoNotificacion 
} from '@/domain/entities/Notificacion'

export const NOTIFICATION_CONFIG = {
    // Configuración de procesamiento
    BATCH_SIZE: 50,
    PROCESSING_INTERVAL_MINUTES: 5,
    MAX_RETRY_ATTEMPTS: 3,
    DUPLICATE_WINDOW_MINUTES: 60,
    
    // Configuración de limpieza
    CLEANUP_DAYS: 90,
    CLEANUP_INTERVAL_HOURS: 24,
    
    // Configuración de email
    EMAIL_ENABLED: true,
    SMS_ENABLED: false,
    
    // Tiempos de vencimiento por defecto (horas)
    DEFAULT_EXPIRY_HOURS: {
        [TipoNotificacion.VENCIMIENTO_ACTIVIDAD]: 72,
        [TipoNotificacion.RIESGO_CRITICO]: 24,
        [TipoNotificacion.HALLAZGO_PENDIENTE]: 168, // 7 días
        [TipoNotificacion.PROYECTO_EXCEDE_TIEMPO]: 48,
        [TipoNotificacion.NUEVA_EVIDENCIA]: 24,
        [TipoNotificacion.AUDITORIA_PROGRAMADA]: 48,
        [TipoNotificacion.INCIDENTE_SEGURIDAD]: 1,
        [TipoNotificacion.CONTROL_VENCIDO]: 24
    }
} as const

export const NOTIFICATION_TYPES = {
    [TipoNotificacion.VENCIMIENTO_ACTIVIDAD]: {
        name: 'Vencimiento de Actividad',
        description: 'Notificación cuando una actividad está próxima a vencer',
        icon: 'Clock',
        color: '#ea580c', // orange-600
        priority: PrioridadNotificacion.ALTA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: true
    },
    [TipoNotificacion.RIESGO_CRITICO]: {
        name: 'Riesgo Crítico',
        description: 'Alerta cuando un riesgo alcanza nivel crítico',
        icon: 'AlertTriangle',
        color: '#dc2626', // red-600
        priority: PrioridadNotificacion.CRITICA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: true
    },
    [TipoNotificacion.HALLAZGO_PENDIENTE]: {
        name: 'Hallazgo Pendiente',
        description: 'Recordatorio de hallazgos pendientes de cierre',
        icon: 'FileSearch',
        color: '#d97706', // amber-600
        priority: PrioridadNotificacion.MEDIA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: false
    },
    [TipoNotificacion.PROYECTO_EXCEDE_TIEMPO]: {
        name: 'Proyecto Excede Tiempo',
        description: 'Alerta cuando un proyecto excede el tiempo planificado',
        icon: 'TrendingUp',
        color: '#dc2626', // red-600
        priority: PrioridadNotificacion.ALTA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: true
    },
    [TipoNotificacion.NUEVA_EVIDENCIA]: {
        name: 'Nueva Evidencia',
        description: 'Notificación cuando se carga nueva evidencia',
        icon: 'Upload',
        color: '#16a34a', // green-600
        priority: PrioridadNotificacion.BAJA,
        defaultChannel: CanalNotificacion.SISTEMA,
        canForce: false
    },
    [TipoNotificacion.AUDITORIA_PROGRAMADA]: {
        name: 'Auditoría Programada',
        description: 'Notificación de nueva auditoría programada',
        icon: 'Calendar',
        color: '#2563eb', // blue-600
        priority: PrioridadNotificacion.MEDIA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: false
    },
    [TipoNotificacion.INCIDENTE_SEGURIDAD]: {
        name: 'Incidente de Seguridad',
        description: 'Alerta crítica de incidente de seguridad',
        icon: 'Shield',
        color: '#7c2d12', // orange-800
        priority: PrioridadNotificacion.CRITICA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: true
    },
    [TipoNotificacion.CONTROL_VENCIDO]: {
        name: 'Control Vencido',
        description: 'Notificación de control de seguridad vencido',
        icon: 'ShieldAlert',
        color: '#dc2626', // red-600
        priority: PrioridadNotificacion.ALTA,
        defaultChannel: CanalNotificacion.EMAIL,
        canForce: true
    }
} as const

export const NOTIFICATION_CHANNELS = {
    [CanalNotificacion.EMAIL]: {
        name: 'Email',
        description: 'Notificaciones por correo electrónico',
        icon: 'Mail',
        color: '#2563eb', // blue-600
        enabled: true,
        requiresConfig: true
    },
    [CanalNotificacion.SISTEMA]: {
        name: 'Sistema',
        description: 'Notificaciones dentro del sistema',
        icon: 'Bell',
        color: '#16a34a', // green-600
        enabled: true,
        requiresConfig: false
    },
    [CanalNotificacion.SMS]: {
        name: 'SMS',
        description: 'Notificaciones por mensaje de texto',
        icon: 'MessageSquare',
        color: '#7c3aed', // violet-600
        enabled: false,
        requiresConfig: true
    }
} as const

export const NOTIFICATION_PRIORITIES = {
    [PrioridadNotificacion.BAJA]: {
        name: 'Baja',
        description: 'Prioridad baja - informativa',
        icon: 'Info',
        color: '#16a34a', // green-600
        weight: 1
    },
    [PrioridadNotificacion.MEDIA]: {
        name: 'Media',
        description: 'Prioridad media - requiere atención',
        icon: 'AlertCircle',
        color: '#d97706', // amber-600
        weight: 2
    },
    [PrioridadNotificacion.ALTA]: {
        name: 'Alta',
        description: 'Prioridad alta - requiere acción pronta',
        icon: 'AlertTriangle',
        color: '#ea580c', // orange-600
        weight: 3
    },
    [PrioridadNotificacion.CRITICA]: {
        name: 'Crítica',
        description: 'Prioridad crítica - requiere acción inmediata',
        icon: 'AlertOctagon',
        color: '#dc2626', // red-600
        weight: 4
    }
} as const

export const NOTIFICATION_STATES = {
    [EstadoNotificacion.PENDIENTE]: {
        name: 'Pendiente',
        description: 'Pendiente de envío',
        icon: 'Clock',
        color: '#d97706' // amber-600
    },
    [EstadoNotificacion.ENVIADA]: {
        name: 'Enviada',
        description: 'Enviada exitosamente',
        icon: 'Send',
        color: '#16a34a' // green-600
    },
    [EstadoNotificacion.LEIDA]: {
        name: 'Leída',
        description: 'Leída por el usuario',
        icon: 'Eye',
        color: '#6b7280' // gray-500
    },
    [EstadoNotificacion.ERROR]: {
        name: 'Error',
        description: 'Error en el envío',
        icon: 'AlertCircle',
        color: '#dc2626' // red-600
    }
} as const

export const NOTIFICATION_MESSAGES = {
    SEND: {
        SUCCESS: 'Notificación enviada exitosamente',
        ERROR: 'Error al enviar notificación',
        DUPLICATE: 'Notificación duplicada ignorada',
        USER_NOT_FOUND: 'Usuario destinatario no encontrado',
        NO_PREFERENCES: 'Usuario sin preferencias de notificación configuradas'
    },
    MARK_READ: {
        SUCCESS: 'Notificaciones marcadas como leídas',
        ERROR: 'Error al marcar notificaciones como leídas'
    },
    PREFERENCES: {
        UPDATED: 'Preferencias actualizadas exitosamente',
        INITIALIZED: 'Preferencias inicializadas exitosamente',
        ERROR: 'Error al actualizar preferencias'
    },
    PROCESSING: {
        STARTED: 'Procesamiento de notificaciones iniciado',
        COMPLETED: 'Procesamiento completado',
        ERROR: 'Error en el procesamiento'
    }
} as const

export const NOTIFICATION_TEMPLATES = {
    EMAIL: {
        SUBJECT_PREFIX: 'DELTA CONSULT - ',
        FOOTER_TEXT: 'Este es un mensaje automático del Sistema de Gestión de Riesgos. Por favor, no responda a este correo.',
        COMPANY_NAME: 'DELTA CONSULT',
        SYSTEM_NAME: 'Sistema de Gestión de Riesgos COSO II + ISO 27001'
    },
    SYSTEM: {
        MAX_TITLE_LENGTH: 100,
        MAX_MESSAGE_LENGTH: 500,
        TRUNCATE_SUFFIX: '...'
    }
} as const

export const NOTIFICATION_SCHEDULES = {
    // Horarios de trabajo por defecto
    DEFAULT_WORK_HOURS: {
        START: '08:00',
        END: '18:00'
    },
    
    // Días de la semana (0 = Domingo)
    WORK_DAYS: [1, 2, 3, 4, 5] as const, // Lunes a Viernes
    
    // Frecuencias predefinidas (en minutos)
    FREQUENCIES: {
        IMMEDIATE: 0,
        EVERY_5_MINUTES: 5,
        EVERY_15_MINUTES: 15,
        EVERY_30_MINUTES: 30,
        HOURLY: 60,
        EVERY_2_HOURS: 120,
        EVERY_4_HOURS: 240,
        EVERY_8_HOURS: 480,
        DAILY: 1440,
        WEEKLY: 10080
    }
} as const

// Utilidades para notificaciones
export const NotificationUtils = {
    getPriorityWeight: (priority: PrioridadNotificacion): number => {
        return NOTIFICATION_PRIORITIES[priority].weight
    },

    getTypeConfig: (type: TipoNotificacion) => {
        return NOTIFICATION_TYPES[type]
    },

    getChannelConfig: (channel: CanalNotificacion) => {
        return NOTIFICATION_CHANNELS[channel]
    },

    getPriorityConfig: (priority: PrioridadNotificacion) => {
        return NOTIFICATION_PRIORITIES[priority]
    },

    getStateConfig: (state: EstadoNotificacion) => {
        return NOTIFICATION_STATES[state]
    },

    formatTimeAgo: (date: Date): string => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMinutes / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMinutes < 1) return 'Ahora'
        if (diffMinutes < 60) return `Hace ${diffMinutes} min`
        if (diffHours < 24) return `Hace ${diffHours}h`
        if (diffDays < 7) return `Hace ${diffDays}d`
        
        return date.toLocaleDateString('es-ES')
    },

    isWorkingHours: (date: Date = new Date()): boolean => {
        const hour = date.getHours()
        const minute = date.getMinutes()
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        return timeString >= NOTIFICATION_SCHEDULES.DEFAULT_WORK_HOURS.START &&
               timeString <= NOTIFICATION_SCHEDULES.DEFAULT_WORK_HOURS.END
    },

    isWorkingDay: (date: Date = new Date()): boolean => {
        const dayOfWeek = date.getDay()
        return (NOTIFICATION_SCHEDULES.WORK_DAYS as readonly number[]).includes(dayOfWeek)
    },

    shouldSendNow: (priority: PrioridadNotificacion, date: Date = new Date()): boolean => {
        // Las notificaciones críticas siempre se envían
        if (priority === PrioridadNotificacion.CRITICA) {
            return true
        }
        
        // Las demás solo en horario laboral
        return NotificationUtils.isWorkingHours(date) && NotificationUtils.isWorkingDay(date)
    },

    truncateText: (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength - 3) + NOTIFICATION_TEMPLATES.SYSTEM.TRUNCATE_SUFFIX
    }
} as const