-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA EVIDENCIAS
-- =====================================================

-- 1. CREAR BUCKETS DE STORAGE
-- =====================================================

-- Bucket para evidencias (privado por defecto)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidencias',
    'evidencias',
    false,
    104857600, -- 100MB en bytes
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Bucket para avatares de usuarios (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB en bytes
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
) ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE ACCESO PARA BUCKET EVIDENCIAS
-- =====================================================

-- Política para permitir subir archivos (INSERT)
CREATE POLICY "Usuarios autenticados pueden subir evidencias"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'evidencias' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN ('riesgos', 'auditorias', 'hallazgos', 'usuarios', 'temporal')
);

-- Política para ver archivos propios y públicos (SELECT)
CREATE POLICY "Usuarios pueden ver evidencias según permisos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'evidencias'
    AND auth.role() = 'authenticated'
    AND (
        -- El usuario subió el archivo
        owner = auth.uid()
        OR
        -- El archivo está marcado como público en la tabla evidencias
        EXISTS (
            SELECT 1 FROM evidencias e
            JOIN visibilidades_archivo va ON e.id_visibilidad_archivo = va.id_visibilidad_archivo
            WHERE e.nombre_archivo_almacenado = name
            AND (
                va.nombre_visibilidad_archivo ILIKE '%público%'
                OR va.nombre_visibilidad_archivo ILIKE '%publico%'
            )
        )
        OR
        -- El usuario tiene permisos específicos (por rol, departamento, etc.)
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.auth_user_id = auth.uid()
            AND r.nombre_rol IN ('Administrador', 'Auditor', 'Gerente')
        )
    )
);

-- Política para actualizar archivos propios (UPDATE)
CREATE POLICY "Usuarios pueden actualizar sus propias evidencias"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'evidencias'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

-- Política para eliminar archivos propios (DELETE)
CREATE POLICY "Usuarios pueden eliminar sus propias evidencias"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'evidencias'
    AND auth.role() = 'authenticated'
    AND (
        owner = auth.uid()
        OR
        -- Solo administradores pueden eliminar archivos de otros
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.auth_user_id = auth.uid()
            AND r.nombre_rol = 'Administrador'
        )
    )
);

-- 3. POLÍTICAS DE ACCESO PARA BUCKET AVATARS
-- =====================================================

-- Política para subir avatares
CREATE POLICY "Usuarios pueden subir sus avatares"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para ver avatares (público)
CREATE POLICY "Avatares son públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Política para actualizar avatares propios
CREATE POLICY "Usuarios pueden actualizar sus avatares"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para eliminar avatares propios
CREATE POLICY "Usuarios pueden eliminar sus avatares"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. FUNCIONES AUXILIARES PARA GESTIÓN DE ARCHIVOS
-- =====================================================

-- Función para limpiar archivos temporales antiguos
CREATE OR REPLACE FUNCTION limpiar_archivos_temporales()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Eliminar archivos temporales más antiguos de 7 días
    DELETE FROM storage.objects
    WHERE bucket_id = 'evidencias'
    AND (storage.foldername(name))[1] = 'temporal'
    AND created_at < NOW() - INTERVAL '7 days';
    
    -- También eliminar registros huérfanos de evidencias
    DELETE FROM evidencias
    WHERE fecha_subida_archivo < NOW() - INTERVAL '7 days'
    AND nombre_archivo_almacenado LIKE 'temporal/%'
    AND NOT EXISTS (
        SELECT 1 FROM storage.objects
        WHERE name = evidencias.nombre_archivo_almacenado
        AND bucket_id = 'evidencias'
    );
END;
$$;

-- Función para obtener estadísticas de uso de storage
CREATE OR REPLACE FUNCTION obtener_estadisticas_storage()
RETURNS TABLE (
    bucket_name text,
    total_archivos bigint,
    tamaño_total_mb numeric,
    tamaño_promedio_mb numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        so.bucket_id::text as bucket_name,
        COUNT(*)::bigint as total_archivos,
        ROUND((SUM(COALESCE((so.metadata->>'size')::bigint, 0)) / 1024.0 / 1024.0)::numeric, 2) as tamaño_total_mb,
        ROUND((AVG(COALESCE((so.metadata->>'size')::bigint, 0)) / 1024.0 / 1024.0)::numeric, 2) as tamaño_promedio_mb
    FROM storage.objects so
    WHERE so.bucket_id IN ('evidencias', 'avatars')
    GROUP BY so.bucket_id;
END;
$$;

-- 5. TRIGGERS PARA MANTENER CONSISTENCIA
-- =====================================================

-- Función para limpiar storage cuando se elimina una evidencia
CREATE OR REPLACE FUNCTION limpiar_archivo_storage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Eliminar archivo del storage cuando se elimina el registro de evidencia
    DELETE FROM storage.objects
    WHERE bucket_id = 'evidencias'
    AND name = OLD.nombre_archivo_almacenado;
    
    RETURN OLD;
END;
$$;

-- Crear trigger para limpiar archivos automáticamente
DROP TRIGGER IF EXISTS trigger_limpiar_archivo_storage ON evidencias;
CREATE TRIGGER trigger_limpiar_archivo_storage
    AFTER DELETE ON evidencias
    FOR EACH ROW
    EXECUTE FUNCTION limpiar_archivo_storage();

-- 6. DATOS INICIALES PARA TIPOS Y VISIBILIDADES
-- =====================================================

-- Insertar tipos de archivo por defecto
INSERT INTO tipos_archivo (nombre_tipo_archivo, descripcion_tipo_archivo, extensiones_permitidas) VALUES
('Documentos PDF', 'Archivos en formato PDF', 'pdf'),
('Documentos Word', 'Documentos de Microsoft Word', 'doc,docx'),
('Hojas de Cálculo', 'Archivos de Excel y similares', 'xls,xlsx,csv'),
('Presentaciones', 'Archivos de PowerPoint', 'ppt,pptx'),
('Imágenes', 'Archivos de imagen', 'jpg,jpeg,png,gif,bmp,webp'),
('Archivos de Texto', 'Documentos de texto plano', 'txt'),
('Archivos Comprimidos', 'Archivos ZIP, RAR, etc.', 'zip,rar,7z'),
('Evidencias Generales', 'Cualquier tipo de evidencia', 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,txt,zip')
ON CONFLICT (nombre_tipo_archivo) DO NOTHING;

-- Insertar visibilidades por defecto
INSERT INTO visibilidades_archivo (nombre_visibilidad_archivo, descripcion_visibilidad_archivo) VALUES
('Público', 'Visible para todos los usuarios del sistema'),
('Privado', 'Visible solo para el usuario que subió el archivo'),
('Confidencial', 'Visible solo para usuarios con permisos especiales'),
('Departamental', 'Visible para usuarios del mismo departamento'),
('Proyecto', 'Visible para miembros del proyecto asociado')
ON CONFLICT (nombre_visibilidad_archivo) DO NOTHING;

-- 7. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Buckets de almacenamiento para archivos del sistema';
COMMENT ON FUNCTION limpiar_archivos_temporales() IS 'Limpia archivos temporales antiguos automáticamente';
COMMENT ON FUNCTION obtener_estadisticas_storage() IS 'Obtiene estadísticas de uso del storage';
COMMENT ON FUNCTION limpiar_archivo_storage() IS 'Limpia archivos del storage cuando se elimina una evidencia';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Configuración de Supabase Storage completada exitosamente';
    RAISE NOTICE 'Buckets creados: evidencias (privado), avatars (público)';
    RAISE NOTICE 'Políticas de acceso configuradas';
    RAISE NOTICE 'Funciones auxiliares creadas';
    RAISE NOTICE 'Datos iniciales insertados';
END;
$$;