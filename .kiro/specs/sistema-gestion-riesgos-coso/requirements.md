# Especificación de Requerimientos - Sistema de Gestión de Riesgos COSO II

## Introducción

El Sistema de Gestión de Riesgos COSO II para DELTA CONSULT LTDA es una plataforma integral que permite identificar, evaluar, mitigar y monitorear riesgos tanto corporativos como de proyectos de auditoría, siguiendo el marco COSO Enterprise Risk Management 2017. El sistema proporcionará herramientas para la gestión completa del ciclo de vida de riesgos, desde su identificación hasta su tratamiento y seguimiento.

## Glosario

- **Sistema_Gestion_Riesgos**: Plataforma web desarrollada en Next.js con Supabase para la gestión integral de riesgos
- **Usuario_Sistema**: Persona autorizada para acceder y utilizar las funcionalidades del sistema
- **Riesgo_Corporativo**: Evento o condición que puede afectar los objetivos estratégicos de DELTA CONSULT LTDA
- **Riesgo_Proyecto**: Evento o condición que puede impactar un proyecto específico de auditoría
- **Matriz_Riesgos**: Representación visual que muestra riesgos clasificados por probabilidad e impacto
- **Plan_Mitigacion**: Conjunto de acciones definidas para reducir la probabilidad o impacto de un riesgo
- **Control_Interno**: Mecanismo implementado para prevenir o detectar la materialización de riesgos
- **Auditoria_Interna**: Proceso sistemático de evaluación de controles y cumplimiento normativo
- **Dashboard_Ejecutivo**: Panel de control con indicadores clave para la toma de decisiones
- **COSO_ERM**: Marco de gestión de riesgos empresariales del Committee of Sponsoring Organizations

## Requerimientos

### Requerimiento 1

**Historia de Usuario:** Como administrador del sistema, quiero gestionar usuarios y sus permisos, para que solo personal autorizado acceda a funcionalidades específicas según su rol.

#### Criterios de Aceptación

1. WHEN un administrador registra un nuevo usuario, THE Sistema_Gestion_Riesgos SHALL validar que el CI y correo electrónico sean únicos
2. WHEN un usuario intenta autenticarse, THE Sistema_Gestion_Riesgos SHALL verificar credenciales y establecer sesión segura con token JWT
3. WHILE un usuario tiene sesión activa, THE Sistema_Gestion_Riesgos SHALL controlar acceso a módulos según permisos de rol asignado
4. IF un usuario excede 3 intentos fallidos de autenticación, THEN THE Sistema_Gestion_Riesgos SHALL bloquear la cuenta por 30 minutos
5. THE Sistema_Gestion_Riesgos SHALL registrar todos los accesos y cambios de permisos en la bitácora de auditoría

### Requerimiento 2

**Historia de Usuario:** Como gerente de proyecto, quiero crear y administrar proyectos de auditoría, para que pueda asignar equipos y hacer seguimiento del avance.

#### Criterios de Aceptación

1. WHEN un gerente crea un proyecto, THE Sistema_Gestion_Riesgos SHALL validar que las fechas de inicio y fin sean coherentes
2. WHEN se asigna un usuario al equipo de proyecto, THE Sistema_Gestion_Riesgos SHALL verificar disponibilidad según porcentaje de dedicación
3. WHILE un proyecto está activo, THE Sistema_Gestion_Riesgos SHALL calcular automáticamente el porcentaje de avance basado en actividades completadas
4. THE Sistema_Gestion_Riesgos SHALL permitir asociar múltiples proyectos a un mismo cliente
5. THE Sistema_Gestion_Riesgos SHALL generar alertas cuando un proyecto exceda el 80% del tiempo planificado

### Requerimiento 3

**Historia de Usuario:** Como analista de riesgos, quiero identificar y registrar riesgos, para que puedan ser evaluados y priorizados según su impacto potencial.

#### Criterios de Aceptación

1. WHEN se registra un riesgo, THE Sistema_Gestion_Riesgos SHALL calcular automáticamente el nivel de riesgo multiplicando probabilidad por impacto
2. WHEN se asigna una categoría a un riesgo, THE Sistema_Gestion_Riesgos SHALL aplicar el código de color correspondiente en visualizaciones
3. WHILE se evalúa un riesgo, THE Sistema_Gestion_Riesgos SHALL validar que probabilidad e impacto estén en escala de 1 a 5
4. THE Sistema_Gestion_Riesgos SHALL permitir asociar riesgos con objetivos estratégicos específicos
5. THE Sistema_Gestion_Riesgos SHALL generar la matriz de riesgos visual automáticamente al actualizar evaluaciones

### Requerimiento 4

**Historia de Usuario:** Como propietario de riesgo, quiero crear planes de mitigación con actividades específicas, para que pueda reducir la probabilidad o impacto del riesgo asignado.

#### Criterios de Aceptación

1. WHEN se crea un plan de mitigación, THE Sistema_Gestion_Riesgos SHALL validar que la fecha de inicio sea posterior a la fecha actual
2. WHEN se asigna una actividad a un responsable, THE Sistema_Gestion_Riesgos SHALL enviar notificación automática por correo electrónico
3. WHILE un plan está en ejecución, THE Sistema_Gestion_Riesgos SHALL calcular el porcentaje de completado basado en actividades finalizadas
4. IF una actividad excede su fecha límite, THEN THE Sistema_Gestion_Riesgos SHALL generar alerta automática al responsable y supervisor
5. THE Sistema_Gestion_Riesgos SHALL permitir adjuntar evidencias de cumplimiento a cada actividad

### Requerimiento 5

**Historia de Usuario:** Como auditor interno, quiero programar y ejecutar auditorías, para que pueda evaluar la efectividad de controles y identificar hallazgos.

#### Criterios de Aceptación

1. WHEN se programa una auditoría, THE Sistema_Gestion_Riesgos SHALL validar que el auditor tenga permisos para el alcance definido
2. WHEN se registra un hallazgo, THE Sistema_Gestion_Riesgos SHALL asignar automáticamente fecha límite según severidad
3. WHILE una auditoría está en progreso, THE Sistema_Gestion_Riesgos SHALL permitir cargar evidencias y documentación de soporte
4. THE Sistema_Gestion_Riesgos SHALL generar reportes automáticos de hallazgos pendientes por responsable
5. THE Sistema_Gestion_Riesgos SHALL enviar recordatorios automáticos 7 días antes del vencimiento de acciones correctivas

### Requerimiento 6

**Historia de Usuario:** Como director ejecutivo, quiero visualizar dashboards con indicadores clave, para que pueda tomar decisiones informadas sobre la gestión de riesgos.

#### Criterios de Aceptación

1. WHEN se accede al dashboard ejecutivo, THE Sistema_Gestion_Riesgos SHALL mostrar datos actualizados en tiempo real
2. WHEN se aplica un filtro de fecha, THE Sistema_Gestion_Riesgos SHALL actualizar todos los gráficos y métricas correspondientes
3. WHILE se visualiza la matriz de riesgos, THE Sistema_Gestion_Riesgos SHALL permitir hacer clic en cada cuadrante para ver detalles
4. THE Sistema_Gestion_Riesgos SHALL generar alertas visuales para riesgos con nivel crítico (≥20)
5. THE Sistema_Gestion_Riesgos SHALL exportar reportes en formatos PDF, Excel y CSV

### Requerimiento 7

**Historia de Usuario:** Como usuario del sistema, quiero recibir notificaciones oportunas, para que pueda actuar sobre vencimientos y situaciones críticas.

#### Criterios de Aceptación

1. WHEN se aproxima el vencimiento de una actividad, THE Sistema_Gestion_Riesgos SHALL enviar notificación 3 días antes
2. WHEN un riesgo alcanza nivel crítico, THE Sistema_Gestion_Riesgos SHALL notificar inmediatamente al propietario y supervisor
3. WHILE hay hallazgos pendientes de cierre, THE Sistema_Gestion_Riesgos SHALL enviar recordatorios semanales
4. THE Sistema_Gestion_Riesgos SHALL permitir configurar preferencias de notificación por usuario
5. THE Sistema_Gestion_Riesgos SHALL registrar todas las notificaciones enviadas en la bitácora del sistema

### Requerimiento 8

**Historia de Usuario:** Como responsable de cumplimiento, quiero gestionar evidencias y documentación, para que pueda demostrar el cumplimiento normativo en auditorías externas.

#### Criterios de Aceptación

1. WHEN se carga un archivo como evidencia, THE Sistema_Gestion_Riesgos SHALL validar tipo y tamaño según configuración
2. WHEN se busca documentación, THE Sistema_Gestion_Riesgos SHALL permitir filtros por tipo, fecha, proyecto y responsable
3. WHILE se accede a documentos confidenciales, THE Sistema_Gestion_Riesgos SHALL verificar permisos específicos del usuario
4. THE Sistema_Gestion_Riesgos SHALL mantener control de versiones automático para documentos actualizados
5. THE Sistema_Gestion_Riesgos SHALL generar reportes de trazabilidad documental para auditorías externas
