// =============================================
// INTERFAZ: Repositorio de Incidentes de Seguridad (ISO 27001)
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { IncidenteSeguridad, TipoIncidente, SeveridadIncidente, EstadoIncidente } from '../entities/IncidenteSeguridad'
import { IBaseRepository } from './IBaseRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from './common'

export interface IncidenteFilters {
  tipoIncidente?: TipoIncidente
  severidadIncidente?: SeveridadIncidente
  estadoIncidente?: EstadoIncidente
  reportadoPor?: number
  asignadoA?: number
  activosAfectados?: number[]
  fechaDeteccion?: DateRangeFilter
  fechaReporte?: DateRangeFilter
  fechaResolucion?: DateRangeFilter
  soloAbiertos?: boolean
  soloCriticos?: boolean
  soloSinResolver?: boolean
}

export interface IncidenteSearchOptions {
  query: string
  searchInDescription?: boolean
  searchInImpact?: boolean
  searchInActions?: boolean
  searchInCause?: boolean
}

export interface IncidenteMetrics {
  totalIncidentes: number
  incidentesAbiertos: number
  incidentesCriticos: number
  incidentesResueltos: number
  tiempoPromedioResolucion: number
  tiempoPromedioDeteccion: number
  distribucionPorTipo: { tipo: TipoIncidente; count: number }[]
  distribucionPorSeveridad: { severidad: SeveridadIncidente; count: number }[]
  distribucionPorEstado: { estado: EstadoIncidente; count: number }[]
  tendenciaMensual: { mes: string; count: number }[]
}

export interface IIncidenteRepository extends IBaseRepository<IncidenteSeguridad, number> {
  // Búsquedas por tipo
  findByTipo(tipo: TipoIncidente, options?: {
    pagination?: PaginationOptions
    soloAbiertos?: boolean
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  // Búsquedas por severidad
  findBySeveridad(severidad: SeveridadIncidente, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  findCriticos(options?: {
    pagination?: PaginationOptions
    soloAbiertos?: boolean
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  findAltos(): Promise<IncidenteSeguridad[]>
  
  // Búsquedas por estado
  findByEstado(estado: EstadoIncidente, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  findAbiertos(): Promise<IncidenteSeguridad[]>
  findCerrados(options?: {
    pagination?: PaginationOptions
    from?: Date
    to?: Date
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  findEnInvestigacion(): Promise<IncidenteSeguridad[]>
  findContenidos(): Promise<IncidenteSeguridad[]>
  findResueltos(): Promise<IncidenteSeguridad[]>
  
  // Búsquedas por personas
  findByReporter(idReporter: number, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  findByAssignee(idAssignee: number, options?: {
    pagination?: PaginationOptions
    soloAbiertos?: boolean
  }): Promise<PaginatedResult<IncidenteSeguridad>>
  
  // Búsquedas por activos afectados
  findByAsset(idActivo: number): Promise<IncidenteSeguridad[]>
  findByAssets(idsActivos: number[]): Promise<IncidenteSeguridad[]>
  findWithMultipleAssets(): Promise<IncidenteSeguridad[]>
  
  // Búsquedas por tiempo
  findByDetectionDateRange(from: Date, to: Date): Promise<IncidenteSeguridad[]>
  findByReportDateRange(from: Date, to: Date): Promise<IncidenteSeguridad[]>
  findByResolutionDateRange(from: Date, to: Date): Promise<IncidenteSeguridad[]>
  
  findRecentIncidents(hours: number): Promise<IncidenteSeguridad[]>
  findOverdueIncidents(): Promise<IncidenteSeguridad[]>
  findLongRunningIncidents(days: number): Promise<IncidenteSeguridad[]>
  
  // Búsquedas por completitud
  findWithRootCause(): Promise<IncidenteSeguridad[]>
  findWithoutRootCause(): Promise<IncidenteSeguridad[]>
  findWithLessonsLearned(): Promise<IncidenteSeguridad[]>
  findIncompleteInvestigations(): Promise<IncidenteSeguridad[]>
  
  // Estadísticas y métricas
  countByTipo(from?: Date, to?: Date): Promise<{ tipo: TipoIncidente; count: number }[]>
  countBySeveridad(from?: Date, to?: Date): Promise<{ severidad: SeveridadIncidente; count: number }[]>
  countByEstado(): Promise<{ estado: EstadoIncidente; count: number }[]>
  countByReporter(): Promise<{ idReporter: number; count: number }[]>
  countByAssignee(): Promise<{ idAssignee: number; count: number }[]>
  
  getIncidentMetrics(from?: Date, to?: Date): Promise<IncidenteMetrics>
  
  getResponseTimeMetrics(): Promise<{
    tiempoPromedioDeteccion: number
    tiempoPromedioRespuesta: number
    tiempoPromedioResolucion: number
    tiempoPromedioContención: number
    metricasPorSeveridad: {
      severidad: SeveridadIncidente
      tiempoPromedio: number
      slaCompliance: number
    }[]
  }>
  
  getSLACompliance(): Promise<{
    cumplimientoGeneral: number
    cumplimientoPorSeveridad: {
      severidad: SeveridadIncidente
      slaTarget: number
      cumplimiento: number
      incidentesVencidos: number
    }[]
    incidentesVencidos: IncidenteSeguridad[]
  }>
  
  // Análisis de tendencias
  getIncidentTrends(from: Date, to: Date, groupBy: 'day' | 'week' | 'month'): Promise<{
    periodo: string
    totalIncidentes: number
    incidentesCriticos: number
    tiempoPromedioResolucion: number
  }[]>
  
  getRecurringIncidents(): Promise<{
    patron: string
    incidentes: IncidenteSeguridad[]
    frecuencia: number
    ultimaOcurrencia: Date
  }[]>
  
  // Análisis de causa raíz
  getRootCauseAnalysis(): Promise<{
    causasComunes: { causa: string; count: number; porcentaje: number }[]
    tiposAfectados: { tipo: TipoIncidente; causas: string[] }[]
    activosMasAfectados: { idActivo: number; count: number }[]
    recomendacionesPrevencion: string[]
  }>
  
  // Operaciones de gestión
  assignIncident(id: number, idAssignee: number): Promise<IncidenteSeguridad>
  changeState(id: number, nuevoEstado: EstadoIncidente): Promise<IncidenteSeguridad>
  changeSeverity(id: number, nuevaSeveridad: SeveridadIncidente): Promise<IncidenteSeguridad>
  addAffectedAsset(id: number, idActivo: number): Promise<IncidenteSeguridad>
  removeAffectedAsset(id: number, idActivo: number): Promise<IncidenteSeguridad>
  setRootCause(id: number, causaRaiz: string): Promise<IncidenteSeguridad>
  setLessonsLearned(id: number, lecciones: string): Promise<IncidenteSeguridad>
  
  // Validaciones específicas
  validateAssignment(idAssignee: number): Promise<{
    isValid: boolean
    currentOpenIncidents: number
    maxRecommended: number
  }>
  
  validateSeverityEscalation(id: number, nuevaSeveridad: SeveridadIncidente): Promise<{
    isValid: boolean
    requiresApproval: boolean
    reason: string
  }>
  
  // Búsquedas avanzadas
  findSimilarIncidents(incidente: IncidenteSeguridad, limit?: number): Promise<{
    incidente: IncidenteSeguridad
    similarityScore: number
    similarityFactors: string[]
  }[]>
  
  findIncidentPatterns(): Promise<{
    patron: string
    descripcion: string
    incidentes: IncidenteSeguridad[]
    riesgoRecurrencia: 'bajo' | 'medio' | 'alto'
    accionesPreventivas: string[]
  }[]>
  
  findHighImpactIncidents(): Promise<{
    incidente: IncidenteSeguridad
    impactoCalculado: number
    factoresImpacto: string[]
    leccionesAprendidas?: string
  }[]>
  
  // Reportes especializados
  getIncidentReport(filters: IncidenteFilters): Promise<{
    resumenEjecutivo: IncidenteMetrics
    incidentesPorTipo: { tipo: TipoIncidente; incidentes: IncidenteSeguridad[] }[]
    incidentesPorSeveridad: { severidad: SeveridadIncidente; incidentes: IncidenteSeguridad[] }[]
    analisisTendencias: {
      tendenciaGeneral: 'creciente' | 'estable' | 'decreciente'
      tiposEmergentes: TipoIncidente[]
      mejorasDetectadas: string[]
    }
    recomendaciones: string[]
  }>
  
  getSecurityPosture(): Promise<{
    nivelSeguridad: 'bajo' | 'medio' | 'alto'
    indicadores: {
      frecuenciaIncidentes: number
      tiempoRespuesta: number
      efectividadContención: number
      completitudInvestigacion: number
    }
    amenazasEmergentes: string[]
    vulnerabilidadesIdentificadas: string[]
    recomendacionesMejora: string[]
  }>
  
  getComplianceReport(): Promise<{
    cumplimientoReporte: number
    cumplimientoInvestigacion: number
    cumplimientoDocumentacion: number
    incidentesNoConformes: IncidenteSeguridad[]
    brechasDocumentacion: string[]
    accionesCorrectivas: string[]
  }>
  
  // Alertas y notificaciones
  getIncidentsRequiringAttention(): Promise<{
    incidentesCriticosAbiertos: IncidenteSeguridad[]
    incidentesVencidos: IncidenteSeguridad[]
    incidentesSinAsignar: IncidenteSeguridad[]
    incidentesEstancados: IncidenteSeguridad[]
    alertasEscalamiento: {
      incidente: IncidenteSeguridad
      razonEscalamiento: string
      accionRequerida: string
    }[]
  }>
}