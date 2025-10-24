-- =============================================
-- HACER COLUMNAS OPCIONALES
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- Hacer que las columnas NOT NULL sean opcionales
ALTER TABLE usuarios ALTER COLUMN nombres DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN apellido_paterno DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN ci DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN correo_electronico DROP NOT NULL;

-- Verificar cambios
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('nombres', 'apellido_paterno', 'ci', 'correo_electronico');