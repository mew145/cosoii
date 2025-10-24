// =============================================
// SCRIPT: Verificar Superadmin Existente
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkExistingSuperAdmin() {
  try {
    console.log('🔍 Verificando usuarios superadmin existentes...')
    
    // 1. Buscar usuarios con rol de administrador o super_admin
    const { data: adminUsers, error: adminError } = await supabase
      .from('usuarios')
      .select('*')
      .in('rol_usuario', ['administrador', 'super_admin', 'SUPERADMIN'])
      .eq('activo', true)

    if (adminError) {
      console.error('❌ Error consultando usuarios:', adminError.message)
      return
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No se encontraron usuarios administradores activos')
      return
    }

    console.log(`✅ Encontrados ${adminUsers.length} usuario(s) administrador(es):`)
    console.log('=' .repeat(80))

    for (const user of adminUsers) {
      console.log(`\n👤 Usuario ID: ${user.id_usuario}`)
      console.log(`📧 Email: ${user.email_usuario}`)
      console.log(`👤 Nombre: ${user.nombres_usuario} ${user.apellidos_usuario}`)
      console.log(`🆔 CI: ${user.ci_usuario}`)
      console.log(`📱 Teléfono: ${user.telefono_usuario}`)
      console.log(`🏢 Departamento: ${user.departamento_usuario}`)
      console.log(`👑 Rol: ${user.rol_usuario}`)
      console.log(`✅ Activo: ${user.activo ? 'Sí' : 'No'}`)
      console.log(`📅 Registro: ${new Date(user.fecha_registro).toLocaleDateString()}`)
      console.log(`🔗 Auth ID: ${user.id_usuario_auth || 'No vinculado'}`)

      // Verificar permisos
      const { data: permissions } = await supabase
        .from('permisos_usuario')
        .select('modulo, accion')
        .eq('id_usuario', user.id_usuario)
        .eq('activo', true)

      if (permissions && permissions.length > 0) {
        console.log(`🔑 Permisos: ${permissions.length} permisos activos`)
        
        // Agrupar por módulo
        const permsByModule = permissions.reduce((acc, perm) => {
          if (!acc[perm.modulo]) acc[perm.modulo] = []
          acc[perm.modulo].push(perm.accion)
          return acc
        }, {})

        Object.entries(permsByModule).forEach(([module, actions]) => {
          console.log(`   - ${module}: ${actions.join(', ')}`)
        })
      } else {
        console.log('⚠️  Sin permisos asignados')
      }

      console.log('-' .repeat(80))
    }

    // 2. Sugerir credenciales comunes para probar
    console.log('\n💡 CREDENCIALES SUGERIDAS PARA PROBAR:')
    console.log('=' .repeat(50))
    
    const commonCredentials = [
      { email: 'superadmin@riesgos.com', password: 'SuperAdmin2024!' },
      { email: 'admin@deltaconsult.com.bo', password: 'DeltaConsult2024!' },
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'superadmin@admin.com', password: 'superadmin123' }
    ]

    for (const cred of commonCredentials) {
      const userExists = adminUsers.find(u => u.email_usuario === cred.email)
      if (userExists) {
        console.log(`✅ ${cred.email} - Contraseña: ${cred.password}`)
      } else {
        console.log(`❌ ${cred.email} - No existe`)
      }
    }

    console.log('\n🚀 INSTRUCCIONES:')
    console.log('1. Usa uno de los emails existentes arriba')
    console.log('2. Si no sabes la contraseña, puedes:')
    console.log('   - Usar las contraseñas sugeridas')
    console.log('   - Crear un nuevo usuario con: node scripts/create-new-superadmin.js')
    console.log('   - Resetear contraseña en Supabase Dashboard')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
checkExistingSuperAdmin()