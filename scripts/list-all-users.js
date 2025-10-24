// =============================================
// SCRIPT: Listar Todos los Usuarios
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllUsers() {
  try {
    console.log('📋 Listando todos los usuarios...')
    
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

    console.log(`✅ Se encontraron ${users.length} usuarios:`)
    console.log('=' .repeat(120))
    console.log('ID | Nombre                    | Email                     | CI       | Rol              | Activo | Auth ID')
    console.log('=' .repeat(120))
    
    users.forEach(user => {
      const id = user.id_usuario.toString().padEnd(2)
      const nombre = `${user.nombres_usuario || ''} ${user.apellidos_usuario || ''}`.trim().padEnd(25)
      const email = (user.email_usuario || '').padEnd(25)
      const ci = (user.ci_usuario || '').padEnd(8)
      const rol = (user.rol_usuario || '').padEnd(16)
      const activo = user.activo ? '✅' : '❌'
      const authId = user.id_usuario_auth ? '🔗' : '❌'
      
      console.log(`${id} | ${nombre} | ${email} | ${ci} | ${rol} | ${activo}     | ${authId}`)
    })
    
    console.log('=' .repeat(120))
    console.log(`Total de usuarios: ${users.length}`)

    // Buscar duplicados por email
    const emailCounts = {}
    users.forEach(user => {
      if (user.email_usuario) {
        emailCounts[user.email_usuario] = (emailCounts[user.email_usuario] || 0) + 1
      }
    })

    const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log('\n⚠️ Emails duplicados encontrados:')
      duplicates.forEach(([email, count]) => {
        console.log(`📧 ${email}: ${count} usuarios`)
      })
    }

    // Buscar usuarios superadmin específicamente
    const superadmins = users.filter(user => 
      user.email_usuario === 'superadmin@riesgos.com' || 
      user.rol_usuario === 'administrador'
    )

    if (superadmins.length > 0) {
      console.log('\n👑 Usuarios administradores encontrados:')
      superadmins.forEach(user => {
        console.log(`🆔 ID: ${user.id_usuario}`)
        console.log(`👤 Nombre: ${user.nombres_usuario} ${user.apellidos_usuario}`)
        console.log(`📧 Email: ${user.email_usuario}`)
        console.log(`👑 Rol: ${user.rol_usuario}`)
        console.log(`✅ Activo: ${user.activo ? 'Sí' : 'No'}`)
        console.log(`🔗 Auth ID: ${user.id_usuario_auth || 'No vinculado'}`)
        console.log('---')
      })
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
listAllUsers()