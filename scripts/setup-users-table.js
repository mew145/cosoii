// =============================================
// CONFIGURAR TABLA DE USUARIOS PARA SUPABASE AUTH
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupUsersTable() {
  console.log('🔧 Configurando tabla de usuarios para Supabase Auth...\n')
  
  try {
    // Verificar si la tabla usuarios existe
    console.log('1️⃣ Verificando estructura de tabla usuarios...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      console.log('❌ Error accediendo a tabla usuarios:', tablesError.message)
      
      if (tablesError.message.includes('does not exist')) {
        console.log('📝 Creando tabla usuarios compatible con Supabase Auth...')
        await createUsersTable()
      } else {
        console.log('💡 Intentando crear tabla con estructura correcta...')
        await createUsersTable()
      }
    } else {
      console.log('✅ Tabla usuarios existe')
      
      // Verificar estructura de columnas
      console.log('2️⃣ Verificando columnas necesarias...')
      await checkAndAddColumns()
    }
    
    // Verificar usuarios existentes
    console.log('3️⃣ Verificando usuarios existentes...')
    await checkExistingUsers()
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
  }
}

async function createUsersTable() {
  try {
    console.log('📝 Ejecutando SQL para crear tabla usuarios...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario SERIAL PRIMARY KEY,
        id_usuario_auth UUID UNIQUE, -- ID de Supabase Auth
        nombres_usuario VARCHAR(100) NOT NULL,
        apellidos_usuario VARCHAR(100) NOT NULL,
        email_usuario VARCHAR(255) UNIQUE NOT NULL,
        ci_usuario VARCHAR(20) UNIQUE,
        telefono_usuario VARCHAR(20),
        departamento_usuario VARCHAR(100),
        rol_usuario VARCHAR(50) DEFAULT 'CONSULTOR',
        activo BOOLEAN DEFAULT FALSE,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        ultima_conexion TIMESTAMP,
        -- Campos adicionales
        provider_oauth VARCHAR(50), -- 'google', 'github', etc.
        avatar_url TEXT,
        metadata_usuario JSONB
      );
      
      -- Crear índices
      CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(id_usuario_auth);
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email_usuario);
      CREATE INDEX IF NOT EXISTS idx_usuarios_ci ON usuarios(ci_usuario);
    `
    
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.log('❌ Error creando tabla:', error.message)
      console.log('💡 Intentando método alternativo...')
      
      // Método alternativo: usar el cliente de administración
      console.log('⚠️  Nota: Necesitas ejecutar este SQL manualmente en Supabase Dashboard:')
      console.log('\n--- SQL PARA EJECUTAR ---')
      console.log(createTableSQL)
      console.log('--- FIN SQL ---\n')
      
    } else {
      console.log('✅ Tabla usuarios creada exitosamente')
    }
    
  } catch (error) {
    console.log('❌ Error creando tabla:', error.message)
    console.log('\n💡 Ejecuta este SQL manualmente en Supabase Dashboard > SQL Editor:')
    console.log('\n--- SQL PARA EJECUTAR ---')
    console.log(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario SERIAL PRIMARY KEY,
        id_usuario_auth UUID UNIQUE,
        nombres_usuario VARCHAR(100) NOT NULL,
        apellidos_usuario VARCHAR(100) NOT NULL,
        email_usuario VARCHAR(255) UNIQUE NOT NULL,
        ci_usuario VARCHAR(20) UNIQUE,
        telefono_usuario VARCHAR(20),
        departamento_usuario VARCHAR(100),
        rol_usuario VARCHAR(50) DEFAULT 'CONSULTOR',
        activo BOOLEAN DEFAULT FALSE,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        ultima_conexion TIMESTAMP,
        provider_oauth VARCHAR(50),
        avatar_url TEXT,
        metadata_usuario JSONB
      );
      
      CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(id_usuario_auth);
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email_usuario);
      CREATE INDEX IF NOT EXISTS idx_usuarios_ci ON usuarios(ci_usuario);
    `)
    console.log('--- FIN SQL ---\n')
  }
}

async function checkAndAddColumns() {
  // Intentar insertar un registro de prueba para verificar columnas
  try {
    const testData = {
      id_usuario_auth: '00000000-0000-0000-0000-000000000000',
      nombres_usuario: 'Test',
      apellidos_usuario: 'User',
      email_usuario: 'test@test.com',
      rol_usuario: 'CONSULTOR',
      activo: false
    }
    
    const { error } = await supabase
      .from('usuarios')
      .insert(testData)
    
    if (error) {
      console.log('❌ Error de estructura:', error.message)
      console.log('💡 La tabla necesita ser recreada con la estructura correcta')
    } else {
      // Eliminar el registro de prueba
      await supabase
        .from('usuarios')
        .delete()
        .eq('email_usuario', 'test@test.com')
      
      console.log('✅ Estructura de tabla correcta')
    }
    
  } catch (error) {
    console.log('❌ Error verificando estructura:', error.message)
  }
}

async function checkExistingUsers() {
  try {
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
    
    if (error) {
      console.log('❌ Error consultando usuarios:', error.message)
      return
    }
    
    console.log(`📊 Usuarios en tabla: ${users?.length || 0}`)
    
    if (users && users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nombres_usuario} ${user.apellidos_usuario} (${user.email_usuario})`)
      })
    }
    
    // Verificar sesión actual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('\n👤 Usuario actual en sesión:')
      console.log(`   - Auth ID: ${session.user.id}`)
      console.log(`   - Email: ${session.user.email}`)
      
      const userInDB = users?.find(u => u.id_usuario_auth === session.user.id)
      
      if (userInDB) {
        console.log('✅ Usuario actual está en la tabla')
      } else {
        console.log('❌ Usuario actual NO está en la tabla')
        console.log('💡 Creando registro para usuario actual...')
        await createCurrentUser(session.user)
      }
    } else {
      console.log('\n❌ No hay sesión activa')
      console.log('💡 Inicia sesión primero para crear el registro de usuario')
    }
    
  } catch (error) {
    console.log('❌ Error verificando usuarios:', error.message)
  }
}

async function createCurrentUser(authUser) {
  try {
    const email = authUser.email
    const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
    const [nombres = '', ...apellidosParts] = fullName.split(' ')
    const apellidos = apellidosParts.join(' ') || ''

    const userData = {
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
      fecha_actualizacion: new Date().toISOString(),
      provider_oauth: authUser.app_metadata?.provider || null,
      avatar_url: authUser.user_metadata?.avatar_url || null
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert(userData)
      .select()
      .single()

    if (error) {
      console.log('❌ Error creando usuario:', error.message)
    } else {
      console.log('✅ Usuario creado exitosamente')
      console.log(`   - Nombres: ${data.nombres_usuario}`)
      console.log(`   - Apellidos: ${data.apellidos_usuario}`)
      console.log(`   - Email: ${data.email_usuario}`)
      console.log('⚠️  Nota: Usuario inactivo, necesita completar perfil')
    }

  } catch (error) {
    console.log('❌ Error creando usuario:', error.message)
  }
}

setupUsersTable().catch(console.error)