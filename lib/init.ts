// =============================================
// INICIALIZACIÓN DEL SISTEMA
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { logConfigurationStatus, validateEnvironmentVariables } from './config/validation'
import { appConfig } from './config'

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

export function initializeApp() {
  // Solo ejecutar en el servidor
  if (typeof window !== 'undefined') {
    return
  }

  console.log(`\n🚀 Iniciando ${appConfig.app.name}`)
  console.log(`📍 Entorno: ${appConfig.app.environment}`)
  console.log(`🏢 Empresa: ${appConfig.app.company}`)
  console.log(`📦 Versión: ${appConfig.app.version}`)

  // Validar configuración
  const validation = validateEnvironmentVariables()

  if (!validation.isValid) {
    console.error('\n❌ ERRORES DE CONFIGURACIÓN:')
    validation.errors.forEach(error => console.error(`   - ${error}`))
    console.error('\n💡 Revisa el archivo .env.local y .env.example para más información\n')

    if (appConfig.app.environment === 'production') {
      throw new Error('Configuración inválida en producción')
    }
  }

  // Mostrar estado de configuración
  logConfigurationStatus()

  // Mostrar información de características
  console.log('🎯 Sistema listo para:')
  console.log(`   - Gestión de Riesgos COSO ERM 2017: ✅`)
  console.log(`   - ISO 27001:2022: ${appConfig.features.enableISO27001 ? '✅' : '❌'}`)
  console.log(`   - Autenticación OAuth: ${appConfig.features.enableOAuth ? '✅' : '❌'}`)
  console.log(`   - Auditoría de Cambios: ${appConfig.features.enableAuditTrail ? '✅' : '❌'}`)
  console.log(`   - Notificaciones: ${appConfig.features.enableNotifications ? '✅' : '❌'}`)

  console.log('\n🌐 Acceso:')
  console.log(`   - URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`)
  console.log(`   - Supabase: ${appConfig.supabase.url}`)

  console.log('\n=====================================\n')
}

// =============================================
// VALIDACIÓN EN TIEMPO DE EJECUCIÓN
// =============================================

export function validateRuntimeConfiguration() {
  const validation = validateEnvironmentVariables()

  if (!validation.isValid) {
    const errorMessage = `Configuración inválida: ${validation.errors.join(', ')}`

    if (appConfig.app.environment === 'production') {
      throw new Error(errorMessage)
    } else {
      console.warn(`⚠️ ${errorMessage}`)
    }
  }

  return validation
}

// =============================================
// INFORMACIÓN DEL SISTEMA
// =============================================

export function getSystemInfo() {
  return {
    app: {
      name: appConfig.app.name,
      version: appConfig.app.version,
      environment: appConfig.app.environment,
      company: appConfig.app.company,
    },
    features: appConfig.features,
    supabase: {
      url: appConfig.supabase.url,
      projectId: appConfig.supabase.projectId,
      configured: !!appConfig.supabase.url && !!appConfig.supabase.anonKey,
    },
    oauth: {
      enabled: appConfig.features.enableOAuth,
      providers: Object.entries(appConfig.oauth)
        .filter(([_, config]) => config.enabled)
        .map(([name, config]) => ({
          name,
          enabled: config.enabled,
          configured: !!config.clientId,
        })),
    },
    timestamp: new Date().toISOString(),
  }
}

// Ejecutar inicialización automáticamente
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  initializeApp()
}
