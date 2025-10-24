// =============================================
// DEBUG ESTADO DEL USUARIO
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUserState() {
  console.log('🔍 Debuggeando estado del usuario...\n')
  
  try {
    // Obtener sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Error obteniendo sesión:', sessionError.message)
      return
    }
    
    if (!session) {
      console.log('❌ No hay sesión activa')
      console.log('💡 Inicia sesión primero para debuggear')
      return
    }
    
    console.log('👤 Usuario en sesión:')
    console.log(`   - Auth ID: ${session.user.id}`)
    console.log(`   - Email: ${session.user.email}`)
    console.log(`   - Provider: ${session.user.app_metadata?.provider}`)
    console.log(`   - Nombre: ${session.user.user_metadata?.full_name || session.user.user_metadata?.name}`)
    
    // Buscar usuario en la base de datos
    console.log('\n🗄️ Buscando usuario en base de datos...')
    
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario_auth', session.user.id)
      .single()
    
    if (userError) {
      console.log('❌ Error consultando usuario:', userError.message)
      
      if (userError.code === 'PGRST116') {
        console.log('💡 Usuario no encontrado en la tabla usuarios')
        console.log('🔧 Creando usuario...')
        await createMissingUser(session.user)
      }
      return
    }
    
    if (!userData) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log('✅ Usuario encontrado en BD:')
    console.log(`   - ID Usuario: ${userData.id_usuario}`)
    console.log(`   - Nombres: ${userData.nombres_usuario}`)
    console.log(`   - Apellidos: ${userData.apellidos_usuario}`)
    console.log(`   - Email: ${userData.email_usuario}`)
    console.log(`   - CI: ${userData.ci_usuario || 'No especificado'}`)
    console.log(`   - Teléfono: ${userData.telefono_usuario || 'No especificado'}`)
    console.log(`   - Departamento: ${userData.departamento_usuario || 'No especificado'}`)
    console.log(`   - Rol: ${userData.rol_usuario}`)
    console.log(`   - Activo: ${userData.activo ? 'SÍ' : 'NO'}`)
    console.log(`   - Fecha Registro: ${userData.fecha_registro}`)
    console.log(`   - Última Actualización: ${userData.fecha_actualizacion}`)
    
    // Verificar condiciones para completar perfil
    console.log('\n🔍 Verificando condiciones:')
    
    const needsCI = !userData.ci_usuario
    const needsActivation = !userData.activo
    const needsNames = !userData.nombres_usuario || userData.nombres_usuario === 'Usuario'
    
    console.log(`   - Necesita CI: ${needsCI ? 'SÍ' : 'NO'}`)
    console.log(`   - Necesita activación: ${needsActivation ? 'SÍ' : 'NO'}`)
    console.log(`   - Necesita nombres: ${needsNames ? 'SÍ' : 'NO'}`)
    
    if (needsCI || needsActivation || needsNames) {
      console.log('\n⚠️  Usuario necesita completar perfil')
      console.log('🔄 Debería ser redirigido a /auth/complete-profile')
    } else {
      console.log('\n✅ Usuario tiene perfil completo')
      console.log('🔄 Debería ser redirigido a /dashboard')
    }
    
    // Mostrar todos los usuarios para comparar
    console.log('\n📋 Todos los usuarios en la tabla:')
    const { data: allUsers } = await supabase
      .from('usuarios')
      .select('id_usuario, nombres_usuario, apellidos_usuario, email_usuario, ci_usuario, activo')
      .order('fecha_registro', { ascending: false })
    
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((user, index) => {
        const isCurrentUser = user.id_usuario === userData.id_usuario
        const marker = isCurrentUser ? '👉' : '  '
        console.log(`${marker} ${index + 1}. ${user.nombres_usuario} ${user.apellidos_usuario}`)
        console.log(`     Email: ${user.email_usuario}`)
        console.log(`     CI: ${user.ci_usuario || 'Sin CI'}`)
        console.log(`     Activo: ${user.activo ? 'SÍ' : 'NO'}`)
        if (isCurrentUser) console.log('     ⬆️  USUARIO ACTUAL')
      })
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
  }
}

async function createMissingUser(authUser) {
  try {
    console.log('🔧 Creando usuario faltante...')
    
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
        activo: false,
        fecha_registro: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.log('❌ Error creando usuario:', error.message)
    } else {
      console.log('✅ Usuario creado exitosamente')
      console.log(`   - Nombres: ${data.nombres_usuario}`)
      console.log(`   - Apellidos: ${data.apellidos_usuario}`)
      console.log(`   - Email: ${data.email_usuario}`)
    }

  } catch (error) {
    console.log('❌ Error creando usuario:', error.message)
  }
}

debugUserState().catch(console.error)