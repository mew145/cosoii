// =============================================
// CONSTANTES DE AUTENTICACIÓN
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// =============================================
// PROVEEDORES OAUTH
// =============================================
export const OAUTH_PROVIDERS = {
  GOOGLE: {
    name: 'google' as const,
    displayName: 'Google',
    icon: 'Chrome', // Lucide icon name
    color: '#ea4335',
    bgColor: '#fef2f2',
    textColor: '#991b1b',
  },
  LINKEDIN: {
    name: 'linkedin' as const,
    displayName: 'LinkedIn',
    icon: 'Linkedin', // Lucide icon name
    color: '#0077b5',
    bgColor: '#eff6ff',
    textColor: '#1e40af',
  },
  GITHUB: {
    name: 'github' as const,
    displayName: 'GitHub',
    icon: 'Github', // Lucide icon name
    color: '#333333',
    bgColor: '#f9fafb',
    textColor: '#111827',
  },
} as const

// =============================================
// RUTAS DE AUTENTICACIÓN
// =============================================
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/sign-up',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CALLBACK: '/auth/callback',
  LOGOUT: '/auth/logout',
} as const

// =============================================
// RUTAS PROTEGIDAS
// =============================================
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  USERS: '/users',
  PROJECTS: '/projects',
  RISKS: '/risks',
  AUDITS: '/audits',
  ISO27001: '/iso27001',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const

// =============================================
// RUTAS PÚBLICAS
// =============================================
export const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/auth/error',
] as const

// =============================================
// PERMISOS POR MÓDULO
// =============================================
export const PERMISSIONS = {
  // Gestión de Usuarios
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    EDIT: 'users.edit',
    DELETE: 'users.delete',
    MANAGE_ROLES: 'users.manage_roles',
  },

  // Gestión de Proyectos
  PROJECTS: {
    VIEW: 'projects.view',
    CREATE: 'projects.create',
    EDIT: 'projects.edit',
    DELETE: 'projects.delete',
    MANAGE_TEAM: 'projects.manage_team',
  },

  // Gestión de Riesgos
  RISKS: {
    VIEW: 'risks.view',
    CREATE: 'risks.create',
    EDIT: 'risks.edit',
    DELETE: 'risks.delete',
    EVALUATE: 'risks.evaluate',
    APPROVE: 'risks.approve',
  },

  // Controles Internos
  CONTROLS: {
    VIEW: 'controls.view',
    CREATE: 'controls.create',
    EDIT: 'controls.edit',
    DELETE: 'controls.delete',
    EVALUATE: 'controls.evaluate',
  },

  // Auditorías
  AUDITS: {
    VIEW: 'audits.view',
    CREATE: 'audits.create',
    EDIT: 'audits.edit',
    DELETE: 'audits.delete',
    CONDUCT: 'audits.conduct',
    APPROVE: 'audits.approve',
  },

  // ISO 27001
  ISO27001: {
    VIEW: 'iso27001.view',
    MANAGE_ASSETS: 'iso27001.manage_assets',
    MANAGE_CONTROLS: 'iso27001.manage_controls',
    CONDUCT_ASSESSMENTS: 'iso27001.conduct_assessments',
    MANAGE_INCIDENTS: 'iso27001.manage_incidents',
  },

  // Reportes
  REPORTS: {
    VIEW: 'reports.view',
    GENERATE: 'reports.generate',
    EXPORT: 'reports.export',
    SCHEDULE: 'reports.schedule',
  },

  // Configuración del Sistema
  SYSTEM: {
    VIEW_SETTINGS: 'system.view_settings',
    MANAGE_SETTINGS: 'system.manage_settings',
    VIEW_LOGS: 'system.view_logs',
    BACKUP: 'system.backup',
  },
} as const

// =============================================
// PERMISOS POR ROL
// =============================================
export const ROLE_PERMISSIONS = {
  [1]: [
    // SUPERADMIN
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.PROJECTS),
    ...Object.values(PERMISSIONS.RISKS),
    ...Object.values(PERMISSIONS.CONTROLS),
    ...Object.values(PERMISSIONS.AUDITS),
    ...Object.values(PERMISSIONS.ISO27001),
    ...Object.values(PERMISSIONS.REPORTS),
    ...Object.values(PERMISSIONS.SYSTEM),
  ],

  [2]: [
    // ADMIN
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.EDIT,
    PERMISSIONS.USERS.MANAGE_ROLES,
    ...Object.values(PERMISSIONS.PROJECTS),
    ...Object.values(PERMISSIONS.RISKS),
    ...Object.values(PERMISSIONS.CONTROLS),
    ...Object.values(PERMISSIONS.AUDITS),
    ...Object.values(PERMISSIONS.ISO27001),
    ...Object.values(PERMISSIONS.REPORTS),
    PERMISSIONS.SYSTEM.VIEW_SETTINGS,
    PERMISSIONS.SYSTEM.MANAGE_SETTINGS,
  ],

  [3]: [
    // GERENTE
    PERMISSIONS.USERS.VIEW,
    ...Object.values(PERMISSIONS.PROJECTS),
    ...Object.values(PERMISSIONS.RISKS),
    ...Object.values(PERMISSIONS.CONTROLS),
    PERMISSIONS.AUDITS.VIEW,
    PERMISSIONS.AUDITS.CREATE,
    PERMISSIONS.AUDITS.EDIT,
    PERMISSIONS.ISO27001.VIEW,
    PERMISSIONS.ISO27001.MANAGE_ASSETS,
    ...Object.values(PERMISSIONS.REPORTS),
  ],

  [4]: [
    // AUDITOR_INTERNO
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.PROJECTS.VIEW,
    PERMISSIONS.RISKS.VIEW,
    PERMISSIONS.RISKS.EVALUATE,
    PERMISSIONS.CONTROLS.VIEW,
    PERMISSIONS.CONTROLS.EVALUATE,
    ...Object.values(PERMISSIONS.AUDITS),
    PERMISSIONS.ISO27001.VIEW,
    PERMISSIONS.ISO27001.CONDUCT_ASSESSMENTS,
    ...Object.values(PERMISSIONS.REPORTS),
  ],

  [5]: [
    // OFICIAL_SEGURIDAD
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.PROJECTS.VIEW,
    PERMISSIONS.RISKS.VIEW,
    PERMISSIONS.RISKS.CREATE,
    PERMISSIONS.RISKS.EDIT,
    PERMISSIONS.CONTROLS.VIEW,
    PERMISSIONS.CONTROLS.CREATE,
    PERMISSIONS.CONTROLS.EDIT,
    PERMISSIONS.AUDITS.VIEW,
    ...Object.values(PERMISSIONS.ISO27001),
    ...Object.values(PERMISSIONS.REPORTS),
  ],

  [6]: [
    // ANALISTA_RIESGOS
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.PROJECTS.VIEW,
    PERMISSIONS.RISKS.VIEW,
    PERMISSIONS.RISKS.CREATE,
    PERMISSIONS.RISKS.EDIT,
    PERMISSIONS.RISKS.EVALUATE,
    PERMISSIONS.CONTROLS.VIEW,
    PERMISSIONS.CONTROLS.CREATE,
    PERMISSIONS.CONTROLS.EDIT,
    PERMISSIONS.AUDITS.VIEW,
    PERMISSIONS.ISO27001.VIEW,
    PERMISSIONS.ISO27001.CONDUCT_ASSESSMENTS,
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.GENERATE,
  ],
} as const

// =============================================
// CONFIGURACIÓN DE SESIÓN
// =============================================
export const SESSION_CONFIG = {
  // Duración de la sesión en segundos (24 horas)
  DURATION: 24 * 60 * 60,

  // Tiempo de inactividad antes de cerrar sesión (2 horas)
  INACTIVITY_TIMEOUT: 2 * 60 * 60,

  // Tiempo de advertencia antes del cierre por inactividad (5 minutos)
  WARNING_TIMEOUT: 5 * 60,

  // Intentos máximos de login fallidos
  MAX_LOGIN_ATTEMPTS: 3,

  // Tiempo de bloqueo después de intentos fallidos (30 minutos)
  LOCKOUT_DURATION: 30 * 60,
} as const

// =============================================
// MENSAJES DE ERROR DE AUTENTICACIÓN
// =============================================
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_INACTIVE: 'Usuario inactivo',
  ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos',
  SESSION_EXPIRED: 'Sesión expirada',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
  OAUTH_ERROR: 'Error en autenticación OAuth',
  EMAIL_NOT_VERIFIED: 'Email no verificado',
  PASSWORD_RESET_REQUIRED: 'Se requiere restablecer la contraseña',
} as const

// =============================================
// FUNCIONES UTILITARIAS DE AUTENTICACIÓN
// =============================================

// Función para verificar si una ruta es pública
export function isPublicRoute(pathname: string): boolean {
  return (
    (PUBLIC_ROUTES as readonly string[]).includes(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname === '/'
  )
}

// Función para verificar si una ruta es protegida
export function isProtectedRoute(pathname: string): boolean {
  return Object.values(PROTECTED_ROUTES).some(route => pathname.startsWith(route))
}

// Función para verificar permisos de usuario
export function hasPermission(userRole: number, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
  return rolePermissions?.includes(permission as any) || false
}

// Función para obtener permisos de un rol
export function getRolePermissions(roleId: number): readonly string[] {
  return ROLE_PERMISSIONS[roleId as keyof typeof ROLE_PERMISSIONS] || []
}

// Función para verificar si el usuario puede acceder a un módulo
export function canAccessModule(userRole: number, module: keyof typeof PERMISSIONS): boolean {
  const modulePermissions = Object.values(PERMISSIONS[module])
  const userPermissions = getRolePermissions(userRole)

  return modulePermissions.some(permission => userPermissions.includes(permission as string))
}

// Función para obtener la URL de redirección después del login
export function getRedirectUrl(userRole: number): string {
  // Superadmin y Admin van al dashboard completo
  if (userRole <= 2) {
    return PROTECTED_ROUTES.DASHBOARD
  }

  // Gerentes van a proyectos
  if (userRole === 3) {
    return PROTECTED_ROUTES.PROJECTS
  }

  // Auditores van a auditorías
  if (userRole === 4) {
    return PROTECTED_ROUTES.AUDITS
  }

  // Oficial de seguridad va a ISO 27001
  if (userRole === 5) {
    return PROTECTED_ROUTES.ISO27001
  }

  // Analistas van a riesgos
  if (userRole === 6) {
    return PROTECTED_ROUTES.RISKS
  }

  // Por defecto, dashboard
  return PROTECTED_ROUTES.DASHBOARD
}

// Exportar arrays para uso en componentes
export const OAUTH_PROVIDERS_ARRAY = Object.values(OAUTH_PROVIDERS)
export const PUBLIC_ROUTES_ARRAY = Array.from(PUBLIC_ROUTES)
export const PROTECTED_ROUTES_ARRAY = Object.values(PROTECTED_ROUTES)
