// =============================================
// EXCEPCIONES DE DOMINIO
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApplicationError'
  }
}

export class InfrastructureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InfrastructureError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(entity: string, id: string | number) {
    super(`${entity} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class DuplicateError extends Error {
  constructor(entity: string, field: string, value: any) {
    super(`${entity} with ${field} '${value}' already exists`)
    this.name = 'DuplicateError'
  }
}

export interface RepositoryError extends Error {
  code: string
  details?: any
}