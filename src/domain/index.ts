// =============================================
// CAPA DE DOMINIO - EXPORTS PRINCIPALES
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// Esta capa contiene la lógica de negocio pura, entidades de dominio,
// value objects, servicios de dominio e interfaces de repositorio.
// No debe tener dependencias externas.

// Entidades de dominio
export * from './entities'

// Value Objects
export * from './value-objects'

// Servicios de dominio
export * from './services'

// Casos de uso
export * from './use-cases'

// Interfaces de repositorio
export * from './repositories'

// Enums y tipos de dominio
export * from './types'

// Excepciones de dominio
export * from './exceptions'
