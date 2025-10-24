// =============================================
// SCRIPT: Probar Login del Superadmin
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSuperAdminLogin() {
  try {
    console.log('🔐 Probando login del superadmin...')
    
    // Intentar login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'superadmin@riesgos.com',
      password: 'SuperAdmin2024!'
    })

    if (error) {
      console.error('❌ Error en login:', error.message)
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 El usuario no existe en Supabase Auth.')
        console.log('Pasos para solucionarlo:')
        console.log('1. Ve a tu panel de Supabase > Authentication > Users')
        console.log('2. Clic en "Add user"')
        console.log('3. Email: superadmin@riesgos.com')
        console.log('4. Password: SuperAdmin2024!')
        console.log('5. Confirmar email automáticamente')
      }
      return
    }

    if (data.user) {
      console.log('✅ Login exitoso!')
      console.log('👤 Usuario Auth ID:', data.user.id)
      console.log('📧 Email:', data.user.email)
      
      // Buscar usuario en BD
      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', data.user.id)
        .single()

      if (dbError) {
        console.error('❌ Error buscando usuario en BD:', dbError.message)
      } else {
        console.log('✅ Usuario encontrado en BD:')
        console.log('🆔 ID:', dbUser.id_usuario)
        console.log('👤 Nombre:', dbUser.nombres_usuario, dbUser.apellidos_usuario)
        console.log('👑 Rol:', dbUser.rol_usuario)
        console.log('✅ Activo:', dbUser.activo ? 'Sí' : 'No')
        
        if (dbUser.rol_usuario === 'administrador') {
          console.log('🎉 ¡El usuario tiene permisos de administrador!')
          console.log('💡 Debería poder acceder a /admin/dashboard')
        } else {
          console.log('⚠️ El usuario NO tiene permisos de administrador')
          console.log('👑 Rol actual:', dbUser.rol_usuario)
        }
      }

      // Cerrar sesión
      await supabase.auth.signOut()
      console.log('🚪 Sesión cerrada')
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
testSuperAdminLogin()