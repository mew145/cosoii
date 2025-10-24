// =============================================
// ÍNDICE DE CONSTANTES
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// Exportar todas las constantes de base de datos
export * from './database'

// Exportar todas las constantes de ISO 27001
export * from './iso27001'

// Exportar todas las constantes de autenticación
export * from './auth'

// Exportar todas las constantes de UI
export * from './ui'

// Exportar configuración
export { default as appConfig } from '../config'
export * from '../config'
export * from '../config/validation'

// =============================================
// EXPORTACIONES AGRUPADAS PARA CONVENIENCIA
// =============================================

// Constantes de roles y permisos
export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  canAccessModule,
} from './auth'

// Constantes de roles y departamentos (desde database)
export { ROLES, DEPARTAMENTOS } from './database'

// Constantes de riesgos COSO
export {
  ESTADOS_RIESGO,
  CATEGORIAS_RIESGO,
  TIPOS_RESPUESTA_RIESGO,
  NIVELES_RIESGO,
  ESCALA_PROBABILIDAD,
  ESCALA_IMPACTO,
  getNivelRiesgo,
  calcularNivelRiesgo,
} from './database'

// Constantes de ISO 27001
export {
  TIPOS_ACTIVO_INFORMACION,
  CLASIFICACIONES_SEGURIDAD,
  DOMINIOS_ISO27001,
  TIPOS_CONTROL_ISO,
  ESTADOS_IMPLEMENTACION,
  NIVELES_MADUREZ,
  TIPOS_INCIDENTE_SEGURIDAD,
  SEVERIDADES_INCIDENTE,
  ESTADOS_INCIDENTE,
  calcularRiesgoInherenteISO,
} from './iso27001'

// Constantes de navegación
export { MAIN_NAVIGATION, ISO27001_NAVIGATION } from './ui'

// Constantes de rutas (desde auth)
export { PROTECTED_ROUTES, PUBLIC_ROUTES, isPublicRoute, isProtectedRoute } from './auth'

// Constantes de OAuth y autenticación
export { OAUTH_PROVIDERS, AUTH_ROUTES, getRedirectUrl } from './auth'

// Configuración de UI
export {
  TABLE_CONFIG,
  FORM_CONFIG,
  NOTIFICATION_CONFIG,
  CHART_CONFIG,
  DASHBOARD_CONFIG,
  UI_MESSAGES,
} from './ui'
