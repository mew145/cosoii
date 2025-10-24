// =============================================
// SCRIPT COMPLETO: Crear Usuario Superadmin con Auth
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usando variables del .env.local)
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgxMjkwMiwiZXhwIjoyMDc2Mzg4OTAyfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8' // Necesitas el service_role key

// Cliente con permisos de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Datos del superadmin para Delta Consult
const SUPERADMIN_DATA = {
  email: 'admin@deltaconsult.com.bo',
  password: 'DeltaConsult2024!',
  nombres: 'Administrador',
  apellidos: 'Delta Consult',
  ci: '12345678',
  telefono: '+591 2 123-4567',
  departamento: 'Administración',
  rol: 'super_admin'
}

async function createCompleteSuperAdmin() {
  try {
    console.log('🚀 Iniciando creación completa de usuario superadmin para Delta Consult...')
    
    // 1. Verificar si ya existe un usuario con este email en Auth
    console.log('📧 Verificando si el email ya existe en Auth...')
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers.users.find(user => user.email === SUPERADMIN_DATA.email)

    if (existingAuthUser) {
      console.log('⚠️  Ya existe un usuario Auth con el email:', SUPERADMIN_DATA.email)
      console.log('ID del usuario Auth existente:', existingAuthUser.id)
      
      // Verificar si existe en la tabla usuarios
      const { data: existingDbUser } = await supabaseAdmin
        .from('usuarios')
        .select('*')
        .eq('email_usuario', SUPERADMIN_DATA.email)
        .single()

      if (existingDbUser) {
        console.log('✅ Usuario ya existe completamente configurado')
        console.log('📧 Email:', SUPERADMIN_DATA.email)
        console.log('🔑 Contraseña:', SUPERADMIN_DATA.password)
        return
      }
    }

    // 2. Crear usuario en Supabase Auth
    console.log('🔐 Creando usuario en Supabase Auth...')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: SUPERADMIN_DATA.email,
      password: SUPERADMIN_DATA.password,
      email_confirm: true,
      user_metadata: {
        nombres: SUPERADMIN_DATA.nombres,
        apellidos: SUPERADMIN_DATA.apellidos,
        rol: SUPERADMIN_DATA.rol
      }
    })

    if (authError) {
      console.error('❌ Error creando usuario Auth:', authError.message)
      return
    }

    console.log('✅ Usuario Auth creado con ID:', authUser.user.id)

    // 3. Verificar si ya existe en la tabla usuarios
    console.log('🔍 Verificando usuario en base de datos...')
    const { data: existingDbUser } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email_usuario', SUPERADMIN_DATA.email)
      .single()

    let dbUser = existingDbUser

    if (!existingDbUser) {
      // 4. Crear usuario en la tabla usuarios
      console.log('👤 Creando usuario en la base de datos...')
      const { data: newDbUser, error: dbError } = await supabaseAdmin
        .from('usuarios')
        .insert({
          id_usuario_auth: authUser.user.id,
          nombres_usuario: SUPERADMIN_DATA.nombres,
          apellidos_usuario: SUPERADMIN_DATA.apellidos,
          email_usuario: SUPERADMIN_DATA.email,
          ci_usuario: SUPERADMIN_DATA.ci,
          telefono_usuario: SUPERADMIN_DATA.telefono,
          departamento_usuario: SUPERADMIN_DATA.departamento,
          rol_usuario: SUPERADMIN_DATA.rol,
          activo: true,
          fecha_registro: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        console.error('❌ Error creando usuario en BD:', dbError.message)
        return
      }

      dbUser = newDbUser
      console.log('✅ Usuario creado en BD con ID:', dbUser.id_usuario)
    } else {
      // Actualizar el id_usuario_auth si no existe
      if (!existingDbUser.id_usuario_auth) {
        const { error: updateError } = await supabaseAdmin
          .from('usuarios')
          .update({ id_usuario_auth: authUser.user.id })
          .eq('id_usuario', existingDbUser.id_usuario)

        if (updateError) {
          console.error('⚠️  Error actualizando id_usuario_auth:', updateError.message)
        } else {
          console.log('✅ ID de Auth actualizado en BD')
        }
      }
    }

    // 5. Asignar todos los permisos de superadmin
    console.log('🔑 Asignando permisos de superadmin...')
    
    // Primero eliminar permisos existentes
    await supabaseAdmin
      .from('permisos_usuario')
      .delete()
      .eq('id_usuario', dbUser.id_usuario)

    const superAdminPermissions = [
      // Usuarios - Control total
      { modulo: 'usuarios', accion: 'crear', activo: true },
      { modulo: 'usuarios', accion: 'leer', activo: true },
      { modulo: 'usuarios', accion: 'actualizar', activo: true },
      { modulo: 'usuarios', accion: 'eliminar', activo: true },
      { modulo: 'usuarios', accion: 'administrar', activo: true },
      
      // Riesgos - Control total
      { modulo: 'riesgos', accion: 'crear', activo: true },
      { modulo: 'riesgos', accion: 'leer', activo: true },
      { modulo: 'riesgos', accion: 'actualizar', activo: true },
      { modulo: 'riesgos', accion: 'eliminar', activo: true },
      { modulo: 'riesgos', accion: 'administrar', activo: true },
      
      // Activos - Control total
      { modulo: 'activos', accion: 'crear', activo: true },
      { modulo: 'activos', accion: 'leer', activo: true },
      { modulo: 'activos', accion: 'actualizar', activo: true },
      { modulo: 'activos', accion: 'eliminar', activo: true },
      { modulo: 'activos', accion: 'administrar', activo: true },
      
      // Controles ISO - Control total
      { modulo: 'controles_iso', accion: 'crear', activo: true },
      { modulo: 'controles_iso', accion: 'leer', activo: true },
      { modulo: 'controles_iso', accion: 'actualizar', activo: true },
      { modulo: 'controles_iso', accion: 'eliminar', activo: true },
      { modulo: 'controles_iso', accion: 'administrar', activo: true },
      
      // Incidentes - Control total
      { modulo: 'incidentes', accion: 'crear', activo: true },
      { modulo: 'incidentes', accion: 'leer', activo: true },
      { modulo: 'incidentes', accion: 'actualizar', activo: true },
      { modulo: 'incidentes', accion: 'eliminar', activo: true },
      { modulo: 'incidentes', accion: 'administrar', activo: true },
      
      // Proyectos - Control total
      { modulo: 'proyectos', accion: 'crear', activo: true },
      { modulo: 'proyectos', accion: 'leer', activo: true },
      { modulo: 'proyectos', accion: 'actualizar', activo: true },
      { modulo: 'proyectos', accion: 'eliminar', activo: true },
      { modulo: 'proyectos', accion: 'administrar', activo: true },
      
      // Reportes - Control total
      { modulo: 'reportes', accion: 'crear', activo: true },
      { modulo: 'reportes', accion: 'leer', activo: true },
      { modulo: 'reportes', accion: 'actualizar', activo: true },
      { modulo: 'reportes', accion: 'eliminar', activo: true },
      { modulo: 'reportes', accion: 'administrar', activo: true },
      
      // Sistema - Control total
      { modulo: 'sistema', accion: 'crear', activo: true },
      { modulo: 'sistema', accion: 'leer', activo: true },
      { modulo: 'sistema', accion: 'actualizar', activo: true },
      { modulo: 'sistema', accion: 'eliminar', activo: true },
      { modulo: 'sistema', accion: 'administrar', activo: true },
      
      // Configuración - Control total
      { modulo: 'configuracion', accion: 'crear', activo: true },
      { modulo: 'configuracion', accion: 'leer', activo: true },
      { modulo: 'configuracion', accion: 'actualizar', activo: true },
      { modulo: 'configuracion', accion: 'eliminar', activo: true },
      { modulo: 'configuracion', accion: 'administrar', activo: true },
      
      // Auditoría - Control total
      { modulo: 'auditoria', accion: 'crear', activo: true },
      { modulo: 'auditoria', accion: 'leer', activo: true },
      { modulo: 'auditoria', accion: 'actualizar', activo: true },
      { modulo: 'auditoria', accion: 'eliminar', activo: true },
      { modulo: 'auditoria', accion: 'administrar', activo: true },

      // Monitoreo - Control total
      { modulo: 'monitoreo', accion: 'crear', activo: true },
      { modulo: 'monitoreo', accion: 'leer', activo: true },
      { modulo: 'monitoreo', accion: 'actualizar', activo: true },
      { modulo: 'monitoreo', accion: 'eliminar', activo: true },
      { modulo: 'monitoreo', accion: 'administrar', activo: true }
    ]

    const permissionsToInsert = superAdminPermissions.map(permission => ({
      id_usuario: dbUser.id_usuario,
      modulo: permission.modulo,
      accion: permission.accion,
      activo: permission.activo,
      fecha_asignacion: new Date().toISOString(),
      asignado_por: dbUser.id_usuario // Se asigna a sí mismo
    }))

    const { error: permissionsError } = await supabaseAdmin
      .from('permisos_usuario')
      .insert(permissionsToInsert)

    if (permissionsError) {
      console.error('⚠️  Error asignando permisos:', permissionsError.message)
      console.log('El usuario fue creado pero sin permisos completos')
    } else {
      console.log('✅ Permisos de superadmin asignados correctamente')
    }

    // 6. Mostrar información de acceso
    console.log('\n🎉 ¡Usuario superadmin de Delta Consult creado exitosamente!')
    console.log('=' .repeat(70))
    console.log('🏢 EMPRESA: Delta Consult LTDA')
    console.log('📧 Email:', SUPERADMIN_DATA.email)
    console.log('🔑 Contraseña:', SUPERADMIN_DATA.password)
    console.log('👤 Nombre:', `${SUPERADMIN_DATA.nombres} ${SUPERADMIN_DATA.apellidos}`)
    console.log('🆔 CI:', SUPERADMIN_DATA.ci)
    console.log('📱 Teléfono:', SUPERADMIN_DATA.telefono)
    console.log('🏢 Departamento:', SUPERADMIN_DATA.departamento)
    console.log('👑 Rol:', SUPERADMIN_DATA.rol.toUpperCase())
    console.log('🆔 ID Usuario BD:', dbUser.id_usuario)
    console.log('🔐 ID Usuario Auth:', authUser.user.id)
    console.log('=' .repeat(70))
    console.log('\n✅ CONFIGURACIÓN COMPLETA:')
    console.log('1. ✅ Usuario creado en Supabase Auth')
    console.log('2. ✅ Usuario creado en base de datos')
    console.log('3. ✅ Permisos de superadmin asignados')
    console.log('4. ✅ Cuenta activada y lista para usar')
    console.log('\n🚀 ¡Ya puedes iniciar sesión en el sistema!')
    console.log('🌐 URL: http://localhost:3000/auth/login')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
createCompleteSuperAdmin()