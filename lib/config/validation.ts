// =============================================
// VALIDACIÓN DE CONFIGURACIÓN
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { appConfig } from './index'

// Tipos para validación
interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

interface EnvironmentCheck {
    name: string
    value: string | undefined
    required: boolean
    description: string
}

// =============================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// =============================================

export function validateEnvironmentVariables(): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Variables requeridas
    const requiredVars: EnvironmentCheck[] = [
        {
            name: 'NEXT_PUBLIC_SUPABASE_URL',
            value: process.env.NEXT_PUBLIC_SUPABASE_URL,
            required: true,
            description: 'URL de Supabase'
        },
        {
            name: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
            value: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            required: true,
            description: 'Clave pública de Supabase'
        },
        {
            name: 'NEXT_PUBLIC_SUPABASE_PROJECT_ID',
            value: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID,
            required: true,
            description: 'ID del proyecto de Supabase'
        }
    ]

    // Variables opcionales pero recomendadas
    const optionalVars: EnvironmentCheck[] = [
        {
            name: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
            value: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            required: false,
            description: 'Client ID de Google OAuth'
        },
        {
            name: 'NEXT_PUBLIC_LINKEDIN_CLIENT_ID',
            value: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
            required: false,
            description: 'Client ID de LinkedIn OAuth'
        },
        {
            name: 'NEXT_PUBLIC_GITHUB_CLIENT_ID',
            value: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
            required: false,
            description: 'Client ID de GitHub OAuth'
        },
        {
            name: 'NEXT_PUBLIC_APP_URL',
            value: process.env.NEXT_PUBLIC_APP_URL,
            required: false,
            description: 'URL base de la aplicación'
        }
    ]

    // Validar variables requeridas
    for (const envVar of requiredVars) {
        if (!envVar.value || envVar.value.trim() === '') {
            errors.push(`${envVar.name} es requerida: ${envVar.description}`)
        }
    }

    // Validar variables opcionales
    for (const envVar of optionalVars) {
        if (!envVar.value || envVar.value.trim() === '') {
            warnings.push(`${envVar.name} no está configurada: ${envVar.description}`)
        }
    }

    // Validaciones específicas
    if (process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL debe comenzar con https://')
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.length < 100) {
        errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY parece ser inválida (muy corta)')
    }

    // Validar OAuth si está habilitado
    if (appConfig.features.enableOAuth) {
        const oauthProviders = [
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
            process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
        ].filter(Boolean)

        if (oauthProviders.length === 0) {
            warnings.push('OAuth está habilitado pero no hay proveedores configurados')
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

// =============================================
// VALIDACIÓN DE CONFIGURACIÓN DE SUPABASE
// =============================================

export async function validateSupabaseConnection(): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
        // Importar dinámicamente para evitar errores en build
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // Probar conexión básica
        const { error } = await supabase
            .from('roles')
            .select('count')
            .limit(1)

        if (error) {
            errors.push(`Error de conexión a Supabase: ${error.message}`)
        }

        // Verificar autenticación
        const { error: authError } = await supabase.auth.getSession()

        if (authError) {
            warnings.push(`Advertencia de autenticación: ${authError.message}`)
        }

    } catch (error) {
        errors.push(`Error al validar conexión a Supabase: ${error}`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

// =============================================
// VALIDACIÓN DE CONFIGURACIÓN OAUTH
// =============================================

export function validateOAuthConfiguration(): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!appConfig.features.enableOAuth) {
        return { isValid: true, errors, warnings }
    }

    // Verificar que al menos un proveedor esté configurado
    const configuredProviders = Object.entries(appConfig.oauth)
        .filter(([_, config]) => config.enabled && config.clientId)

    if (configuredProviders.length === 0) {
        errors.push('OAuth está habilitado pero no hay proveedores configurados correctamente')
    }

    // Validar cada proveedor configurado
    Object.entries(appConfig.oauth).forEach(([provider, config]) => {
        if (config.enabled) {
            if (!config.clientId) {
                errors.push(`${provider} OAuth está habilitado pero falta el Client ID`)
            } else if (config.clientId.length < 10) {
                warnings.push(`${provider} Client ID parece ser inválido (muy corto)`)
            }
        }
    })

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

// =============================================
// VALIDACIÓN COMPLETA DEL SISTEMA
// =============================================

export async function validateSystemConfiguration(): Promise<ValidationResult> {
    const allErrors: string[] = []
    const allWarnings: string[] = []

    // Validar variables de entorno
    const envValidation = validateEnvironmentVariables()
    allErrors.push(...envValidation.errors)
    allWarnings.push(...envValidation.warnings)

    // Validar OAuth
    const oauthValidation = validateOAuthConfiguration()
    allErrors.push(...oauthValidation.errors)
    allWarnings.push(...oauthValidation.warnings)

    // Validar Supabase (solo si las variables básicas están configuradas)
    if (envValidation.isValid) {
        try {
            const supabaseValidation = await validateSupabaseConnection()
            allErrors.push(...supabaseValidation.errors)
            allWarnings.push(...supabaseValidation.warnings)
        } catch (error) {
            allWarnings.push('No se pudo validar la conexión a Supabase')
        }
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    }
}

// =============================================
// FUNCIONES DE UTILIDAD
// =============================================

// Función para mostrar el estado de configuración en consola
export function logConfigurationStatus(): void {
    if (typeof window !== 'undefined') {
        // Solo ejecutar en el cliente
        return
    }

    console.log('\n🔧 Estado de Configuración del Sistema')
    console.log('=====================================')

    const envValidation = validateEnvironmentVariables()

    if (envValidation.isValid) {
        console.log('✅ Variables de entorno: OK')
    } else {
        console.log('❌ Variables de entorno: ERRORES')
        envValidation.errors.forEach(error => console.log(`   - ${error}`))
    }

    if (envValidation.warnings.length > 0) {
        console.log('⚠️  Advertencias:')
        envValidation.warnings.forEach(warning => console.log(`   - ${warning}`))
    }

    const oauthValidation = validateOAuthConfiguration()
    if (appConfig.features.enableOAuth) {
        if (oauthValidation.isValid) {
            console.log('✅ Configuración OAuth: OK')
        } else {
            console.log('❌ Configuración OAuth: ERRORES')
            oauthValidation.errors.forEach(error => console.log(`   - ${error}`))
        }
    } else {
        console.log('ℹ️  OAuth: Deshabilitado')
    }

    console.log('\n📋 Características Habilitadas:')
    console.log(`   - OAuth: ${appConfig.features.enableOAuth ? '✅' : '❌'}`)
    console.log(`   - ISO 27001: ${appConfig.features.enableISO27001 ? '✅' : '❌'}`)
    console.log(`   - Auditoría: ${appConfig.features.enableAuditTrail ? '✅' : '❌'}`)
    console.log(`   - Notificaciones: ${appConfig.features.enableNotifications ? '✅' : '❌'}`)

    console.log('\n=====================================\n')
}

// Función para obtener información de configuración
export function getConfigurationInfo() {
    return {
        environment: appConfig.app.environment,
        features: appConfig.features,
        supabase: {
            configured: !!appConfig.supabase.url && !!appConfig.supabase.anonKey,
            projectId: appConfig.supabase.projectId
        },
        oauth: {
            enabled: appConfig.features.enableOAuth,
            providers: Object.entries(appConfig.oauth)
                .filter(([_, config]) => config.enabled)
                .map(([name, _]) => name)
        }
    }
}