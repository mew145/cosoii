// =============================================
// INTERFAZ: Repositorio de Controles ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ControlISO27001, TipoControl, CategoriaControl, EstadoImplementacion, NivelMadurez } from '../entities/ControlISO27001'
import { IBaseRepository } from './IBaseRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from './common'

export interface ControlFilters {
  codigoControl?: string
  dominioControl?: string
  tipoControl?: TipoControl
  categoriaControl?: CategoriaControl
  estadoImplementacion?: EstadoImplementacion
  nivelMadurez?: NivelMadurez
  nivelMadurezMin?: NivelMadurez
  nivelMadurezMax?: NivelMadurez
  responsableControl?: number
  fechaImplementacion?: DateRangeFilter
  fechaRevision?: DateRangeFilter
  fechaRegistro?: DateRangeFilter
  soloImplementados?: boolean
  soloEfectivos?: boolean
  requierenRevision?: boolean
}

export interface ControlSearchOptions {
  query: string
  searchInDescription?: boolean
  searchInDomain?: boolean
  searchInEvidence?: boolean
}

export interface ControlMetrics {
  totalControles: number
  controlesImplementados: number
  controlesEfectivos: number
  porcentajeImplementacion: number
  porcentajeEfectividad: number
  madurezPromedio: number
  controlesVencidos: number
  distribucionPorTipo: { tipo: TipoControl; count: number }[]
  distribucionPorCategoria: { categoria: CategoriaControl; count: number }[]
  distribucionPorEstado: { estado: EstadoImplementacion; count: number }[]
  distribucionPorMadurez: { nivel: NivelMadurez; count: number }[]
}

export interface IControlISORepository extends IBaseRepository<ControlISO27001, number> {
  // Búsquedas por código y dominio
  findByCode(codigo: string): Promise<ControlISO27001 | null>
  findByDomain(dominio: string, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>>
  
  findByDomainNumber(numerodominio: number): Promise<ControlISO27001[]>
  
  // Búsquedas por tipo y categoría
  findByTipo(tipo: TipoControl, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>>
  
  findByCategoria(categoria: CategoriaControl, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>>
  
  // Búsquedas por estado de implementación
  findByEstado(estado: EstadoImplementacion, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>>
  
  findImplementados(): Promise<ControlISO27001[]>
  findNoImplementados(): Promise<ControlISO27001[]>
  findParcialmenteImplementados(): Promise<ControlISO27001[]>
  findNoAplicables(): Promise<ControlISO27001[]>
  
  // Búsquedas por madurez
  findByNivelMadurez(nivel: NivelMadurez, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ControlISO27001>>
  
  findByMadurezRange(min: NivelMadurez, max: NivelMadurez): Promise<ControlISO27001[]>
  findEfectivos(): Promise<ControlISO27001[]>
  findMaduros(): Promise<ControlISO27001[]>
  findRequierenAtencion(): Promise<ControlISO27001[]>
  
  // Búsquedas por responsable
  findByResponsable(idResponsable: number, options?: {
    pagination?: PaginationOptions
    soloImplementados?: boolean
  }): Promise<PaginatedResult<ControlISO27001>>
  
  // Búsquedas por fechas
  findRequierenRevision(): Promise<ControlISO27001[]>
  findImplementadosEnPeriodo(from: Date, to: Date): Promise<ControlISO27001[]>
  findVencidos(dias?: number): Promise<ControlISO27001[]>
  
  // Búsquedas por evidencias
  findConEvidencias(): Promise<ControlISO27001[]>
  findSinEvidencias(): Promise<ControlISO27001[]>
  findByEvidencia(evidencia: string): Promise<ControlISO27001[]>
  
  // Estadísticas y métricas
  countByTipo(): Promise<{ tipo: TipoControl; count: number }[]>
  countByCategoria(): Promise<{ categoria: CategoriaControl; count: number }[]>
  countByEstado(): Promise<{ estado: EstadoImplementacion; count: number }[]>
  countByMadurez(): Promise<{ nivel: NivelMadurez; count: number }[]>
  countByDominio(): Promise<{ dominio: string; count: number }[]>
  countByResponsable(): Promise<{ idResponsable: number; count: number }[]>
  
  getControlMetrics(): Promise<ControlMetrics>
  
  getDomainCompleteness(): Promise<{
    dominio: string
    totalControles: number
    controlesImplementados: number
    porcentajeComplecion: number
    madurezPromedio: number
  }[]>
  
  getResponsibleWorkload(): Promise<{
    idResponsable: number
    totalControles: number
    controlesImplementados: number
    controlesVencidos: number
    cargaTrabajo: number
  }[]>
  
  // Análisis de efectividad
  getEffectivenessAnalysis(): Promise<{
    efectividadGeneral: number
    efectividadPorTipo: { tipo: TipoControl; efectividad: number }[]
    efectividadPorCategoria: { categoria: CategoriaControl; efectividad: number }[]
    efectividadPorDominio: { dominio: string; efectividad: number }[]
    controlesInefectivos: ControlISO27001[]
    recomendacionesMejora: string[]
  }>
  
  // Operaciones de gestión
  implement(id: number): Promise<ControlISO27001>
  updateMaturity(id: number, nivel: NivelMadurez): Promise<ControlISO27001>
  assignResponsible(id: number, idResponsable: number): Promise<ControlISO27001>
  addEvidence(id: number, evidencia: string): Promise<ControlISO27001>
  removeEvidence(id: number, evidencia: string): Promise<ControlISO27001>
  updateReview(id: number): Promise<ControlISO27001>
  
  // Validaciones específicas
  validateControlCode(codigo: string): Promise<boolean>
  validateResponsibleAssignment(idResponsable: number): Promise<{
    isValid: boolean
    currentControls: number
    maxRecommended: number
  }>
  
  // Búsquedas avanzadas
  findGapAnalysis(): Promise<{
    dominiosIncompletos: { dominio: string; brechas: number }[]
    controlesObligatorios: ControlISO27001[]
    controlesRecomendados: ControlISO27001[]
    prioridadImplementacion: ControlISO27001[]
  }>
  
  findControlDependencies(id: number): Promise<{
    dependencias: ControlISO27001[]
    dependientes: ControlISO27001[]
    impactoImplementacion: string
  }>
  
  findSimilarControls(id: number): Promise<ControlISO27001[]>
  
  // Reportes de cumplimiento
  getComplianceReport(): Promise<{
    resumenGeneral: ControlMetrics
    cumplimientoPorDominio: {
      dominio: string
      porcentajeImplementacion: number
      madurezPromedio: number
      controlesVencidos: number
    }[]
    brechasCriticas: {
      controlesObligatorios: ControlISO27001[]
      controlesVencidos: ControlISO27001[]
      controlesInefectivos: ControlISO27001[]
    }
    planMejora: {
      prioridad: 'alta' | 'media' | 'baja'
      controles: ControlISO27001[]
      accionRecomendada: string
      plazoEstimado: string
    }[]
    certificacionReadiness: {
      porcentajeListo: number
      brechasRestantes: number
      tiempoEstimado: string
    }
  }>
  
  getAuditReport(): Promise<{
    controlesAuditados: ControlISO27001[]
    hallazgos: {
      control: ControlISO27001
      tipo: 'no_conformidad' | 'observacion' | 'mejora'
      descripcion: string
      severidad: 'baja' | 'media' | 'alta' | 'critica'
    }[]
    recomendaciones: string[]
    planAccionCorrectiva: {
      control: ControlISO27001
      accion: string
      responsable: number
      plazo: Date
    }[]
  }>
  
  // Análisis de tendencias
  getImplementationTrends(from: Date, to: Date): Promise<{
    fecha: Date
    controlesImplementados: number
    madurezPromedio: number
    efectividadPromedio: number
  }[]>
}