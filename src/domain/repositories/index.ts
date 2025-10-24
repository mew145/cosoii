// =============================================
// EXPORTS: Interfaces de Repositorio
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// Tipos comunes y base
export * from './common'
export * from './IBaseRepository'

// Repositorios COSO
export * from './IUsuarioRepository'
export * from './IRiesgoRepository'
export * from './IProyectoRepository'

// Repositorios ISO 27001
export * from './IActivoRepository'
export * from './IControlISORepository'
export * from './IIncidenteRepository'

// Repositorios de Gestión Documental
export * from './IEvidenciaRepository'

// Repositorios de Notificaciones
export * from './INotificacionRepository'