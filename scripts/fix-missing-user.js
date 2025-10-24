// =============================================
// CREAR USUARIO FALTANTE
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMissingUser() {
  console.log('🔧 Verificando y creando usuario faltante...\n')
  
  try {
    // Obtener sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Error obteniendo sesión:', sessionError.message)
      return
    }
    
    if (!session) {
      console.log('❌ No hay sesión activa')
      console.log('💡 Inicia sesión con OAuth primero')
      return
    }
    
    console.log('👤 Usuario en sesión:')
    console.log(`   - Auth ID: ${session.user.id}`)
    console.log(`   - Email: ${session.user.email}`)
    console.log(`   - Provider: ${session.user.app_metadata?.provider}`)
    
    // Verificar si existe en la tabla usuarios
    console.log('\n🔍 Verificando si existe en tabla usuarios...')
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario_auth', session.user.id)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error consultando usuario:', checkError.message)
      return
    }
    
    if (existingUser) {
      console.log('✅ Usuario ya existe en BD:')
      console.log(`   - ID: ${existingUser.id_usuario}`)
      console.log(`   - Nombres: ${existingUser.nombres_usuario}`)
      console.log(`   - Apellidos: ${existingUser.apellidos_usuario}`)
      console.log(`   - CI: ${existingUser.ci_usuario || 'Sin CI'}`)
      console.log(`   - Activo: ${existingUser.activo ? 'SÍ' : 'NO'}`)
      
      if (!existingUser.ci_usuario || !existingUser.activo) {
        console.log('\n⚠️  Usuario necesita completar perfil')
      } else {
        console.log('\n✅ Usuario tiene perfil completo')
      }
      return
    }
    
    console.log('❌ Usuario NO existe en tabla usuarios')
    console.log('🔧 Creando usuario...')
    
    // Crear usuario
    const email = session.user.email
    const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
    const [nombres = '', ...apellidosParts] = fullName.split(' ')
    const apellidos = apellidosParts.join(' ') || ''

    const userData = {
      id_usuario_auth: session.user.id,
      nombres_usuario: nombres || 'Usuario',
      apellidos_usuario: apellidos || 'OAuth',
      email_usuario: email,
      ci_usuario: null,
      telefono_usuario: null,
      departamento_usuario: null,
      rol_usuario: 'CONSULTOR',
      activo: false, // Requiere completar perfil
      fecha_registro: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    }

    console.log('📋 Datos del usuario a crear:', userData)

    const { data: newUser, error: createError } = await supabase
      .from('usuarios')
      .insert(userData)
      .select()
      .single()

    if (createError) {
      console.log('❌ Error creando usuario:', createError.message)
      console.log('💡 Detalles del error:', createError)
      
      // Verificar si es un problema de RLS
      if (createError.message.includes('row-level security')) {
        console.log('\n🔒 Problema de Row Level Security (RLS)')
        console.log('💡 Soluciones posibles:')
        console.log('1. Deshabilitar RLS temporalmente en Supabase Dashboard')
        console.log('2. Crear políticas RLS apropiadas')
        console.log('3. Usar el Service Role Key (no recomendado para producción)')
      }
      
      return
    }

    console.log('✅ Usuario creado exitosamente:')
    console.log(`   - ID: ${newUser.id_usuario}`)
    console.log(`   - Nombres: ${newUser.nombres_usuario}`)
    console.log(`   - Apellidos: ${newUser.apellidos_usuario}`)
    console.log(`   - Email: ${newUser.email_usuario}`)
    console.log(`   - Activo: ${newUser.activo}`)
    
    console.log('\n🎯 Próximos pasos:')
    console.log('1. Ve a /auth/complete-profile')
    console.log('2. Completa tu CI y otros datos')
    console.log('3. El usuario será activado automáticamente')
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
  }
}

fixMissingUser().catch(console.error)