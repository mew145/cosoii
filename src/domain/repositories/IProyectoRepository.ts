// =============================================
// INTERFAZ: Repositorio de Proyectos
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Proyecto, EstadoProyecto } from '../entities/Proyecto'
import { IBaseRepository } from './IBaseRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from './common'

export interface ProyectoFilters {
  idCliente?: number
  idGerenteProyecto?: number
  estado?: EstadoProyecto
  presupuestoMin?: number
  presupuestoMax?: number
  avanceMin?: number
  avanceMax?: number
  fechaInicio?: DateRangeFilter
  fechaFinEstimada?: DateRangeFilter
  fechaFinReal?: DateRangeFilter
  fechaRegistro?: DateRangeFilter
}

export interface ProyectoSearchOptions {
  query: string
  searchInDescription?: boolean
}

export interface ProyectoMetrics {
  totalProyectos: number
  proyectosActivos: number
  proyectosCompletados: number
  proyectosCancelados: number
  avancePromedio: number
  presupuestoTotal: number
  proyectosRetrasados: number
  proyectosEnTiempo: number
}

export interface IProyectoRepository extends IBaseRepository<Proyecto, number> {
  // Búsquedas específicas
  findByCliente(idCliente: number, options?: {
    pagination?: PaginationOptions
    incluirCancelados?: boolean
  }): Promise<PaginatedResult<Proyecto>>
  
  findByGerente(idGerente: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<Proyecto>>
  
  findByEstado(estado: EstadoProyecto, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Proyecto>>
  
  // Búsquedas por rangos
  findByPresupuestoRange(min: number, max: number): Promise<Proyecto[]>
  findByAvanceRange(min: number, max: number): Promise<Proyecto[]>
  findByDateRange(
    field: 'fechaInicio' | 'fechaFinEstimada' | 'fechaFinReal',
    from: Date,
    to: Date
  ): Promise<Proyecto[]>
  
  // Proyectos activos y estados especiales
  findActiveProjects(): Promise<Proyecto[]>
  findCompletedProjects(options?: {
    pagination?: PaginationOptions
    from?: Date
    to?: Date
  }): Promise<PaginatedResult<Proyecto>>
  
  findDelayedProjects(): Promise<Proyecto[]>
  findProjectsNearDeadline(days: number): Promise<Proyecto[]>
  findProjectsWithoutProgress(days: number): Promise<Proyecto[]>
  
  // Estadísticas y métricas
  countByEstado(): Promise<{ estado: EstadoProyecto; count: number }[]>
  countByCliente(): Promise<{ idCliente: number; count: number }[]>
  countByGerente(): Promise<{ idGerente: number; count: number }[]>
  
  getProjectMetrics(): Promise<ProyectoMetrics>
  getClientMetrics(idCliente: number): Promise<{
    totalProyectos: number
    proyectosActivos: number
    proyectosCompletados: number
    avancePromedio: number
    presupuestoTotal: number
    tiempoPromedioComplecion: number
  }>
  
  getManagerMetrics(idGerente: number): Promise<{
    totalProyectos: number
    proyectosActivos: number
    cargaTrabajo: number
    avancePromedio: number
    proyectosRetrasados: number
    eficienciaComplecion: number
  }>
  
  // Análisis temporal
  getProjectTrends(from: Date, to: Date): Promise<{
    fecha: Date
    proyectosIniciados: number
    proyectosCompletados: number
    avancePromedio: number
  }[]>
  
  getCompletionRates(period: 'month' | 'quarter' | 'year'): Promise<{
    periodo: string
    proyectosIniciados: number
    proyectosCompletados: number
    tasaComplecion: number
  }[]>
  
  // Operaciones de gestión
  updateProgress(id: number, avance: number): Promise<Proyecto>
  changeState(id: number, estado: EstadoProyecto): Promise<Proyecto>
  assignManager(id: number, idGerente: number): Promise<Proyecto>
  updateBudget(id: number, presupuesto: number): Promise<Proyecto>
  updateDates(id: number, fechaInicio?: Date, fechaFinEstimada?: Date): Promise<Proyecto>
  
  // Validaciones específicas
  validateManagerWorkload(idGerente: number, excludeProjectId?: number): Promise<{
    isValid: boolean
    currentProjects: number
    maxRecommended: number
  }>
  
  validateBudgetAllocation(idCliente: number, presupuesto: number): Promise<{
    isValid: boolean
    totalBudget: number
    availableBudget: number
  }>
  
  // Búsquedas avanzadas
  findSimilarProjects(proyecto: Proyecto, limit?: number): Promise<Proyecto[]>
  findProjectsByRiskLevel(nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico'): Promise<Proyecto[]>
  
  // Reportes
  getProjectReport(filters: ProyectoFilters): Promise<{
    resumen: ProyectoMetrics
    proyectosPorEstado: { estado: EstadoProyecto; proyectos: Proyecto[] }[]
    proyectosPorCliente: { idCliente: number; count: number; avancePromedio: number }[]
    proyectosPorGerente: { idGerente: number; count: number; cargaTrabajo: number }[]
    alertas: {
      proyectosRetrasados: Proyecto[]
      proyectosSinAvance: Proyecto[]
      proyectosVencidos: Proyecto[]
    }
    recomendaciones: string[]
  }>
  
  getPortfolioAnalysis(): Promise<{
    distribucionPorEstado: { estado: EstadoProyecto; count: number; porcentaje: number }[]
    distribucionPorPresupuesto: { rango: string; count: number; porcentaje: number }[]
    eficienciaGerentes: { idGerente: number; eficiencia: number; proyectosActivos: number }[]
    tendenciasComplecion: { mes: string; tasaComplecion: number }[]
    riesgosPortfolio: string[]
  }>
}