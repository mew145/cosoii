-- =============================================
-- MIGRACIÓN COMPLETA A SUPABASE
-- Sistema de Gestión de Riesgos COSO II + ISO 27001
-- DELTA CONSULT LTDA
-- =============================================

-- EJECUTAR EN SUPABASE SQL EDITOR
-- Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- =============================================
-- PASO 1: EXTENSIONES NECESARIAS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PASO 2: ESQUEMA PRINCIPAL - COSO II + ISO 27001
-- =============================================

-- MÓDULO 1: GOBERNANZA Y SEGURIDAD
CREATE TABLE departamentos (
    id_departamento SERIAL PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL,
    descripcion_departamento TEXT,
    id_jefe_departamento INTEGER,
    fecha_creacion_departamento TIMESTAMP DEFAULT NOW(),
    estado_departamento VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion_rol TEXT,
    nivel_acceso_rol INTEGER DEFAULT 1,
    fecha_creacion_rol TIMESTAMP DEFAULT NOW(),
    estado_rol VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER REFERENCES roles(id_rol),
    id_departamento INTEGER REFERENCES departamentos(id_departamento),
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(20) UNIQUE NOT NULL,
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    telefono_contacto VARCHAR(20),
    fecha_ingreso_empresa DATE,
    fecha_registro_sistema TIMESTAMP DEFAULT NOW(),
    ultimo_acceso TIMESTAMP,
    estado_usuario VARCHAR(20) DEFAULT 'activo',
    url_foto_perfil TEXT,
    -- Campos para OAuth
    provider_oauth VARCHAR(50),
    provider_id VARCHAR(255),
    email_verificado BOOLEAN DEFAULT FALSE
);

CREATE TABLE permisos_modulos (
    id_permiso SERIAL PRIMARY KEY,
    id_rol INTEGER REFERENCES roles(id_rol),
    nombre_modulo VARCHAR(50) NOT NULL,
    nombre_accion VARCHAR(50) NOT NULL,
    alcance_permiso VARCHAR(20) NOT NULL,
    fecha_asignacion_permiso TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sesiones_usuarios (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    token_sesion TEXT NOT NULL,
    fecha_inicio_sesion TIMESTAMP DEFAULT NOW(),
    fecha_expiracion_sesion TIMESTAMP NOT NULL,
    direccion_ip INET,
    tipo_dispositivo VARCHAR(100),
    estado_sesion VARCHAR(20) DEFAULT 'activa'
);

-- MÓDULO 2: PLANIFICACIÓN ESTRATÉGICA
CREATE TABLE categorias_objetivos (
    id_categoria_objetivo SERIAL PRIMARY KEY,
    nombre_categoria_objetivo VARCHAR(100) NOT NULL,
    descripcion_categoria_objetivo TEXT,
    color_categoria VARCHAR(7),
    icono_categoria VARCHAR(50)
);

CREATE TABLE objetivos_estrategicos (
    id_objetivo SERIAL PRIMARY KEY,
    id_categoria_objetivo INTEGER REFERENCES categorias_objetivos(id_categoria_objetivo),
    nombre_objetivo VARCHAR(200) NOT NULL,
    descripcion_objetivo TEXT,
    tipo_objetivo VARCHAR(50) NOT NULL,
    nivel_objetivo VARCHAR(50) NOT NULL,
    prioridad_objetivo VARCHAR(20) NOT NULL,
    fecha_inicio_objetivo DATE NOT NULL,
    fecha_meta_objetivo DATE NOT NULL,
    estado_objetivo VARCHAR(20) DEFAULT 'activo',
    id_responsable_objetivo INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE indicadores_desempeno (
    id_kpi SERIAL PRIMARY KEY,
    id_objetivo INTEGER REFERENCES objetivos_estrategicos(id_objetivo),
    nombre_indicador VARCHAR(200) NOT NULL,
    descripcion_indicador TEXT,
    formula_calculo_indicador TEXT,
    valor_meta_indicador DECIMAL(15,2),
    unidad_medida_indicador VARCHAR(50),
    frecuencia_medicion_indicador VARCHAR(50),
    id_responsable_kpi INTEGER REFERENCES usuarios(id_usuario)
);

-- MÓDULO 3: GESTIÓN DE PROYECTOS
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(200) NOT NULL,
    tipo_industria VARCHAR(100),
    tamaño_empresa VARCHAR(50),
    nombre_contacto_principal VARCHAR(100),
    apellido_contacto_principal VARCHAR(100),
    telefono_contacto VARCHAR(20),
    correo_contacto VARCHAR(255),
    direccion_empresa TEXT,
    estado_cliente VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE proyectos (
    id_proyecto SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    nombre_proyecto VARCHAR(200) NOT NULL,
    descripcion_proyecto TEXT,
    presupuesto_proyecto DECIMAL(15,2),
    fecha_inicio_proyecto DATE NOT NULL,
    fecha_fin_estimada_proyecto DATE,
    fecha_fin_real_proyecto DATE,
    estado_proyecto VARCHAR(30) DEFAULT 'planificado',
    prioridad_proyecto VARCHAR(20) DEFAULT 'media',
    porcentaje_avance_proyecto DECIMAL(5,2) DEFAULT 0,
    id_gerente_proyecto INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE roles_proyecto (
    id_rol_proyecto SERIAL PRIMARY KEY,
    nombre_rol_proyecto VARCHAR(100) NOT NULL,
    descripcion_rol_proyecto TEXT,
    nivel_autoridad_rol INTEGER DEFAULT 1
);

CREATE TABLE proyecto_equipo (
    id_asignacion SERIAL PRIMARY KEY,
    id_proyecto INTEGER REFERENCES proyectos(id_proyecto),
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    id_rol_proyecto INTEGER REFERENCES roles_proyecto(id_rol_proyecto),
    fecha_inicio_asignacion DATE NOT NULL,
    fecha_fin_asignacion DATE,
    porcentaje_dedicacion DECIMAL(5,2) DEFAULT 100,
    estado_asignacion VARCHAR(20) DEFAULT 'activa'
);

-- MÓDULO 4: IDENTIFICACIÓN DE RIESGOS
CREATE TABLE categorias_riesgo (
    id_categoria_riesgo SERIAL PRIMARY KEY,
    nombre_categoria_riesgo VARCHAR(100) NOT NULL,
    descripcion_categoria_riesgo TEXT,
    color_hex_categoria VARCHAR(7),
    icono_categoria VARCHAR(50),
    nivel_categoria VARCHAR(50) DEFAULT 'corporativo'
);

CREATE TABLE tipos_riesgo (
    id_tipo_riesgo SERIAL PRIMARY KEY,
    nombre_tipo_riesgo VARCHAR(100) NOT NULL,
    descripcion_tipo_riesgo TEXT
);

CREATE TABLE velocidades_impacto (
    id_velocidad_impacto SERIAL PRIMARY KEY,
    nombre_velocidad_impacto VARCHAR(50) NOT NULL,
    descripcion_velocidad_impacto TEXT,
    rango_tiempo_impacto VARCHAR(50)
);

CREATE TABLE estados_riesgo (
    id_estado_riesgo SERIAL PRIMARY KEY,
    nombre_estado_riesgo VARCHAR(50) NOT NULL,
    descripcion_estado_riesgo TEXT,
    es_estado_final BOOLEAN DEFAULT FALSE
);

CREATE TABLE riesgos (
    id_riesgo SERIAL PRIMARY KEY,
    id_proyecto INTEGER REFERENCES proyectos(id_proyecto),
    id_categoria_riesgo INTEGER REFERENCES categorias_riesgo(id_categoria_riesgo),
    id_tipo_riesgo INTEGER REFERENCES tipos_riesgo(id_tipo_riesgo),
    id_velocidad_impacto INTEGER REFERENCES velocidades_impacto(id_velocidad_impacto),
    id_estado_riesgo INTEGER REFERENCES estados_riesgo(id_estado_riesgo),
    id_usuario_registro INTEGER REFERENCES usuarios(id_usuario),
    id_propietario_riesgo INTEGER REFERENCES usuarios(id_usuario),
    titulo_riesgo VARCHAR(300) NOT NULL,
    descripcion_riesgo TEXT NOT NULL,
    causa_raiz_riesgo TEXT,
    consecuencia_riesgo TEXT,
    valor_probabilidad INTEGER CHECK (valor_probabilidad BETWEEN 1 AND 5),
    valor_impacto INTEGER CHECK (valor_impacto BETWEEN 1 AND 5),
    nivel_riesgo_calculado INTEGER,
    fecha_registro_riesgo TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion_riesgo TIMESTAMP DEFAULT NOW()
);

CREATE TABLE riesgos_objetivos (
    id_riesgo_objetivo SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    id_objetivo INTEGER REFERENCES objetivos_estrategicos(id_objetivo),
    nivel_afectacion VARCHAR(20) NOT NULL,
    tipo_impacto VARCHAR(20) NOT NULL,
    comentarios_afectacion TEXT
);

-- MÓDULO 5: EVALUACIÓN Y CONTROLES
CREATE TABLE tipos_control (
    id_tipo_control SERIAL PRIMARY KEY,
    nombre_tipo_control VARCHAR(100) NOT NULL,
    descripcion_tipo_control TEXT
);

CREATE TABLE frecuencias_control (
    id_frecuencia_control SERIAL PRIMARY KEY,
    nombre_frecuencia_control VARCHAR(50) NOT NULL,
    descripcion_frecuencia_control TEXT
);

CREATE TABLE efectividades_control (
    id_efectividad_control SERIAL PRIMARY KEY,
    nombre_efectividad_control VARCHAR(50) NOT NULL,
    descripcion_efectividad_control TEXT,
    valor_efectividad INTEGER
);

CREATE TABLE controles_internos (
    id_control SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    id_tipo_control INTEGER REFERENCES tipos_control(id_tipo_control),
    id_frecuencia_control INTEGER REFERENCES frecuencias_control(id_frecuencia_control),
    id_responsable_control INTEGER REFERENCES usuarios(id_usuario),
    nombre_control VARCHAR(200) NOT NULL,
    descripcion_control TEXT,
    costo_implementacion_control DECIMAL(15,2),
    fecha_creacion_control TIMESTAMP DEFAULT NOW(),
    fecha_ultima_evaluacion_control TIMESTAMP,
    estado_control VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE evaluacion_controles (
    id_evaluacion SERIAL PRIMARY KEY,
    id_control INTEGER REFERENCES controles_internos(id_control),
    id_evaluador INTEGER REFERENCES usuarios(id_usuario),
    id_efectividad_control INTEGER REFERENCES efectividades_control(id_efectividad_control),
    fecha_evaluacion_control TIMESTAMP DEFAULT NOW(),
    hallazgos_evaluacion TEXT,
    recomendaciones_evaluacion TEXT,
    estado_evaluacion VARCHAR(20) DEFAULT 'pendiente'
);

CREATE TABLE indicadores_riesgo (
    id_kri SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    nombre_indicador_riesgo VARCHAR(200) NOT NULL,
    descripcion_indicador_riesgo TEXT,
    formula_calculo_kri TEXT,
    valor_actual_kri DECIMAL(15,2),
    valor_umbral_kri DECIMAL(15,2),
    unidad_medida_kri VARCHAR(50),
    frecuencia_medicion_kri VARCHAR(50),
    direccion_indicador VARCHAR(20),
    estado_alerta_kri VARCHAR(20) DEFAULT 'normal'
);

-- MÓDULO 6: MITIGACIÓN Y TRATAMIENTO
CREATE TABLE tipos_respuesta_riesgo (
    id_tipo_respuesta SERIAL PRIMARY KEY,
    nombre_tipo_respuesta VARCHAR(100) NOT NULL,
    descripcion_tipo_respuesta TEXT
);

CREATE TABLE estados_plan_mitigacion (
    id_estado_plan SERIAL PRIMARY KEY,
    nombre_estado_plan VARCHAR(50) NOT NULL,
    descripcion_estado_plan TEXT
);

CREATE TABLE planes_mitigacion (
    id_plan SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    id_tipo_respuesta INTEGER REFERENCES tipos_respuesta_riesgo(id_tipo_respuesta),
    id_estado_plan INTEGER REFERENCES estados_plan_mitigacion(id_estado_plan),
    nombre_plan_mitigacion VARCHAR(200) NOT NULL,
    descripcion_plan_mitigacion TEXT,
    presupuesto_asignado_plan DECIMAL(15,2),
    fecha_inicio_plan DATE NOT NULL,
    fecha_fin_plan DATE NOT NULL,
    porcentaje_completado_plan DECIMAL(5,2) DEFAULT 0
);

CREATE TABLE prioridades_actividad (
    id_prioridad_actividad SERIAL PRIMARY KEY,
    nombre_prioridad_actividad VARCHAR(50) NOT NULL,
    descripcion_prioridad_actividad TEXT,
    nivel_prioridad INTEGER
);

CREATE TABLE estados_actividad (
    id_estado_actividad SERIAL PRIMARY KEY,
    nombre_estado_actividad VARCHAR(50) NOT NULL,
    descripcion_estado_actividad TEXT
);

CREATE TABLE actividades_mitigacion (
    id_actividad SERIAL PRIMARY KEY,
    id_plan INTEGER REFERENCES planes_mitigacion(id_plan),
    id_responsable_actividad INTEGER REFERENCES usuarios(id_usuario),
    id_prioridad_actividad INTEGER REFERENCES prioridades_actividad(id_prioridad_actividad),
    id_estado_actividad INTEGER REFERENCES estados_actividad(id_estado_actividad),
    descripcion_actividad TEXT NOT NULL,
    fecha_inicio_actividad DATE NOT NULL,
    fecha_fin_actividad DATE NOT NULL,
    dependencias_actividad TEXT
);

-- MÓDULO 7: AUDITORÍA Y CUMPLIMIENTO
CREATE TABLE tipos_auditoria (
    id_tipo_auditoria SERIAL PRIMARY KEY,
    nombre_tipo_auditoria VARCHAR(100) NOT NULL,
    descripcion_tipo_auditoria TEXT
);

CREATE TABLE estados_auditoria (
    id_estado_auditoria SERIAL PRIMARY KEY,
    nombre_estado_auditoria VARCHAR(50) NOT NULL,
    descripcion_estado_auditoria TEXT
);

CREATE TABLE auditorias (
    id_auditoria SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    id_auditor INTEGER REFERENCES usuarios(id_usuario),
    id_tipo_auditoria INTEGER REFERENCES tipos_auditoria(id_tipo_auditoria),
    id_estado_auditoria INTEGER REFERENCES estados_auditoria(id_estado_auditoria),
    alcance_auditoria TEXT,
    fecha_inicio_auditoria DATE NOT NULL,
    fecha_fin_auditoria DATE,
    observaciones_auditoria TEXT
);

CREATE TABLE tipos_hallazgo (
    id_tipo_hallazgo SERIAL PRIMARY KEY,
    nombre_tipo_hallazgo VARCHAR(100) NOT NULL,
    descripcion_tipo_hallazgo TEXT
);

CREATE TABLE severidades_hallazgo (
    id_severidad_hallazgo SERIAL PRIMARY KEY,
    nombre_severidad_hallazgo VARCHAR(50) NOT NULL,
    descripcion_severidad_hallazgo TEXT,
    nivel_severidad INTEGER
);

CREATE TABLE estados_hallazgo (
    id_estado_hallazgo SERIAL PRIMARY KEY,
    nombre_estado_hallazgo VARCHAR(50) NOT NULL,
    descripcion_estado_hallazgo TEXT
);

CREATE TABLE hallazgos_auditoria (
    id_hallazgo SERIAL PRIMARY KEY,
    id_auditoria INTEGER REFERENCES auditorias(id_auditoria),
    id_tipo_hallazgo INTEGER REFERENCES tipos_hallazgo(id_tipo_hallazgo),
    id_severidad_hallazgo INTEGER REFERENCES severidades_hallazgo(id_severidad_hallazgo),
    id_estado_hallazgo INTEGER REFERENCES estados_hallazgo(id_estado_hallazgo),
    id_responsable_hallazgo INTEGER REFERENCES usuarios(id_usuario),
    descripcion_hallazgo TEXT NOT NULL,
    accion_correctiva_hallazgo TEXT,
    fecha_limite_hallazgo DATE
);

-- MÓDULO 8: EVIDENCIAS Y DOCUMENTACIÓN
CREATE TABLE tipos_archivo (
    id_tipo_archivo SERIAL PRIMARY KEY,
    nombre_tipo_archivo VARCHAR(50) NOT NULL,
    descripcion_tipo_archivo TEXT,
    extensiones_permitidas VARCHAR(100)
);

CREATE TABLE visibilidades_archivo (
    id_visibilidad_archivo SERIAL PRIMARY KEY,
    nombre_visibilidad_archivo VARCHAR(50) NOT NULL,
    descripcion_visibilidad_archivo TEXT
);

CREATE TABLE evidencias (
    id_evidencia SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    id_auditoria INTEGER REFERENCES auditorias(id_auditoria),
    id_hallazgo INTEGER REFERENCES hallazgos_auditoria(id_hallazgo),
    id_tipo_archivo INTEGER REFERENCES tipos_archivo(id_tipo_archivo),
    id_visibilidad_archivo INTEGER REFERENCES visibilidades_archivo(id_visibilidad_archivo),
    id_usuario_subio INTEGER REFERENCES usuarios(id_usuario),
    nombre_archivo_original VARCHAR(255) NOT NULL,
    nombre_archivo_almacenado VARCHAR(255) NOT NULL,
    url_almacenamiento_archivo TEXT NOT NULL,
    tamaño_bytes_archivo BIGINT,
    fecha_subida_archivo TIMESTAMP DEFAULT NOW(),
    descripcion_evidencia TEXT
);

-- MÓDULO 9: MONITOREO Y REPORTES
CREATE TABLE bitacora (
    id_bitacora SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    modulo_afectado VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    accion_realizada VARCHAR(50) NOT NULL,
    descripcion_cambio_bitacora TEXT,
    valores_anteriores_bitacora JSONB,
    valores_nuevos_bitacora JSONB,
    fecha_accion_bitacora TIMESTAMP DEFAULT NOW(),
    direccion_ip_bitacora INET
);

-- MÓDULO 10: ISO 27001 - GESTIÓN DE SEGURIDAD DE LA INFORMACIÓN
CREATE TABLE tipos_activo_informacion (
    id_tipo_activo SERIAL PRIMARY KEY,
    nombre_tipo_activo VARCHAR(50) NOT NULL,
    descripcion_tipo_activo TEXT,
    icono_tipo_activo VARCHAR(50)
);

CREATE TABLE clasificaciones_seguridad (
    id_clasificacion SERIAL PRIMARY KEY,
    nombre_clasificacion VARCHAR(50) NOT NULL,
    descripcion_clasificacion TEXT,
    nivel_clasificacion INTEGER,
    color_clasificacion VARCHAR(7)
);

CREATE TABLE activos_informacion (
    id_activo SERIAL PRIMARY KEY,
    nombre_activo VARCHAR(200) NOT NULL,
    descripcion_activo TEXT,
    id_tipo_activo INTEGER REFERENCES tipos_activo_informacion(id_tipo_activo),
    id_clasificacion INTEGER REFERENCES clasificaciones_seguridad(id_clasificacion),
    id_propietario INTEGER REFERENCES usuarios(id_usuario),
    id_custodio INTEGER REFERENCES usuarios(id_usuario),
    ubicacion_activo VARCHAR(255),
    valor_activo INTEGER CHECK (valor_activo BETWEEN 1 AND 5),
    estado_activo VARCHAR(20) DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    version_activo VARCHAR(50),
    proveedor_activo VARCHAR(200),
    fecha_adquisicion DATE,
    costo_activo DECIMAL(15,2)
);

CREATE TABLE dominios_iso27001 (
    id_dominio SERIAL PRIMARY KEY,
    codigo_dominio VARCHAR(10) NOT NULL,
    nombre_dominio VARCHAR(200) NOT NULL,
    descripcion_dominio TEXT,
    orden_dominio INTEGER
);

CREATE TABLE controles_iso27001 (
    id_control_iso SERIAL PRIMARY KEY,
    id_dominio INTEGER REFERENCES dominios_iso27001(id_dominio),
    codigo_control VARCHAR(20) NOT NULL,
    nombre_control VARCHAR(300) NOT NULL,
    descripcion_control TEXT,
    objetivo_control TEXT,
    tipo_control VARCHAR(20) NOT NULL,
    categoria_control VARCHAR(20) NOT NULL,
    estado_implementacion VARCHAR(30) DEFAULT 'no_implementado',
    nivel_madurez INTEGER DEFAULT 0 CHECK (nivel_madurez BETWEEN 0 AND 5),
    id_responsable INTEGER REFERENCES usuarios(id_usuario),
    fecha_implementacion DATE,
    fecha_revision DATE,
    costo_implementacion DECIMAL(15,2),
    evidencias_control TEXT[],
    observaciones_control TEXT
);

CREATE TABLE amenazas_seguridad (
    id_amenaza SERIAL PRIMARY KEY,
    nombre_amenaza VARCHAR(200) NOT NULL,
    descripcion_amenaza TEXT,
    tipo_amenaza VARCHAR(50),
    origen_amenaza VARCHAR(50),
    nivel_amenaza INTEGER CHECK (nivel_amenaza BETWEEN 1 AND 5)
);

CREATE TABLE vulnerabilidades_seguridad (
    id_vulnerabilidad SERIAL PRIMARY KEY,
    nombre_vulnerabilidad VARCHAR(200) NOT NULL,
    descripcion_vulnerabilidad TEXT,
    tipo_vulnerabilidad VARCHAR(50),
    nivel_vulnerabilidad INTEGER CHECK (nivel_vulnerabilidad BETWEEN 1 AND 5),
    facilidad_explotacion INTEGER CHECK (facilidad_explotacion BETWEEN 1 AND 5)
);

CREATE TABLE evaluaciones_riesgo_iso (
    id_evaluacion_iso SERIAL PRIMARY KEY,
    id_activo INTEGER REFERENCES activos_informacion(id_activo),
    id_amenaza INTEGER REFERENCES amenazas_seguridad(id_amenaza),
    id_vulnerabilidad INTEGER REFERENCES vulnerabilidades_seguridad(id_vulnerabilidad),
    probabilidad_iso INTEGER CHECK (probabilidad_iso BETWEEN 1 AND 5),
    impacto_confidencialidad INTEGER CHECK (impacto_confidencialidad BETWEEN 1 AND 5),
    impacto_integridad INTEGER CHECK (impacto_integridad BETWEEN 1 AND 5),
    impacto_disponibilidad INTEGER CHECK (impacto_disponibilidad BETWEEN 1 AND 5),
    riesgo_inherente DECIMAL(5,2),
    riesgo_residual DECIMAL(5,2),
    nivel_riesgo_aceptable BOOLEAN DEFAULT FALSE,
    tratamiento_riesgo VARCHAR(20) NOT NULL,
    justificacion_tratamiento TEXT,
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    id_evaluador INTEGER REFERENCES usuarios(id_usuario),
    fecha_proxima_revision DATE,
    estado_evaluacion VARCHAR(20) DEFAULT 'vigente'
);

CREATE TABLE controles_aplicables_evaluacion (
    id_control_aplicable SERIAL PRIMARY KEY,
    id_evaluacion_iso INTEGER REFERENCES evaluaciones_riesgo_iso(id_evaluacion_iso),
    id_control_iso INTEGER REFERENCES controles_iso27001(id_control_iso),
    efectividad_control INTEGER CHECK (efectividad_control BETWEEN 1 AND 5),
    fecha_aplicacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tipos_incidente_seguridad (
    id_tipo_incidente SERIAL PRIMARY KEY,
    nombre_tipo_incidente VARCHAR(100) NOT NULL,
    descripcion_tipo_incidente TEXT,
    severidad_base INTEGER CHECK (severidad_base BETWEEN 1 AND 5)
);

CREATE TABLE incidentes_seguridad (
    id_incidente SERIAL PRIMARY KEY,
    titulo_incidente VARCHAR(300) NOT NULL,
    descripcion_incidente TEXT NOT NULL,
    id_tipo_incidente INTEGER REFERENCES tipos_incidente_seguridad(id_tipo_incidente),
    severidad_incidente VARCHAR(20) NOT NULL,
    estado_incidente VARCHAR(30) DEFAULT 'reportado',
    fecha_deteccion TIMESTAMP NOT NULL,
    fecha_reporte TIMESTAMP DEFAULT NOW(),
    id_reportado_por INTEGER REFERENCES usuarios(id_usuario),
    id_asignado_a INTEGER REFERENCES usuarios(id_usuario),
    impacto_negocio TEXT,
    acciones_inmediatas TEXT,
    causa_raiz TEXT,
    lecciones_aprendidas TEXT,
    fecha_resolucion TIMESTAMP,
    tiempo_resolucion_horas INTEGER,
    costo_incidente DECIMAL(15,2)
);

CREATE TABLE activos_afectados_incidente (
    id_activo_afectado SERIAL PRIMARY KEY,
    id_incidente INTEGER REFERENCES incidentes_seguridad(id_incidente),
    id_activo INTEGER REFERENCES activos_informacion(id_activo),
    nivel_afectacion VARCHAR(20),
    descripcion_afectacion TEXT
);

CREATE TABLE mapeo_coso_iso (
    id_mapeo SERIAL PRIMARY KEY,
    id_riesgo INTEGER REFERENCES riesgos(id_riesgo),
    id_evaluacion_iso INTEGER REFERENCES evaluaciones_riesgo_iso(id_evaluacion_iso),
    id_control_interno INTEGER REFERENCES controles_internos(id_control),
    id_control_iso INTEGER REFERENCES controles_iso27001(id_control_iso),
    tipo_relacion VARCHAR(50),
    descripcion_relacion TEXT,
    fecha_mapeo TIMESTAMP DEFAULT NOW(),
    id_usuario_mapeo INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE metricas_seguridad (
    id_metrica SERIAL PRIMARY KEY,
    nombre_metrica VARCHAR(200) NOT NULL,
    descripcion_metrica TEXT,
    tipo_metrica VARCHAR(50),
    formula_calculo TEXT,
    valor_actual DECIMAL(15,2),
    valor_objetivo DECIMAL(15,2),
    unidad_medida VARCHAR(50),
    frecuencia_medicion VARCHAR(50),
    fecha_ultima_medicion TIMESTAMP,
    id_responsable INTEGER REFERENCES usuarios(id_usuario),
    estado_metrica VARCHAR(20) DEFAULT 'activa'
);

-- =============================================
-- PASO 3: DATOS INICIALES
-- =============================================

-- Insertar roles base
INSERT INTO roles (id_rol, nombre_rol, descripcion_rol, nivel_acceso_rol) VALUES
(1, 'superadmin', 'Acceso total al sistema', 10),
(2, 'admin', 'Administrador de la empresa', 8),
(3, 'gerente', 'Gestión de riesgos de proyectos', 6),
(4, 'auditor_interno', 'Auditoría y cumplimiento', 7),
(5, 'oficial_seguridad', 'Oficial de Seguridad de la Información ISO 27001', 7),
(6, 'analista_riesgos', 'Analista de riesgos COSO e ISO 27001', 5);

-- Insertar departamentos base
INSERT INTO departamentos (id_departamento, nombre_departamento, descripcion_departamento) VALUES
(1, 'Dirección General', 'Dirección y gestión estratégica de la empresa'),
(2, 'TI y Sistemas', 'Tecnologías de la información y desarrollo de sistemas'),
(3, 'Gestión de Riesgos', 'Identificación y control de riesgos empresariales'),
(4, 'Auditoría Interna', 'Auditoría y cumplimiento normativo'),
(5, 'Seguridad de la Información', 'Gestión de seguridad de la información ISO 27001');

-- Insertar usuario superadmin inicial
INSERT INTO usuarios (id_rol, id_departamento, nombres, apellido_paterno, apellido_materno, ci, correo_electronico, password_hash, estado_usuario) VALUES 
(1, 2, 'Admin', 'Sistema', 'Principal', '0000000', 'admin@deltaconsult.com', 'password_temp', 'activo');

-- Insertar estados de riesgo
INSERT INTO estados_riesgo (id_estado_riesgo, nombre_estado_riesgo, descripcion_estado_riesgo, es_estado_final) VALUES
(1, 'identificado', 'Riesgo identificado pero no evaluado', false),
(2, 'evaluado', 'Riesgo evaluado y priorizado', false),
(3, 'mitigado', 'Riesgo con plan de mitigación activo', false),
(4, 'monitoreado', 'Riesgo en monitoreo continuo', false),
(5, 'cerrado', 'Riesgo cerrado o resuelto', true),
(6, 'materializado', 'Riesgo que se ha materializado', true);

-- Insertar categorías de riesgo
INSERT INTO categorias_riesgo (id_categoria_riesgo, nombre_categoria_riesgo, descripcion_categoria_riesgo) VALUES
(1, 'Estratégico', 'Riesgos relacionados con la estrategia y objetivos de la empresa'),
(2, 'Operativo', 'Riesgos en procesos operativos y de producción'),
(3, 'Financiero', 'Riesgos financieros y contables'),
(4, 'Cumplimiento', 'Riesgos de cumplimiento legal y regulatorio'),
(5, 'Reputacional', 'Riesgos que afectan la imagen y reputación'),
(6, 'Tecnológico', 'Riesgos relacionados con tecnología y sistemas'),
(7, 'Seguridad de la Información', 'Riesgos de seguridad de la información ISO 27001');

-- Insertar tipos de respuesta
INSERT INTO tipos_respuesta_riesgo (id_tipo_respuesta, nombre_tipo_respuesta, descripcion_tipo_respuesta) VALUES
(1, 'Evitar', 'Eliminar la causa del riesgo'),
(2, 'Reducir', 'Implementar controles para reducir probabilidad o impacto'),
(3, 'Transferir', 'Transferir el riesgo a terceros (ej: seguros)'),
(4, 'Aceptar', 'Aceptar el riesgo sin acciones específicas');

-- Insertar tipos de activos de información
INSERT INTO tipos_activo_informacion (id_tipo_activo, nombre_tipo_activo, descripcion_tipo_activo) VALUES
(1, 'Hardware', 'Equipos físicos de computación y comunicaciones'),
(2, 'Software', 'Aplicaciones, sistemas operativos y herramientas'),
(3, 'Datos', 'Información digital y bases de datos'),
(4, 'Servicios', 'Servicios de TI y comunicaciones'),
(5, 'Personas', 'Personal y recursos humanos'),
(6, 'Instalaciones', 'Infraestructura física y ubicaciones'),
(7, 'Documentos', 'Documentación física y digital');

-- Insertar clasificaciones de seguridad
INSERT INTO clasificaciones_seguridad (id_clasificacion, nombre_clasificacion, descripcion_clasificacion, nivel_clasificacion, color_clasificacion) VALUES
(1, 'Público', 'Información que puede ser divulgada públicamente', 1, '#28a745'),
(2, 'Interno', 'Información para uso interno de la organización', 2, '#ffc107'),
(3, 'Confidencial', 'Información sensible con acceso restringido', 3, '#fd7e14'),
(4, 'Restringido', 'Información altamente sensible con acceso muy limitado', 4, '#dc3545');

-- Insertar dominios ISO 27001:2022
INSERT INTO dominios_iso27001 (id_dominio, codigo_dominio, nombre_dominio, descripcion_dominio, orden_dominio) VALUES
(1, 'A.5', 'Políticas de seguridad de la información', 'Políticas de seguridad de la información', 1),
(2, 'A.6', 'Organización de la seguridad de la información', 'Organización de la seguridad de la información', 2),
(3, 'A.7', 'Seguridad de los recursos humanos', 'Seguridad de los recursos humanos', 3),
(4, 'A.8', 'Gestión de activos', 'Gestión de activos', 4),
(5, 'A.9', 'Control de acceso', 'Control de acceso', 5),
(6, 'A.10', 'Criptografía', 'Criptografía', 6),
(7, 'A.11', 'Seguridad física y del entorno', 'Seguridad física y del entorno', 7),
(8, 'A.12', 'Seguridad de las operaciones', 'Seguridad de las operaciones', 8),
(9, 'A.13', 'Seguridad de las comunicaciones', 'Seguridad de las comunicaciones', 9),
(10, 'A.14', 'Adquisición, desarrollo y mantenimiento de sistemas', 'Adquisición, desarrollo y mantenimiento de sistemas', 10),
(11, 'A.15', 'Relaciones con los proveedores', 'Relaciones con los proveedores', 11),
(12, 'A.16', 'Gestión de incidentes de seguridad de la información', 'Gestión de incidentes de seguridad de la información', 12),
(13, 'A.17', 'Aspectos de seguridad de la información de la gestión de la continuidad del negocio', 'Aspectos de seguridad de la información de la gestión de la continuidad del negocio', 13),
(14, 'A.18', 'Cumplimiento', 'Cumplimiento', 14);

-- Insertar algunos controles ISO 27001 principales
INSERT INTO controles_iso27001 (id_control_iso, id_dominio, codigo_control, nombre_control, descripcion_control, tipo_control, categoria_control) VALUES
(1, 1, 'A.5.1', 'Políticas para la seguridad de la información', 'Se debe definir un conjunto de políticas para la seguridad de la información', 'preventivo', 'administrativo'),
(2, 2, 'A.6.1', 'Organización interna', 'Se deben definir y asignar todas las responsabilidades de la seguridad de la información', 'preventivo', 'administrativo'),
(3, 3, 'A.7.1', 'Antes del empleo', 'Las verificaciones de los antecedentes se deben llevar a cabo para todos los candidatos a un empleo', 'preventivo', 'administrativo'),
(4, 4, 'A.8.1', 'Responsabilidad por los activos', 'Los activos asociados con información e instalaciones de procesamiento de información se deben identificar', 'preventivo', 'administrativo'),
(5, 5, 'A.9.1', 'Requisitos del negocio para el control de acceso', 'Se debe establecer, documentar y revisar una política de control de acceso', 'preventivo', 'tecnico');

-- Insertar tipos de incidentes de seguridad
INSERT INTO tipos_incidente_seguridad (id_tipo_incidente, nombre_tipo_incidente, descripcion_tipo_incidente, severidad_base) VALUES
(1, 'Acceso no autorizado', 'Acceso no autorizado a sistemas o información', 3),
(2, 'Malware', 'Infección por software malicioso', 4),
(3, 'Phishing', 'Intento de obtener información confidencial mediante engaño', 3),
(4, 'Pérdida de datos', 'Pérdida o filtración de información confidencial', 5),
(5, 'Denegación de servicio', 'Interrupción de servicios de TI', 4),
(6, 'Robo físico', 'Robo de equipos o documentos', 3),
(7, 'Error humano', 'Incidente causado por error del usuario', 2),
(8, 'Falla de sistema', 'Falla técnica de sistemas o infraestructura', 3);

-- =============================================
-- PASO 4: ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para usuarios
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX idx_usuarios_departamento ON usuarios(id_departamento);
CREATE INDEX idx_usuarios_email ON usuarios(correo_electronico);
CREATE INDEX idx_usuarios_ci ON usuarios(ci);
CREATE INDEX idx_usuarios_provider ON usuarios(provider_oauth);

-- Índices para riesgos
CREATE INDEX idx_riesgos_proyecto ON riesgos(id_proyecto);
CREATE INDEX idx_riesgos_estado ON riesgos(id_estado_riesgo);
CREATE INDEX idx_riesgos_categoria ON riesgos(id_categoria_riesgo);
CREATE INDEX idx_riesgos_usuario_registro ON riesgos(id_usuario_registro);

-- Índices para ISO 27001
CREATE INDEX idx_activos_tipo ON activos_informacion(id_tipo_activo);
CREATE INDEX idx_activos_clasificacion ON activos_informacion(id_clasificacion);
CREATE INDEX idx_activos_propietario ON activos_informacion(id_propietario);
CREATE INDEX idx_controles_iso_dominio ON controles_iso27001(id_dominio);
CREATE INDEX idx_controles_iso_responsable ON controles_iso27001(id_responsable);
CREATE INDEX idx_evaluaciones_iso_activo ON evaluaciones_riesgo_iso(id_activo);
CREATE INDEX idx_incidentes_tipo ON incidentes_seguridad(id_tipo_incidente);

-- =============================================
-- PASO 5: FUNCIONES Y TRIGGERS
-- =============================================

-- Función para calcular nivel de riesgo automáticamente
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

-- Función para calcular riesgo inherente ISO
CREATE OR REPLACE FUNCTION calcular_riesgo_iso_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.riesgo_inherente = NEW.probabilidad_iso * 
    ((NEW.impacto_confidencialidad + NEW.impacto_integridad + NEW.impacto_disponibilidad) / 3.0);
  
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
-- PASO 6: ROW LEVEL SECURITY
-- =============================================

-- Habilitar RLS en tablas principales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE riesgos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos_informacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles_iso27001 ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_riesgo_iso ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidentes_seguridad ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar según necesidades)
CREATE POLICY "Usuarios autenticados pueden ver usuarios activos" ON usuarios
FOR SELECT USING (
  auth.role() = 'authenticated' 
  AND estado_usuario = 'activo'
);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
FOR UPDATE USING (
  auth.uid()::text = id_usuario::text
);

-- =============================================
-- PASO 7: VISTAS PARA DASHBOARDS
-- =============================================

-- Vista: Dashboard ISO 27001
CREATE VIEW vista_dashboard_iso27001 AS
SELECT 
    (SELECT COUNT(*) FROM activos_informacion WHERE estado_activo = 'activo') as total_activos,
    (SELECT COUNT(*) FROM activos_informacion WHERE valor_activo >= 4 AND estado_activo = 'activo') as activos_criticos,
    (SELECT COUNT(*) FROM controles_iso27001 WHERE estado_implementacion = 'implementado') as controles_implementados,
    (SELECT COUNT(*) FROM controles_iso27001) as total_controles,
    (SELECT ROUND(AVG(nivel_madurez), 2) FROM controles_iso27001 WHERE estado_implementacion = 'implementado') as madurez_promedio,
    (SELECT COUNT(*) FROM incidentes_seguridad WHERE estado_incidente NOT IN ('resuelto', 'cerrado')) as incidentes_abiertos;

-- Vista: Resumen de riesgos por categoría
CREATE VIEW vista_riesgos_categoria AS
SELECT 
    cr.nombre_categoria_riesgo,
    COUNT(r.id_riesgo) as total_riesgos,
    AVG(r.nivel_riesgo_calculado) as promedio_nivel_riesgo,
    COUNT(CASE WHEN r.nivel_riesgo_calculado >= 15 THEN 1 END) as riesgos_altos,
    COUNT(CASE WHEN r.nivel_riesgo_calculado BETWEEN 8 AND 14 THEN 1 END) as riesgos_medios,
    COUNT(CASE WHEN r.nivel_riesgo_calculado <= 7 THEN 1 END) as riesgos_bajos
FROM categorias_riesgo cr
LEFT JOIN riesgos r ON cr.id_categoria_riesgo = r.id_categoria_riesgo
GROUP BY cr.id_categoria_riesgo, cr.nombre_categoria_riesgo;

-- =============================================
-- INSTRUCCIONES FINALES
-- =============================================

/*
PASOS SIGUIENTES:

1. EJECUTAR ESTE SCRIPT COMPLETO EN SUPABASE SQL EDITOR

2. CONFIGURAR OAUTH EN SUPABASE DASHBOARD:
   - Authentication > Providers
   - Habilitar Google, LinkedIn, GitHub
   - Configurar Client ID/Secret

3. GENERAR TIPOS TYPESCRIPT:
   - Instalar CLI: npm install -g supabase
   - Generar tipos: supabase gen types typescript --project-id [PROJECT_ID] > lib/supabase/types.ts

4. CONFIGURAR VARIABLES DE ENTORNO:
   - Agregar credenciales OAuth a .env.local

5. VERIFICAR FUNCIONAMIENTO:
   - Probar autenticación
   - Verificar políticas RLS
   - Probar inserción de datos

¡El esquema está listo para COSO II + ISO 27001 integrado!
*/