// =============================================
// REPOSITORIO CONCRETO: Proyecto con Supabase
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Proyecto, EstadoProyecto } from '@/domain/entities/Proyecto'
import { IProyectoRepository, ProyectoFilters, ProyectoMetrics } from '@/domain/repositories/IProyectoRepository'
import { PaginationOptions, PaginatedResult } from '@/domain/repositories/common'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class ProyectoRepository extends BaseSupabaseRepository<Proyecto, number> implements IProyectoRepository {
  protected tableName = 'proyectos'
  protected primaryKey = 'id_proyecto'

  protected mapFromDatabase(row: any): Proyecto {
    return new Proyecto({
      id: row.id_proyecto,
      idCliente: row.id_cliente,
      nombreProyecto: row.nombre_proyecto,
      descripcionProyecto: row.descripcion_proyecto,
      presupuestoProyecto: row.presupuesto_proyecto,
      fechaInicioProyecto: new Date(row.fecha_inicio_proyecto),
      fechaFinEstimadaProyecto: row.fecha_fin_estimada_proyecto ? new Date(row.fecha_fin_estimada_proyecto) : undefined,
      fechaFinRealProyecto: row.fecha_fin_real_proyecto ? new Date(row.fecha_fin_real_proyecto) : undefined,
      estadoProyecto: row.estado_proyecto as EstadoProyecto,
      porcentajeAvanceProyecto: row.porcentaje_avance_proyecto,
      idGerenteProyecto: row.id_gerente_proyecto,
      fechaRegistro: new Date(row.fecha_registro),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    })
  }

  protected mapToDatabase(entity: Omit<Proyecto, 'id'>): any {
    const plainObject = (entity as any).toPlainObject ? (entity as any).toPlainObject() : entity
    return {
      id_cliente: plainObject.id_cliente,
      nombre_proyecto: plainObject.nombre_proyecto,
      descripcion_proyecto: plainObject.descripcion_proyecto,
      presupuesto_proyecto: plainObject.presupuesto_proyecto,
      fecha_inicio_proyecto: plainObject.fecha_inicio_proyecto,
      fecha_fin_estimada_proyecto: plainObject.fecha_fin_estimada_proyecto,
      fecha_fin_real_proyecto: plainObject.fecha_fin_real_proyecto,
      estado_proyecto: plainObject.estado_proyecto,
      porcentaje_avance_proyecto: plainObject.porcentaje_avance_proyecto,
      id_gerente_proyecto: plainObject.id_gerente_proyecto,
      fecha_registro: plainObject.fecha_registro,
      fecha_actualizacion: plainObject.fecha_actualizacion
    }
  }

  protected mapUpdateToDatabase(updates: Partial<Proyecto>): any {
    return updates as any
  }

  // Implementación de métodos específicos de IProyectoRepository

  async findByCliente(idCliente: number, options?: {
    pagination?: PaginationOptions
    incluirCancelados?: boolean
  }): Promise<PaginatedResult<Proyecto>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('id_cliente', idCliente)

    if (!options?.incluirCancelados) {
      query = query.neq('estado_proyecto', EstadoProyecto.CANCELADO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding projects by client: ${error.message}`)
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

  async findByGerente(idGerente: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<Proyecto>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('id_gerente_proyecto', idGerente)

    if (options?.soloActivos) {
      query = query.in('estado_proyecto', [EstadoProyecto.PLANIFICADO, EstadoProyecto.EN_PROGRESO])
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding projects by manager: ${error.message}`)
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

  async findByEstado(estado: EstadoProyecto, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Proyecto>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { estado_proyecto: estado }
    })
  }

  async findByPresupuestoRange(min: number, max: number): Promise<Proyecto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('presupuesto_proyecto', min)
      .lte('presupuesto_proyecto', max)

    if (error) {
      throw new Error(`Error finding projects by budget range: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByAvanceRange(min: number, max: number): Promise<Proyecto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('porcentaje_avance_proyecto', min)
      .lte('porcentaje_avance_proyecto', max)

    if (error) {
      throw new Error(`Error finding projects by progress range: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByDateRange(
    field: 'fechaInicio' | 'fechaFinEstimada' | 'fechaFinReal',
    from: Date,
    to: Date
  ): Promise<Proyecto[]> {
    const dbField = field === 'fechaInicio' ? 'fecha_inicio_proyecto' :
                   field === 'fechaFinEstimada' ? 'fecha_fin_estimada_proyecto' :
                   'fecha_fin_real_proyecto'

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte(dbField, from.toISOString())
      .lte(dbField, to.toISOString())

    if (error) {
      throw new Error(`Error finding projects by date range: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findActiveProjects(): Promise<Proyecto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('estado_proyecto', [EstadoProyecto.PLANIFICADO, EstadoProyecto.EN_PROGRESO])

    if (error) {
      throw new Error(`Error finding active projects: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findCompletedProjects(options?: {
    pagination?: PaginationOptions
    from?: Date
    to?: Date
  }): Promise<PaginatedResult<Proyecto>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('estado_proyecto', EstadoProyecto.COMPLETADO)

    if (options?.from) {
      query = query.gte('fecha_fin_real_proyecto', options.from.toISOString())
    }

    if (options?.to) {
      query = query.lte('fecha_fin_real_proyecto', options.to.toISOString())
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding completed projects: ${error.message}`)
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

  async findDelayedProjects(): Promise<Proyecto[]> {
    const today = new Date().toISOString()
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('estado_proyecto', [EstadoProyecto.EN_PROGRESO])
      .lt('fecha_fin_estimada_proyecto', today)

    if (error) {
      throw new Error(`Error finding delayed projects: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findProjectsNearDeadline(days: number): Promise<Proyecto[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('estado_proyecto', [EstadoProyecto.EN_PROGRESO])
      .lte('fecha_fin_estimada_proyecto', futureDate.toISOString())
      .gte('fecha_fin_estimada_proyecto', new Date().toISOString())

    if (error) {
      throw new Error(`Error finding projects near deadline: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findProjectsWithoutProgress(days: number): Promise<Proyecto[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('estado_proyecto', [EstadoProyecto.EN_PROGRESO])
      .lt('fecha_actualizacion', cutoffDate.toISOString())

    if (error) {
      throw new Error(`Error finding projects without progress: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async countByEstado(): Promise<{ estado: EstadoProyecto; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_proyecto')

    if (error) {
      throw new Error(`Error counting projects by state: ${error.message}`)
    }

    const counts = new Map<EstadoProyecto, number>()
    data?.forEach(row => {
      const estado = row.estado_proyecto as EstadoProyecto
      const count = counts.get(estado) || 0
      counts.set(estado, count + 1)
    })

    return Array.from(counts.entries()).map(([estado, count]) => ({ estado, count }))
  }

  async countByCliente(): Promise<{ idCliente: number; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_cliente')

    if (error) {
      throw new Error(`Error counting projects by client: ${error.message}`)
    }

    const counts = new Map<number, number>()
    data?.forEach(row => {
      const count = counts.get(row.id_cliente) || 0
      counts.set(row.id_cliente, count + 1)
    })

    return Array.from(counts.entries()).map(([idCliente, count]) => ({ idCliente, count }))
  }

  async countByGerente(): Promise<{ idGerente: number; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_gerente_proyecto')

    if (error) {
      throw new Error(`Error counting projects by manager: ${error.message}`)
    }

    const counts = new Map<number, number>()
    data?.forEach(row => {
      const count = counts.get(row.id_gerente_proyecto) || 0
      counts.set(row.id_gerente_proyecto, count + 1)
    })

    return Array.from(counts.entries()).map(([idGerente, count]) => ({ idGerente, count }))
  }

  async getProjectMetrics(): Promise<ProyectoMetrics> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_proyecto, porcentaje_avance_proyecto, presupuesto_proyecto, fecha_fin_estimada_proyecto')

    if (error) {
      throw new Error(`Error getting project metrics: ${error.message}`)
    }

    const totalProyectos = data?.length || 0
    const proyectosActivos = data?.filter(p => 
      [EstadoProyecto.PLANIFICADO, EstadoProyecto.EN_PROGRESO].includes(p.estado_proyecto)
    ).length || 0
    const proyectosCompletados = data?.filter(p => p.estado_proyecto === EstadoProyecto.COMPLETADO).length || 0
    const proyectosCancelados = data?.filter(p => p.estado_proyecto === EstadoProyecto.CANCELADO).length || 0

    const avancePromedio = data?.length ? 
      data.reduce((sum, p) => sum + p.porcentaje_avance_proyecto, 0) / data.length : 0

    const presupuestoTotal = data?.reduce((sum, p) => sum + (p.presupuesto_proyecto || 0), 0) || 0

    const today = new Date()
    const proyectosRetrasados = data?.filter(p => 
      p.estado_proyecto === EstadoProyecto.EN_PROGRESO &&
      p.fecha_fin_estimada_proyecto &&
      new Date(p.fecha_fin_estimada_proyecto) < today
    ).length || 0

    const proyectosEnTiempo = proyectosActivos - proyectosRetrasados

    return {
      totalProyectos,
      proyectosActivos,
      proyectosCompletados,
      proyectosCancelados,
      avancePromedio: Math.round(avancePromedio * 100) / 100,
      presupuestoTotal,
      proyectosRetrasados,
      proyectosEnTiempo
    }
  }

  // Métodos de gestión
  async updateProgress(id: number, avance: number): Promise<Proyecto> {
    const updates: any = {
      porcentaje_avance_proyecto: avance,
      fecha_actualizacion: new Date().toISOString()
    }

    if (avance === 100) {
      updates.estado_proyecto = EstadoProyecto.COMPLETADO
      updates.fecha_fin_real_proyecto = new Date().toISOString()
    }

    return this.update(id, updates)
  }

  async changeState(id: number, estado: EstadoProyecto): Promise<Proyecto> {
    const updates: any = {
      estado_proyecto: estado,
      fecha_actualizacion: new Date().toISOString()
    }

    if (estado === EstadoProyecto.COMPLETADO) {
      updates.fecha_fin_real_proyecto = new Date().toISOString()
    }

    return this.update(id, updates)
  }

  async assignManager(id: number, idGerente: number): Promise<Proyecto> {
    return this.update(id, {
      id_gerente_proyecto: idGerente,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async updateBudget(id: number, presupuesto: number): Promise<Proyecto> {
    return this.update(id, {
      presupuesto_proyecto: presupuesto,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async updateDates(id: number, fechaInicio?: Date, fechaFinEstimada?: Date): Promise<Proyecto> {
    const updates: any = {
      fecha_actualizacion: new Date().toISOString()
    }

    if (fechaInicio) {
      updates.fecha_inicio_proyecto = fechaInicio.toISOString()
    }

    if (fechaFinEstimada) {
      updates.fecha_fin_estimada_proyecto = fechaFinEstimada.toISOString()
    }

    return this.update(id, updates)
  }

  // Validaciones
  async validateManagerWorkload(idGerente: number, excludeProjectId?: number): Promise<{
    isValid: boolean
    currentProjects: number
    maxRecommended: number
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select('id_proyecto')
      .eq('id_gerente_proyecto', idGerente)
      .in('estado_proyecto', [EstadoProyecto.PLANIFICADO, EstadoProyecto.EN_PROGRESO])

    if (excludeProjectId) {
      query = query.neq('id_proyecto', excludeProjectId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error validating manager workload: ${error.message}`)
    }

    const currentProjects = data?.length || 0
    const maxRecommended = 5 // Máximo recomendado de proyectos activos por gerente

    return {
      isValid: currentProjects < maxRecommended,
      currentProjects,
      maxRecommended
    }
  }

  async validateBudgetAllocation(idCliente: number, presupuesto: number): Promise<{
    isValid: boolean
    totalBudget: number
    availableBudget: number
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('presupuesto_proyecto')
      .eq('id_cliente', idCliente)
      .neq('estado_proyecto', EstadoProyecto.CANCELADO)

    if (error) {
      throw new Error(`Error validating budget allocation: ${error.message}`)
    }

    const totalBudget = data?.reduce((sum, p) => sum + (p.presupuesto_proyecto || 0), 0) || 0
    const availableBudget = Math.max(0, 10000000 - totalBudget) // Límite ejemplo de 10M

    return {
      isValid: presupuesto <= availableBudget,
      totalBudget,
      availableBudget
    }
  }

  // Implementación simplificada de métodos restantes
  async getClientMetrics(idCliente: number): Promise<any> {
    return {}
  }

  async getManagerMetrics(idGerente: number): Promise<any> {
    return {}
  }

  async getProjectTrends(from: Date, to: Date): Promise<any[]> {
    return []
  }

  async getCompletionRates(period: 'month' | 'quarter' | 'year'): Promise<any[]> {
    return []
  }

  async findSimilarProjects(proyecto: Proyecto, limit?: number): Promise<Proyecto[]> {
    return []
  }

  async findProjectsByRiskLevel(nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico'): Promise<Proyecto[]> {
    return []
  }

  async getProjectReport(filters: ProyectoFilters): Promise<any> {
    return {}
  }

  async getPortfolioAnalysis(): Promise<any> {
    return {}
  }
}