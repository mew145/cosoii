// =============================================
// TEST FLUJO COMPLETAR PERFIL
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteProfileFlow() {
  console.log('🧪 Probando flujo de completar perfil...\n')
  
  try {
    // Crear un usuario de prueba con UUID válido
    const testAuthId = '12345678-1234-1234-1234-123456789012'
    const testEmail = `test${Date.now()}@test.com`
    
    console.log('1️⃣ Creando usuario de prueba...')
    const { data: newUser, error: createError } = await supabase
      .from('usuarios')
      .insert({
        id_usuario_auth: testAuthId,
        nombres_usuario: 'Usuario',
        apellidos_usuario: 'OAuth',
        email_usuario: testEmail,
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
    
    if (createError) {
      console.log('❌ Error creando usuario de prueba:', createError.message)
      return
    }
    
    console.log('✅ Usuario de prueba creado:', newUser.nombres_usuario, newUser.apellidos_usuario)
    console.log('   - ID:', newUser.id_usuario)
    console.log('   - Auth ID:', newUser.id_usuario_auth)
    console.log('   - Activo:', newUser.activo)
    console.log('   - CI:', newUser.ci_usuario)
    
    // Simular completar perfil
    console.log('\n2️⃣ Simulando completar perfil...')
    const { data: updatedUser, error: updateError } = await supabase
      .from('usuarios')
      .update({
        nombres_usuario: 'Juan',
        apellidos_usuario: 'Pérez',
        ci_usuario: '12345678',
        telefono_usuario: '70123456',
        departamento_usuario: 'Sistemas',
        activo: true,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_usuario_auth', testAuthId)
      .select()
      .single()
    
    if (updateError) {
      console.log('❌ Error actualizando usuario:', updateError.message)
      return
    }
    
    console.log('✅ Usuario actualizado exitosamente:')
    console.log('   - Nombres:', updatedUser.nombres_usuario)
    console.log('   - Apellidos:', updatedUser.apellidos_usuario)
    console.log('   - CI:', updatedUser.ci_usuario)
    console.log('   - Activo:', updatedUser.activo)
    
    // Verificar que el usuario puede ser encontrado
    console.log('\n3️⃣ Verificando búsqueda de usuario...')
    const { data: foundUser, error: findError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario_auth', testAuthId)
      .single()
    
    if (findError) {
      console.log('❌ Error buscando usuario:', findError.message)
      return
    }
    
    console.log('✅ Usuario encontrado correctamente:')
    console.log('   - ID:', foundUser.id_usuario)
    console.log('   - Nombres:', foundUser.nombres_usuario)
    console.log('   - Apellidos:', foundUser.apellidos_usuario)
    console.log('   - CI:', foundUser.ci_usuario)
    console.log('   - Activo:', foundUser.activo)
    
    // Verificar condiciones para dashboard
    console.log('\n4️⃣ Verificando condiciones para dashboard...')
    const hasCI = !!foundUser.ci_usuario
    const isActive = !!foundUser.activo
    const hasValidNames = foundUser.nombres_usuario && foundUser.nombres_usuario !== 'Usuario'
    
    console.log('   - Tiene CI:', hasCI ? 'SÍ' : 'NO')
    console.log('   - Está activo:', isActive ? 'SÍ' : 'NO')
    console.log('   - Tiene nombres válidos:', hasValidNames ? 'SÍ' : 'NO')
    
    const canAccessDashboard = hasCI && isActive && hasValidNames
    console.log('   - Puede acceder al dashboard:', canAccessDashboard ? 'SÍ' : 'NO')
    
    if (canAccessDashboard) {
      console.log('\n✅ FLUJO EXITOSO: Usuario debería poder acceder al dashboard')
    } else {
      console.log('\n⚠️  PROBLEMA: Usuario aún necesita completar perfil')
    }
    
    // Limpiar usuario de prueba
    console.log('\n5️⃣ Limpiando usuario de prueba...')
    await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario_auth', testAuthId)
    
    console.log('✅ Usuario de prueba eliminado')
    
  } catch (error) {
    console.log('❌ Error en test:', error.message)
  }
}

testCompleteProfileFlow().catch(console.error)