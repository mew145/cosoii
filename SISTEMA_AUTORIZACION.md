# Sistema de Autenticación y Autorización Avanzado

## Descripción General

Este documento describe el sistema de autenticación y autorización avanzado implementado para el Sistema de Gestión de Riesgos COSO II + ISO 27001. El sistema proporciona control granular de acceso basado en roles y permisos específicos por módulo.

## Arquitectura del Sistema

### 1. Row Level Security (RLS) en Supabase

El sistema utiliza políticas de Row Level Security para controlar el acceso a los datos a nivel de base de datos:

- **Políticas por tabla**: Cada tabla principal tiene políticas específicas
- **Control basado en roles**: Las políticas verifican el rol del usuario
- **Verificación de propiedad**: Los usuarios pueden acceder a recursos que poseen
- **Funciones auxiliares**: Funciones SQL para verificar permisos y roles

#### Archivos relacionados:
- `supabase-rls-policies.sql`: Políticas RLS principales
- `supabase-default-permissions.sql`: Permisos predeterminados y funciones

### 2. Middleware de Autorización

El middleware de autorización proporciona verificación de permisos en el servidor:

#### Características:
- **Verificación por módulo**: Control de acceso por módulo y acción
- **Verificación de propiedad**: Validación de propiedad de recursos
- **Roles requeridos**: Verificación de roles específicos
- **Manejo de errores**: Respuestas HTTP apropiadas para acceso denegado

#### Archivos relacionados:
- `src/infrastructure/middleware/AuthorizationMiddleware.ts`
- `middleware.ts`: Middleware principal de Next.js

### 3. Servicio de Permisos

El servicio de permisos gestiona la asignación y verificación de permisos:

#### Funcionalidades:
- **Gestión de permisos**: CRUD completo de permisos
- **Asignación por rol**: Permisos predeterminados por rol
- **Validación de consistencia**: Verificación de permisos de usuario
- **Estadísticas**: Métricas de uso de permisos

#### Archivos relacionados:
- `src/application/services/PermissionService.ts`

### 4. Hooks de Frontend

Los hooks proporcionan funcionalidad de permisos en el frontend:

#### Características:
- **usePermissions**: Hook principal para gestión de permisos
- **usePermission**: Hook para verificar permisos específicos
- **useRole**: Hook para verificar roles
- **useIsAdmin**: Hook para verificar si es administrador

#### Archivos relacionados:
- `src/presentation/hooks/usePermissions.ts`

### 5. Componentes de Protección

Los componentes de protección controlan el acceso a rutas y contenido:

#### Componentes:
- **ProtectedRoute**: Protege rutas completas
- **ConditionalRender**: Renderizado condicional basado en permisos
- **withPermissions**: HOC para proteger componentes

#### Archivos relacionados:
- `src/presentation/components/auth/ProtectedRoute.tsx`

### 6. Políticas ISO 27001

Políticas específicas para cumplimiento con ISO 27001:

#### Características:
- **Clasificación de activos**: Control de acceso por clasificación
- **Severidad de incidentes**: Acceso basado en severidad
- **Restricciones temporales**: Control de horarios para acciones críticas
- **Segregación de funciones**: Separación de responsabilidades

#### Archivos relacionados:
- `src/infrastructure/security/ISO27001Policies.ts`

## Roles del Sistema

### 1. Administrador
- **Permisos**: Acceso completo a todos los módulos
- **Responsabilidades**: Gestión de usuarios, configuración del sistema
- **Restricciones**: Ninguna

### 2. Auditor Senior
- **Permisos**: Usuarios, riesgos, proyectos, auditoría, reportes
- **Responsabilidades**: Supervisión de auditorías, aprobación de evaluaciones
- **Restricciones**: No puede eliminar usuarios

### 3. Auditor Junior
- **Permisos**: Riesgos, proyectos, auditoría (limitado)
- **Responsabilidades**: Ejecución de auditorías, registro de hallazgos
- **Restricciones**: No puede eliminar ni aprobar

### 4. Gerente de Proyecto
- **Permisos**: Riesgos y proyectos (limitado)
- **Responsabilidades**: Gestión de proyectos, evaluación de riesgos
- **Restricciones**: No puede eliminar riesgos

### 5. Oficial de Seguridad
- **Permisos**: Activos, controles, incidentes, reportes
- **Responsabilidades**: Gestión de seguridad ISO 27001
- **Restricciones**: Limitado a módulos de seguridad

### 6. Analista de Riesgos
- **Permisos**: Riesgos y reportes (limitado)
- **Responsabilidades**: Análisis de riesgos, generación de reportes
- **Restricciones**: No puede eliminar ni aprobar

### 7. Consultor
- **Permisos**: Riesgos, proyectos, reportes (básico)
- **Responsabilidades**: Consultoría externa, análisis específicos
- **Restricciones**: Solo ver, crear y editar

## Módulos y Permisos

### Módulo de Usuarios
- **ver**: Ver lista de usuarios
- **crear**: Crear nuevos usuarios
- **editar**: Modificar usuarios existentes
- **eliminar**: Eliminar usuarios
- **permisos**: Gestionar permisos de usuarios

### Módulo de Riesgos
- **ver**: Ver riesgos registrados
- **crear**: Registrar nuevos riesgos
- **editar**: Modificar riesgos existentes
- **eliminar**: Eliminar riesgos
- **evaluar**: Realizar evaluaciones de riesgos
- **aprobar**: Aprobar evaluaciones

### Módulo de Proyectos
- **ver**: Ver proyectos
- **crear**: Crear nuevos proyectos
- **editar**: Modificar proyectos
- **eliminar**: Eliminar proyectos
- **asignar**: Asignar usuarios a proyectos

### Módulo de Activos (ISO 27001)
- **ver**: Ver activos de información
- **crear**: Registrar nuevos activos
- **editar**: Modificar activos
- **eliminar**: Eliminar activos
- **clasificar**: Cambiar clasificación de seguridad
- **valorar**: Asignar valor de negocio

### Módulo de Controles (ISO 27001)
- **ver**: Ver controles de seguridad
- **crear**: Crear nuevos controles
- **editar**: Modificar controles
- **eliminar**: Eliminar controles
- **implementar**: Marcar como implementados
- **evaluar**: Evaluar efectividad

### Módulo de Incidentes (ISO 27001)
- **ver**: Ver incidentes de seguridad
- **crear**: Reportar nuevos incidentes
- **editar**: Modificar incidentes
- **eliminar**: Eliminar incidentes
- **investigar**: Realizar investigaciones
- **cerrar**: Cerrar incidentes resueltos

### Módulo de Auditoría
- **ver**: Ver auditorías
- **crear**: Programar auditorías
- **editar**: Modificar auditorías
- **eliminar**: Eliminar auditorías
- **aprobar**: Aprobar planes de auditoría
- **ejecutar**: Realizar auditorías

### Módulo de Reportes
- **ver**: Ver reportes
- **exportar**: Exportar reportes
- **ejecutivo**: Acceder a reportes ejecutivos
- **crear**: Crear reportes personalizados

## Uso del Sistema

### 1. Verificación de Permisos en el Backend

```typescript
import { AuthorizationMiddleware, ModulePermissions } from '@/infrastructure/middleware/AuthorizationMiddleware'

// Verificar permiso específico
const authMiddleware = new AuthorizationMiddleware()
const result = await authMiddleware.checkPermission(request, ModulePermissions.RISKS.CREATE)

if (!result.authorized) {
  return result.response // Respuesta de error
}
```

### 2. Uso de Hooks en el Frontend

```typescript
import { usePermissions } from '@/presentation/hooks/usePermissions'

function MyComponent() {
  const { hasPermission, canAccess, isAdmin } = usePermissions()
  
  if (hasPermission('riesgos', 'crear')) {
    // Mostrar botón de crear riesgo
  }
  
  if (canAccess('risks.delete')) {
    // Mostrar botón de eliminar
  }
  
  if (isAdmin) {
    // Mostrar opciones de administrador
  }
}
```

### 3. Protección de Rutas

```typescript
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute'
import { RolUsuario } from '@/domain/types/RolUsuario'

function RiskManagementPage() {
  return (
    <ProtectedRoute
      requiredPermissions={[{ module: 'riesgos', action: 'ver' }]}
      requiredRoles={[RolUsuario.AUDITOR_SENIOR, RolUsuario.GERENTE_PROYECTO]}
    >
      {/* Contenido de la página */}
    </ProtectedRoute>
  )
}
```

### 4. Renderizado Condicional

```typescript
import { ConditionalRender } from '@/presentation/components/auth/ProtectedRoute'

function RiskList() {
  return (
    <div>
      {/* Lista de riesgos */}
      
      <ConditionalRender permission={{ module: 'riesgos', action: 'crear' }}>
        <Button>Crear Nuevo Riesgo</Button>
      </ConditionalRender>
      
      <ConditionalRender roles={[RolUsuario.ADMINISTRADOR, RolUsuario.AUDITOR_SENIOR]}>
        <Button variant="destructive">Eliminar Seleccionados</Button>
      </ConditionalRender>
    </div>
  )
}
```

## Configuración y Deployment

### 1. Configuración de Base de Datos

1. Ejecutar `supabase-rls-policies.sql` para crear las políticas RLS
2. Ejecutar `supabase-default-permissions.sql` para insertar permisos predeterminados
3. Verificar que las funciones auxiliares estén creadas correctamente

### 2. Variables de Entorno

Asegurar que las siguientes variables estén configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Configuración del Middleware

El middleware está configurado para proteger todas las rutas excepto las públicas. Verificar la configuración en `middleware.ts`.

## Seguridad y Cumplimiento

### ISO 27001 Compliance

- **A.9.1.1**: Control de acceso basado en políticas
- **A.9.1.2**: Acceso a redes y servicios de red
- **A.9.2.1**: Registro de usuarios
- **A.9.2.2**: Aprovisionamiento de acceso de usuarios
- **A.9.2.3**: Gestión de derechos de acceso privilegiados
- **A.9.2.4**: Gestión de información de autenticación secreta de usuarios
- **A.9.2.5**: Revisión de los derechos de acceso de usuarios
- **A.9.2.6**: Retirada o ajuste de los derechos de acceso

### Características de Seguridad

- **Principio de menor privilegio**: Los usuarios solo tienen los permisos mínimos necesarios
- **Segregación de funciones**: Separación de responsabilidades críticas
- **Auditoría completa**: Registro de todas las acciones de acceso
- **Revisión periódica**: Validación automática de permisos de usuario
- **Restricciones temporales**: Control de horarios para acciones críticas

## Mantenimiento

### Tareas Regulares

1. **Revisión de permisos**: Validar permisos de usuarios mensualmente
2. **Auditoría de accesos**: Revisar logs de acceso semanalmente
3. **Actualización de políticas**: Revisar y actualizar políticas trimestralmente
4. **Pruebas de seguridad**: Ejecutar pruebas de penetración semestralmente

### Monitoreo

- **Intentos de acceso denegado**: Alertas automáticas
- **Cambios de permisos**: Notificaciones a administradores
- **Accesos fuera de horario**: Alertas para acciones críticas
- **Usuarios inactivos**: Revisión mensual de usuarios sin actividad

## Troubleshooting

### Problemas Comunes

1. **Usuario sin permisos**: Verificar asignación de rol y permisos predeterminados
2. **RLS bloqueando acceso**: Revisar políticas de Row Level Security
3. **Middleware no funcionando**: Verificar configuración de rutas en `middleware.ts`
4. **Hooks no actualizando**: Verificar conexión con Supabase y estado de autenticación

### Logs y Debugging

- **Logs de middleware**: Revisar console.log en desarrollo
- **Logs de Supabase**: Verificar en el dashboard de Supabase
- **Logs de aplicación**: Usar herramientas de monitoreo en producción