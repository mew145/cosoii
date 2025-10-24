// =============================================
// SCRIPT DE DIAGNÓSTICO OAUTH
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuración desde variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

console.log('🔍 Diagnóstico de configuración OAuth\n')

// Verificar variables de entorno
console.log('📋 Variables de entorno:')
console.log(`- SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`)
console.log(`- SUPABASE_KEY: ${supabaseKey ? '✅ Configurada' : '❌ Faltante'}`)
console.log(`- GOOGLE_CLIENT_ID: ${googleClientId ? '✅ Configurada' : '❌ Faltante'}\n`)

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Error: Configuración de Supabase incompleta')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log('🔗 Probando conexión con Supabase...')
    
    // Probar conexión básica
    const { data, error } = await supabase.from('usuarios').select('count').limit(1)
    
    if (error) {
      console.log(`❌ Error de conexión: ${error.message}`)
      return false
    }
    
    console.log('✅ Conexión con Supabase exitosa\n')
    return true
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`)
    return false
  }
}

async function testOAuthProviders() {
  console.log('🔐 Probando proveedores OAuth...')
  
  const providers = ['google', 'github']
  
  for (const provider of providers) {
    try {
      // Intentar obtener URL de OAuth (esto no hace la redirección real)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'http://localhost:3000/api/auth/callback',
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        console.log(`❌ ${provider}: ${error.message}`)
      } else {
        console.log(`✅ ${provider}: Configurado correctamente`)
      }
    } catch (error) {
      console.log(`❌ ${provider}: ${error.message}`)
    }
  }
  
  console.log('')
}

function checkCallbackURL() {
  console.log('🔄 URLs de callback recomendadas:')
  console.log('- Desarrollo: http://localhost:3000/api/auth/callback')
  console.log('- Producción: https://tu-dominio.com/api/auth/callback')
  console.log('')
  
  console.log('📝 Configuración requerida en Supabase Dashboard:')
  console.log('1. Ve a Authentication > Settings')
  console.log('2. En "Site URL" agrega: http://localhost:3000 (desarrollo)')
  console.log('3. En "Redirect URLs" agrega: http://localhost:3000/api/auth/callback')
  console.log('4. Configura los proveedores OAuth en Authentication > Providers')
  console.log('')
}

async function main() {
  const connectionOk = await testSupabaseConnection()
  
  if (connectionOk) {
    await testOAuthProviders()
  }
  
  checkCallbackURL()
  
  console.log('✨ Diagnóstico completado')
}

main().catch(console.error)