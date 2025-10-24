// =============================================
// SCRIPT: Asignar Permisos de Superadmin
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

// ID del usuario superadmin existente
const SUPERADMIN_USER_ID = 11

async function assignSuperAdminPermissions() {
  try {
    console.log('🔑 Asignando permisos de superadmin...')
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
    console.log(`📧 Email: ${user.email_usuario}`)

    // 2. Eliminar permisos existentes
    console.log('🧹 Limpiando permisos existentes...')
    const { error: deleteError } = await supabase
      .from('permisos_usuario')
      .delete()
      .eq('id_usuario', SUPERADMIN_USER_ID)

    if (deleteError) {
      console.error('⚠️  Error eliminando permisos existentes:', deleteError.message)
    } else {
      console.log('✅ Permisos existentes eliminados')
    }

    // 3. Definir todos los permisos de superadmin
    const superAdminPermissions = [
      // Usuarios - Control total
      { modulo: 'usuarios', accion: 'crear' },
      { modulo: 'usuarios', accion: 'leer' },
      { modulo: 'usuarios', accion: 'actualizar' },
      { modulo: 'usuarios', accion: 'eliminar' },
      { modulo: 'usuarios', accion: 'administrar' },
      
      // Riesgos - Control total
      { modulo: 'riesgos', accion: 'crear' },
      { modulo: 'riesgos', accion: 'leer' },
      { modulo: 'riesgos', accion: 'actualizar' },
      { modulo: 'riesgos', accion: 'eliminar' },
      { modulo: 'riesgos', accion: 'administrar' },
      
      // Activos - Control total
      { modulo: 'activos', accion: 'crear' },
      { modulo: 'activos', accion: 'leer' },
      { modulo: 'activos', accion: 'actualizar' },
      { modulo: 'activos', accion: 'eliminar' },
      { modulo: 'activos', accion: 'administrar' },
      
      // Controles ISO - Control total
      { modulo: 'controles_iso', accion: 'crear' },
      { modulo: 'controles_iso', accion: 'leer' },
      { modulo: 'controles_iso', accion: 'actualizar' },
      { modulo: 'controles_iso', accion: 'eliminar' },
      { modulo: 'controles_iso', accion: 'administrar' },
      
      // Incidentes - Control total
      { modulo: 'incidentes', accion: 'crear' },
      { modulo: 'incidentes', accion: 'leer' },
      { modulo: 'incidentes', accion: 'actualizar' },
      { modulo: 'incidentes', accion: 'eliminar' },
      { modulo: 'incidentes', accion: 'administrar' },
      
      // Proyectos - Control total
      { modulo: 'proyectos', accion: 'crear' },
      { modulo: 'proyectos', accion: 'leer' },
      { modulo: 'proyectos', accion: 'actualizar' },
      { modulo: 'proyectos', accion: 'eliminar' },
      { modulo: 'proyectos', accion: 'administrar' },
      
      // Reportes - Control total
      { modulo: 'reportes', accion: 'crear' },
      { modulo: 'reportes', accion: 'leer' },
      { modulo: 'reportes', accion: 'actualizar' },
      { modulo: 'reportes', accion: 'eliminar' },
      { modulo: 'reportes', accion: 'administrar' },
      
      // Sistema - Control total
      { modulo: 'sistema', accion: 'crear' },
      { modulo: 'sistema', accion: 'leer' },
      { modulo: 'sistema', accion: 'actualizar' },
      { modulo: 'sistema', accion: 'eliminar' },
      { modulo: 'sistema', accion: 'administrar' },
      
      // Configuración - Control total
      { modulo: 'configuracion', accion: 'crear' },
      { modulo: 'configuracion', accion: 'leer' },
      { modulo: 'configuracion', accion: 'actualizar' },
      { modulo: 'configuracion', accion: 'eliminar' },
      { modulo: 'configuracion', accion: 'administrar' },
      
      // Auditoría - Control total
      { modulo: 'auditoria', accion: 'crear' },
      { modulo: 'auditoria', accion: 'leer' },
      { modulo: 'auditoria', accion: 'actualizar' },
      { modulo: 'auditoria', accion: 'eliminar' },
      { modulo: 'auditoria', accion: 'administrar' },

      // Monitoreo - Control total
      { modulo: 'monitoreo', accion: 'crear' },
      { modulo: 'monitoreo', accion: 'leer' },
      { modulo: 'monitoreo', accion: 'actualizar' },
      { modulo: 'monitoreo', accion: 'eliminar' },
      { modulo: 'monitoreo', accion: 'administrar' },

      // Dashboard - Control total
      { modulo: 'dashboard', accion: 'crear' },
      { modulo: 'dashboard', accion: 'leer' },
      { modulo: 'dashboard', accion: 'actualizar' },
      { modulo: 'dashboard', accion: 'eliminar' },
      { modulo: 'dashboard', accion: 'administrar' }
    ]

    // 4. Preparar permisos para insertar
    const permissionsToInsert = superAdminPermissions.map(permission => ({
      id_usuario: SUPERADMIN_USER_ID,
      modulo: permission.modulo,
      accion: permission.accion,
      activo: true,
      fecha_asignacion: new Date().toISOString(),
      asignado_por: SUPERADMIN_USER_ID // Se asigna a sí mismo
    }))

    console.log(`📝 Insertando ${permissionsToInsert.length} permisos...`)

    // 5. Insertar permisos
    const { data: insertedPermissions, error: permissionsError } = await supabase
      .from('permisos_usuario')
      .insert(permissionsToInsert)
      .select()

    if (permissionsError) {
      console.error('❌ Error asignando permisos:', permissionsError.message)
      return
    }

    console.log('✅ Permisos asignados correctamente')

    // 6. Verificar permisos asignados
    console.log('🔍 Verificando permisos asignados...')
    const { data: verifyPermissions, error: verifyError } = await supabase
      .from('permisos_usuario')
      .select('modulo, accion')
      .eq('id_usuario', SUPERADMIN_USER_ID)
      .eq('activo', true)

    if (verifyError) {
      console.error('❌ Error verificando permisos:', verifyError.message)
      return
    }

    // Agrupar permisos por módulo
    const permissionsByModule = verifyPermissions.reduce((acc, perm) => {
      if (!acc[perm.modulo]) {
        acc[perm.modulo] = []
      }
      acc[perm.modulo].push(perm.accion)
      return acc
    }, {})

    console.log(`✅ Total de permisos verificados: ${verifyPermissions.length}`)
    console.log('\n📋 Permisos por módulo:')
    Object.entries(permissionsByModule).forEach(([module, actions]) => {
      console.log(`  - ${module}: ${actions.join(', ')}`)
    })

    // 7. Actualizar información del usuario para Delta Consult
    console.log('\n🏢 Actualizando información para Delta Consult...')
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        nombres_usuario: 'Administrador',
        apellidos_usuario: 'Delta Consult',
        rol_usuario: 'super_admin',
        departamento_usuario: 'Administración',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_usuario', SUPERADMIN_USER_ID)

    if (updateError) {
      console.error('⚠️  Error actualizando información:', updateError.message)
    } else {
      console.log('✅ Información actualizada para Delta Consult')
    }

    // 8. Mostrar información final
    console.log('\n🎉 ¡SUPERADMIN CONFIGURADO EXITOSAMENTE!')
    console.log('=' .repeat(60))
    console.log('🏢 EMPRESA: Delta Consult LTDA')
    console.log('📧 Email: superadmin@riesgos.com')
    console.log('🔑 Contraseña: SuperAdmin2024!')
    console.log('👤 Nombre: Administrador Delta Consult')
    console.log('👑 Rol: SUPER_ADMIN')
    console.log('🔑 Permisos: TODOS LOS MÓDULOS')
    console.log('=' .repeat(60))
    console.log('\n🚀 ¡Ya puedes iniciar sesión!')
    console.log('🌐 URL: http://localhost:3000/auth/login')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
assignSuperAdminPermissions()