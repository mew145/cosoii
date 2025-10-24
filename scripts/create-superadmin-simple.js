// =============================================
// SCRIPT SIMPLE: Crear Usuario Superadmin
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usando variables del .env.local)
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

// Datos del superadmin
const SUPERADMIN_DATA = {
  email: 'superadmin@riesgos.com',
  nombres: 'Super',
  apellidos: 'Administrador',
  ci: '00000001',
  telefono: '70000000',
  departamento: 'Administración',
  rol: 'administrador'
}

async function createSuperAdmin() {
  try {
    console.log('🚀 Iniciando creación de usuario superadmin...')
    
    // 1. Verificar si ya existe un usuario con este email
    console.log('📧 Verificando si el email ya existe...')
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id_usuario, email_usuario')
      .eq('email_usuario', SUPERADMIN_DATA.email)
      .single()

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con el email:', SUPERADMIN_DATA.email)
      console.log('ID del usuario existente:', existingUser.id_usuario)
      return
    }

    // 2. Verificar si ya existe un usuario con este CI
    console.log('🆔 Verificando si el CI ya existe...')
    const { data: existingCI } = await supabase
      .from('usuarios')
      .select('id_usuario, ci_usuario')
      .eq('ci_usuario', SUPERADMIN_DATA.ci)
      .single()

    if (existingCI) {
      console.log('⚠️  Ya existe un usuario con el CI:', SUPERADMIN_DATA.ci)
      console.log('ID del usuario existente:', existingCI.id_usuario)
      return
    }

    // 3. Crear usuario en la tabla usuarios
    console.log('👤 Creando usuario en la base de datos...')
    const { data: dbUser, error: dbError } = await supabase
      .from('usuarios')
      .insert({
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

    console.log('✅ Usuario creado en BD con ID:', dbUser.id_usuario)

    // 4. Asignar todos los permisos de administrador
    console.log('🔑 Asignando permisos de administrador...')
    
    const adminPermissions = [
      // Usuarios
      { modulo: 'usuarios', accion: 'crear', activo: true },
      { modulo: 'usuarios', accion: 'leer', activo: true },
      { modulo: 'usuarios', accion: 'actualizar', activo: true },
      { modulo: 'usuarios', accion: 'eliminar', activo: true },
      
      // Riesgos
      { modulo: 'riesgos', accion: 'crear', activo: true },
      { modulo: 'riesgos', accion: 'leer', activo: true },
      { modulo: 'riesgos', accion: 'actualizar', activo: true },
      { modulo: 'riesgos', accion: 'eliminar', activo: true },
      
      // Activos
      { modulo: 'activos', accion: 'crear', activo: true },
      { modulo: 'activos', accion: 'leer', activo: true },
      { modulo: 'activos', accion: 'actualizar', activo: true },
      { modulo: 'activos', accion: 'eliminar', activo: true },
      
      // Controles ISO
      { modulo: 'controles_iso', accion: 'crear', activo: true },
      { modulo: 'controles_iso', accion: 'leer', activo: true },
      { modulo: 'controles_iso', accion: 'actualizar', activo: true },
      { modulo: 'controles_iso', accion: 'eliminar', activo: true },
      
      // Incidentes
      { modulo: 'incidentes', accion: 'crear', activo: true },
      { modulo: 'incidentes', accion: 'leer', activo: true },
      { modulo: 'incidentes', accion: 'actualizar', activo: true },
      { modulo: 'incidentes', accion: 'eliminar', activo: true },
      
      // Proyectos
      { modulo: 'proyectos', accion: 'crear', activo: true },
      { modulo: 'proyectos', accion: 'leer', activo: true },
      { modulo: 'proyectos', accion: 'actualizar', activo: true },
      { modulo: 'proyectos', accion: 'eliminar', activo: true },
      
      // Reportes
      { modulo: 'reportes', accion: 'crear', activo: true },
      { modulo: 'reportes', accion: 'leer', activo: true },
      { modulo: 'reportes', accion: 'actualizar', activo: true },
      { modulo: 'reportes', accion: 'eliminar', activo: true },
      
      // Configuración
      { modulo: 'configuracion', accion: 'crear', activo: true },
      { modulo: 'configuracion', accion: 'leer', activo: true },
      { modulo: 'configuracion', accion: 'actualizar', activo: true },
      { modulo: 'configuracion', accion: 'eliminar', activo: true },
      
      // Auditoría
      { modulo: 'auditoria', accion: 'crear', activo: true },
      { modulo: 'auditoria', accion: 'leer', activo: true },
      { modulo: 'auditoria', accion: 'actualizar', activo: true },
      { modulo: 'auditoria', accion: 'eliminar', activo: true }
    ]

    const permissionsToInsert = adminPermissions.map(permission => ({
      id_usuario: dbUser.id_usuario,
      modulo: permission.modulo,
      accion: permission.accion,
      activo: permission.activo,
      fecha_asignacion: new Date().toISOString(),
      asignado_por: dbUser.id_usuario // Se asigna a sí mismo
    }))

    const { error: permissionsError } = await supabase
      .from('permisos_usuario')
      .insert(permissionsToInsert)

    if (permissionsError) {
      console.error('⚠️  Error asignando permisos:', permissionsError.message)
      console.log('El usuario fue creado pero sin permisos completos')
    } else {
      console.log('✅ Permisos asignados correctamente')
    }

    // 5. Mostrar información de acceso
    console.log('\n🎉 ¡Usuario superadmin creado exitosamente!')
    console.log('=' .repeat(60))
    console.log('📧 Email:', SUPERADMIN_DATA.email)
    console.log('🔑 Contraseña: SuperAdmin2024!')
    console.log('👤 Nombre:', `${SUPERADMIN_DATA.nombres} ${SUPERADMIN_DATA.apellidos}`)
    console.log('🆔 CI:', SUPERADMIN_DATA.ci)
    console.log('📱 Teléfono:', SUPERADMIN_DATA.telefono)
    console.log('🏢 Departamento:', SUPERADMIN_DATA.departamento)
    console.log('👑 Rol:', SUPERADMIN_DATA.rol.toUpperCase())
    console.log('🆔 ID Usuario:', dbUser.id_usuario)
    console.log('=' .repeat(60))
    console.log('\n⚠️  IMPORTANTE:')
    console.log('1. El usuario fue creado en la base de datos')
    console.log('2. Debes crear la cuenta en Supabase Auth manualmente')
    console.log('3. Ve a tu panel de Supabase > Authentication > Users')
    console.log('4. Crea un usuario con el email: superadmin@riesgos.com')
    console.log('5. Usa la contraseña: SuperAdmin2024!')
    console.log('\n💡 Alternativamente, puedes usar el registro normal del sistema')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
createSuperAdmin()