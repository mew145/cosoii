// =============================================
// INTERFAZ BASE PARA REPOSITORIOS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { PaginationOptions, PaginatedResult, SortOptions, FilterOptions, SearchOptions } from './common'

export interface IBaseRepository<T, TId = number> {
  // Operaciones CRUD básicas
  findById(id: TId): Promise<T | null>
  findAll(options?: {
    pagination?: PaginationOptions
    sort?: SortOptions[]
    filters?: FilterOptions
  }): Promise<PaginatedResult<T>>
  
  create(entity: Omit<T, 'id'>): Promise<T>
  update(id: TId, updates: Partial<T>): Promise<T>
  delete(id: TId): Promise<boolean>
  
  // Operaciones de búsqueda
  search(options: SearchOptions & {
    pagination?: PaginationOptions
    sort?: SortOptions[]
    filters?: FilterOptions
  }): Promise<PaginatedResult<T>>
  
  // Operaciones de existencia
  exists(id: TId): Promise<boolean>
  count(filters?: FilterOptions): Promise<number>
  
  // Operaciones por lotes
  createMany(entities: Omit<T, 'id'>[]): Promise<T[]>
  updateMany(ids: TId[], updates: Partial<T>): Promise<T[]>
  deleteMany(ids: TId[]): Promise<boolean>
  
  // Operaciones de validación
  validateUnique(field: keyof T, value: any, excludeId?: TId): Promise<boolean>
}