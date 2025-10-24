-- =============================================
-- PERMISOS PREDETERMINADOS DEL SISTEMA
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- Insertar permisos del módulo de usuarios
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Usuarios', 'Permite ver la lista de usuarios del sistema', 'usuarios', 'ver', true),
('Crear Usuarios', 'Permite crear nuevos usuarios en el sistema', 'usuarios', 'crear', true),
('Editar Usuarios', 'Permite modificar información de usuarios existentes', 'usuarios', 'editar', true),
('Eliminar Usuarios', 'Permite eliminar usuarios del sistema', 'usuarios', 'eliminar', true),
('Gestionar Permisos', 'Permite asignar y revocar permisos de usuarios', 'usuarios', 'permisos', true);

-- Insertar permisos del módulo de riesgos COSO
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Riesgos', 'Permite ver riesgos registrados en el sistema', 'riesgos', 'ver', true),
('Crear Riesgos', 'Permite registrar nuevos riesgos', 'riesgos', 'crear', true),
('Editar Riesgos', 'Permite modificar riesgos existentes', 'riesgos', 'editar', true),
('Eliminar Riesgos', 'Permite eliminar riesgos del sistema', 'riesgos', 'eliminar', true),
('Evaluar Riesgos', 'Permite realizar evaluaciones de riesgos', 'riesgos', 'evaluar', true),
('Aprobar Evaluaciones', 'Permite aprobar evaluaciones de riesgos', 'riesgos', 'aprobar', true);

-- Insertar permisos del módulo de proyectos
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Proyectos', 'Permite ver proyectos del sistema', 'proyectos', 'ver', true),
('Crear Proyectos', 'Permite crear nuevos proyectos', 'proyectos', 'crear', true),
('Editar Proyectos', 'Permite modificar proyectos existentes', 'proyectos', 'editar', true),
('Eliminar Proyectos', 'Permite eliminar proyectos', 'proyectos', 'eliminar', true),
('Asignar Equipos', 'Permite asignar usuarios a proyectos', 'proyectos', 'asignar', true);

-- Insertar permisos del módulo de activos ISO 27001
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Activos', 'Permite ver activos de información', 'activos', 'ver', true),
('Crear Activos', 'Permite registrar nuevos activos de información', 'activos', 'crear', true),
('Editar Activos', 'Permite modificar activos existentes', 'activos', 'editar', true),
('Eliminar Activos', 'Permite eliminar activos del inventario', 'activos', 'eliminar', true),
('Clasificar Activos', 'Permite cambiar la clasificación de seguridad de activos', 'activos', 'clasificar', true),
('Valorar Activos', 'Permite asignar valor de negocio a activos', 'activos', 'valorar', true);

-- Insertar permisos del módulo de controles ISO 27001
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Controles', 'Permite ver controles de seguridad', 'controles', 'ver', true),
('Crear Controles', 'Permite crear nuevos controles de seguridad', 'controles', 'crear', true),
('Editar Controles', 'Permite modificar controles existentes', 'controles', 'editar', true),
('Eliminar Controles', 'Permite eliminar controles', 'controles', 'eliminar', true),
('Implementar Controles', 'Permite marcar controles como implementados', 'controles', 'implementar', true),
('Evaluar Controles', 'Permite evaluar la efectividad de controles', 'controles', 'evaluar', true);

-- Insertar permisos del módulo de incidentes de seguridad
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Incidentes', 'Permite ver incidentes de seguridad', 'incidentes', 'ver', true),
('Crear Incidentes', 'Permite reportar nuevos incidentes de seguridad', 'incidentes', 'crear', true),
('Editar Incidentes', 'Permite modificar incidentes existentes', 'incidentes', 'editar', true),
('Eliminar Incidentes', 'Permite eliminar incidentes', 'incidentes', 'eliminar', true),
('Investigar Incidentes', 'Permite realizar investigaciones de incidentes', 'incidentes', 'investigar', true),
('Cerrar Incidentes', 'Permite cerrar incidentes resueltos', 'incidentes', 'cerrar', true);

-- Insertar permisos del módulo de auditoría
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Auditorías', 'Permite ver auditorías programadas y realizadas', 'auditoria', 'ver', true),
('Crear Auditorías', 'Permite programar nuevas auditorías', 'auditoria', 'crear', true),
('Editar Auditorías', 'Permite modificar auditorías existentes', 'auditoria', 'editar', true),
('Eliminar Auditorías', 'Permite eliminar auditorías', 'auditoria', 'eliminar', true),
('Aprobar Auditorías', 'Permite aprobar planes de auditoría', 'auditoria', 'aprobar', true),
('Ejecutar Auditorías', 'Permite realizar auditorías', 'auditoria', 'ejecutar', true);

-- Insertar permisos del módulo de reportes
INSERT INTO permisos (nombre_permiso, descripcion_permiso, modulo_permiso, accion_permiso, activo) VALUES
('Ver Reportes', 'Permite ver reportes del sistema', 'reportes', 'ver', true),
('Exportar Reportes', 'Permite exportar reportes en diferentes formatos', 'reportes', 'exportar', true),
('Reportes Ejecutivos', 'Permite acceder a reportes ejecutivos', 'reportes', 'ejecutivo', true),
('Crear Reportes', 'Permite crear reportes personalizados', 'reportes', 'crear', true);

-- =============================================
-- FUNCIÓN PARA ASIGNAR PERMISOS POR ROL
-- =============================================

CREATE OR REPLACE FUNCTION assign_default_permissions_by_role(user_id INTEGER, user_role TEXT, assigned_by INTEGER)
RETURNS void AS $$
DECLARE
    permission_record RECORD;
BEGIN
    -- Eliminar permisos existentes del usuario
    UPDATE permisos_usuario SET activo = false WHERE id_usuario = user_id;
    
    -- Asignar permisos según el rol
    CASE user_role
        WHEN 'administrador' THEN
            -- Administradores tienen todos los permisos
            FOR permission_record IN 
                SELECT id_permiso FROM permisos WHERE activo = true
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        WHEN 'auditor_senior' THEN
            -- Auditores senior: usuarios, riesgos, proyectos, auditoría, reportes
            FOR permission_record IN 
                SELECT id_permiso FROM permisos 
                WHERE activo = true 
                AND modulo_permiso IN ('usuarios', 'riesgos', 'proyectos', 'auditoria', 'reportes')
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        WHEN 'auditor_junior' THEN
            -- Auditores junior: riesgos, proyectos, auditoría (sin eliminar ni aprobar)
            FOR permission_record IN 
                SELECT id_permiso FROM permisos 
                WHERE activo = true 
                AND modulo_permiso IN ('riesgos', 'proyectos', 'auditoria')
                AND accion_permiso NOT IN ('eliminar', 'aprobar')
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        WHEN 'gerente_proyecto' THEN
            -- Gerentes de proyecto: riesgos, proyectos (sin eliminar)
            FOR permission_record IN 
                SELECT id_permiso FROM permisos 
                WHERE activo = true 
                AND modulo_permiso IN ('riesgos', 'proyectos')
                AND accion_permiso != 'eliminar'
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        WHEN 'oficial_seguridad' THEN
            -- Oficiales de seguridad: activos, controles, incidentes, reportes
            FOR permission_record IN 
                SELECT id_permiso FROM permisos 
                WHERE activo = true 
                AND modulo_permiso IN ('activos', 'controles', 'incidentes', 'reportes')
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        WHEN 'analista_riesgos' THEN
            -- Analistas de riesgos: riesgos, reportes (sin eliminar ni aprobar)
            FOR permission_record IN 
                SELECT id_permiso FROM permisos 
                WHERE activo = true 
                AND modulo_permiso IN ('riesgos', 'reportes')
                AND accion_permiso NOT IN ('eliminar', 'aprobar')
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        WHEN 'consultor' THEN
            -- Consultores: riesgos, proyectos, reportes (ver, crear, editar)
            FOR permission_record IN 
                SELECT id_permiso FROM permisos 
                WHERE activo = true 
                AND modulo_permiso IN ('riesgos', 'proyectos', 'reportes')
                AND accion_permiso IN ('ver', 'crear', 'editar')
            LOOP
                INSERT INTO permisos_usuario (id_usuario, id_permiso, activo, fecha_asignacion, asignado_por)
                VALUES (user_id, permission_record.id_permiso, true, NOW(), assigned_by)
                ON CONFLICT (id_usuario, id_permiso) 
                DO UPDATE SET activo = true, fecha_asignacion = NOW(), asignado_por = assigned_by;
            END LOOP;
            
        ELSE
            -- Rol no reconocido, no asignar permisos
            RAISE NOTICE 'Rol no reconocido: %', user_role;
    END CASE;
    
    RAISE NOTICE 'Permisos asignados correctamente para usuario % con rol %', user_id, user_role;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER PARA ASIGNAR PERMISOS AUTOMÁTICAMENTE
-- =============================================

CREATE OR REPLACE FUNCTION auto_assign_permissions()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo asignar permisos en INSERT o cuando cambia el rol
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.rol_usuario != NEW.rol_usuario) THEN
        -- Asignar permisos predeterminados (asignado por el sistema = usuario ID 1)
        PERFORM assign_default_permissions_by_role(NEW.id_usuario, NEW.rol_usuario, 1);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para asignación automática de permisos
DROP TRIGGER IF EXISTS trigger_auto_assign_permissions ON usuarios;
CREATE TRIGGER trigger_auto_assign_permissions
    AFTER INSERT OR UPDATE OF rol_usuario ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_permissions();

-- =============================================
-- DATOS INICIALES PARA TESTING
-- =============================================

-- Crear usuario administrador inicial si no existe
INSERT INTO usuarios (
    id_usuario_auth,
    nombres_usuario,
    apellidos_usuario,
    email_usuario,
    rol_usuario,
    activo,
    fecha_registro
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- UUID temporal para admin
    'Administrador',
    'Sistema',
    'admin@deltacons.com',
    'administrador',
    true,
    NOW()
) ON CONFLICT (email_usuario) DO NOTHING;

-- Asignar permisos al administrador inicial
DO $$
DECLARE
    admin_user_id INTEGER;
BEGIN
    SELECT id_usuario INTO admin_user_id 
    FROM usuarios 
    WHERE email_usuario = 'admin@deltacons.com';
    
    IF admin_user_id IS NOT NULL THEN
        PERFORM assign_default_permissions_by_role(admin_user_id, 'administrador', admin_user_id);
    END IF;
END $$;