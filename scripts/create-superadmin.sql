-- =============================================
-- SCRIPT SQL: Crear Usuario Superadmin
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- IMPORTANTE: Este script debe ejecutarse en Supabase SQL Editor
-- o usando psql con la conexión a tu base de datos

-- 1. Insertar usuario superadmin
INSERT INTO usuarios (
  nombres_usuario,
  apellidos_usuario,
  email_usuario,
  ci_usuario,
  telefono_usuario,
  departamento_usuario,
  rol_usuario,
  activo,
  fecha_registro,
  fecha_actualizacion
) VALUES (
  'Super',
  'Administrador',
  'superadmin@riesgos.com',
  '00000001',
  '70000000',
  'Administración',
  'administrador',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email_usuario) DO NOTHING;

-- 2. Obtener el ID del usuario creado (para usar en permisos)
-- Nota: Reemplaza 'USER_ID' con el ID real del usuario creado

-- 3. Asignar permisos completos de administrador
WITH superadmin_user AS (
  SELECT id_usuario FROM usuarios WHERE email_usuario = 'superadmin@riesgos.com'
),
admin_permissions AS (
  SELECT 
    u.id_usuario,
    modulo,
    accion,
    true as activo,
    NOW() as fecha_asignacion,
    u.id_usuario as asignado_por
  FROM superadmin_user u
  CROSS JOIN (
    VALUES 
    -- Usuarios
    ('usuarios', 'crear'),
    ('usuarios', 'leer'),
    ('usuarios', 'actualizar'),
    ('usuarios', 'eliminar'),
    
    -- Riesgos
    ('riesgos', 'crear'),
    ('riesgos', 'leer'),
    ('riesgos', 'actualizar'),
    ('riesgos', 'eliminar'),
    
    -- Activos
    ('activos', 'crear'),
    ('activos', 'leer'),
    ('activos', 'actualizar'),
    ('activos', 'eliminar'),
    
    -- Controles ISO
    ('controles_iso', 'crear'),
    ('controles_iso', 'leer'),
    ('controles_iso', 'actualizar'),
    ('controles_iso', 'eliminar'),
    
    -- Incidentes
    ('incidentes', 'crear'),
    ('incidentes', 'leer'),
    ('incidentes', 'actualizar'),
    ('incidentes', 'eliminar'),
    
    -- Proyectos
    ('proyectos', 'crear'),
    ('proyectos', 'leer'),
    ('proyectos', 'actualizar'),
    ('proyectos', 'eliminar'),
    
    -- Reportes
    ('reportes', 'crear'),
    ('reportes', 'leer'),
    ('reportes', 'actualizar'),
    ('reportes', 'eliminar'),
    
    -- Configuración
    ('configuracion', 'crear'),
    ('configuracion', 'leer'),
    ('configuracion', 'actualizar'),
    ('configuracion', 'eliminar'),
    
    -- Auditoría
    ('auditoria', 'crear'),
    ('auditoria', 'leer'),
    ('auditoria', 'actualizar'),
    ('auditoria', 'eliminar')
  ) AS perms(modulo, accion)
)
INSERT INTO permisos_usuario (
  id_usuario,
  modulo,
  accion,
  activo,
  fecha_asignacion,
  asignado_por
)
SELECT 
  id_usuario,
  modulo,
  accion,
  activo,
  fecha_asignacion,
  asignado_por
FROM admin_permissions
ON CONFLICT (id_usuario, modulo, accion) DO UPDATE SET
  activo = EXCLUDED.activo,
  fecha_asignacion = EXCLUDED.fecha_asignacion;

-- 4. Verificar que el usuario fue creado correctamente
SELECT 
  id_usuario,
  nombres_usuario,
  apellidos_usuario,
  email_usuario,
  ci_usuario,
  rol_usuario,
  activo,
  fecha_registro
FROM usuarios 
WHERE email_usuario = 'superadmin@riesgos.com';

-- 5. Verificar permisos asignados
SELECT 
  u.nombres_usuario,
  u.apellidos_usuario,
  p.modulo,
  p.accion,
  p.activo
FROM usuarios u
JOIN permisos_usuario p ON u.id_usuario = p.id_usuario
WHERE u.email_usuario = 'superadmin@riesgos.com'
ORDER BY p.modulo, p.accion;

-- =============================================
-- CREDENCIALES DEL SUPERADMIN CREADO:
-- =============================================
-- Email: superadmin@riesgos.com
-- Contraseña: (Debe configurarse en Supabase Auth)
-- Nombre: Super Administrador
-- CI: 00000001
-- Teléfono: 70000000
-- Departamento: Administración
-- Rol: administrador
-- =============================================