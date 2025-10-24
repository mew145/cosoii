// =============================================
// REPOSITORIO CONCRETO: Control ISO 27001 con Supabase
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ControlISO27001, TipoControl, CategoriaControl, EstadoImplementacion, NivelMadurez } from '@/domain/entities/ControlISO27001'
import { IControlISORepository, ControlFilters, ControlMetrics } from '@/domain/repositories/IControlISORepository'
import { PaginationOptions, PaginatedResult } from '@/domain/repositories/common'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class ControlISORepository extends BaseSupabaseRepository<ControlISO27001, number> implements IControlISORepository {
  protected tableName = 'controles_iso27001'
  protected primaryKey = 'id_control'

  protected mapFromDatabase(row: any): ControlISO27001 {
    return new ControlISO27001({
      id: row.id_control,
      codigoControl: row.codigo_control,
      nombreControl: row.nombre_control,
      descripcionControl: row.descripcion_control,
      dominioControl: row.dominio_control,
      tipoControl: row.tipo_control as TipoControl,
      categoriaControl: row.categoria_control as CategoriaControl,
      estadoImplementacion: row.estado_implementacion as EstadoImplementacion,
      nivelMadurez: row.nivel_madurez as NivelMadurez,
      responsableControl: row.responsable_control,
      fechaImplementacion: row.fecha_implementacion ? new Date(row.fecha_implementacion) : undefined,
      fechaRevision: new Date(row.fecha_revision),
      evidenciasControl: row.evidencias_control || [],
      fechaRegistro: new Date(row.fecha_registro),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    })
  }

  protected mapToDatabase(entity: Omit<ControlISO27001, 'id'>): any {
    const plainObject = (entity as any).toPlainObject ? (entity as any).toPlainObject() : entity
    return {
      codigo_control: plainObject.codigo_control,
      nombre_control: plainObject.nombre_control,
      descripcion_control: plainObject.descripcion_control,
      dominio_control: plainObject.dominio_control,
      tipo_control: plainObject.tipo_control,
      categoria_control: plainObject.categoria_control,
      estado_implementacion: plainObject.estado_implementacion,
      nivel_madurez: plainObject.nivel_madurez,
      responsable_control: plainObject.responsable_control,
      fecha_implementacion: plainObject.fecha_implementacion,
      fecha_revision: plainObject.fecha_revision,
      evidencias_control: plainObject.evidencias_control,
      fecha_registro: plainObject.fecha_registro,
      fecha_actualizacion: plainObject.fecha_actualizacion
    }
  }

  protected mapUpdateToDatabase(updates: Partial<ControlISO27001>): any {
    return updates as any
  }

  // Implementación de métodos específicos de IControlISORepository

  async findByCode(codigo: string): Promise<ControlISO27001 | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('codigo_control', codigo)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error finding control by code: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async findByDomain(dominio: string, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { dominio_control: dominio }
    })
  }

  async findByDomainNumber(numeroDominio: number): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .like('codigo_control', `A.${numeroDominio}.%`)

    if (error) {
      throw new Error(`Error finding controls by domain number: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByTipo(tipo: TipoControl, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { tipo_control: tipo }
    })
  }

  async findByCategoria(categoria: CategoriaControl, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { categoria_control: categoria }
    })
  }

  async findByEstado(estado: EstadoImplementacion, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { estado_implementacion: estado }
    })
  }

  async findImplementados(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_implementacion', EstadoImplementacion.IMPLEMENTADO)

    if (error) {
      throw new Error(`Error finding implemented controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findNoImplementados(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_implementacion', EstadoImplementacion.NO_IMPLEMENTADO)

    if (error) {
      throw new Error(`Error finding non-implemented controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findParcialmenteImplementados(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_implementacion', EstadoImplementacion.PARCIALMENTE_IMPLEMENTADO)

    if (error) {
      throw new Error(`Error finding partially implemented controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findNoAplicables(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_implementacion', EstadoImplementacion.NO_APLICABLE)

    if (error) {
      throw new Error(`Error finding non-applicable controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByNivelMadurez(nivel: NivelMadurez, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>> {
    return this.findAll({
      pagination: options?.pagination,
      filters: { nivel_madurez: nivel }
    })
  }

  async findByMadurezRange(min: NivelMadurez, max: NivelMadurez): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('nivel_madurez', min)
      .lte('nivel_madurez', max)

    if (error) {
      throw new Error(`Error finding controls by maturity range: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findEfectivos(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_implementacion', EstadoImplementacion.IMPLEMENTADO)
      .gte('nivel_madurez', 3)

    if (error) {
      throw new Error(`Error finding effective controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findMaduros(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('nivel_madurez', 4)

    if (error) {
      throw new Error(`Error finding mature controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findRequierenAtencion(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .or('estado_implementacion.eq.no_implementado,and(estado_implementacion.eq.parcialmente_implementado,nivel_madurez.lt.2)')

    if (error) {
      throw new Error(`Error finding controls requiring attention: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByResponsable(idResponsable: number, options?: {
    pagination?: PaginationOptions
    soloImplementados?: boolean
  }): Promise<PaginatedResult<ControlISO27001>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('responsable_control', idResponsable)

    if (options?.soloImplementados) {
      query = query.eq('estado_implementacion', EstadoImplementacion.IMPLEMENTADO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding controls by responsible: ${error.message}`)
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

  async findRequierenRevision(): Promise<ControlISO27001[]> {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('fecha_revision', sixMonthsAgo.toISOString())

    if (error) {
      throw new Error(`Error finding controls requiring review: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findImplementadosEnPeriodo(from: Date, to: Date): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('fecha_implementacion', from.toISOString())
      .lte('fecha_implementacion', to.toISOString())

    if (error) {
      throw new Error(`Error finding controls implemented in period: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findVencidos(dias?: number): Promise<ControlISO27001[]> {
    const cutoffDate = new Date()
    if (dias) {
      cutoffDate.setDate(cutoffDate.getDate() - dias)
    } else {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6) // Por defecto 6 meses
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('fecha_revision', cutoffDate.toISOString())

    if (error) {
      throw new Error(`Error finding overdue controls: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findConEvidencias(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .not('evidencias_control', 'is', null)
      .neq('evidencias_control', '[]')

    if (error) {
      throw new Error(`Error finding controls with evidence: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findSinEvidencias(): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .or('evidencias_control.is.null,evidencias_control.eq.[]')

    if (error) {
      throw new Error(`Error finding controls without evidence: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findByEvidencia(evidencia: string): Promise<ControlISO27001[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .contains('evidencias_control', [evidencia])

    if (error) {
      throw new Error(`Error finding controls by evidence: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  // Estadísticas y métricas
  async countByTipo(): Promise<{ tipo: TipoControl; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('tipo_control')

    if (error) {
      throw new Error(`Error counting controls by type: ${error.message}`)
    }

    const counts = new Map<TipoControl, number>()
    data?.forEach(row => {
      const tipo = row.tipo_control as TipoControl
      const count = counts.get(tipo) || 0
      counts.set(tipo, count + 1)
    })

    return Array.from(counts.entries()).map(([tipo, count]) => ({ tipo, count }))
  }

  async countByCategoria(): Promise<{ categoria: CategoriaControl; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('categoria_control')

    if (error) {
      throw new Error(`Error counting controls by category: ${error.message}`)
    }

    const counts = new Map<CategoriaControl, number>()
    data?.forEach(row => {
      const categoria = row.categoria_control as CategoriaControl
      const count = counts.get(categoria) || 0
      counts.set(categoria, count + 1)
    })

    return Array.from(counts.entries()).map(([categoria, count]) => ({ categoria, count }))
  }

  async countByEstado(): Promise<{ estado: EstadoImplementacion; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_implementacion')

    if (error) {
      throw new Error(`Error counting controls by state: ${error.message}`)
    }

    const counts = new Map<EstadoImplementacion, number>()
    data?.forEach(row => {
      const estado = row.estado_implementacion as EstadoImplementacion
      const count = counts.get(estado) || 0
      counts.set(estado, count + 1)
    })

    return Array.from(counts.entries()).map(([estado, count]) => ({ estado, count }))
  }

  async countByMadurez(): Promise<{ nivel: NivelMadurez; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('nivel_madurez')

    if (error) {
      throw new Error(`Error counting controls by maturity: ${error.message}`)
    }

    const counts = new Map<NivelMadurez, number>()
    data?.forEach(row => {
      const nivel = row.nivel_madurez as NivelMadurez
      const count = counts.get(nivel) || 0
      counts.set(nivel, count + 1)
    })

    return Array.from(counts.entries()).map(([nivel, count]) => ({ nivel, count }))
  }

  async countByDominio(): Promise<{ dominio: string; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('dominio_control')

    if (error) {
      throw new Error(`Error counting controls by domain: ${error.message}`)
    }

    const counts = new Map<string, number>()
    data?.forEach(row => {
      const dominio = row.dominio_control
      const count = counts.get(dominio) || 0
      counts.set(dominio, count + 1)
    })

    return Array.from(counts.entries()).map(([dominio, count]) => ({ dominio, count }))
  }

  async countByResponsable(): Promise<{ idResponsable: number; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('responsable_control')

    if (error) {
      throw new Error(`Error counting controls by responsible: ${error.message}`)
    }

    const counts = new Map<number, number>()
    data?.forEach(row => {
      const count = counts.get(row.responsable_control) || 0
      counts.set(row.responsable_control, count + 1)
    })

    return Array.from(counts.entries()).map(([idResponsable, count]) => ({ idResponsable, count }))
  }

  async getControlMetrics(): Promise<ControlMetrics> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_implementacion, nivel_madurez, tipo_control, categoria_control, fecha_revision')

    if (error) {
      throw new Error(`Error getting control metrics: ${error.message}`)
    }

    const totalControles = data?.length || 0
    const controlesImplementados = data?.filter(c => c.estado_implementacion === EstadoImplementacion.IMPLEMENTADO).length || 0
    const controlesEfectivos = data?.filter(c => 
      c.estado_implementacion === EstadoImplementacion.IMPLEMENTADO && c.nivel_madurez >= 3
    ).length || 0

    const porcentajeImplementacion = totalControles > 0 ? (controlesImplementados / totalControles) * 100 : 0
    const porcentajeEfectividad = totalControles > 0 ? (controlesEfectivos / totalControles) * 100 : 0

    const madurezPromedio = data?.length ? 
      data.reduce((sum, c) => sum + c.nivel_madurez, 0) / data.length : 0

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const controlesVencidos = data?.filter(c => new Date(c.fecha_revision) < sixMonthsAgo).length || 0

    const distribucionPorTipo = await this.countByTipo()
    const distribucionPorCategoria = await this.countByCategoria()
    const distribucionPorEstado = await this.countByEstado()
    const distribucionPorMadurez = await this.countByMadurez()

    return {
      totalControles,
      controlesImplementados,
      controlesEfectivos,
      porcentajeImplementacion: Math.round(porcentajeImplementacion * 100) / 100,
      porcentajeEfectividad: Math.round(porcentajeEfectividad * 100) / 100,
      madurezPromedio: Math.round(madurezPromedio * 100) / 100,
      controlesVencidos,
      distribucionPorTipo,
      distribucionPorCategoria,
      distribucionPorEstado,
      distribucionPorMadurez
    }
  }

  // Métodos de gestión
  async implement(id: number): Promise<ControlISO27001> {
    return this.update(id, {
      estado_implementacion: EstadoImplementacion.IMPLEMENTADO,
      fecha_implementacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async updateMaturity(id: number, nivel: NivelMadurez): Promise<ControlISO27001> {
    return this.update(id, {
      nivel_madurez: nivel,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async assignResponsible(id: number, idResponsable: number): Promise<ControlISO27001> {
    return this.update(id, {
      responsable_control: idResponsable,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async addEvidence(id: number, evidencia: string): Promise<ControlISO27001> {
    const control = await this.findById(id)
    if (!control) {
      throw new Error('Control not found')
    }

    const evidenciasActuales = control.getEvidenciasControl()
    const nuevasEvidencias = [...evidenciasActuales, evidencia]

    return this.update(id, {
      evidencias_control: nuevasEvidencias,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async removeEvidence(id: number, evidencia: string): Promise<ControlISO27001> {
    const control = await this.findById(id)
    if (!control) {
      throw new Error('Control not found')
    }

    const evidenciasActuales = control.getEvidenciasControl()
    const nuevasEvidencias = evidenciasActuales.filter(e => e !== evidencia)

    return this.update(id, {
      evidencias_control: nuevasEvidencias,
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  async updateReview(id: number): Promise<ControlISO27001> {
    return this.update(id, {
      fecha_revision: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    } as any)
  }

  // Validaciones
  async validateControlCode(codigo: string): Promise<boolean> {
    const regex = /^A\.\d{1,2}\.\d{1,2}$/
    return regex.test(codigo)
  }

  async validateResponsibleAssignment(idResponsable: number): Promise<{
    isValid: boolean
    currentControls: number
    maxRecommended: number
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_control')
      .eq('responsable_control', idResponsable)

    if (error) {
      throw new Error(`Error validating responsible assignment: ${error.message}`)
    }

    const currentControls = data?.length || 0
    const maxRecommended = 15 // Máximo recomendado de controles por responsable

    return {
      isValid: currentControls < maxRecommended,
      currentControls,
      maxRecommended
    }
  }

  // Implementación simplificada de métodos restantes
  async getDomainCompleteness(): Promise<any[]> {
    return []
  }

  async getResponsibleWorkload(): Promise<any[]> {
    return []
  }

  async getEffectivenessAnalysis(): Promise<any> {
    return {}
  }

  async findGapAnalysis(): Promise<any> {
    return {}
  }

  async findControlDependencies(id: number): Promise<any> {
    return {}
  }

  async findSimilarControls(id: number): Promise<ControlISO27001[]> {
    return []
  }

  async getComplianceReport(): Promise<any> {
    return {}
  }

  async getAuditReport(): Promise<any> {
    return {}
  }

  async getImplementationTrends(from: Date, to: Date): Promise<any[]> {
    return []
  }
}