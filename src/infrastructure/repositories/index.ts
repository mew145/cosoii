// =============================================
// EXPORTS: Repositorios Concretos
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// Repositorio base
export * from './BaseSupabaseRepository'

// Repositorios COSO
export * from './UsuarioRepository'
export * from './RiesgoRepository'

// Repositorios ISO 27001
export * from './ActivoRepository'
export * from './ControlISORepository'
export * from './IncidenteRepository'

// Repositorios de Gestión
export * from './ProyectoRepository'

// Repositorios de Gestión Documental
export * from './EvidenciaRepository'

// Repositorios de Notificaciones
export * from './NotificacionRepository'