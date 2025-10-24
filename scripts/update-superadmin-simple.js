// =============================================
// SCRIPT: Actualizar Usuario a Superadmin (Simple)
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

// ID del usuario superadmin existente
const SUPERADMIN_USER_ID = 11

async function updateSuperAdmin() {
  try {
    console.log('🔧 Actualizando usuario a superadmin...')
    console.log(`👤 Usuario ID: ${SUPERADMIN_USER_ID}`)
    
    // 1. Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', SUPERADMIN_USER_ID)
      .single()

    if (userError || !user) {
      console.error('❌ Usuario no encontrado:', userError?.message)
      return
    }

    console.log(`✅ Usuario encontrado: ${user.nombres_usuario} ${user.apellidos_usuario}`)
    console.log(`📧 Email actual: ${user.email_usuario}`)
    console.log(`👑 Rol actual: ${user.rol_usuario}`)

    // 2. Actualizar información del usuario para Delta Consult
    console.log('\n🏢 Actualizando información para Delta Consult...')
    const { data: updatedUser, error: updateError } = await supabase
      .from('usuarios')
      .update({
        nombres_usuario: 'Administrador',
        apellidos_usuario: 'Delta Consult',
        email_usuario: 'admin@deltaconsult.com.bo',
        rol_usuario: 'super_admin',
        departamento_usuario: 'Administración',
        ci_usuario: '12345678',
        telefono_usuario: '+591 2 123-4567',
        activo: true,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_usuario', SUPERADMIN_USER_ID)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error actualizando información:', updateError.message)
      return
    }

    console.log('✅ Información actualizada exitosamente')

    // 3. Verificar las tablas disponibles
    console.log('\n🔍 Verificando estructura de la base de datos...')
    
    // Intentar consultar diferentes posibles tablas de permisos
    const possiblePermissionTables = [
      'permisos_usuario',
      'user_permissions', 
      'permissions',
      'roles_permissions',
      'usuario_permisos'
    ]

    let permissionTableExists = false
    let permissionTableName = null

    for (const tableName of possiblePermissionTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (!error) {
          console.log(`✅ Tabla de permisos encontrada: ${tableName}`)
          permissionTableExists = true
          permissionTableName = tableName
          break
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }

    if (!permissionTableExists) {
      console.log('⚠️  No se encontró tabla de permisos específica')
      console.log('💡 El sistema usará validación basada en roles')
    }

    // 4. Mostrar información final
    console.log('\n🎉 ¡SUPERADMIN ACTUALIZADO EXITOSAMENTE!')
    console.log('=' .repeat(70))
    console.log('🏢 EMPRESA: Delta Consult LTDA')
    console.log('📧 Email: admin@deltaconsult.com.bo')
    console.log('🔑 Contraseña sugerida: DeltaConsult2024!')
    console.log('👤 Nombre: Administrador Delta Consult')
    console.log('🆔 CI: 12345678')
    console.log('📱 Teléfono: +591 2 123-4567')
    console.log('🏢 Departamento: Administración')
    console.log('👑 Rol: SUPER_ADMIN')
    console.log('✅ Estado: ACTIVO')
    console.log('🆔 ID Usuario: ' + SUPERADMIN_USER_ID)
    console.log('🔗 Auth ID: ' + (updatedUser.id_usuario_auth || 'Vinculado'))
    console.log('=' .repeat(70))
    
    console.log('\n📋 CREDENCIALES PARA PROBAR:')
    console.log('1. Email: admin@deltaconsult.com.bo')
    console.log('   Contraseña: DeltaConsult2024!')
    console.log('')
    console.log('2. Email: superadmin@riesgos.com (original)')
    console.log('   Contraseña: SuperAdmin2024!')
    
    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('1. Intenta iniciar sesión con las credenciales de arriba')
    console.log('2. Si no funciona, ve a Supabase Dashboard > Authentication')
    console.log('3. Busca el usuario y actualiza/resetea la contraseña')
    console.log('4. O crea un nuevo usuario Auth con el email: admin@deltaconsult.com.bo')
    
    console.log('\n🌐 URL del sistema: http://localhost:3000/auth/login')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
updateSuperAdmin()