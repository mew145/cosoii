// =============================================
// SCRIPT: Verificar Usuario Superadmin
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySuperAdmin() {
  try {
    console.log('🔍 Verificando usuario superadmin...')
    
    // Buscar el usuario superadmin
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email_usuario', 'superadmin@riesgos.com')
      .single()

    if (error) {
      console.error('❌ Error buscando superadmin:', error.message)
      return
    }

    if (!user) {
      console.log('❌ Usuario superadmin no encontrado')
      return
    }

    console.log('✅ Usuario superadmin encontrado:')
    console.log('=' .repeat(50))
    console.log('🆔 ID:', user.id_usuario)
    console.log('👤 Nombre:', user.nombres_usuario, user.apellidos_usuario)
    console.log('📧 Email:', user.email_usuario)
    console.log('🆔 CI:', user.ci_usuario)
    console.log('📱 Teléfono:', user.telefono_usuario || 'No especificado')
    console.log('🏢 Departamento:', user.departamento_usuario || 'No especificado')
    console.log('👑 Rol:', user.rol_usuario)
    console.log('✅ Activo:', user.activo ? 'Sí' : 'No')
    console.log('📅 Fecha Registro:', new Date(user.fecha_registro).toLocaleString())
    console.log('🔄 Última Actualización:', new Date(user.fecha_actualizacion).toLocaleString())
    console.log('🔐 ID Auth:', user.id_usuario_auth || 'No vinculado')
    console.log('=' .repeat(50))

    // Verificar configuración
    const issues = []
    
    if (user.rol_usuario !== 'administrador') {
      issues.push('❌ Rol incorrecto (debe ser "administrador")')
    }
    
    if (!user.activo) {
      issues.push('❌ Usuario no está activo')
    }
    
    if (!user.ci_usuario) {
      issues.push('⚠️ CI no especificado')
    }
    
    if (!user.id_usuario_auth) {
      issues.push('⚠️ No está vinculado con Supabase Auth')
    }

    if (issues.length === 0) {
      console.log('🎉 ¡Usuario superadmin configurado correctamente!')
      console.log('\n📋 Credenciales de acceso:')
      console.log('📧 Email: superadmin@riesgos.com')
      console.log('🔑 Contraseña: SuperAdmin2024!')
      console.log('\n💡 Pasos para completar la configuración:')
      console.log('1. Ve a tu panel de Supabase > Authentication > Users')
      console.log('2. Crea un usuario con email: superadmin@riesgos.com')
      console.log('3. Usa la contraseña: SuperAdmin2024!')
      console.log('4. Una vez creado, el sistema debería funcionar correctamente')
    } else {
      console.log('\n⚠️ Problemas encontrados:')
      issues.forEach(issue => console.log(issue))
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
verifySuperAdmin()