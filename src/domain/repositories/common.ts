// =============================================
// TIPOS COMUNES PARA REPOSITORIOS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterOptions {
  [key: string]: any
}

export interface SearchOptions {
  query: string
  fields: string[]
}

export interface DateRangeFilter {
  from?: Date
  to?: Date
}

// Las clases de error se importan desde exceptions
export type { RepositoryError } from '../exceptions'