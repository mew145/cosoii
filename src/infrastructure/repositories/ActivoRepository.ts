// =============================================
// REPOSITORIO CONCRETO: Activo de Información con Supabase
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ActivoInformacion, TipoActivo, ClasificacionSeguridad, EstadoActivo, ValorActivo } from '@/domain/entities/ActivoInformacion'
import { IActivoRepository, ActivoFilters, ActivoMetrics } from '@/domain/repositories/IActivoRepository'
import { PaginationOptions, PaginatedResult } from '@/domain/repositories/common'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class ActivoRepository extends BaseSupabaseRepository<ActivoInformacion, number> implements IActivoRepository {
  protected tableName = 'activos_informacion'
  protected primaryKey = 'id_activo'

  protected mapFromDatabase(row: any): ActivoInformacion {
    return new ActivoInformacion({
      id: row.id_activo,
      nombreActivo: row.nombre_activo,
      descripcionActivo: row.descripcion_activo,
      tipoActivo: row.tipo_activo as TipoActivo,
      clasificacionSeguridad: row.clasificacion_seguridad as ClasificacionSeguridad,
      propietarioActivo: row.propietario_activo,
      custodioActivo: row.custodio_activo,
      ubicacionActivo: row.ubicacion_activo,
      valorActivo: row.valor_activo as ValorActivo,
      estadoActivo: row.estado_activo as EstadoActivo,
      fechaRegistro: new Date(row.fecha_registro),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    })
  }

  protected mapToDatabase(entity: Omit<ActivoInformacion, 'id'>): any {
    const plainObject = (entity as any).toPlainObject ? (entity as any).toPlainObject() : entity
    return {
      nombre_activo: plainObject.nombre_activo,
      descripcion_activo: plainObject.descripcion_activo,
      tipo_activo: plainObject.tipo_activo,
      clasificacion_seguridad: plainObject.clasificacion_seguridad,
      propietario_activo: plainObject.propietario_activo,
      custodio_activo: plainObject.custodio_activo,
      ubicacion_activo: plainObject.ubicacion_activo,
      valor_activo: plainObject.valor_activo,
      estado_activo: plainObject.estado_activo,
      fecha_registro: plainObject.fecha_registro,
      fecha_actualizacion: plainObject.fecha_actualizacion
    }
  }

  protected mapUpdateToDatabase(updates: Partial<ActivoInformacion>): any {
    return updates as any
  }

  // Implementación de métodos específicos de IActivoRepository

  async findByTipo(tipo: TipoActivo, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<ActivoInformacion>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('tipo_activo', tipo)

    if (options?.soloActivos) {
      query = query.eq('estado_activo', EstadoActivo.ACTIVO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding assets by type: ${error.message}`)
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

  async findByClasificacion(clasificacion: ClasificacionSeguridad, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { clasificacion_seguridad: clasificacion }
    })
  }

  async findConfidenciales(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('clasificacion_seguridad', [ClasificacionSeguridad.CONFIDENCIAL, ClasificacionSeguridad.RESTRINGIDO])

    if (error) {
      throw new Error(`Error finding confidential assets: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findRestringidos(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('clasificacion_seguridad', ClasificacionSeguridad.RESTRINGIDO)

    if (error) {
      throw new Error(`Error finding restricted assets: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByValor(valor: ValorActivo, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { valor_activo: valor }
    })
  }

  async findCriticos(options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .gte('valor_activo', 4)

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding critical assets: ${error.message}`)
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

  async findByValorRange(min: ValorActivo, max: ValorActivo): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('valor_activo', min)
      .lte('valor_activo', max)

    if (error) {
      throw new Error(`Error finding assets by value range: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByPropietario(idPropietario: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<ActivoInformacion>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('propietario_activo', idPropietario)

    if (options?.soloActivos) {
      query = query.eq('estado_activo', EstadoActivo.ACTIVO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding assets by owner: ${error.message}`)
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

  async findByCustodio(idCustodio: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<ActivoInformacion>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('custodio_activo', idCustodio)

    if (options?.soloActivos) {
      query = query.eq('estado_activo', EstadoActivo.ACTIVO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding assets by custodian: ${error.message}`)
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

  async findSinCustodio(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .is('custodio_activo', null)

    if (error) {
      throw new Error(`Error finding assets without custodian: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByUbicacion(ubicacion: string): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('ubicacion_activo', ubicacion)

    if (error) {
      throw new Error(`Error finding assets by location: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findSinUbicacion(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .is('ubicacion_activo', null)

    if (error) {
      throw new Error(`Error finding assets without location: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByEstado(estado: EstadoActivo, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { estado_activo: estado }
    })
  }

  async findActivos(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_activo', EstadoActivo.ACTIVO)

    if (error) {
      throw new Error(`Error finding active assets: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findInactivos(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_activo', EstadoActivo.INACTIVO)

    if (error) {
      throw new Error(`Error finding inactive assets: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findRetirados(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_activo', EstadoActivo.RETIRADO)

    if (error) {
      throw new Error(`Error finding retired assets: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findEnMantenimiento(): Promise<ActivoInformacion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_activo', EstadoActivo.EN_MANTENIMIENTO)

    if (error) {
      throw new Error(`Error finding assets in maintenance: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  // Estadísticas y métricas
  async countByTipo(): Promise<{ tipo: TipoActivo; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('tipo_activo')

    if (error) {
      throw new Error(`Error counting assets by type: ${error.message}`)
    }

    const counts = new Map<TipoActivo, number>()
    data?.forEach(row => {
      const tipo = row.tipo_activo as TipoActivo
      const count = counts.get(tipo) || 0
      counts.set(tipo, count + 1)
    })

    return Array.from(counts.entries()).map(([tipo, count]) => ({ tipo, count }))
  }

  async countByClasificacion(): Promise<{ clasificacion: ClasificacionSeguridad; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('clasificacion_seguridad')

    if (error) {
      throw new Error(`Error counting assets by classification: ${error.message}`)
    }

    const counts = new Map<ClasificacionSeguridad, number>()
    data?.forEach(row => {
      const clasificacion = row.clasificacion_seguridad as ClasificacionSeguridad
      const count = counts.get(clasificacion) || 0
      counts.set(clasificacion, count + 1)
    })

    return Array.from(counts.entries()).map(([clasificacion, count]) => ({ clasificacion, count }))
  }

  async countByValor(): Promise<{ valor: ValorActivo; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('valor_activo')

    if (error) {
      throw new Error(`Error counting assets by value: ${error.message}`)
    }

    const counts = new Map<ValorActivo, number>()
    data?.forEach(row => {
      const valor = row.valor_activo as ValorActivo
      const count = counts.get(valor) || 0
      counts.set(valor, count + 1)
    })

    return Array.from(counts.entries()).map(([valor, count]) => ({ valor, count }))
  }

  async countByEstado(): Promise<{ estado: EstadoActivo; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_activo')

    if (error) {
      throw new Error(`Error counting assets by state: ${error.message}`)
    }

    const counts = new Map<EstadoActivo, number>()
    data?.forEach(row => {
      const estado = row.estado_activo as EstadoActivo
      const count = counts.get(estado) || 0
      counts.set(estado, count + 1)
    })

    return Array.from(counts.entries()).map(([estado, count]) => ({ estado, count }))
  }

  async countByPropietario(): Promise<{ idPropietario: number; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('propietario_activo')

    if (error) {
      throw new Error(`Error counting assets by owner: ${error.message}`)
    }

    const counts = new Map<number, number>()
    data?.forEach(row => {
      const count = counts.get(row.propietario_activo) || 0
      counts.set(row.propietario_activo, count + 1)
    })

    return Array.from(counts.entries()).map(([idPropietario, count]) => ({ idPropietario, count }))
  }

  async countByUbicacion(): Promise<{ ubicacion: string; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('ubicacion_activo')
      .not('ubicacion_activo', 'is', null)

    if (error) {
      throw new Error(`Error counting assets by location: ${error.message}`)
    }

    const counts = new Map<string, number>()
    data?.forEach(row => {
      const ubicacion = row.ubicacion_activo
      const count = counts.get(ubicacion) || 0
      counts.set(ubicacion, count + 1)
    })

    return Array.from(counts.entries()).map(([ubicacion, count]) => ({ ubicacion, count }))
  }

  async getActivoMetrics(): Promise<ActivoMetrics> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_activo, valor_activo, clasificacion_seguridad, tipo_activo')

    if (error) {
      throw new Error(`Error getting asset metrics: ${error.message}`)
    }

    const totalActivos = data?.length || 0
    const activosActivos = data?.filter(a => a.estado_activo === EstadoActivo.ACTIVO).length || 0
    const activosCriticos = data?.filter(a => a.valor_activo >= 4).length || 0
    const activosConfidenciales = data?.filter(a => 
      [ClasificacionSeguridad.CONFIDENCIAL, ClasificacionSeguridad.RESTRINGIDO].includes(a.clasificacion_seguridad)
    ).length || 0

    const distribucionPorTipo = await this.countByTipo()
    const distribucionPorClasificacion = await this.countByClasificacion()
    const distribucionPorValor = await this.countByValor()

    return {
      totalActivos,
      activosActivos,
      activosCriticos,
      activosConfidenciales,
      distribucionPorTipo,
      distribucionPorClasificacion,
      distribucionPorValor
    }
  }

  // Métodos de gestión
  async reclassify(id: number, nuevaClasificacion: ClasificacionSeguridad): Promise<ActivoInformacion> {
    return this.update(id, {
      clasificacion_seguridad: nuevaClasificacion,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async revalue(id: number, nuevoValor: ValorActivo): Promise<ActivoInformacion> {
    return this.update(id, {
      valor_activo: nuevoValor,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async changeState(id: number, nuevoEstado: EstadoActivo): Promise<ActivoInformacion> {
    return this.update(id, {
      estado_activo: nuevoEstado,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async assignOwner(id: number, idPropietario: number): Promise<ActivoInformacion> {
    return this.update(id, {
      propietario_activo: idPropietario,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async assignCustodian(id: number, idCustodio?: number): Promise<ActivoInformacion> {
    return this.update(id, {
      custodio_activo: idCustodio,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async updateLocation(id: number, ubicacion?: string): Promise<ActivoInformacion> {
    return this.update(id, {
      ubicacion_activo: ubicacion,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  // Validaciones
  async validateOwnershipAssignment(idPropietario: number): Promise<{
    isValid: boolean
    currentAssets: number
    maxRecommended: number
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_activo')
      .eq('propietario_activo', idPropietario)
      .eq('estado_activo', EstadoActivo.ACTIVO)

    if (error) {
      throw new Error(`Error validating ownership assignment: ${error.message}`)
    }

    const currentAssets = data?.length || 0
    const maxRecommended = 20 // Máximo recomendado de activos por propietario

    return {
      isValid: currentAssets < maxRecommended,
      currentAssets,
      maxRecommended
    }
  }

  async validateCustodianAssignment(idCustodio: number): Promise<{
    isValid: boolean
    currentAssets: number
    maxRecommended: number
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_activo')
      .eq('custodio_activo', idCustodio)
      .eq('estado_activo', EstadoActivo.ACTIVO)

    if (error) {
      throw new Error(`Error validating custodian assignment: ${error.message}`)
    }

    const currentAssets = data?.length || 0
    const maxRecommended = 30 // Máximo recomendado de activos por custodio

    return {
      isValid: currentAssets < maxRecommended,
      currentAssets,
      maxRecommended
    }
  }

  // Implementación simplificada de métodos restantes
  async getAssetRiskProfile(idActivo: number): Promise<any> {
    return {}
  }

  async getHighRiskAssets(): Promise<any[]> {
    return []
  }

  async findActivosRequierenRevision(): Promise<ActivoInformacion[]> {
    return []
  }

  async findActivosSinControles(): Promise<ActivoInformacion[]> {
    return []
  }

  async findActivosConClasificacionIncorrecta(): Promise<any[]> {
    return []
  }

  async findActivosDuplicados(): Promise<any[]> {
    return []
  }

  async getInventoryReport(): Promise<any> {
    return {}
  }

  async getComplianceReport(): Promise<any> {
    return {}
  }

  async getAssetTrends(from: Date, to: Date): Promise<any[]> {
    return []
  }
}