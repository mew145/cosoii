// =============================================
// SCRIPT: Corregir Rol del Superadmin
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSuperAdminRole() {
  try {
    console.log('🔧 Corrigiendo rol del superadmin...')
    
    // Buscar el usuario superadmin
    const { data: users, error: searchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email_usuario', 'superadmin@riesgos.com')

    if (searchError) {
      console.error('❌ Error buscando superadmin:', searchError.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('❌ No se encontró el usuario superadmin')
      return
    }

    const superadmin = users[0]
    console.log('👤 Usuario encontrado:', superadmin.nombres_usuario, superadmin.apellidos_usuario)
    console.log('📊 Rol actual:', superadmin.rol_usuario)

    // Actualizar el rol a administrador
    const { data: updatedUser, error: updateError } = await supabase
      .from('usuarios')
      .update({
        rol_usuario: 'administrador',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_usuario', superadmin.id_usuario)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error actualizando rol:', updateError.message)
      return
    }

    console.log('✅ Rol actualizado exitosamente')
    console.log('📊 Nuevo rol:', updatedUser.rol_usuario)

    // Verificar todos los usuarios y sus roles
    console.log('\n📋 Lista de todos los usuarios:')
    const { data: allUsers, error: listError } = await supabase
      .from('usuarios')
      .select('id_usuario, nombres_usuario, apellidos_usuario, email_usuario, rol_usuario, activo')
      .order('id_usuario')

    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
      return
    }

    console.log('=' .repeat(80))
    console.log('ID | Nombre                    | Email                     | Rol              | Activo')
    console.log('=' .repeat(80))
    
    allUsers?.forEach(user => {
      const id = user.id_usuario.toString().padEnd(2)
      const nombre = `${user.nombres_usuario} ${user.apellidos_usuario}`.padEnd(25)
      const email = user.email_usuario.padEnd(25)
      const rol = user.rol_usuario.padEnd(16)
      const activo = user.activo ? '✅' : '❌'
      
      console.log(`${id} | ${nombre} | ${email} | ${rol} | ${activo}`)
    })
    
    console.log('=' .repeat(80))
    console.log(`Total de usuarios: ${allUsers?.length || 0}`)

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
fixSuperAdminRole()