// =============================================
// REPOSITORIO BASE SUPABASE
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { createClient } from '@/lib/supabase/client'
import { 
  IBaseRepository, 
  PaginationOptions, 
  PaginatedResult, 
  SortOptions, 
  FilterOptions, 
  SearchOptions
} from '@/domain/repositories'
import { NotFoundError, DuplicateError, ValidationError } from '@/domain/exceptions'

export abstract class BaseSupabaseRepository<T, TId = number> implements IBaseRepository<T, TId> {
  protected supabase = createClient()
  protected abstract tableName: string
  protected abstract primaryKey: string

  // Mappers abstractos que deben implementar las clases hijas
  protected abstract mapFromDatabase(row: any): T
  protected abstract mapToDatabase(entity: Omit<T, 'id'>): any
  protected abstract mapUpdateToDatabase(updates: Partial<T>): any

  async findById(id: TId): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq(this.primaryKey, id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      throw new Error(`Error finding ${this.tableName}: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async findAll(options?: {
    pagination?: PaginationOptions
    sort?: SortOptions[]
    filters?: FilterOptions
  }): Promise<PaginatedResult<T>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })

    // Aplicar filtros
    if (options?.filters) {
      query = this.applyFilters(query, options.filters)
    }

    // Aplicar ordenamiento
    if (options?.sort && options.sort.length > 0) {
      for (const sort of options.sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' })
      }
    }

    // Aplicar paginación
    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding all ${this.tableName}: ${error.message}`)
    }

    const items = data?.map(row => this.mapFromDatabase(row)) || []
    const total = count || 0
    const page = options?.pagination?.page || 1
    const limit = options?.pagination?.limit || total
    const totalPages = Math.ceil(total / limit)

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const dbEntity = this.mapToDatabase(entity)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(dbEntity)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new DuplicateError(this.tableName, 'field', 'value')
      }
      throw new Error(`Error creating ${this.tableName}: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async update(id: TId, updates: Partial<T>): Promise<T> {
    const dbUpdates = this.mapUpdateToDatabase(updates)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(dbUpdates)
      .eq(this.primaryKey, id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(this.tableName, id as string)
      }
      throw new Error(`Error updating ${this.tableName}: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async delete(id: TId): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq(this.primaryKey, id)

    if (error) {
      throw new Error(`Error deleting ${this.tableName}: ${error.message}`)
    }

    return true
  }

  async search(options: SearchOptions & {
    pagination?: PaginationOptions
    sort?: SortOptions[]
    filters?: FilterOptions
  }): Promise<PaginatedResult<T>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })

    // Aplicar búsqueda de texto
    if (options.query && options.fields.length > 0) {
      const searchConditions = options.fields.map(field => 
        `${field}.ilike.%${options.query}%`
      ).join(',')
      query = query.or(searchConditions)
    }

    // Aplicar filtros adicionales
    if (options.filters) {
      query = this.applyFilters(query, options.filters)
    }

    // Aplicar ordenamiento
    if (options.sort && options.sort.length > 0) {
      for (const sort of options.sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' })
      }
    }

    // Aplicar paginación
    if (options.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error searching ${this.tableName}: ${error.message}`)
    }

    const items = data?.map(row => this.mapFromDatabase(row)) || []
    const total = count || 0
    const page = options.pagination?.page || 1
    const limit = options.pagination?.limit || total
    const totalPages = Math.ceil(total / limit)

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  }

  async exists(id: TId): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(this.primaryKey)
      .eq(this.primaryKey, id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking existence in ${this.tableName}: ${error.message}`)
    }

    return !!data
  }

  async count(filters?: FilterOptions): Promise<number> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true })

    if (filters) {
      query = this.applyFilters(query, filters)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Error counting ${this.tableName}: ${error.message}`)
    }

    return count || 0
  }

  async createMany(entities: Omit<T, 'id'>[]): Promise<T[]> {
    const dbEntities = entities.map(entity => this.mapToDatabase(entity))
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(dbEntities)
      .select()

    if (error) {
      throw new Error(`Error creating multiple ${this.tableName}: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async updateMany(ids: TId[], updates: Partial<T>): Promise<T[]> {
    const dbUpdates = this.mapUpdateToDatabase(updates)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(dbUpdates)
      .in(this.primaryKey, ids)
      .select()

    if (error) {
      throw new Error(`Error updating multiple ${this.tableName}: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async deleteMany(ids: TId[]): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .in(this.primaryKey, ids)

    if (error) {
      throw new Error(`Error deleting multiple ${this.tableName}: ${error.message}`)
    }

    return true
  }

  async validateUnique(field: keyof T, value: any, excludeId?: TId): Promise<boolean> {
    let query = this.supabase
      .from(this.tableName)
      .select(this.primaryKey)
      .eq(field as string, value)

    if (excludeId) {
      query = query.neq(this.primaryKey, excludeId)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error validating uniqueness in ${this.tableName}: ${error.message}`)
    }

    return !data // Es único si no se encontró ningún registro
  }

  // Método auxiliar para aplicar filtros
  protected applyFilters(query: any, filters: FilterOptions): any {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object' && value.from && value.to) {
          // Filtro de rango de fechas
          query = query.gte(key, value.from).lte(key, value.to)
        } else {
          query = query.eq(key, value)
        }
      }
    }
    return query
  }

  // Método auxiliar para construir consultas complejas
  protected buildComplexQuery(baseQuery: any, options: {
    joins?: string[]
    conditions?: string[]
    groupBy?: string[]
  }): any {
    let query = baseQuery

    // Aplicar joins si se especifican
    if (options.joins) {
      for (const join of options.joins) {
        query = query.select(join)
      }
    }

    // Aplicar condiciones adicionales
    if (options.conditions) {
      for (const condition of options.conditions) {
        query = query.or(condition)
      }
    }

    return query
  }
}