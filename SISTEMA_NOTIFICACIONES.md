# Sistema de Notificaciones - Sistema COSO II + ISO 27001

## Resumen de Implementación

Se ha implementado completamente el **sistema de notificaciones y email** para el sistema de gestión de riesgos, cumpliendo con los requerimientos 7.1, 7.2 y 7.3. El sistema permite enviar notificaciones automáticas por múltiples canales según las preferencias del usuario.

## Arquitectura Implementada

### 1. Capa de Dominio

#### Entidades Principales
- **`Notificacion`**: Representa una notificación del sistema con estado, canal y prioridad
- **`PreferenciaNotificacion`**: Configuración de preferencias de notificación por usuario

#### Enums y Tipos
- **`TipoNotificacion`**: 8 tipos diferentes (vencimientos, riesgos críticos, incidentes, etc.)
- **`EstadoNotificacion`**: Estados del ciclo de vida (pendiente, enviada, leída, error)
- **`CanalNotificacion`**: Canales de envío (email, sistema, SMS)
- **`PrioridadNotificacion`**: Niveles de prioridad (baja, media, alta, crítica)

#### Servicios de Dominio
- **`NotificationService`**: Lógica de negocio para creación y procesamiento de notificaciones
  - Templates predefinidos por tipo
  - Validación de preferencias de usuario
  - Procesamiento de contexto y variables
  - Detección de duplicados

### 2. Capa de Infraestructura

#### Repositorios Implementados
- **`NotificacionRepository`**: CRUD y consultas específicas para notificaciones
- **`PreferenciaNotificacionRepository`**: Gestión de preferencias de usuario

#### Servicio de Email
- **`EmailService`**: Servicio completo de envío de emails
  - Templates HTML responsivos con branding corporativo
  - Soporte para variables dinámicas
  - Configuración SMTP flexible
  - Envío en lotes para optimización

### 3. Capa de Aplicación

#### Servicio Principal
- **`NotificationManagementService`**: Orquesta todas las operaciones de notificaciones
  - Envío con validaciones y control de duplicados
  - Procesamiento en lotes de notificaciones pendientes
  - Reintento automático de envíos fallidos
  - Gestión de preferencias de usuario
  - Limpieza automática de notificaciones antiguas

### 4. Capa de Presentación

#### API Routes
- **`/api/notifications`**: CRUD de notificaciones (GET, POST)
- **`/api/notifications/mark-read`**: Marcar notificaciones como leídas
- **`/api/notifications/preferences`**: Gestión de preferencias de usuario

#### Hook Personalizado
- **`useNotifications`**: Hook React completo para gestión de notificaciones
  - Estado reactivo de notificaciones y contador no leídas
  - Funciones para envío, lectura y filtrado
  - Métodos de conveniencia para tipos específicos
  - Auto-refresh cada 30 segundos

## Configuración de Base de Datos

### Tablas Principales
1. **`notificaciones`**: Almacena todas las notificaciones del sistema
2. **`preferencias_notificacion`**: Configuración de preferencias por usuario

### Tipos Enum Creados
- `tipo_notificacion`: 8 tipos diferentes de notificaciones
- `estado_notificacion`: 4 estados del ciclo de vida
- `canal_notificacion`: 3 canales de envío
- `prioridad_notificacion`: 4 niveles de prioridad

### Funciones Auxiliares
- `obtener_contador_no_leidas()`: Contador de notificaciones no leídas
- `marcar_todas_como_leidas()`: Marcar todas como leídas
- `limpiar_notificaciones_antiguas()`: Limpieza automática
- `obtener_estadisticas_notificaciones()`: Estadísticas por tipo

### Políticas RLS
- Usuarios solo pueden ver sus propias notificaciones
- Control de acceso granular por usuario autenticado
- Seguridad a nivel de fila para todas las operaciones

## Tipos de Notificación Implementados

### 1. **Vencimiento de Actividad** 🕐
- **Prioridad**: Alta
- **Canal por defecto**: Email
- **Trigger**: 3 días antes del vencimiento
- **Contexto**: Descripción, días restantes, URL de acción

### 2. **Riesgo Crítico** ⚠️
- **Prioridad**: Crítica
- **Canal por defecto**: Email
- **Trigger**: Cuando riesgo alcanza nivel ≥20
- **Contexto**: Nombre del riesgo, nivel, URL de mitigación

### 3. **Hallazgo Pendiente** 📋
- **Prioridad**: Media
- **Canal por defecto**: Email
- **Trigger**: Recordatorios semanales
- **Contexto**: Descripción, fecha límite, días restantes

### 4. **Proyecto Excede Tiempo** 📈
- **Prioridad**: Alta
- **Canal por defecto**: Email
- **Trigger**: Cuando proyecto excede 80% del tiempo
- **Contexto**: Nombre proyecto, porcentaje avance

### 5. **Nueva Evidencia** 📎
- **Prioridad**: Baja
- **Canal por defecto**: Sistema
- **Trigger**: Al subir nueva evidencia
- **Contexto**: Nombre archivo, entidad relacionada

### 6. **Auditoría Programada** 📅
- **Prioridad**: Media
- **Canal por defecto**: Email
- **Trigger**: Al programar nueva auditoría
- **Contexto**: Nombre auditoría, fecha programada

### 7. **Incidente de Seguridad** 🛡️
- **Prioridad**: Crítica
- **Canal por defecto**: Email
- **Trigger**: Al reportar incidente crítico
- **Contexto**: Descripción, severidad, URL de respuesta

### 8. **Control Vencido** 🔒
- **Prioridad**: Alta
- **Canal por defecto**: Email
- **Trigger**: Cuando control ISO 27001 vence
- **Contexto**: Nombre control, fecha vencimiento

## Canales de Notificación

### 1. **Email** 📧
- **Estado**: ✅ Implementado
- **Características**:
  - Templates HTML responsivos
  - Branding corporativo DELTA CONSULT
  - Variables dinámicas
  - Soporte para adjuntos
  - Configuración SMTP flexible

### 2. **Sistema** 🔔
- **Estado**: ✅ Implementado
- **Características**:
  - Notificaciones in-app
  - Contador de no leídas
  - Persistencia en base de datos
  - Tiempo real con auto-refresh

### 3. **SMS** 📱
- **Estado**: 🚧 Preparado (no implementado)
- **Características**:
  - Estructura preparada
  - Fácil integración futura
  - Configuración por preferencias

## Sistema de Preferencias

### Configuración por Usuario
- **Activación/Desactivación**: Por tipo y canal
- **Horarios**: Restricción de horario de envío
- **Días de la semana**: Configuración de días laborales
- **Prioridad mínima**: Filtro por nivel de prioridad
- **Frecuencia**: Para notificaciones recurrentes

### Preferencias por Defecto
Al crear un usuario, se configuran automáticamente:
- Riesgos críticos e incidentes por email (siempre)
- Vencimientos por sistema y email (horario laboral)
- Hallazgos pendientes semanalmente (lunes 9-10am)
- Nuevas evidencias por sistema (prioridad baja)

## Características Avanzadas

### ✅ **Control de Duplicados**
- Ventana de 60 minutos por defecto
- Validación por tipo, usuario y entidad relacionada
- Prevención de spam de notificaciones

### ✅ **Procesamiento en Lotes**
- Lotes de 50 notificaciones
- Procesamiento cada 5 minutos
- Optimización de recursos

### ✅ **Reintento Automático**
- Máximo 3 intentos por notificación
- Backoff exponencial (5min, 15min, 1h)
- Registro de errores detallado

### ✅ **Limpieza Automática**
- Eliminación de notificaciones leídas > 90 días
- Función programable para mantenimiento
- Optimización de base de datos

### ✅ **Seguridad y Privacidad**
- Row Level Security (RLS) habilitado
- Acceso solo a notificaciones propias
- Validación de permisos en cada operación

## Uso en Frontend

### Ejemplo de Hook de Notificaciones
```typescript
import { useNotifications } from '@/presentation/hooks/useNotifications'

const { 
  notifications, 
  unreadCount, 
  fetchNotifications,
  markAsRead,
  notifyCriticalRisk 
} = useNotifications()

// Obtener notificaciones
useEffect(() => {
  fetchNotifications({ soloNoLeidas: true })
}, [])

// Notificar riesgo crítico
const handleCriticalRisk = async () => {
  await notifyCriticalRisk(userId, riskId, riskName, riskLevel)
}
```

### Ejemplo de Envío Manual
```typescript
const sendCustomNotification = async () => {
  const result = await sendNotification({
    tipo: TipoNotificacion.RIESGO_CRITICO,
    idUsuarioDestino: 123,
    contexto: {
      nombreRiesgo: 'Falla en servidor crítico',
      nivelRiesgo: 25,
      urlAccion: '/riesgos/456/mitigar'
    },
    forzarEnvio: true
  })
}
```

## Configuración de Email

### Variables de Entorno Requeridas
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@deltaConsult.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@deltaConsult.com
FROM_NAME=DELTA CONSULT - Sistema de Riesgos
```

### Template HTML
- Diseño responsivo
- Branding corporativo DELTA CONSULT
- Variables dinámicas con Handlebars-like syntax
- Soporte para botones de acción
- Footer corporativo automático

## Próximos Pasos

Con el sistema de notificaciones completamente implementado, las siguientes tareas recomendadas son:

1. **Tarea 4.2**: Desarrollar servicios de aplicación para gestión de riesgos
2. **Tarea 5.2**: Personalizar tema corporativo DELTA CONSULT
3. **Tarea 6.2**: Implementar autenticación OAuth con proveedores sociales

## Archivos Creados/Modificados

### Nuevos Archivos
- `src/domain/entities/Notificacion.ts`
- `src/domain/entities/PreferenciaNotificacion.ts`
- `src/domain/repositories/INotificacionRepository.ts`
- `src/domain/services/NotificationService.ts`
- `src/infrastructure/repositories/NotificacionRepository.ts`
- `src/infrastructure/email/EmailService.ts`
- `src/application/services/NotificationManagementService.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/mark-read/route.ts`
- `app/api/notifications/preferences/route.ts`
- `src/presentation/hooks/useNotifications.ts`
- `lib/constants/notifications.ts`
- `supabase-notifications-setup.sql`

### Archivos Modificados
- `src/domain/entities/index.ts`
- `src/domain/repositories/index.ts`
- `src/domain/services/index.ts`
- `src/infrastructure/repositories/index.ts`
- `src/application/services/index.ts`
- `src/presentation/hooks/index.ts`
- `.kiro/specs/sistema-gestion-riesgos-coso/tasks.md`

## Conclusión

El sistema de notificaciones está completamente implementado y listo para uso en producción. Proporciona una base sólida para mantener a los usuarios informados sobre eventos críticos del sistema de gestión de riesgos, con todas las características necesarias para un entorno empresarial profesional.

### Beneficios Implementados:
- ✅ Notificaciones automáticas para todos los eventos críticos
- ✅ Múltiples canales de comunicación
- ✅ Preferencias personalizables por usuario
- ✅ Templates profesionales con branding corporativo
- ✅ Procesamiento eficiente y escalable
- ✅ Seguridad y privacidad garantizadas
- ✅ Fácil integración con el resto del sistema