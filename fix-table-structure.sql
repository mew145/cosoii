-- =============================================
-- CORREGIR ESTRUCTURA DE TABLA USUARIOS
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Opción 1: Hacer columnas opcionales (RECOMENDADO)
ALTER TABLE usuarios ALTER COLUMN nombres DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN apellido_paterno DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN apellido_materno DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN ci DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN correo_electronico DROP NOT NULL;

-- Opción 2: Agregar valores por defecto
ALTER TABLE usuarios ALTER COLUMN nombres SET DEFAULT 'Usuario';
ALTER TABLE usuarios ALTER COLUMN apellido_paterno SET DEFAULT 'OAuth';
ALTER TABLE usuarios ALTER COLUMN correo_electronico SET DEFAULT 'temp@temp.com';

-- Verificar que los cambios se aplicaron
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('nombres', 'apellido_paterno', 'ci', 'correo_electronico')
ORDER BY ordinal_position;