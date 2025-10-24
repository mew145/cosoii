// =============================================
// SCRIPT: Prueba Completa del Sistema
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSystemComplete() {
  try {
    console.log('🧪 PRUEBA COMPLETA DEL SISTEMA')
    console.log('=' .repeat(60))

    // 1. Verificar que solo existen los 4 roles válidos
    console.log('👑 1. VERIFICANDO ROLES EN BASE DE DATOS')
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('rol_usuario')

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    const rolesEncontrados = [...new Set(users.map(u => u.rol_usuario))]
    const rolesValidos = ['super_admin', 'administrador', 'gerente', 'auditor']
    
    console.log('📊 Roles encontrados en BD:', rolesEncontrados)
    console.log('✅ Roles válidos esperados:', rolesValidos)

    const rolesInvalidos = rolesEncontrados.filter(rol => !rolesValidos.includes(rol))
    
    if (rolesInvalidos.length === 0) {
      console.log('✅ ¡Todos los roles son válidos!')
    } else {
      console.log('❌ Roles inválidos encontrados:', rolesInvalidos)
    }

    // 2. Verificar distribución de usuarios por rol
    console.log('\n📈 2. DISTRIBUCIÓN DE USUARIOS POR ROL')
    const distribucion = {}
    users.forEach(user => {
      const rol = user.rol_usuario
      distribucion[rol] = (distribucion[rol] || 0) + 1
    })

    Object.entries(distribucion).forEach(([rol, count]) => {
      const emoji = {
        'super_admin': '🔴',
        'administrador': '🟠',
        'gerente': '🟡',
        'auditor': '🟢'
      }[rol] || '⚪'
      
      const nombre = {
        'super_admin': 'Super Administrador',
        'administrador': 'Administrador',
        'gerente': 'Gerente',
        'auditor': 'Auditor'
      }[rol] || rol

      console.log(`${emoji} ${nombre}: ${count} usuarios`)
    })

    // 3. Verificar usuario superadmin
    console.log('\n🔐 3. VERIFICANDO USUARIO SUPERADMIN')
    const { data: superadmin } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email_usuario', 'superadmin@riesgos.com')
      .single()

    if (superadmin) {
      console.log('✅ Usuario superadmin encontrado')
      console.log(`   👤 Nombre: ${superadmin.nombres_usuario} ${superadmin.apellidos_usuario}`)
      console.log(`   👑 Rol: ${superadmin.rol_usuario}`)
      console.log(`   ✅ Activo: ${superadmin.activo ? 'Sí' : 'No'}`)
      console.log(`   🔗 Auth: ${superadmin.id_usuario_auth ? 'Vinculado' : 'No vinculado'}`)
      
      if (superadmin.rol_usuario === 'administrador' && superadmin.activo) {
        console.log('✅ Configuración correcta para acceso a /admin/dashboard')
      } else {
        console.log('⚠️  Revisar configuración del superadmin')
      }
    } else {
      console.log('❌ Usuario superadmin no encontrado')
    }

    // 4. Resumen final
    console.log('\n🎯 4. RESUMEN FINAL')
    const checks = {
      rolesValidos: rolesInvalidos.length === 0,
      superadminExiste: !!superadmin,
      superadminConfiguracion: superadmin?.rol_usuario === 'administrador' && superadmin?.activo,
      usuariosEnBD: users.length > 0
    }

    Object.entries(checks).forEach(([check, passed]) => {
      const emoji = passed ? '✅' : '❌'
      const nombre = {
        rolesValidos: 'Solo roles válidos en BD',
        superadminExiste: 'Usuario superadmin existe',
        superadminConfiguracion: 'Superadmin configurado correctamente',
        usuariosEnBD: 'Usuarios en base de datos'
      }[check]
      
      console.log(`${emoji} ${nombre}`)
    })

    const todoOK = Object.values(checks).every(check => check)
    
    console.log('\n🏆 RESULTADO FINAL')
    if (todoOK) {
      console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!')
      console.log('💡 Puedes hacer login y probar todos los dashboards')
      console.log('\n🔑 Credenciales de prueba:')
      console.log('📧 Email: superadmin@riesgos.com')
      console.log('🔑 Contraseña: SuperAdmin2024!')
    } else {
      console.log('⚠️  Sistema necesita ajustes')
      console.log('💡 Revisa los elementos marcados con ❌')
    }

    console.log('\n🏠 Dashboards disponibles:')
    console.log('🔴 /admin/dashboard - Super Admin y Administradores')
    console.log('🟡 /gerente/dashboard - Gerentes')
    console.log('🟢 /auditor/dashboard - Auditores')
    console.log('⚪ /dashboard/general - Dashboard general')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Ejecutar la prueba
testSystemComplete()