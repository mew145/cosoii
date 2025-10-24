-- =====================================================
-- CONFIGURACIÓN DE TABLAS PARA SISTEMA DE NOTIFICACIONES
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =====================================================

-- 1. CREAR TIPOS ENUM PARA NOTIFICACIONES
-- =====================================================

-- Tipos de notificación
CREATE TYPE tipo_notificacion AS ENUM (
    'VENCIMIENTO_ACTIVIDAD',
    'RIESGO_CRITICO',
    'HALLAZGO_PENDIENTE',
    'PROYECTO_EXCEDE_TIEMPO',
    'NUEVA_EVIDENCIA',
    'AUDITORIA_PROGRAMADA',
    'INCIDENTE_SEGURIDAD',
    'CONTROL_VENCIDO'
);

-- Estados de notificación
CREATE TYPE estado_notificacion AS ENUM (
    'PENDIENTE',
    'ENVIADA',
    'LEIDA',
    'ERROR'
);

-- Canales de notificación
CREATE TYPE canal_notificacion AS ENUM (
    'EMAIL',
    'SISTEMA',
    'SMS'
);

-- Prioridades de notificación
CREATE TYPE prioridad_notificacion AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);

-- 2. CREAR TABLA DE NOTIFICACIONES
-- =====================================================

CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    tipo_notificacion tipo_notificacion NOT NULL,
    titulo_notificacion VARCHAR(255) NOT NULL,
    mensaje_notificacion TEXT NOT NULL,
    
    -- Usuarios
    id_usuario_destino INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_usuario_origen INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    
    -- Estado y canal
    estado_notificacion estado_notificacion NOT NULL DEFAULT 'PENDIENTE',
    canal_notificacion canal_notificacion NOT NULL,
    prioridad_notificacion prioridad_notificacion NOT NULL,
    
    -- Fechas
    fecha_creacion_notificacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_envio_notificacion TIMESTAMPTZ,
    fecha_leida_notificacion TIMESTAMPTZ,
    fecha_vencimiento_notificacion TIMESTAMPTZ,
    
    -- Referencias a entidades relacionadas (opcionales)
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo) ON DELETE CASCADE,
    id_proyecto INTEGER REFERENCES proyectos(id_proyecto) ON DELETE CASCADE,
    id_auditoria INTEGER REFERENCES auditorias(id_auditoria) ON DELETE CASCADE,
    id_hallazgo INTEGER REFERENCES hallazgos_auditoria(id_hallazgo) ON DELETE CASCADE,
    id_actividad INTEGER REFERENCES actividades_mitigacion(id_actividad) ON DELETE CASCADE,
    id_incidente INTEGER REFERENCES incidentes_seguridad(id_incidente) ON DELETE CASCADE,
    id_control INTEGER REFERENCES controles_internos(id_control) ON DELETE CASCADE,
    
    -- Metadatos adicionales
    metadatos_notificacion JSONB,
    
    -- Control de envío
    intentos_envio INTEGER NOT NULL DEFAULT 0,
    ultimo_error_notificacion TEXT,
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREAR TABLA DE PREFERENCIAS DE NOTIFICACIÓN
-- =====================================================

CREATE TABLE preferencias_notificacion (
    id_preferencia_notificacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    tipo_notificacion tipo_notificacion NOT NULL,
    canal_notificacion canal_notificacion NOT NULL,
    
    -- Configuración de la preferencia
    activa_preferencia BOOLEAN NOT NULL DEFAULT TRUE,
    frecuencia_minutos INTEGER, -- Para notificaciones recurrentes
    hora_inicio TIME, -- Horario de inicio (formato HH:MM)
    hora_fin TIME, -- Horario de fin (formato HH:MM)
    dias_semana INTEGER[], -- Array de días (0=Domingo, 1=Lunes, etc.)
    prioridad_minima prioridad_notificacion, -- Prioridad mínima para enviar
    
    -- Auditoría
    fecha_creacion_preferencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion_preferencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint para evitar duplicados
    UNIQUE(id_usuario, tipo_notificacion, canal_notificacion)
);

-- 4. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario_destino ON notificaciones(id_usuario_destino);
CREATE INDEX idx_notificaciones_estado ON notificaciones(estado_notificacion);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo_notificacion);
CREATE INDEX idx_notificaciones_prioridad ON notificaciones(prioridad_notificacion);
CREATE INDEX idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion_notificacion);
CREATE INDEX idx_notificaciones_fecha_vencimiento ON notificaciones(fecha_vencimiento_notificacion);
CREATE INDEX idx_notificaciones_pendientes ON notificaciones(estado_notificacion, intentos_envio) WHERE estado_notificacion = 'PENDIENTE';
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(id_usuario_destino, estado_notificacion) WHERE estado_notificacion IN ('PENDIENTE', 'ENVIADA');

-- Índices para entidades relacionadas
CREATE INDEX idx_notificaciones_riesgo ON notificaciones(id_riesgo) WHERE id_riesgo IS NOT NULL;
CREATE INDEX idx_notificaciones_proyecto ON notificaciones(id_proyecto) WHERE id_proyecto IS NOT NULL;
CREATE INDEX idx_notificaciones_auditoria ON notificaciones(id_auditoria) WHERE id_auditoria IS NOT NULL;
CREATE INDEX idx_notificaciones_hallazgo ON notificaciones(id_hallazgo) WHERE id_hallazgo IS NOT NULL;
CREATE INDEX idx_notificaciones_actividad ON notificaciones(id_actividad) WHERE id_actividad IS NOT NULL;
CREATE INDEX idx_notificaciones_incidente ON notificaciones(id_incidente) WHERE id_incidente IS NOT NULL;
CREATE INDEX idx_notificaciones_control ON notificaciones(id_control) WHERE id_control IS NOT NULL;

-- Índices para preferencias
CREATE INDEX idx_preferencias_usuario ON preferencias_notificacion(id_usuario);
CREATE INDEX idx_preferencias_tipo ON preferencias_notificacion(tipo_notificacion);
CREATE INDEX idx_preferencias_canal ON preferencias_notificacion(canal_notificacion);
CREATE INDEX idx_preferencias_activas ON preferencias_notificacion(id_usuario, activa_preferencia) WHERE activa_preferencia = TRUE;

-- 5. CREAR TRIGGERS PARA AUDITORÍA
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para notificaciones
CREATE TRIGGER update_notificaciones_updated_at 
    BEFORE UPDATE ON notificaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para preferencias
CREATE TRIGGER update_preferencias_updated_at 
    BEFORE UPDATE ON preferencias_notificacion 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. CREAR FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener contador de notificaciones no leídas
CREATE OR REPLACE FUNCTION obtener_contador_no_leidas(usuario_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contador INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO contador
    FROM notificaciones
    WHERE id_usuario_destino = usuario_id
    AND estado_notificacion IN ('PENDIENTE', 'ENVIADA');
    
    RETURN COALESCE(contador, 0);
END;
$$;

-- Función para marcar todas las notificaciones como leídas
CREATE OR REPLACE FUNCTION marcar_todas_como_leidas(usuario_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    actualizadas INTEGER;
BEGIN
    UPDATE notificaciones
    SET estado_notificacion = 'LEIDA',
        fecha_leida_notificacion = NOW()
    WHERE id_usuario_destino = usuario_id
    AND estado_notificacion IN ('PENDIENTE', 'ENVIADA');
    
    GET DIAGNOSTICS actualizadas = ROW_COUNT;
    RETURN actualizadas;
END;
$$;

-- Función para limpiar notificaciones antiguas
CREATE OR REPLACE FUNCTION limpiar_notificaciones_antiguas(dias_antiguedad INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    eliminadas INTEGER;
BEGIN
    DELETE FROM notificaciones
    WHERE estado_notificacion = 'LEIDA'
    AND fecha_creacion_notificacion < NOW() - INTERVAL '1 day' * dias_antiguedad;
    
    GET DIAGNOSTICS eliminadas = ROW_COUNT;
    RETURN eliminadas;
END;
$$;

-- Función para obtener estadísticas de notificaciones
CREATE OR REPLACE FUNCTION obtener_estadisticas_notificaciones(usuario_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    tipo tipo_notificacion,
    total BIGINT,
    pendientes BIGINT,
    enviadas BIGINT,
    leidas BIGINT,
    con_error BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.tipo_notificacion,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE n.estado_notificacion = 'PENDIENTE') as pendientes,
        COUNT(*) FILTER (WHERE n.estado_notificacion = 'ENVIADA') as enviadas,
        COUNT(*) FILTER (WHERE n.estado_notificacion = 'LEIDA') as leidas,
        COUNT(*) FILTER (WHERE n.estado_notificacion = 'ERROR') as con_error
    FROM notificaciones n
    WHERE (usuario_id IS NULL OR n.id_usuario_destino = usuario_id)
    GROUP BY n.tipo_notificacion
    ORDER BY n.tipo_notificacion;
END;
$$;

-- 7. CREAR POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferencias_notificacion ENABLE ROW LEVEL SECURITY;

-- Políticas para notificaciones
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
ON notificaciones
FOR SELECT
USING (
    id_usuario_destino IN (
        SELECT id_usuario FROM usuarios WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Los usuarios pueden crear notificaciones"
ON notificaciones
FOR INSERT
WITH CHECK (
    id_usuario_origen IN (
        SELECT id_usuario FROM usuarios WHERE auth_user_id = auth.uid()
    )
    OR
    -- Permitir creación por sistema (sin usuario origen)
    id_usuario_origen IS NULL
);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones recibidas"
ON notificaciones
FOR UPDATE
USING (
    id_usuario_destino IN (
        SELECT id_usuario FROM usuarios WHERE auth_user_id = auth.uid()
    )
);

-- Políticas para preferencias
CREATE POLICY "Los usuarios pueden gestionar sus preferencias"
ON preferencias_notificacion
FOR ALL
USING (
    id_usuario IN (
        SELECT id_usuario FROM usuarios WHERE auth_user_id = auth.uid()
    )
);

-- 8. INSERTAR DATOS INICIALES
-- =====================================================

-- Insertar preferencias por defecto para usuarios existentes
-- (Esto se ejecutará mediante la aplicación cuando sea necesario)

-- 9. CREAR VISTAS ÚTILES
-- =====================================================

-- Vista de notificaciones con información de usuario
CREATE VIEW vista_notificaciones_completa AS
SELECT 
    n.*,
    u_destino.nombres || ' ' || u_destino.apellidos as nombre_usuario_destino,
    u_destino.email as email_usuario_destino,
    u_origen.nombres || ' ' || u_origen.apellidos as nombre_usuario_origen,
    CASE 
        WHEN n.fecha_vencimiento_notificacion IS NOT NULL 
        AND n.fecha_vencimiento_notificacion < NOW() 
        THEN TRUE 
        ELSE FALSE 
    END as es_vencida
FROM notificaciones n
LEFT JOIN usuarios u_destino ON n.id_usuario_destino = u_destino.id_usuario
LEFT JOIN usuarios u_origen ON n.id_usuario_origen = u_origen.id_usuario;

-- Vista de resumen de notificaciones por usuario
CREATE VIEW vista_resumen_notificaciones AS
SELECT 
    u.id_usuario,
    u.nombres || ' ' || u.apellidos as nombre_usuario,
    COUNT(*) as total_notificaciones,
    COUNT(*) FILTER (WHERE n.estado_notificacion IN ('PENDIENTE', 'ENVIADA')) as no_leidas,
    COUNT(*) FILTER (WHERE n.estado_notificacion = 'LEIDA') as leidas,
    COUNT(*) FILTER (WHERE n.estado_notificacion = 'ERROR') as con_error,
    COUNT(*) FILTER (WHERE n.prioridad_notificacion = 'CRITICA') as criticas,
    MAX(n.fecha_creacion_notificacion) as ultima_notificacion
FROM usuarios u
LEFT JOIN notificaciones n ON u.id_usuario = n.id_usuario_destino
GROUP BY u.id_usuario, u.nombres, u.apellidos;

-- 10. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE notificaciones IS 'Tabla principal para almacenar todas las notificaciones del sistema';
COMMENT ON TABLE preferencias_notificacion IS 'Configuración de preferencias de notificación por usuario';

COMMENT ON COLUMN notificaciones.tipo_notificacion IS 'Tipo de notificación según el evento que la genera';
COMMENT ON COLUMN notificaciones.estado_notificacion IS 'Estado actual de la notificación en el proceso de envío';
COMMENT ON COLUMN notificaciones.canal_notificacion IS 'Canal por el cual se debe enviar la notificación';
COMMENT ON COLUMN notificaciones.prioridad_notificacion IS 'Prioridad de la notificación para determinar urgencia';
COMMENT ON COLUMN notificaciones.metadatos_notificacion IS 'Información adicional en formato JSON para contexto';
COMMENT ON COLUMN notificaciones.intentos_envio IS 'Número de intentos de envío realizados';

COMMENT ON COLUMN preferencias_notificacion.frecuencia_minutos IS 'Frecuencia en minutos para notificaciones recurrentes';
COMMENT ON COLUMN preferencias_notificacion.hora_inicio IS 'Hora de inicio del horario de notificaciones';
COMMENT ON COLUMN preferencias_notificacion.hora_fin IS 'Hora de fin del horario de notificaciones';
COMMENT ON COLUMN preferencias_notificacion.dias_semana IS 'Array de días de la semana (0=Domingo, 1=Lunes, etc.)';

COMMENT ON FUNCTION obtener_contador_no_leidas(INTEGER) IS 'Obtiene el número de notificaciones no leídas para un usuario';
COMMENT ON FUNCTION marcar_todas_como_leidas(INTEGER) IS 'Marca todas las notificaciones de un usuario como leídas';
COMMENT ON FUNCTION limpiar_notificaciones_antiguas(INTEGER) IS 'Elimina notificaciones leídas más antiguas que X días';
COMMENT ON FUNCTION obtener_estadisticas_notificaciones(INTEGER) IS 'Obtiene estadísticas de notificaciones por tipo';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Configuración del sistema de notificaciones completada exitosamente';
    RAISE NOTICE 'Tablas creadas: notificaciones, preferencias_notificacion';
    RAISE NOTICE 'Tipos enum creados: tipo_notificacion, estado_notificacion, canal_notificacion, prioridad_notificacion';
    RAISE NOTICE 'Índices, triggers, funciones y políticas RLS configurados';
    RAISE NOTICE 'Vistas auxiliares creadas: vista_notificaciones_completa, vista_resumen_notificaciones';
END;
$$;