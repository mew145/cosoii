-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE riesgos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos_informacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles_iso27001 ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidentes_seguridad ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA USUARIOS
-- =============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT USING (auth.uid() = id_usuario_auth);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE USING (auth.uid() = id_usuario_auth);

-- Solo administradores pueden crear usuarios
CREATE POLICY "usuarios_insert_admin" ON usuarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario = 'administrador'
        )
    );

-- Solo administradores pueden ver todos los usuarios
CREATE POLICY "usuarios_select_admin" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario = 'administrador'
        )
    );

-- =============================================
-- POLÍTICAS PARA RIESGOS
-- =============================================

-- Los usuarios pueden ver riesgos de sus proyectos asignados
CREATE POLICY "riesgos_select_assigned" ON riesgos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM proyectos p
            JOIN usuarios u ON u.id_usuario = p.id_gerente_proyecto
            WHERE p.id_proyecto = riesgos.id_proyecto
            AND u.id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior')
        )
    );

-- Los usuarios pueden crear riesgos en proyectos donde son gerentes
CREATE POLICY "riesgos_insert_manager" ON riesgos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM proyectos p
            JOIN usuarios u ON u.id_usuario = p.id_gerente_proyecto
            WHERE p.id_proyecto = riesgos.id_proyecto
            AND u.id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior')
        )
    );

-- Los usuarios pueden actualizar riesgos donde son propietarios o gerentes del proyecto
CREATE POLICY "riesgos_update_owner" ON riesgos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario = riesgos.id_propietario_riesgo
            AND id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM proyectos p
            JOIN usuarios u ON u.id_usuario = p.id_gerente_proyecto
            WHERE p.id_proyecto = riesgos.id_proyecto
            AND u.id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior')
        )
    );

-- =============================================
-- POLÍTICAS PARA PROYECTOS
-- =============================================

-- Los usuarios pueden ver proyectos donde son gerentes o están asignados
CREATE POLICY "proyectos_select_assigned" ON proyectos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario = proyectos.id_gerente_proyecto
            AND id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior')
        )
    );

-- Solo administradores y auditores senior pueden crear proyectos
CREATE POLICY "proyectos_insert_admin" ON proyectos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior')
        )
    );

-- Los gerentes pueden actualizar sus proyectos
CREATE POLICY "proyectos_update_manager" ON proyectos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario = proyectos.id_gerente_proyecto
            AND id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior')
        )
    );

-- =============================================
-- POLÍTICAS PARA ACTIVOS DE INFORMACIÓN (ISO 27001)
-- =============================================

-- Los usuarios pueden ver activos donde son propietarios o custodios
CREATE POLICY "activos_select_owner" ON activos_informacion
    FOR SELECT USING (
        propietario_activo IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        custodio_activo IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior', 'oficial_seguridad')
        )
    );

-- Solo oficiales de seguridad y administradores pueden crear activos
CREATE POLICY "activos_insert_security" ON activos_informacion
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'oficial_seguridad')
        )
    );

-- Los propietarios y custodios pueden actualizar sus activos
CREATE POLICY "activos_update_owner" ON activos_informacion
    FOR UPDATE USING (
        propietario_activo IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        custodio_activo IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'oficial_seguridad')
        )
    );

-- =============================================
-- POLÍTICAS PARA CONTROLES ISO 27001
-- =============================================

-- Los usuarios pueden ver controles según su rol
CREATE POLICY "controles_select_role" ON controles_iso27001
    FOR SELECT USING (
        responsable_control IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'auditor_senior', 'oficial_seguridad')
        )
    );

-- Solo oficiales de seguridad y administradores pueden crear controles
CREATE POLICY "controles_insert_security" ON controles_iso27001
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'oficial_seguridad')
        )
    );

-- Los responsables pueden actualizar sus controles
CREATE POLICY "controles_update_responsible" ON controles_iso27001
    FOR UPDATE USING (
        responsable_control IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'oficial_seguridad')
        )
    );

-- =============================================
-- POLÍTICAS PARA INCIDENTES DE SEGURIDAD
-- =============================================

-- Los usuarios pueden ver incidentes que reportaron o están asignados
CREATE POLICY "incidentes_select_involved" ON incidentes_seguridad
    FOR SELECT USING (
        reportado_por IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        asignado_a IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'oficial_seguridad')
        )
    );

-- Todos los usuarios autenticados pueden reportar incidentes
CREATE POLICY "incidentes_insert_all" ON incidentes_seguridad
    FOR INSERT WITH CHECK (
        reportado_por IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
    );

-- Solo oficiales de seguridad pueden actualizar incidentes
CREATE POLICY "incidentes_update_security" ON incidentes_seguridad
    FOR UPDATE USING (
        asignado_a IN (
            SELECT id_usuario FROM usuarios WHERE id_usuario_auth = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario IN ('administrador', 'oficial_seguridad')
        )
    );

-- =============================================
-- POLÍTICAS PARA AUDITORÍA
-- =============================================

-- Solo administradores pueden ver logs de auditoría
CREATE POLICY "auditoria_select_admin" ON auditoria_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id_usuario_auth = auth.uid() 
            AND rol_usuario = 'administrador'
        )
    );

-- Los logs se insertan automáticamente por triggers
CREATE POLICY "auditoria_insert_system" ON auditoria_logs
    FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNCIONES AUXILIARES PARA PERMISOS
-- =============================================

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION auth.has_role(required_role text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id_usuario_auth = auth.uid() 
        AND rol_usuario = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario tiene acceso a un módulo
CREATE OR REPLACE FUNCTION auth.has_module_access(module_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios u
        JOIN permisos_usuario pu ON u.id_usuario = pu.id_usuario
        JOIN permisos p ON pu.id_permiso = p.id_permiso
        WHERE u.id_usuario_auth = auth.uid() 
        AND p.modulo_permiso = module_name
        AND pu.activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede realizar una acción específica
CREATE OR REPLACE FUNCTION auth.can_perform_action(module_name text, action_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios u
        JOIN permisos_usuario pu ON u.id_usuario = pu.id_usuario
        JOIN permisos p ON pu.id_permiso = p.id_permiso
        WHERE u.id_usuario_auth = auth.uid() 
        AND p.modulo_permiso = module_name
        AND p.accion_permiso = action_name
        AND pu.activo = true
    ) OR auth.has_role('administrador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;