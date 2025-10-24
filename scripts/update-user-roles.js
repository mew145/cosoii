// =============================================
// SCRIPT: Actualizar Roles de Usuarios
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeo de roles antiguos a nuevos
const ROLE_MAPPING = {
  'CONSULTOR': 'auditor',
  'consultor': 'auditor',
  'AUDITOR_SENIOR': 'auditor',
  'AUDITOR_JUNIOR': 'auditor',
  'auditor_senior': 'auditor',
  'auditor_junior': 'auditor',
  'GERENTE_PROYECTO': 'gerente',
  'gerente_proyecto': 'gerente',
  'ADMINISTRADOR': 'administrador',
  'OFICIAL_SEGURIDAD': 'administrador',
  'ANALISTA_RIESGOS': 'auditor',
  'oficial_seguridad': 'administrador',
  'analista_riesgos': 'auditor'
}

async function updateUserRoles() {
  try {
    console.log('🔄 Actualizando roles de usuarios...')
    
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
    console.log('=' .repeat(80))
    console.log('ID | Nombre                    | Rol Actual       | Nuevo Rol        | Estado')
    console.log('=' .repeat(80))

    let updatedCount = 0

    for (const user of users) {
      const currentRole = user.rol_usuario
      const newRole = ROLE_MAPPING[currentRole] || currentRole
      
      const id = user.id_usuario.toString().padEnd(2)
      const nombre = `${user.nombres_usuario || ''} ${user.apellidos_usuario || ''}`.trim().padEnd(25)
      const currentRoleDisplay = (currentRole || '').padEnd(16)
      const newRoleDisplay = newRole.padEnd(16)
      
      if (newRole !== currentRole) {
        // Actualizar el rol
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({
            rol_usuario: newRole,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('id_usuario', user.id_usuario)

        if (updateError) {
          console.log(`${id} | ${nombre} | ${currentRoleDisplay} | ${newRoleDisplay} | ❌ Error`)
          console.error(`   Error: ${updateError.message}`)
        } else {
          console.log(`${id} | ${nombre} | ${currentRoleDisplay} | ${newRoleDisplay} | ✅ Actualizado`)
          updatedCount++
        }
      } else {
        console.log(`${id} | ${nombre} | ${currentRoleDisplay} | ${newRoleDisplay} | ⚪ Sin cambios`)
      }
    }

    console.log('=' .repeat(80))
    console.log(`✅ Proceso completado. ${updatedCount} usuarios actualizados.`)

    // Mostrar resumen de roles finales
    console.log('\n📊 Resumen de roles actuales:')
    const { data: finalUsers, error: finalError } = await supabase
      .from('usuarios')
      .select('rol_usuario')

    if (!finalError && finalUsers) {
      const roleCounts = {}
      finalUsers.forEach(user => {
        const rol = user.rol_usuario || 'sin_rol'
        roleCounts[rol] = (roleCounts[rol] || 0) + 1
      })

      Object.entries(roleCounts).forEach(([rol, count]) => {
        const displayName = {
          'super_admin': 'Super Administrador',
          'administrador': 'Administrador',
          'gerente': 'Gerente',
          'auditor': 'Auditor',
          'sin_rol': 'Sin Rol'
        }[rol] || rol

        console.log(`👥 ${displayName}: ${count} usuarios`)
      })
    }

    console.log('\n💡 Roles válidos en el sistema:')
    console.log('🔴 super_admin - Super Administrador (acceso completo)')
    console.log('🟠 administrador - Administrador (gestión avanzada)')
    console.log('🟡 gerente - Gerente (gestión de proyectos)')
    console.log('🟢 auditor - Auditor (auditorías y evaluaciones)')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
updateUserRoles()