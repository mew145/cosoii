-- =============================================
-- DESHABILITAR RLS TEMPORALMENTE
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- EJECUTAR ESTO TEMPORALMENTE PARA PERMITIR CREACIÓN DE USUARIOS

-- Deshabilitar RLS en la tabla usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- NOTA: Después de crear los usuarios, vuelve a habilitar RLS con:
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;