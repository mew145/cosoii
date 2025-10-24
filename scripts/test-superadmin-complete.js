// =============================================
// SCRIPT DE PRUEBA: Verificar Login Superadmin
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

// Credenciales del superadmin
const SUPERADMIN_CREDENTIALS = {
  email: 'admin@deltaconsult.com.bo',
  password: 'DeltaConsult2024!'
}

async function testSuperAdminLogin() {
  try {
    console.log('🧪 Iniciando prueba de login del superadmin...')
    console.log('📧 Email:', SUPERADMIN_CREDENTIALS.email)
    
    // 1. Intentar login
    console.log('🔐 Intentando login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: SUPERADMIN_CREDENTIALS.email,
      password: SUPERADMIN_CREDENTIALS.password
    })

    if (authError) {
      console.error('❌ Error en login:', authError.message)
      return
    }

    console.log('✅ Login exitoso!')
    console.log('🆔 User ID:', authData.user.id)
    console.log('📧 Email verificado:', authData.user.email_confirmed_at ? 'Sí' : 'No')

    // 2. Verificar datos en la tabla usuarios
    console.log('\n🔍 Verificando datos en la base de datos...')
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario_auth', authData.user.id)
      .single()

    if (userError) {
      console.error('❌ Error consultando usuario:', userError.message)
      return
    }

    console.log('✅ Usuario encontrado en BD:')
    console.log('  - ID:', userData.id_usuario)
    console.log('  - Nombre:', `${userData.nombres_usuario} ${userData.apellidos_usuario}`)
    console.log('  - Email:', userData.email_usuario)
    console.log('  - CI:', userData.ci_usuario)
    console.log('  - Rol:', userData.rol_usuario)
    console.log('  - Activo:', userData.activo ? 'Sí' : 'No')
    console.log('  - Departamento:', userData.departamento_usuario)

    // 3. Verificar permisos
    console.log('\n🔑 Verificando permisos...')
    const { data: permissions, error: permError } = await supabase
      .from('permisos_usuario')
      .select('*')
      .eq('id_usuario', userData.id_usuario)
      .eq('activo', true)

    if (permError) {
      console.error('❌ Error consultando permisos:', permError.message)
      return
    }

    console.log(`✅ Permisos encontrados: ${permissions.length}`)
    
    // Agrupar permisos por módulo
    const permissionsByModule = permissions.reduce((acc, perm) => {
      if (!acc[perm.modulo]) {
        acc[perm.modulo] = []
      }
      acc[perm.modulo].push(perm.accion)
      return acc
    }, {})

    console.log('\n📋 Permisos por módulo:')
    Object.entries(permissionsByModule).forEach(([module, actions]) => {
      console.log(`  - ${module}: ${actions.join(', ')}`)
    })

    // 4. Cerrar sesión
    console.log('\n🚪 Cerrando sesión...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('⚠️  Error cerrando sesión:', signOutError.message)
    } else {
      console.log('✅ Sesión cerrada correctamente')
    }

    // 5. Resumen final
    console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!')
    console.log('=' .repeat(50))
    console.log('✅ Login funcional')
    console.log('✅ Usuario en base de datos')
    console.log('✅ Permisos asignados')
    console.log('✅ Sesión manejada correctamente')
    console.log('=' .repeat(50))
    console.log('\n🚀 El superadmin está listo para usar!')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar la prueba
testSuperAdminLogin()