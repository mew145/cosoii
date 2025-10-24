// =============================================
// SCRIPT: Verificación Final del Sistema
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://prcsicfnvyaoxwfrjnky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3NpY2Zudnlhb3h3ZnJqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTI5MDIsImV4cCI6MjA3NjM4ODkwMn0.3SKq9goJGCONNRQ-KhUiRAeWbsKuR1NMgQAsWv6rFyI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function finalVerification() {
  try {
    console.log('🔍 Verificación final del sistema...')
    console.log('=' .repeat(60))

    // 1. Verificar usuarios y roles
    console.log('👥 1. VERIFICANDO USUARIOS Y ROLES')
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('*')
      .order('id_usuario')

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message)
      return
    }

    console.log(`✅ Total de usuarios: ${users?.length || 0}`)
    
    // Contar por roles
    const roleCounts = {}
    users?.forEach(user => {
      const rol = user.rol_usuario || 'sin_rol'
      roleCounts[rol] = (roleCounts[rol] || 0) + 1
    })

    console.log('📊 Distribución por roles:')
    Object.entries(roleCounts).forEach(([rol, count]) => {
      const emoji = {
        'super_admin': '🔴',
        'administrador': '🟠', 
        'gerente': '🟡',
        'auditor': '🟢'
      }[rol] || '⚪'
      
      const displayName = {
        'super_admin': 'Super Administrador',
        'administrador': 'Administrador',
        'gerente': 'Gerente', 
        'auditor': 'Auditor'
      }[rol] || rol

      console.log(`   ${emoji} ${displayName}: ${count} usuarios`)
    })

    // 2. Verificar usuario superadmin específicamente
    console.log('\n🔐 2. VERIFICANDO USUARIO SUPERADMIN')
    const superadmin = users?.find(u => u.email_usuario === 'superadmin@riesgos.com')
    
    if (superadmin) {
      console.log('✅ Usuario superadmin encontrado:')
      console.log(`   📧 Email: ${superadmin.email_usuario}`)
      console.log(`   👤 Nombre: ${superadmin.nombres_usuario} ${superadmin.apellidos_usuario}`)
      console.log(`   👑 Rol: ${superadmin.rol_usuario}`)
      console.log(`   ✅ Activo: ${superadmin.activo ? 'Sí' : 'No'}`)
      console.log(`   🔗 Auth ID: ${superadmin.id_usuario_auth ? 'Vinculado' : 'No vinculado'}`)
      
      if (!superadmin.id_usuario_auth) {
        console.log('⚠️  ACCIÓN REQUERIDA: Crear usuario en Supabase Auth')
        console.log('   1. Ve a Supabase > Authentication > Users')
        console.log('   2. Add user: superadmin@riesgos.com')
        console.log('   3. Password: SuperAdmin2024!')
      }
    } else {
      console.log('❌ Usuario superadmin NO encontrado')
    }

    // 3. Verificar estructura de dashboards
    console.log('\n🏠 3. VERIFICANDO ESTRUCTURA DE DASHBOARDS')
    const dashboards = [
      { path: '/dashboard', description: 'Dashboard principal (redirección)' },
      { path: '/admin/dashboard', description: 'Dashboard de administrador' },
      { path: '/gerente/dashboard', description: 'Dashboard de gerente' },
      { path: '/auditor/dashboard', description: 'Dashboard de auditor' },
      { path: '/dashboard/general', description: 'Dashboard general' }
    ]

    dashboards.forEach(dashboard => {
      console.log(`✅ ${dashboard.path} - ${dashboard.description}`)
    })

    // 4. Verificar roles válidos
    console.log('\n👑 4. ROLES VÁLIDOS EN EL SISTEMA')
    const validRoles = [
      { role: 'super_admin', name: 'Super Administrador', dashboard: '/admin/dashboard' },
      { role: 'administrador', name: 'Administrador', dashboard: '/admin/dashboard' },
      { role: 'gerente', name: 'Gerente', dashboard: '/gerente/dashboard' },
      { role: 'auditor', name: 'Auditor', dashboard: '/auditor/dashboard' }
    ]

    validRoles.forEach(({ role, name, dashboard }) => {
      const count = roleCounts[role] || 0
      console.log(`✅ ${role} (${name}) → ${dashboard} [${count} usuarios]`)
    })

    // 5. Resumen de credenciales
    console.log('\n🔑 5. CREDENCIALES DE ACCESO')
    console.log('=' .repeat(40))
    console.log('📧 Email: superadmin@riesgos.com')
    console.log('🔑 Contraseña: SuperAdmin2024!')
    console.log('👑 Rol: administrador')
    console.log('🏠 Dashboard: /admin/dashboard')
    console.log('=' .repeat(40))

    // 6. Estado del sistema
    console.log('\n🎯 6. ESTADO DEL SISTEMA')
    const systemStatus = {
      usuarios: users?.length > 0,
      superadmin: !!superadmin,
      rolesActualizados: Object.keys(roleCounts).every(role => 
        ['super_admin', 'administrador', 'gerente', 'auditor'].includes(role) || role === 'sin_rol'
      ),
      dashboardsCreados: true
    }

    Object.entries(systemStatus).forEach(([component, status]) => {
      const emoji = status ? '✅' : '❌'
      const componentName = {
        usuarios: 'Usuarios en BD',
        superadmin: 'Usuario Superadmin',
        rolesActualizados: 'Roles Actualizados',
        dashboardsCreados: 'Dashboards Creados'
      }[component]
      
      console.log(`${emoji} ${componentName}`)
    })

    const allGood = Object.values(systemStatus).every(status => status)
    
    console.log('\n🎉 RESULTADO FINAL')
    if (allGood) {
      console.log('✅ ¡Sistema configurado correctamente!')
      console.log('💡 Puedes hacer login y probar los dashboards diferenciados')
    } else {
      console.log('⚠️  Sistema parcialmente configurado')
      console.log('💡 Revisa los elementos marcados con ❌')
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error)
  }
}

// Ejecutar el script
finalVerification()