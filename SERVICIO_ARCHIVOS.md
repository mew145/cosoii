# Servicio de Gestión de Archivos - Sistema COSO II + ISO 27001

## Resumen de Implementación

Se ha implementado completamente el **servicio de almacenamiento de archivos** para el sistema de gestión de riesgos, cumpliendo con los requerimientos 8.1, 8.2 y 8.3. El sistema permite gestionar evidencias documentales asociadas a riesgos, auditorías y hallazgos.

## Arquitectura Implementada

### 1. Capa de Dominio

#### Entidades Principales
- **`Evidencia`**: Representa un archivo/documento subido al sistema
- **`TipoArchivo`**: Define tipos de archivos permitidos con sus extensiones
- **`VisibilidadArchivo`**: Controla el nivel de acceso a los archivos

#### Servicios de Dominio
- **`FileStorageService`**: Validaciones y lógica de negocio para archivos
  - Validación de tamaños, extensiones y seguridad
  - Generación de nombres únicos
  - Utilidades para manejo de archivos

### 2. Capa de Infraestructura

#### Repositorios Implementados
- **`EvidenciaRepository`**: CRUD y consultas específicas para evidencias
- **`TipoArchivoRepository`**: Gestión de tipos de archivo
- **`VisibilidadArchivoRepository`**: Gestión de niveles de visibilidad

#### Servicio de Storage
- **`SupabaseStorageService`**: Integración con Supabase Storage
  - Subida y descarga de archivos
  - Gestión de buckets y políticas
  - URLs públicas y firmadas

### 3. Capa de Aplicación

#### Servicio Principal
- **`FileManagementService`**: Orquesta todas las operaciones de archivos
  - Subida con validaciones completas
  - Descarga con control de permisos
  - Eliminación segura
  - Búsqueda y filtrado

### 4. Capa de Presentación

#### API Routes
- **`/api/files/upload`**: Subida de archivos (POST) y listado (GET)
- **`/api/files/[id]`**: Información, descarga y eliminación de archivos
- **`/api/files/config`**: Configuración de tipos y visibilidades

#### Hook Personalizado
- **`useFileManagement`**: Hook React para gestión de archivos en frontend

## Configuración de Supabase Storage

### Buckets Configurados
1. **`evidencias`** (privado): Para documentos y evidencias
2. **`avatars`** (público): Para fotos de perfil de usuarios

### Políticas de Seguridad (RLS)
- **INSERT**: Solo usuarios autenticados pueden subir archivos
- **SELECT**: Acceso basado en permisos y visibilidad
- **UPDATE/DELETE**: Solo propietarios o administradores

### Script de Configuración
Ejecutar `supabase-storage-setup.sql` para:
- Crear buckets con configuraciones apropiadas
- Establecer políticas de Row Level Security
- Insertar datos iniciales (tipos y visibilidades)
- Crear funciones auxiliares de limpieza

## Características Implementadas

### ✅ Validaciones de Seguridad
- Tamaño máximo de archivos (100MB por defecto)
- Extensiones permitidas por tipo
- Validación de nombres de archivo
- Detección de archivos peligrosos
- Verificación de tipos MIME

### ✅ Control de Acceso
- Visibilidad por niveles (público, privado, confidencial, etc.)
- Permisos basados en roles de usuario
- Validación de acceso por usuario y archivo

### ✅ Organización de Archivos
- Estructura de carpetas por año y tipo
- Rutas organizadas: `riesgos/2024/123/`, `auditorias/2024/456/`
- Nombres únicos con timestamps y prefijos

### ✅ Gestión Completa
- Subida con progreso y validaciones
- Descarga directa desde navegador
- Eliminación con limpieza automática
- Búsqueda y filtrado avanzado

### ✅ Integración con Entidades
- Asociación con riesgos, auditorías y hallazgos
- Trazabilidad completa de archivos
- Metadatos enriquecidos

## Tipos de Archivo Soportados

### Documentos
- **PDF**: `application/pdf`
- **Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Excel**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **PowerPoint**: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### Imágenes
- **JPEG/JPG**: `image/jpeg`
- **PNG**: `image/png`
- **GIF**: `image/gif`
- **BMP**: `image/bmp`
- **WebP**: `image/webp`

### Otros
- **Texto**: `text/plain`, `text/csv`
- **Comprimidos**: `application/zip`, `application/x-rar-compressed`, `application/x-7z-compressed`

## Niveles de Visibilidad

1. **Público**: Visible para todos los usuarios del sistema
2. **Privado**: Visible solo para el usuario que subió el archivo
3. **Confidencial**: Visible solo para usuarios con permisos especiales
4. **Departamental**: Visible para usuarios del mismo departamento
5. **Proyecto**: Visible para miembros del proyecto asociado

## Uso en Frontend

### Ejemplo de Subida de Archivo
```typescript
import { useFileManagement } from '@/presentation/hooks/useFileManagement'

const { uploadFile, isUploading, uploadProgress } = useFileManagement()

const handleUpload = async (file: File) => {
  const result = await uploadFile(file, {
    idTipoArchivo: 1, // PDF
    idVisibilidadArchivo: 2, // Privado
    descripcion: 'Evidencia de control interno',
    idRiesgo: 123
  })
  
  if (result.success) {
    console.log('Archivo subido:', result.data)
  } else {
    console.error('Error:', result.error)
  }
}
```

### Ejemplo de Descarga
```typescript
const { downloadFile, isDownloading } = useFileManagement()

const handleDownload = async (fileId: number) => {
  const result = await downloadFile(fileId)
  if (!result.success) {
    console.error('Error al descargar:', result.error)
  }
}
```

## Funciones Auxiliares

### Limpieza Automática
- **`limpiar_archivos_temporales()`**: Elimina archivos temporales > 7 días
- **Trigger automático**: Limpia storage cuando se elimina una evidencia

### Estadísticas
- **`obtener_estadisticas_storage()`**: Métricas de uso por bucket
- Contadores por tipo de archivo
- Tamaños totales por usuario

## Próximos Pasos

Con el servicio de archivos completamente implementado, las siguientes tareas recomendadas son:

1. **Tarea 3.4**: Configurar servicios de notificaciones y email
2. **Tarea 4.2**: Desarrollar servicios de aplicación para gestión de riesgos
3. **Tarea 5.2**: Personalizar tema corporativo DELTA CONSULT

## Archivos Creados/Modificados

### Nuevos Archivos
- `src/domain/entities/Evidencia.ts`
- `src/domain/entities/TipoArchivo.ts`
- `src/domain/repositories/IEvidenciaRepository.ts`
- `src/domain/services/FileStorageService.ts`
- `src/infrastructure/repositories/EvidenciaRepository.ts`
- `src/infrastructure/storage/SupabaseStorageService.ts`
- `src/application/services/FileManagementService.ts`
- `app/api/files/upload/route.ts`
- `app/api/files/[id]/route.ts`
- `app/api/files/config/route.ts`
- `src/presentation/hooks/useFileManagement.ts`
- `lib/constants/files.ts`
- `supabase-storage-setup.sql`

### Archivos Modificados
- `src/domain/entities/index.ts`
- `src/domain/repositories/index.ts`
- `src/domain/services/index.ts`
- `src/infrastructure/repositories/index.ts`
- `src/application/services/index.ts`
- `.kiro/specs/sistema-gestion-riesgos-coso/tasks.md`

## Conclusión

El servicio de gestión de archivos está completamente implementado y listo para uso. Proporciona una base sólida para la gestión documental del sistema de riesgos, con todas las validaciones de seguridad, controles de acceso y funcionalidades requeridas por los estándares COSO II e ISO 27001.