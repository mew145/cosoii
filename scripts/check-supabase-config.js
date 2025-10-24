// =============================================
// VERIFICAR CONFIGURACIÓN DE SUPABASE
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabaseConfig() {
  console.log('🔍 Verificando configuración de Supabase Dashboard...\n')
  
  console.log('📋 Información del proyecto:')
  console.log(`- URL: ${supabaseUrl}`)
  console.log(`- Project ID: ${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}`)
  console.log(`- Dashboard: https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}\n`)
  
  console.log('🔧 Configuración requerida en Supabase Dashboard:\n')
  
  console.log('1️⃣ Authentication > Settings:')
  console.log('   - Site URL: http://localhost:3000')
  console.log('   - Redirect URLs: http://localhost:3000/api/auth/callback\n')
  
  console.log('2️⃣ Authentication > Providers:')
  console.log('   📱 Google OAuth:')
  console.log('      ✅ Enabled: true')
  console.log(`      ✅ Client ID: ${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`)
  console.log('      ❓ Client Secret: [Necesitas agregarlo desde Google Cloud Console]')
  console.log('      ❓ Redirect URL: https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback\n')
  
  console.log('   🐙 GitHub OAuth:')
  console.log('      ✅ Enabled: true')
  console.log(`      ✅ Client ID: ${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`)
  console.log('      ❓ Client Secret: [Necesitas agregarlo desde GitHub Developer Settings]')
  console.log('      ❓ Redirect URL: https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback\n')
  
  console.log('🔗 Enlaces importantes:')
  console.log(`- Supabase Dashboard: https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}`)
  console.log('- Google Cloud Console: https://console.cloud.google.com/apis/credentials')
  console.log('- GitHub Developer Settings: https://github.com/settings/developers\n')
  
  // Probar OAuth URLs
  console.log('🧪 Probando generación de URLs OAuth...')
  
  try {
    const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback',
        skipBrowserRedirect: true
      }
    })
    
    if (googleError) {
      console.log(`❌ Google OAuth: ${googleError.message}`)
      if (googleError.message.includes('Provider not found')) {
        console.log('   💡 Solución: Habilita Google OAuth en Supabase Dashboard')
      }
    } else {
      console.log('✅ Google OAuth: URL generada correctamente')
    }
    
    const { data: githubData, error: githubError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback',
        skipBrowserRedirect: true
      }
    })
    
    if (githubError) {
      console.log(`❌ GitHub OAuth: ${githubError.message}`)
      if (githubError.message.includes('Provider not found')) {
        console.log('   💡 Solución: Habilita GitHub OAuth en Supabase Dashboard')
      }
    } else {
      console.log('✅ GitHub OAuth: URL generada correctamente')
    }
    
  } catch (error) {
    console.log(`❌ Error general: ${error.message}`)
  }
  
  console.log('\n📝 Pasos siguientes:')
  console.log('1. Abre el Supabase Dashboard en el enlace de arriba')
  console.log('2. Configura las URLs y proveedores OAuth como se indica')
  console.log('3. Obtén los Client Secrets de Google y GitHub')
  console.log('4. Ejecuta: npm run dev')
  console.log('5. Prueba el login con Google en http://localhost:3000/auth/login')
}

checkSupabaseConfig().catch(console.error)