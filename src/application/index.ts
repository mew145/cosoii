// =============================================
// CAPA DE APLICACIÓN - EXPORTS PRINCIPALES
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// Esta capa contiene los casos de uso, servicios de aplicación,
// DTOs, comandos, queries y orquestación de la lógica de negocio.
// Coordina entre la capa de dominio y la infraestructura.

// Casos de uso
export * from './use-cases'

// Servicios de aplicación
export * from './services'

// DTOs (Data Transfer Objects)
export * from './dtos'

// Comandos y Queries (CQRS) - TODO: Implementar cuando sea necesario
// export * from './commands'
// export * from './queries'

// Interfaces de servicios externos - TODO: Implementar cuando sea necesario
// export * from './interfaces'

// Validadores - TODO: Implementar cuando sea necesario
// export * from './validators'

// Export vacío para que el archivo sea un módulo válido
export {}
