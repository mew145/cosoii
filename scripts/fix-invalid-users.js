// =============================================
// SCRIPT: Corregir Usuarios con Datos Inválidos
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixInvalidUsers() {
  try {
    console.log('🔧 Buscando y corrigiendo usuarios con datos inválidos...')
    
    // Obtener todos los usuarios
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('id_usuario')

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('❌ No se encontraron usuarios')
      return
    }

    console.log(`📋 Revisando ${users.length} usuarios...`)

    const problematicUsers = []

    // Identificar usuarios problemáticos
    users.forEach(user => {
      const issues = []
      
      if (!user.nombres_usuario || user.nombres_usuario.trim().length < 2) {
        issues.push('Nombres inválidos')
      }
      
      if (!user.apellidos_usuario || user.apellidos_usuario.trim().length < 2) {
        issues.push('Apellidos inválidos')
      }
      
      if (!user.email_usuario || !user.email_usuario.includes('@')) {
        issues.push('Email inválido')
      }
      
      if (!user.ci_usuario || user.ci_usuario.trim().length === 0) {
        issues.push('CI inválido')
      }

      if (issues.length > 0) {
        problematicUsers.push({
          user,
          issues
        })
      }
    })

    if (problematicUsers.length === 0) {
      console.log('✅ Todos los usuarios tienen datos válidos')
      return
    }

    console.log(`⚠️ Se encontraron ${problematicUsers.length} usuarios con problemas:`)
    
    for (const { user, issues } of problematicUsers) {
      console.log(`\n🆔 Usuario ID ${user.id_usuario}:`)
      console.log(`👤 Nombre actual: "${user.nombres_usuario || ''}" "${user.apellidos_usuario || ''}"`)
      console.log(`📧 Email: ${user.email_usuario || 'Sin email'}`)
      console.log(`🆔 CI: ${user.ci_usuario || 'Sin CI'}`)
      console.log(`⚠️ Problemas: ${issues.join(', ')}`)

      // Corregir el usuario
      const updates = {}
      
      if (!user.nombres_usuario || user.nombres_usuario.trim().length < 2) {
        updates.nombres_usuario = 'Usuario'
      }
      
      if (!user.apellidos_usuario || user.apellidos_usuario.trim().length < 2) {
        updates.apellidos_usuario = 'Temporal'
      }
      
      if (!user.email_usuario || !user.email_usuario.includes('@')) {
        updates.email_usuario = `usuario${user.id_usuario}@temporal.com`
      }
      
      if (!user.ci_usuario || user.ci_usuario.trim().length === 0) {
        updates.ci_usuario = `temp${user.id_usuario.toString().padStart(6, '0')}`
      }

      updates.fecha_actualizacion = new Date().toISOString()

      // Aplicar correcciones
      const { data: updatedUser, error: updateError } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id_usuario', user.id_usuario)
        .select()
        .single()

      if (updateError) {
        console.error(`❌ Error actualizando usuario ${user.id_usuario}:`, updateError.message)
      } else {
        console.log(`✅ Usuario ${user.id_usuario} corregido:`)
        console.log(`   Nombres: ${updatedUser.nombres_usuario}`)
        console.log(`   Apellidos: ${updatedUser.apellidos_usuario}`)
        console.log(`   Email: ${updatedUser.email_usuario}`)
        console.log(`   CI: ${updatedUser.ci_usuario}`)
      }
    }

    console.log('\n🎉 Proceso de corrección completado')
    console.log('💡 Los usuarios corregidos pueden actualizar sus datos desde su perfil')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
fixInvalidUsers()