-- =============================================
-- SCRIPT DE CONFIGURACIÓN PARA SUPABASE
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- =============================================

-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/[tu-project-id]/sql

-- =============================================
-- PASO 1: CREAR EXTENSIONES NECESARIAS
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PASO 2: EJECUTAR ESQUEMA PRINCIPAL
-- =============================================

-- Copiar y pegar todo el contenido del archivo schema.sql aquí
-- O ejecutar schema.sql por separado

-- =============================================
-- PASO 3: CONFIGURAR AUTENTICACIÓN OAUTH
-- =============================================

-- Configurar proveedores OAuth en Supabase Dashboard:
-- 1. Ir a Authentication > Providers
-- 2. Habilitar Google, LinkedIn, GitHub
-- 3. Configurar Client ID y Client Secret para cada proveedor

-- =============================================
-- PASO 4: CONFIGURAR ROW LEVEL SECURITY
-- =============================================

-- Políticas adicionales para Supabase Auth
CREATE POLICY "Usuarios autenticados pueden ver usuarios activos" ON usuarios
FOR SELECT USING (
  auth.role() = 'authenticated' 
  AND estado_usuario = 'activo'
);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
FOR UPDATE USING (
  auth.uid()::text = id_usuario::text
);

-- Política para riesgos - usuarios pueden ver riesgos según su rol
CREATE POLICY "Ver riesgos según rol" ON riesgos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario::text = auth.uid()::text
    AND (
      r.nombre_rol IN ('superadmin', 'admin') -- Acceso total
      OR u.id_usuario = riesgos.id_propietario_riesgo -- Propietario del riesgo
      OR u.id_usuario = riesgos.id_usuario_registro -- Quien registró el riesgo
      OR EXISTS ( -- Gerente del proyecto asociado
        SELECT 1 FROM proyectos p 
        WHERE p.id_proyecto = riesgos.id_proyecto 
        AND p.id_gerente_proyecto = u.id_usuario
      )
    )
  )
);

-- Política para activos ISO 27001
CREATE POLICY "Ver activos según responsabilidad" ON activos_informacion
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario::text = auth.uid()::text
    AND (
      r.nombre_rol IN ('superadmin', 'admin', 'oficial_seguridad')
      OR u.id_usuario = activos_informacion.id_propietario
      OR u.id_usuario = activos_informacion.id_custodio
    )
  )
);

-- =============================================
-- PASO 5: CREAR FUNCIONES AUXILIARES
-- =============================================

-- Función para obtener el usuario actual desde auth.users
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
DECLARE
  user_id INTEGER;
BEGIN
  SELECT id_usuario INTO user_id
  FROM usuarios
  WHERE correo_electronico = auth.email();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para calcular nivel de riesgo
CREATE OR REPLACE FUNCTION calcular_nivel_riesgo(probabilidad INTEGER, impacto INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN probabilidad * impacto;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular riesgo inherente ISO
CREATE OR REPLACE FUNCTION calcular_riesgo_inherente_iso(
  probabilidad INTEGER,
  impacto_c INTEGER,
  impacto_i INTEGER,
  impacto_a INTEGER
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  -- Fórmula: probabilidad * promedio de impactos CIA
  RETURN probabilidad * ((impacto_c + impacto_i + impacto_a) / 3.0);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PASO 6: TRIGGERS AUTOMÁTICOS
-- =============================================

-- Trigger para actualizar fecha de modificación en riesgos
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion_riesgo = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_riesgos
  BEFORE UPDATE ON riesgos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para calcular nivel de riesgo automáticamente
CREATE OR REPLACE FUNCTION calcular_nivel_riesgo_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nivel_riesgo_calculado = NEW.valor_probabilidad * NEW.valor_impacto;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_nivel_riesgo
  BEFORE INSERT OR UPDATE ON riesgos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_nivel_riesgo_trigger();

-- Trigger para calcular riesgo inherente ISO
CREATE OR REPLACE FUNCTION calcular_riesgo_iso_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.riesgo_inherente = NEW.probabilidad_iso * 
    ((NEW.impacto_confidencialidad + NEW.impacto_integridad + NEW.impacto_disponibilidad) / 3.0);
  
  -- Si no hay riesgo residual definido, usar el inherente
  IF NEW.riesgo_residual IS NULL THEN
    NEW.riesgo_residual = NEW.riesgo_inherente;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_riesgo_iso
  BEFORE INSERT OR UPDATE ON evaluaciones_riesgo_iso
  FOR EACH ROW
  EXECUTE FUNCTION calcular_riesgo_iso_trigger();

-- =============================================
-- PASO 7: DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Insertar algunos datos de prueba para desarrollo
-- NOTA: Comentar esta sección en producción

/*
-- Usuario de prueba para desarrollo
INSERT INTO usuarios (
  id_rol, id_departamento, nombres, apellido_paterno, apellido_materno, 
  ci, correo_electronico, estado_usuario, email_verificado
) VALUES (
  2, 3, 'Usuario', 'Prueba', 'Desarrollo',
  '1234567', 'test@deltaconsult.com', 'activo', true
);

-- Proyecto de prueba
INSERT INTO proyectos (
  id_cliente, nombre_proyecto, descripcion_proyecto,
  fecha_inicio_proyecto, estado_proyecto, id_gerente_proyecto
) VALUES (
  1, 'Proyecto Piloto COSO-ISO', 'Implementación piloto del sistema integrado',
  CURRENT_DATE, 'en_progreso', 1
);

-- Riesgo de prueba
INSERT INTO riesgos (
  id_proyecto, id_categoria_riesgo, id_tipo_riesgo, id_estado_riesgo,
  id_usuario_registro, id_propietario_riesgo, titulo_riesgo, descripcion_riesgo,
  valor_probabilidad, valor_impacto
) VALUES (
  1, 6, 1, 1, 1, 1,
  'Riesgo de Seguridad de la Información',
  'Posible brecha de seguridad en sistemas críticos',
  3, 4
);

-- Activo de información de prueba
INSERT INTO activos_informacion (
  nombre_activo, descripcion_activo, id_tipo_activo, id_clasificacion,
  id_propietario, valor_activo, ubicacion_activo
) VALUES (
  'Base de Datos Principal', 'Base de datos con información crítica del negocio',
  3, 3, 1, 5, 'Servidor Principal - Datacenter'
);
*/

-- =============================================
-- INSTRUCCIONES DE CONFIGURACIÓN
-- =============================================

/*
PASOS PARA COMPLETAR LA CONFIGURACIÓN:

1. EJECUTAR ESTE SCRIPT:
   - Copiar y pegar en SQL Editor de Supabase
   - Ejecutar sección por sección para verificar errores

2. CONFIGURAR OAUTH:
   - Dashboard > Authentication > Providers
   - Habilitar Google, LinkedIn, GitHub
   - Obtener Client ID/Secret de cada proveedor
   - Configurar redirect URLs

3. GENERAR TIPOS TYPESCRIPT:
   - Instalar Supabase CLI: npm install -g supabase
   - Ejecutar: supabase gen types typescript --project-id [tu-project-id] > lib/supabase/types.ts

4. CONFIGURAR VARIABLES DE ENTORNO:
   - Actualizar .env.local con las credenciales OAuth
   - Verificar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

5. CONFIGURAR STORAGE (OPCIONAL):
   - Dashboard > Storage
   - Crear buckets para evidencias y documentos
   - Configurar políticas de acceso

6. VERIFICAR CONFIGURACIÓN:
   - Probar autenticación con email/password
   - Probar autenticación OAuth
   - Verificar políticas RLS
   - Probar inserción de datos básicos
*/