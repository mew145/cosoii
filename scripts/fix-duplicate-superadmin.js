// =============================================
// SCRIPT: Corregir Usuario Superadmin Duplicado
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDuplicateSuperAdmin() {
  try {
    console.log('🔧 Corrigiendo usuario superadmin duplicado...')
    
    // Opción 1: Cambiar el rol del usuario ID 11 (que tiene Auth ID) a administrador
    console.log('📝 Actualizando rol del usuario ID 11 a administrador...')
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('usuarios')
      .update({
        rol_usuario: 'administrador',
        nombres_usuario: 'Super',
        apellidos_usuario: 'Administrador',
        ci_usuario: '00000001',
        telefono_usuario: '70000000',
        departamento_usuario: 'Administración',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_usuario', 11)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error actualizando usuario:', updateError.message)
      return
    }

    console.log('✅ Usuario ID 11 actualizado exitosamente')
    console.log('👤 Nuevo perfil:', updatedUser.nombres_usuario, updatedUser.apellidos_usuario)
    console.log('👑 Nuevo rol:', updatedUser.rol_usuario)

    // Opción 2: Eliminar el usuario duplicado ID 10 (sin Auth ID)
    console.log('\n🗑️ Eliminando usuario duplicado ID 10...')
    
    const { error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario', 10)

    if (deleteError) {
      console.error('❌ Error eliminando usuario duplicado:', deleteError.message)
    } else {
      console.log('✅ Usuario duplicado eliminado exitosamente')
    }

    // Verificar el resultado final
    console.log('\n🔍 Verificando resultado final...')
    
    const { data: finalUsers, error: finalError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email_usuario', 'superadmin@riesgos.com')

    if (finalError) {
      console.error('❌ Error verificando resultado:', finalError.message)
      return
    }

    if (finalUsers && finalUsers.length === 1) {
      const user = finalUsers[0]
      console.log('🎉 ¡Configuración corregida exitosamente!')
      console.log('=' .repeat(50))
      console.log('🆔 ID:', user.id_usuario)
      console.log('👤 Nombre:', user.nombres_usuario, user.apellidos_usuario)
      console.log('📧 Email:', user.email_usuario)
      console.log('🆔 CI:', user.ci_usuario)
      console.log('👑 Rol:', user.rol_usuario)
      console.log('✅ Activo:', user.activo ? 'Sí' : 'No')
      console.log('🔗 Auth ID:', user.id_usuario_auth ? 'Vinculado' : 'No vinculado')
      console.log('=' .repeat(50))
      
      console.log('\n📋 Credenciales de acceso:')
      console.log('📧 Email: superadmin@riesgos.com')
      console.log('🔑 Contraseña: SuperAdmin2024!')
      console.log('\n💡 El usuario ya debería poder acceder al dashboard de administrador')
      
    } else {
      console.log('⚠️ Aún hay problemas con la configuración')
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
fixDuplicateSuperAdmin()