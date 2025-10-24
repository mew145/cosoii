-- =============================================
-- AGREGAR COLUMNAS PARA SUPABASE AUTH
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- Agregar columnas necesarias una por una
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_usuario_auth UUID;
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

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(id_usuario_auth);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_ci ON usuarios(ci_usuario);

-- Agregar constraint único para id_usuario_auth (ignorar si ya existe)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_id_usuario_auth_unique UNIQUE (id_usuario_auth);
    EXCEPTION
        WHEN duplicate_table THEN
            -- Constraint ya existe, ignorar
        WHEN others THEN
            -- Otro error, ignorar por ahora
    END;
END $$;