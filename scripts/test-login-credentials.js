// =============================================
// SCRIPT: Probar Credenciales de Login
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

// Credenciales para probar
const credentialsToTest = [
  { email: 'superadmin@riesgos.com', password: 'SuperAdmin2024!' },
  { email: 'admin@deltaconsult.com.bo', password: 'DeltaConsult2024!' },
  { email: 'superadmin@riesgos.com', password: 'admin123' },
  { email: 'superadmin@riesgos.com', password: 'superadmin123' },
  { email: 'superadmin@riesgos.com', password: '123456' }
]

async function testLoginCredentials() {
  try {
    console.log('🧪 Probando credenciales de login...')
    console.log('=' .repeat(60))

    for (let i = 0; i < credentialsToTest.length; i++) {
      const { email, password } = credentialsToTest[i]
      
      console.log(`\n${i + 1}. Probando: ${email}`)
      console.log(`   Contraseña: ${password}`)
      
      try {
        // Intentar login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authError) {
          console.log(`   ❌ Error: ${authError.message}`)
          continue
        }

        console.log(`   ✅ ¡LOGIN EXITOSO!`)
        console.log(`   🆔 User ID: ${authData.user.id}`)
        console.log(`   📧 Email: ${authData.user.email}`)
        console.log(`   ✅ Verificado: ${authData.user.email_confirmed_at ? 'Sí' : 'No'}`)

        // Verificar datos en la base de datos
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_usuario_auth', authData.user.id)
          .single()

        if (userError) {
          console.log(`   ⚠️  Usuario no encontrado en BD: ${userError.message}`)
        } else {
          console.log(`   👤 Nombre: ${userData.nombres_usuario} ${userData.apellidos_usuario}`)
          console.log(`   👑 Rol: ${userData.rol_usuario}`)
          console.log(`   ✅ Activo: ${userData.activo ? 'Sí' : 'No'}`)
          console.log(`   🏢 Departamento: ${userData.departamento_usuario}`)
        }

        // Cerrar sesión
        await supabase.auth.signOut()
        
        console.log('\n🎉 ¡CREDENCIALES VÁLIDAS ENCONTRADAS!')
        console.log('=' .repeat(60))
        console.log('📧 Email:', email)
        console.log('🔑 Contraseña:', password)
        console.log('=' .repeat(60))
        console.log('\n🚀 Puedes usar estas credenciales para iniciar sesión')
        console.log('🌐 URL: http://localhost:3000/auth/login')
        return

      } catch (error) {
        console.log(`   ❌ Error inesperado: ${error.message}`)
      }
    }

    console.log('\n❌ Ninguna credencial funcionó')
    console.log('\n💡 SOLUCIONES:')
    console.log('1. Ve a Supabase Dashboard > Authentication > Users')
    console.log('2. Busca el usuario: 03f7c4c2-b153-490c-99b5-f6355f3805ca')
    console.log('3. Resetea la contraseña o crea una nueva')
    console.log('4. O ejecuta: node scripts/create-new-auth-user.js')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar las pruebas
testLoginCredentials()