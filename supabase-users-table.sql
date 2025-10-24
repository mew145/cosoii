-- =============================================
-- TABLA DE USUARIOS COMPATIBLE CON SUPABASE AUTH
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- OPCIÓN 1: Agregar columnas a tabla existente (RECOMENDADO)
-- Agregar columnas necesarias para Supabase Auth
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_usuario_auth UUID UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombres_usuario VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos_usuario VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_usuario VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ci_usuario VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono_usuario VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS departamento_usuario VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_usuario VARCHAR(50) DEFAULT 'CONSULTOR';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultima_conexion TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS provider_oauth VARCHAR(50);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS metadata_usuario JSONB;

-- Agregar constraints únicos si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_id_usuario_auth_key') THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_id_usuario_auth_key UNIQUE (id_usuario_auth);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_usuario_key') THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_usuario_key UNIQUE (email_usuario);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_ci_usuario_key') THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_ci_usuario_key UNIQUE (ci_usuario);
    END IF;
END $$;

-- OPCIÓN 2: Recrear tabla completa (solo si la opción 1 no funciona)
/*
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
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
  -- Campos adicionales para OAuth
  provider_oauth VARCHAR(50), -- 'google', 'github', etc.
  avatar_url TEXT,
  metadata_usuario JSONB
);
*/

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(id_usuario_auth);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_ci ON usuarios(ci_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_usuario);

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver y editar su propio registro
CREATE POLICY "Users can view own record" ON usuarios
  FOR SELECT USING (auth.uid() = id_usuario_auth);

CREATE POLICY "Users can update own record" ON usuarios
  FOR UPDATE USING (auth.uid() = id_usuario_auth);

-- Política para que los administradores puedan ver todos los registros
CREATE POLICY "Admins can view all users" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id_usuario_auth = auth.uid() 
      AND rol_usuario IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- Política para insertar nuevos usuarios (durante el registro OAuth)
CREATE POLICY "Allow insert for authenticated users" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id_usuario_auth);

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema integrada con Supabase Auth';
COMMENT ON COLUMN usuarios.id_usuario_auth IS 'UUID del usuario en Supabase Auth';
COMMENT ON COLUMN usuarios.activo IS 'Indica si el usuario está activo en el sistema';
COMMENT ON COLUMN usuarios.rol_usuario IS 'Rol del usuario: SUPERADMIN, ADMIN, GERENTE, AUDITOR, ANALISTA, CONSULTOR';

-- Insertar roles de ejemplo si no existen
INSERT INTO usuarios (
  id_usuario_auth,
  nombres_usuario,
  apellidos_usuario,
  email_usuario,
  rol_usuario,
  activo,
  ci_usuario
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin',
  'Sistema',
  'admin@deltaconsult.com',
  'SUPERADMIN',
  true,
  '0000001'
) ON CONFLICT (email_usuario) DO NOTHING;

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion ON usuarios;
CREATE TRIGGER trigger_update_fecha_actualizacion
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_fecha_actualizacion();