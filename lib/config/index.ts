// =============================================
// CONFIGURACIÓN CENTRALIZADA DEL SISTEMA
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// import { Database } from '@/lib/supabase/types'

// Tipos de configuración
export interface AppConfig {
  app: {
    name: string
    version: string
    description: string
    company: string
    environment: 'development' | 'staging' | 'production'
  }
  supabase: {
    url: string
    anonKey: string
    projectId: string
  }
  oauth: {
    google: {
      clientId: string
      enabled: boolean
    }
    linkedin: {
      clientId: string
      enabled: boolean
    }
    github: {
      clientId: string
      enabled: boolean
    }
  }
  features: {
    enableOAuth: boolean
    enableISO27001: boolean
    enableAuditTrail: boolean
    enableNotifications: boolean
  }
  ui: {
    theme: {
      primary: string
      secondary: string
      accent: string
    }
    company: {
      name: string
      logo: string
      colors: {
        primary: string
        secondary: string
      }
    }
  }
}

// Configuración de la aplicación
export const appConfig: AppConfig = {
  app: {
    name: 'Sistema de Gestión de Riesgos COSO II + ISO 27001',
    version: '1.0.0',
    description:
      'Sistema integral de gestión de riesgos empresariales y seguridad de la información',
    company: 'DELTA CONSULT LTDA',
    environment: (process.env.NODE_ENV as AppConfig['app']['environment']) || 'development',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
    projectId: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || 'prcsicfnvyaoxwfrjnky',
  },
  oauth: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      enabled: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
    linkedin: {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
      enabled: !!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    },
    github: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
      enabled: !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    },
  },
  features: {
    enableOAuth: true,
    enableISO27001: true,
    enableAuditTrail: true,
    enableNotifications: true,
  },
  ui: {
    theme: {
      primary: 'hsl(222.2 84% 4.9%)', // Dark blue
      secondary: 'hsl(210 40% 96%)', // Light gray
      accent: 'hsl(210 40% 98%)', // Very light gray
    },
    company: {
      name: 'DELTA CONSULT LTDA',
      logo: '/logo-delta-consult.png',
      colors: {
        primary: '#1e40af', // Blue-700
        secondary: '#64748b', // Slate-500
      },
    },
  },
}

// Función para validar configuración
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar Supabase
  if (!appConfig.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!appConfig.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required')
  }

  // Validar OAuth (solo si está habilitado)
  if (appConfig.features.enableOAuth) {
    const enabledProviders = Object.entries(appConfig.oauth).filter(([_, config]) => config.enabled)

    if (enabledProviders.length === 0) {
      errors.push('At least one OAuth provider must be configured when OAuth is enabled')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Función para obtener configuración del entorno
export function getEnvironmentConfig() {
  return {
    isDevelopment: appConfig.app.environment === 'development',
    isStaging: appConfig.app.environment === 'staging',
    isProduction: appConfig.app.environment === 'production',
    enableDebug: appConfig.app.environment !== 'production',
  }
}

// Exportar configuración por defecto
export default appConfig
