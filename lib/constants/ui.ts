// =============================================
// CONSTANTES DE INTERFAZ DE USUARIO
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// =============================================
// NAVEGACIÓN PRINCIPAL
// =============================================
export const MAIN_NAVIGATION = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Panel principal con métricas y resumen',
    requiredPermission: 'dashboard.view',
  },
  {
    title: 'Proyectos',
    href: '/projects',
    icon: 'FolderOpen',
    description: 'Gestión de proyectos de auditoría',
    requiredPermission: 'projects.view',
  },
  {
    title: 'Riesgos',
    href: '/risks',
    icon: 'AlertTriangle',
    description: 'Identificación y gestión de riesgos COSO',
    requiredPermission: 'risks.view',
  },
  {
    title: 'Controles',
    href: '/controls',
    icon: 'Shield',
    description: 'Controles internos y evaluaciones',
    requiredPermission: 'controls.view',
  },
  {
    title: 'Auditorías',
    href: '/audits',
    icon: 'Search',
    description: 'Auditorías internas y cumplimiento',
    requiredPermission: 'audits.view',
  },
  {
    title: 'ISO 27001',
    href: '/iso27001',
    icon: 'Lock',
    description: 'Gestión de seguridad de la información',
    requiredPermission: 'iso27001.view',
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: 'FileText',
    description: 'Reportes y análisis',
    requiredPermission: 'reports.view',
  },
  {
    title: 'Usuarios',
    href: '/users',
    icon: 'Users',
    description: 'Gestión de usuarios y permisos',
    requiredPermission: 'users.view',
  },
] as const

// =============================================
// NAVEGACIÓN ISO 27001
// =============================================
export const ISO27001_NAVIGATION = [
  {
    title: 'Dashboard ISO',
    href: '/iso27001',
    icon: 'BarChart3',
    description: 'Métricas de seguridad de la información',
  },
  {
    title: 'Activos',
    href: '/iso27001/assets',
    icon: 'HardDrive',
    description: 'Inventario de activos de información',
  },
  {
    title: 'Controles',
    href: '/iso27001/controls',
    icon: 'Shield',
    description: 'Controles de seguridad ISO 27001',
  },
  {
    title: 'Evaluaciones',
    href: '/iso27001/assessments',
    icon: 'ClipboardCheck',
    description: 'Evaluaciones de riesgo de seguridad',
  },
  {
    title: 'Incidentes',
    href: '/iso27001/incidents',
    icon: 'AlertCircle',
    description: 'Gestión de incidentes de seguridad',
  },
  {
    title: 'Cumplimiento',
    href: '/iso27001/compliance',
    icon: 'CheckCircle',
    description: 'Estado de cumplimiento ISO 27001',
  },
] as const

// =============================================
// TAMAÑOS DE PÁGINA
// =============================================
export const PAGE_SIZES = [10, 25, 50, 100] as const

// =============================================
// FORMATOS DE FECHA
// =============================================
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd/MM/yyyy HH:mm',
  FULL: "EEEE, dd 'de' MMMM 'de' yyyy",
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm:ss',
} as const

// =============================================
// CONFIGURACIÓN DE TABLAS
// =============================================
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  SHOW_PAGINATION_WHEN: 10, // Mostrar paginación cuando hay más de X elementos
  STICKY_HEADER: true,
  SORTABLE_COLUMNS: true,
  FILTERABLE_COLUMNS: true,
} as const

// =============================================
// CONFIGURACIÓN DE FORMULARIOS
// =============================================
export const FORM_CONFIG = {
  AUTO_SAVE_DELAY: 2000, // ms
  VALIDATION_DELAY: 500, // ms
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  TEXTAREA_MIN_ROWS: 3,
  TEXTAREA_MAX_ROWS: 10,
} as const

// =============================================
// CONFIGURACIÓN DE NOTIFICACIONES
// =============================================
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000, // ms
  SUCCESS_DURATION: 3000, // ms
  ERROR_DURATION: 7000, // ms
  WARNING_DURATION: 5000, // ms
  INFO_DURATION: 4000, // ms
  MAX_NOTIFICATIONS: 5,
  POSITION: 'top-right' as const,
} as const

// =============================================
// TIPOS DE NOTIFICACIÓN
// =============================================
export const NOTIFICATION_TYPES = {
  SUCCESS: {
    type: 'success' as const,
    icon: 'CheckCircle',
    color: '#10b981', // emerald-500
    bgColor: '#d1fae5', // emerald-100
    borderColor: '#34d399', // emerald-400
  },
  ERROR: {
    type: 'error' as const,
    icon: 'XCircle',
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    borderColor: '#f87171', // red-400
  },
  WARNING: {
    type: 'warning' as const,
    icon: 'AlertTriangle',
    color: '#f59e0b', // amber-500
    bgColor: '#fef3c7', // amber-100
    borderColor: '#fbbf24', // amber-400
  },
  INFO: {
    type: 'info' as const,
    icon: 'Info',
    color: '#3b82f6', // blue-500
    bgColor: '#dbeafe', // blue-100
    borderColor: '#60a5fa', // blue-400
  },
} as const

// =============================================
// CONFIGURACIÓN DE GRÁFICOS
// =============================================
export const CHART_CONFIG = {
  DEFAULT_HEIGHT: 300,
  COLORS: {
    PRIMARY: '#3b82f6', // blue-500
    SECONDARY: '#8b5cf6', // violet-500
    SUCCESS: '#10b981', // emerald-500
    WARNING: '#f59e0b', // amber-500
    ERROR: '#ef4444', // red-500
    INFO: '#06b6d4', // cyan-500
    GRAY: '#6b7280', // gray-500
  },
  PALETTE: [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ],
} as const

// =============================================
// CONFIGURACIÓN DE MATRIZ DE RIESGOS
// =============================================
export const RISK_MATRIX_CONFIG = {
  SIZE: 5, // 5x5 matrix
  CELL_SIZE: 60, // px
  COLORS: {
    VERY_LOW: '#22c55e', // green-500
    LOW: '#84cc16', // lime-500
    MEDIUM: '#eab308', // yellow-500
    HIGH: '#f97316', // orange-500
    CRITICAL: '#ef4444', // red-500
  },
  LABELS: {
    PROBABILITY: 'Probabilidad',
    IMPACT: 'Impacto',
    VERY_LOW: 'Muy Bajo',
    LOW: 'Bajo',
    MEDIUM: 'Medio',
    HIGH: 'Alto',
    VERY_HIGH: 'Muy Alto',
  },
} as const

// =============================================
// CONFIGURACIÓN DE DASHBOARD
// =============================================
export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 segundos
  CARD_MIN_HEIGHT: 200, // px
  CHART_HEIGHT: 300, // px
  GRID_COLUMNS: 12,
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const

// =============================================
// CONFIGURACIÓN DE BÚSQUEDA
// =============================================
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // ms
  MAX_RESULTS: 50,
  HIGHLIGHT_CLASS: 'bg-yellow-200 text-yellow-900',
} as const

// =============================================
// CONFIGURACIÓN DE EXPORTACIÓN
// =============================================
export const EXPORT_CONFIG = {
  FORMATS: ['pdf', 'excel', 'csv'] as const,
  MAX_RECORDS: 10000,
  FILENAME_DATE_FORMAT: 'yyyy-MM-dd_HH-mm',
  PDF_OPTIONS: {
    format: 'A4' as const,
    orientation: 'portrait' as const,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
} as const

// =============================================
// MENSAJES DE LA UI
// =============================================
export const UI_MESSAGES = {
  LOADING: 'Cargando...',
  NO_DATA: 'No hay datos disponibles',
  ERROR_LOADING: 'Error al cargar los datos',
  SAVE_SUCCESS: 'Guardado exitosamente',
  SAVE_ERROR: 'Error al guardar',
  DELETE_SUCCESS: 'Eliminado exitosamente',
  DELETE_ERROR: 'Error al eliminar',
  DELETE_CONFIRM: '¿Estás seguro de que deseas eliminar este elemento?',
  UNSAVED_CHANGES: 'Tienes cambios sin guardar. ¿Deseas continuar?',
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_DATE: 'Fecha inválida',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
} as const

// =============================================
// CONFIGURACIÓN DE TEMA
// =============================================
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light' as const,
  THEMES: ['light', 'dark', 'system'] as const,
  STORAGE_KEY: 'theme-preference',
} as const

// Exportar arrays para uso en componentes
export const MAIN_NAVIGATION_ARRAY = Array.from(MAIN_NAVIGATION)
export const ISO27001_NAVIGATION_ARRAY = Array.from(ISO27001_NAVIGATION)
export const PAGE_SIZES_ARRAY = Array.from(PAGE_SIZES)
export const NOTIFICATION_TYPES_ARRAY = Object.values(NOTIFICATION_TYPES)
