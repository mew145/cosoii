// =============================================
// VERIFICAR USUARIOS EN BASE DE DATOS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsers() {
  console.log('🔍 Verificando usuarios en la base de datos...\n')
  
  try {
    // Obtener usuarios de Supabase Auth
    console.log('👥 Usuarios en Supabase Auth:')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Error obteniendo sesión:', sessionError.message)
    } else if (session) {
      console.log('✅ Sesión activa:')
      console.log(`   - ID: ${session.user.id}`)
      console.log(`   - Email: ${session.user.email}`)
      console.log(`   - Provider: ${session.user.app_metadata?.provider}`)
      console.log(`   - Nombre: ${session.user.user_metadata?.full_name || session.user.user_metadata?.name}`)
    } else {
      console.log('❌ No hay sesión activa')
    }
    
    console.log('\n📋 Usuarios en tabla "usuarios":')
    
    // Obtener usuarios de la tabla usuarios
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false })
    
    if (usersError) {
      console.log('❌ Error consultando tabla usuarios:', usersError.message)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No hay usuarios en la tabla "usuarios"')
      
      if (session) {
        console.log('\n💡 El usuario actual no está en la tabla. Creando registro...')
        await createMissingUser(session.user)
      }
      
      return
    }
    
    console.log(`✅ Encontrados ${users.length} usuarios:`)
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nombres_usuario} ${user.apellidos_usuario}`)
      console.log(`   - ID Usuario: ${user.id_usuario}`)
      console.log(`   - Auth ID: ${user.id_usuario_auth}`)
      console.log(`   - Email: ${user.email_usuario}`)
      console.log(`   - CI: ${user.ci_usuario || 'No especificado'}`)
      console.log(`   - Activo: ${user.activo ? 'Sí' : 'No'}`)
      console.log(`   - Rol: ${user.rol_usuario}`)
      console.log(`   - Registro: ${new Date(user.fecha_registro).toLocaleString()}`)
    })
    
    // Verificar si el usuario actual está en la tabla
    if (session) {
      const currentUserInDB = users.find(u => u.id_usuario_auth === session.user.id)
      
      if (currentUserInDB) {
        console.log('\n✅ El usuario actual SÍ está en la tabla usuarios')
      } else {
        console.log('\n❌ El usuario actual NO está en la tabla usuarios')
        console.log('💡 Creando registro faltante...')
        await createMissingUser(session.user)
      }
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
  }
}

async function createMissingUser(authUser) {
  try {
    const email = authUser.email
    const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
    const [nombres = '', ...apellidosParts] = fullName.split(' ')
    const apellidos = apellidosParts.join(' ') || ''

    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id_usuario_auth: authUser.id,
        nombres_usuario: nombres || 'Usuario',
        apellidos_usuario: apellidos || 'OAuth',
        email_usuario: email,
        ci_usuario: null,
        telefono_usuario: null,
        departamento_usuario: null,
        rol_usuario: 'CONSULTOR',
        activo: false, // Requiere activación manual
        fecha_registro: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.log('❌ Error creando usuario:', error.message)
    } else {
      console.log('✅ Usuario creado exitosamente:')
      console.log(`   - Nombres: ${data.nombres_usuario}`)
      console.log(`   - Apellidos: ${data.apellidos_usuario}`)
      console.log(`   - Email: ${data.email_usuario}`)
      console.log('⚠️  Nota: El usuario está inactivo y necesita completar su perfil')
    }

  } catch (error) {
    console.log('❌ Error creando usuario:', error.message)
  }
}

checkUsers().catch(console.error)