# Plan de Implementación - Sistema de Gestión de Riesgos COSO II

## Estado Actual del Proyecto

**✅ Completado:**

- Proyecto Next.js 14 con TypeScript configurado
- Supabase cliente y servidor configurados
- Autenticación básica implementada (login, registro, middleware, protected routes)
- shadcn/ui instalado con componentes base (Button, Input, Card, Checkbox, etc.)
- Estructura de rutas protegidas (/protected, /auth/\*)
- Esquema completo de base de datos COSO + ISO 27001 creado (40+ tablas)
- Tipos TypeScript generados desde Supabase
- Estructura de capas (domain, application, infrastructure, presentation) creada
- Configuración centralizada del sistema implementada (lib/config/index.ts)
- Constantes de base de datos definidas con roles, estados, categorías (lib/constants/database.ts)
- Path aliases configurados para todas las capas (@/domain/_, @/application/_, etc.)
- Middleware de autenticación básico implementado
- Componentes de formularios básicos (login, signup, forgot-password, update-password)
- Theme provider configurado con next-themes

**📋 Próximos Pasos Críticos:**

1. Instalar dependencias adicionales necesarias (React Hook Form, Zod, Recharts, etc.)
2. Implementar entidades de dominio y value objects
3. Desarrollar servicios de aplicación y casos de uso
4. Crear repositorios concretos con Supabase
5. Configurar OAuth providers (Google, LinkedIn, GitHub)
6. Implementar páginas principales del sistema

## 1. Configuración inicial del proyecto y estructura base

- [x] 1.1 Configurar proyecto Next.js 14 con TypeScript y estructura de capas
  - ✅ Proyecto Next.js 14 configurado con TypeScript
  - ✅ Estructura básica de directorios creada
  - ✅ Dependencias base instaladas (Next.js, React, TypeScript, Tailwind CSS)
  - ✅ Path aliases configurados en tsconfig.json para capas
  - _Requerimientos: 1.1, 1.2_

- [x] 1.2 Configurar Supabase y conexión a base de datos
  - ✅ Cliente de Supabase configurado con variables de entorno
  - ✅ Middleware de autenticación implementado
  - ✅ Esquema completo de base de datos creado (COSO + ISO 27001)
  - ✅ Tipos TypeScript generados desde Supabase
  - _Requerimientos: 1.1, 8.3_

- [x] 1.3 Crear esquema de base de datos y tipos TypeScript
  - ✅ Tablas para usuarios, roles, departamentos, proyectos, clientes
  - ✅ Tablas para riesgos, categorías, tipos, controles internos
  - ✅ Tablas para auditorías, hallazgos, planes de mitigación
  - ✅ Tablas ISO 27001: activos, controles, evaluaciones de riesgo, incidentes
  - ✅ Tablas de mapeo entre COSO e ISO 27001
  - ✅ Tipos TypeScript generados desde esquema de Supabase
  - _Requerimientos: 1.1, 1.2, 1.3_

- [x] 1.4 Implementar sistema de configuración y constantes
  - ✅ Archivo de configuración centralizado creado (lib/config/index.ts)
  - ✅ Constantes para roles, estados, categorías definidas (lib/constants/database.ts)
  - ✅ Variables de entorno configuradas para desarrollo
  - ✅ Configuración OAuth providers preparada
  - _Requerimientos: 1.1, 1.3_

- [x] 1.5 Instalar dependencias adicionales necesarias
  - ✅ Instalar React Hook Form y Zod para formularios y validaciones
  - ✅ Instalar Recharts para gráficos y visualizaciones
  - ✅ Instalar date-fns para manejo de fechas
  - ✅ Instalar Zustand para manejo de estado global
  - _Requerimientos: 1.1_

- [x] 1.6 Configurar herramientas de desarrollo y testing
  - ✅ Instalar y configurar Jest y Testing Library para unit tests
  - ✅ Configurar Playwright para tests E2E
  - ✅ Configurar Husky para pre-commit hooks
  - ✅ Configurar Prettier y ESLint
  - _Requerimientos: 1.1_

## 2. Capa de Dominio - Entidades y lógica de negocio

- [x] 2.1 Crear estructura de directorios por capas
  - ✅ Directorios creados: src/domain, src/application, src/infrastructure, src/presentation
  - ✅ Path aliases configurados en tsconfig.json para cada capa
  - ✅ Index.ts creados para exports organizados por módulo
  - _Requerimientos: 1.1_

- [x] 2.2 Implementar entidades de dominio principales
  - ✅ Crear entidades Usuario, Riesgo, Proyecto con validaciones de negocio
  - ✅ Implementar value objects para CI, Email, Probabilidad, Impacto, NivelRiesgo
  - ✅ Definir enums para estados y categorías del sistema
  - ✅ Crear entidades ISO 27001: ActivoInformacion, ControlISO27001, IncidenteSeguridad
  - _Requerimientos: 1.1, 3.3, 2.1_

- [x] 2.3 Implementar servicios de dominio para cálculos de riesgo
  - ✅ Crear servicio para cálculo de nivel de riesgo COSO (probabilidad × impacto)
  - ✅ Implementar lógica de categorización de riesgos (bajo, medio, alto, crítico)
  - ✅ Crear servicio para cálculo de riesgo inherente y residual ISO 27001
  - ✅ Implementar servicio para generación de matriz de riesgos integrada
  - _Requerimientos: 3.1, 3.2, 3.5_

- [x] 2.4 Definir interfaces de repositorio para cada entidad
  - ✅ Crear interfaces IUsuarioRepository, IRiesgoRepository, IProyectoRepository
  - ✅ Crear interfaces ISO 27001: IActivoRepository, IControlISORepository, IIncidenteRepository
  - ✅ Definir métodos CRUD estándar y consultas específicas de negocio
  - ✅ Establecer contratos para filtrado, paginación y búsqueda avanzada
  - _Requerimientos: 1.1, 3.4, 2.1_

- [x] 2.5 Implementar casos de uso principales
  - ✅ Crear casos de uso para gestión de usuarios y autenticación
  - ✅ Implementar casos de uso para CRUD de riesgos COSO y evaluación
  - ✅ Desarrollar casos de uso para gestión de proyectos y asignaciones
  - ✅ Crear casos de uso ISO 27001 para activos, controles e incidentes
  - _Requerimientos: 1.1, 2.1, 3.1_

## 3. Capa de Infraestructura - Persistencia y servicios externos

- [x] 3.1 Implementar repositorios concretos con Supabase
  - ✅ Crear UsuarioRepository con operaciones CRUD y autenticación
  - ✅ Implementar RiesgoRepository con consultas complejas y filtros
  - ✅ Desarrollar ProyectoRepository con relaciones y agregaciones
  - ✅ Crear repositorios ISO 27001: ActivoRepository, ControlISORepository, IncidenteRepository
  - _Requerimientos: 1.1, 1.2, 3.4_

- [x] 3.2 Configurar sistema de autenticación y autorización avanzado
  - ✅ Implementar Row Level Security policies específicas en Supabase
  - ✅ Crear middleware para verificación de permisos por módulo
  - ✅ Implementar sistema de roles y permisos granulares
  - ✅ Configurar políticas de acceso para datos ISO 27001
  - _Requerimientos: 1.1, 1.2, 1.3, 1.4_

- [x] 3.3 Implementar servicio de almacenamiento de archivos
  - ✅ Configurar Supabase Storage buckets para evidencias y documentos
  - ✅ Crear servicio para upload, download y gestión de archivos
  - ✅ Implementar validación de tipos y tamaños de archivo
  - ✅ Configurar políticas de acceso a archivos por rol
  - ✅ Crear entidades de dominio (Evidencia, TipoArchivo, VisibilidadArchivo)
  - ✅ Implementar repositorios concretos con Supabase
  - ✅ Desarrollar servicio de aplicación FileManagementService
  - ✅ Crear API Routes para gestión de archivos
  - ✅ Implementar hook personalizado useFileManagement
  - ✅ Configurar constantes y utilidades para archivos
  - _Requerimientos: 8.1, 8.2, 8.3_

- [x] 3.4 Configurar servicios de notificaciones y email
  - ✅ Integrar servicio de email para notificaciones automáticas
  - ✅ Implementar templates para diferentes tipos de notificaciones
  - ✅ Crear sistema de notificaciones para vencimientos y alertas
  - ✅ Implementar notificaciones para incidentes de seguridad críticos
  - ✅ Crear entidades de dominio (Notificacion, PreferenciaNotificacion)
  - ✅ Implementar servicios de dominio (NotificationService)
  - ✅ Desarrollar repositorios concretos con Supabase
  - ✅ Crear servicio de aplicación (NotificationManagementService)
  - ✅ Implementar servicio de email con templates HTML
  - ✅ Crear API Routes para gestión de notificaciones
  - ✅ Desarrollar hook personalizado useNotifications
  - ✅ Configurar constantes y utilidades para notificaciones
  - ✅ Crear script SQL para tablas y configuración de base de datos
  - _Requerimientos: 7.1, 7.2, 7.3_

## 4. Capa de Aplicación - Servicios y controladores

- [x] 4.1 Implementar servicios de aplicación para gestión de usuarios
  - ✅ Crear UserService con operaciones de registro, edición y desactivación
  - ✅ Implementar AuthService para login, logout y gestión de sesiones OAuth
  - ✅ Desarrollar PermissionService para control de acceso por módulos
  - ✅ Crear RoleService para gestión de roles y asignaciones
  - ✅ Implementar API Routes de Next.js para autenticación y usuarios
  - ✅ Crear página de login mejorada con OAuth
  - _Requerimientos: 1.1, 1.2, 1.3, 1.4_

- [ ] 4.2 Desarrollar servicios de aplicación para gestión de riesgos
  - Crear RiskService con CRUD completo y cálculos automáticos COSO
  - Implementar RiskEvaluationService para matriz y priorización
  - Desarrollar ISO27001Service para gestión de activos y controles
  - Crear IncidentService para gestión de incidentes de seguridad
  - Implementar RiskReportService para generación de reportes integrados
  - _Requerimientos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Implementar API Routes de Next.js
  - Crear endpoints REST para autenticación (/api/auth/\*)
  - Desarrollar endpoints para gestión de riesgos (/api/risks/\*)
  - Implementar endpoints para proyectos y usuarios (/api/projects/_, /api/users/_)
  - Crear endpoints ISO 27001 (/api/iso27001/assets/_, /api/iso27001/controls/_)
  - Desarrollar endpoints para incidentes (/api/incidents/\*)
  - _Requerimientos: 1.1, 2.1, 3.1_

- [ ] 4.4 Implementar validadores y DTOs
  - Crear esquemas Zod para validación de formularios COSO e ISO 27001
  - Implementar DTOs para transferencia de datos entre capas
  - Desarrollar mappers para conversión entre entidades y DTOs
  - Crear validadores específicos para CI boliviano y datos empresariales
  - _Requerimientos: 1.1, 3.1, 8.1_

## 5. Capa de Presentación - Componentes base y sistema de diseño

- [x] 5.1 Configurar sistema de diseño con shadcn/ui
  - ✅ shadcn/ui instalado y configurado con Tailwind CSS
  - ✅ Componentes base disponibles (Button, Input, Card, etc.)
  - ✅ Theme provider configurado con next-themes
  - _Requerimientos: 6.1, 6.2, 6.3_

- [ ] 5.2 Personalizar tema corporativo DELTA CONSULT
  - Actualizar variables CSS con colores corporativos (azul corporativo)
  - Configurar tipografía Geist y espaciado según identidad visual
  - Crear componentes personalizados con branding DELTA CONSULT
  - Implementar logo y elementos visuales corporativos
  - _Requerimientos: 6.1, 6.2, 6.3_

- [ ] 5.3 Implementar componentes de layout y navegación
  - Crear layout principal con sidebar colapsible y header corporativo
  - Implementar navegación responsiva con menú móvil
  - Desarrollar breadcrumbs y sistema de navegación contextual
  - Crear componente de navegación por módulos (COSO, ISO 27001)
  - _Requerimientos: 6.1, 6.3_

- [ ] 5.4 Desarrollar componentes de formularios reutilizables
  - Instalar y configurar React Hook Form con Zod para validaciones
  - Crear FormField wrapper con validación y mensajes de error
  - Implementar componentes específicos (UserForm, RiskForm, ProjectForm)
  - Crear formularios ISO 27001 (AssetForm, ControlForm, IncidentForm)
  - _Requerimientos: 1.1, 2.1, 3.1_

- [ ] 5.5 Implementar componentes de visualización de datos
  - Instalar Recharts para gráficos y visualizaciones
  - Crear componentes de tablas con paginación, filtros y ordenamiento
  - Desarrollar matriz de riesgos interactiva (COSO + ISO 27001)
  - Implementar componentes de métricas, KPIs y dashboards
  - Crear gráficos de cumplimiento ISO 27001
  - _Requerimientos: 6.1, 6.2, 3.2_

## 6. Módulo de Autenticación y Gestión de Usuarios

- [x] 6.1 Implementar páginas de autenticación básicas
  - ✅ Página de login con validación y manejo de errores
  - ✅ Página de registro de usuarios
  - ✅ Página de recuperación de contraseña
  - ✅ Página protegida básica implementada
  - _Requerimientos: 1.1, 1.2_

- [ ] 6.2 Implementar autenticación OAuth con proveedores sociales
  - Configurar proveedores OAuth en Supabase Dashboard (Google, LinkedIn, GitHub)
  - Actualizar variables de entorno con Client IDs y Secrets
  - Agregar botones de OAuth en página de login
  - Implementar callback handler para OAuth
  - Crear lógica para sincronizar datos de perfil OAuth con base de datos
  - _Requerimientos: 1.1, 1.2_

- [ ] 6.3 Mejorar autenticación para sistema empresarial
  - Modificar registro para que solo admins puedan crear usuarios
  - Agregar campos adicionales al registro (nombres, apellidos, CI, teléfono, departamento)
  - Implementar validación de CI único y formato correcto boliviano
  - Manejar usuarios que se registran via OAuth sin datos completos
  - Crear flujo de completar perfil para usuarios OAuth
  - _Requerimientos: 1.1, 1.2_

- [ ] 6.4 Desarrollar gestión de usuarios y permisos
  - Crear página de listado de usuarios con filtros por rol y departamento
  - Implementar formulario de creación/edición de usuarios completo
  - Desarrollar sistema de asignación de roles y permisos por módulo
  - Mostrar método de autenticación usado (email/password vs OAuth)
  - Implementar activación/desactivación de usuarios
  - _Requerimientos: 1.1, 1.2, 1.3_

- [x] 6.5 Implementar middleware de autenticación básico
  - ✅ Middleware para protección de rutas privadas
  - ✅ Redirección automática a login para usuarios no autenticados
  - [ ] Implementar verificación de permisos por módulo y acción
  - [ ] Crear redirección automática según rol de usuario
  - _Requerimientos: 1.2, 1.3, 1.4_

## 7. Módulo de Gestión de Proyectos

- [ ] 7.1 Implementar CRUD de proyectos
  - Crear página de listado de proyectos con filtros por estado y cliente
  - Desarrollar formulario de creación/edición de proyectos
  - Implementar vista detallada de proyecto con métricas de avance
  - _Requerimientos: 2.1, 2.2, 2.3_

- [ ] 7.2 Desarrollar gestión de equipos de proyecto
  - Crear sistema de asignación de usuarios a proyectos
  - Implementar gestión de roles dentro del proyecto
  - Desarrollar vista de carga de trabajo por usuario
  - _Requerimientos: 2.2, 2.3_

- [ ] 7.3 Implementar gestión de clientes
  - Crear CRUD completo para clientes
  - Desarrollar vista de historial de proyectos por cliente
  - Implementar sistema de contactos y información empresarial
  - _Requerimientos: 2.3_

## 8. Módulo de Gestión de Riesgos

- [ ] 8.1 Implementar identificación y registro de riesgos
  - Crear formulario de registro de riesgos con validaciones
  - Desarrollar sistema de categorización y clasificación
  - Implementar asignación automática de propietarios de riesgo
  - _Requerimientos: 3.1, 3.2, 3.3_

- [ ] 8.2 Desarrollar evaluación y matriz de riesgos
  - Crear componente de matriz de riesgos interactiva
  - Implementar cálculo automático de nivel de riesgo
  - Desarrollar sistema de priorización automática
  - _Requerimientos: 3.2, 3.4, 3.5_

- [ ] 8.3 Implementar relación riesgos-objetivos estratégicos
  - Crear sistema de vinculación de riesgos con objetivos
  - Desarrollar análisis de impacto en objetivos estratégicos
  - Implementar vista de riesgos agrupados por objetivo
  - _Requerimientos: 3.4_

## 9. Módulo de Planes de Mitigación

- [ ] 9.1 Implementar gestión de controles internos
  - Crear CRUD para controles internos asociados a riesgos
  - Desarrollar sistema de evaluación de efectividad de controles
  - Implementar seguimiento de costos de implementación
  - _Requerimientos: 4.1, 4.2, 4.3_

- [ ] 9.2 Desarrollar planes de acción y actividades
  - Crear sistema de planes de mitigación con actividades específicas
  - Implementar asignación de responsables y fechas límite
  - Desarrollar seguimiento de avance con porcentajes de completado
  - _Requerimientos: 4.1, 4.2, 4.3, 4.4_

- [ ] 9.3 Implementar sistema de notificaciones automáticas
  - Crear notificaciones de vencimiento de actividades
  - Desarrollar alertas para riesgos críticos
  - Implementar recordatorios automáticos por email
  - _Requerimientos: 7.1, 7.2, 7.4_

## 10. Módulo de Auditoría y Cumplimiento

- [ ] 10.1 Implementar programación y gestión de auditorías
  - Crear sistema de programación de auditorías por riesgo/proyecto
  - Desarrollar asignación de auditores y definición de alcance
  - Implementar seguimiento de estado de auditorías
  - _Requerimientos: 5.1, 5.2_

- [ ] 10.2 Desarrollar gestión de hallazgos y acciones correctivas
  - Crear registro de hallazgos con clasificación por severidad
  - Implementar asignación de acciones correctivas con responsables
  - Desarrollar seguimiento de cierre de hallazgos
  - _Requerimientos: 5.2, 5.3, 5.4_

- [ ] 10.3 Implementar cumplimiento normativo
  - Crear registro de normas aplicables (COSO, ISO, etc.)
  - Desarrollar evaluación de nivel de cumplimiento por riesgo
  - Implementar reportes de brechas de cumplimiento
  - _Requerimientos: 5.1, 5.2_

## 11. Módulo de Evidencias y Documentación

- [ ] 11.1 Implementar gestión documental
  - Crear sistema de carga de evidencias con validación de tipos
  - Desarrollar control de versiones automático para documentos
  - Implementar sistema de búsqueda y filtrado avanzado
  - _Requerimientos: 8.1, 8.2, 8.3_

- [ ] 11.2 Desarrollar control de acceso a documentos
  - Crear sistema de permisos granulares por documento
  - Implementar clasificación de confidencialidad
  - Desarrollar auditoría de acceso a documentos sensibles
  - _Requerimientos: 8.3, 8.4_

## 12. Módulo ISO 27001 - Gestión de Seguridad de la Información

- [ ] 12.1 Implementar gestión de activos de información
  - Crear CRUD para activos de información con clasificación de seguridad
  - Desarrollar sistema de valoración de activos (criticidad 1-5)
  - Implementar asignación de propietarios y custodios de activos
  - Crear vista de inventario de activos con filtros por tipo y clasificación
  - _Requerimientos: 8.1, 8.2, 8.3_

- [ ] 12.2 Desarrollar catálogo de controles ISO 27001
  - Crear base de datos con los 93 controles del Anexo A de ISO 27001:2022
  - Implementar sistema de evaluación de madurez de controles (0-5)
  - Desarrollar asignación de responsables por control
  - Crear seguimiento de estado de implementación de controles
  - _Requerimientos: 4.1, 4.2, 5.1_

- [ ] 12.3 Implementar evaluación de riesgos ISO 27001
  - Crear metodología de evaluación basada en activos-amenazas-vulnerabilidades
  - Implementar cálculo de riesgo inherente y residual
  - Desarrollar matriz de riesgos CIA (Confidencialidad, Integridad, Disponibilidad)
  - Crear sistema de tratamiento de riesgos (aceptar, mitigar, transferir, evitar)
  - _Requerimientos: 3.1, 3.2, 3.4, 3.5_

- [ ] 12.4 Desarrollar gestión de incidentes de seguridad
  - Crear sistema de reporte y clasificación de incidentes
  - Implementar flujo de investigación y resolución de incidentes
  - Desarrollar análisis de causa raíz y lecciones aprendidas
  - Crear métricas de tiempo de respuesta y resolución
  - _Requerimientos: 5.2, 5.3, 7.1, 7.2_

- [ ] 12.5 Implementar integración COSO-ISO 27001
  - Crear mapeo entre riesgos COSO y evaluaciones ISO 27001
  - Desarrollar vista unificada de riesgos empresariales y de seguridad
  - Implementar correlación entre controles internos COSO y controles ISO
  - Crear reportes integrados de cumplimiento normativo
  - _Requerimientos: 3.4, 5.1, 6.1, 6.2_

## 13. Dashboards y Reportes

- [ ] 13.1 Implementar dashboard ejecutivo integrado
  - Crear dashboard con KPIs principales de riesgos COSO e ISO 27001
  - Desarrollar gráficos de tendencias y métricas clave unificadas
  - Implementar filtros por fecha, proyecto, categoría y marco normativo
  - Agregar métricas de cumplimiento ISO 27001 y madurez de controles
  - _Requerimientos: 6.1, 6.3, 6.4_

- [ ] 13.2 Desarrollar dashboards específicos por módulo
  - Crear dashboard de proyectos con riesgos asociados
  - Implementar dashboard de auditoría con estado de hallazgos
  - Desarrollar dashboard ISO 27001 con activos, controles e incidentes
  - Crear vista de cumplimiento normativo integrado (COSO + ISO)
  - _Requerimientos: 6.2, 6.3_

- [ ] 13.3 Implementar sistema de reportes automatizados
  - Crear generador de reportes de matriz de riesgos COSO e ISO
  - Desarrollar reportes de estado de planes de mitigación
  - Implementar reportes de cumplimiento ISO 27001 (SOA, análisis de brechas)
  - Crear reportes de incidentes de seguridad y métricas de respuesta
  - Implementar exportación en múltiples formatos (PDF, Excel, CSV)
  - _Requerimientos: 6.1, 6.2, 6.3_

## 14. Optimización y Testing

- [ ] 14.1 Implementar optimizaciones de performance
  - Instalar y configurar TanStack Query (React Query) para caching
  - Implementar lazy loading para componentes pesados
  - Optimizar consultas de base de datos con índices apropiados
  - _Requerimientos: 6.1, 6.2_

- [ ] 14.2 Desarrollar suite de tests automatizados
  - Crear unit tests para servicios de dominio y cálculos críticos
  - Implementar integration tests para flujos de autenticación
  - Desarrollar E2E tests para flujos críticos de usuario
  - _Requerimientos: 1.1_

- [ ] 14.3 Configurar monitoreo y logging
  - Implementar sistema de logging estructurado
  - Configurar monitoreo de errores con Sentry
  - Desarrollar métricas de performance y uso
  - _Requerimientos: 1.4_

## 15. Deployment y Configuración de Producción

- [ ] 15.1 Configurar entornos de deployment
  - Configurar deployment en Vercel para staging y producción
  - Implementar variables de entorno para cada ambiente
  - Configurar base de datos de producción en Supabase
  - _Requerimientos: 1.1_

- [ ] 15.2 Implementar CI/CD pipeline
  - Configurar GitHub Actions para tests automáticos
  - Implementar deployment automático en merge a main
  - Configurar rollback automático en caso de fallos
  - _Requerimientos: 1.1_

- [ ] 15.3 Configurar backup y recovery
  - Implementar backup automático diario de base de datos
  - Configurar sistema de recovery con RTO < 4 horas
  - Desarrollar procedimientos de disaster recovery
  - _Requerimientos: 1.1_
