// =============================================
// SCRIPT: Crear Usuario Superadmin
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('Asegúrate de tener configuradas:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Datos del superadmin
const SUPERADMIN_DATA = {
  email: 'superadmin@riesgos.com',
  password: 'SuperAdmin2024!',
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

    // 3. Crear usuario en Supabase Auth
    console.log('🔐 Creando usuario en Supabase Auth...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
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
      console.error('❌ Error creando usuario en Auth:', authError.message)
      return
    }

    console.log('✅ Usuario creado en Auth con ID:', authUser.user.id)

    // 4. Crear usuario en la tabla usuarios
    console.log('👤 Creando usuario en la base de datos...')
    const { data: dbUser, error: dbError } = await supabase
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
      
      // Limpiar usuario de Auth si falló la creación en BD
      console.log('🧹 Limpiando usuario de Auth...')
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return
    }

    console.log('✅ Usuario creado en BD con ID:', dbUser.id_usuario)

    // 5. Asignar todos los permisos de administrador
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

    // 6. Mostrar información de acceso
    console.log('\n🎉 ¡Usuario superadmin creado exitosamente!')
    console.log('=' .repeat(50))
    console.log('📧 Email:', SUPERADMIN_DATA.email)
    console.log('🔑 Contraseña:', SUPERADMIN_DATA.password)
    console.log('👤 Nombre:', `${SUPERADMIN_DATA.nombres} ${SUPERADMIN_DATA.apellidos}`)
    console.log('🆔 CI:', SUPERADMIN_DATA.ci)
    console.log('📱 Teléfono:', SUPERADMIN_DATA.telefono)
    console.log('🏢 Departamento:', SUPERADMIN_DATA.departamento)
    console.log('👑 Rol:', SUPERADMIN_DATA.rol.toUpperCase())
    console.log('🆔 ID Usuario:', dbUser.id_usuario)
    console.log('🔐 ID Auth:', authUser.user.id)
    console.log('=' .repeat(50))
    console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro')
    console.log('💡 Recomendación: Cambia la contraseña después del primer login')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
createSuperAdmin()