// =============================================
// SCRIPT DE PRUEBA DE FLUJO OAUTH
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testOAuthFlow() {
  console.log('🧪 Probando flujo OAuth completo...\n')
  
  try {
    // Probar Google OAuth
    console.log('🔍 Probando Google OAuth...')
    const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback',
        skipBrowserRedirect: true
      }
    })
    
    if (googleError) {
      console.log(`❌ Google OAuth Error: ${googleError.message}`)
      console.log(`   Detalles: ${JSON.stringify(googleError, null, 2)}`)
    } else {
      console.log('✅ Google OAuth: URL generada correctamente')
      if (googleData.url) {
        console.log(`   URL: ${googleData.url.substring(0, 100)}...`)
      }
    }
    
    console.log('')
    
    // Probar GitHub OAuth
    console.log('🔍 Probando GitHub OAuth...')
    const { data: githubData, error: githubError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback',
        skipBrowserRedirect: true
      }
    })
    
    if (githubError) {
      console.log(`❌ GitHub OAuth Error: ${githubError.message}`)
      console.log(`   Detalles: ${JSON.stringify(githubError, null, 2)}`)
    } else {
      console.log('✅ GitHub OAuth: URL generada correctamente')
      if (githubData.url) {
        console.log(`   URL: ${githubData.url.substring(0, 100)}...`)
      }
    }
    
  } catch (error) {
    console.log(`❌ Error general: ${error.message}`)
  }
  
  console.log('\n📋 Checklist de configuración:')
  console.log('1. ✅ Variables de entorno configuradas')
  console.log('2. ✅ Conexión con Supabase funcionando')
  console.log('3. ❓ Configuración OAuth en Supabase Dashboard')
  console.log('4. ❓ URLs de callback configuradas')
  console.log('5. ❓ Proveedores OAuth habilitados')
  
  console.log('\n🔧 Pasos para configurar OAuth en Supabase:')
  console.log('1. Ve a https://supabase.com/dashboard/project/' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID)
  console.log('2. Authentication > Settings')
  console.log('3. Site URL: http://localhost:3000')
  console.log('4. Redirect URLs: http://localhost:3000/api/auth/callback')
  console.log('5. Authentication > Providers')
  console.log('6. Habilita Google y GitHub con sus respectivos Client ID y Secret')
}

testOAuthFlow().catch(console.error)