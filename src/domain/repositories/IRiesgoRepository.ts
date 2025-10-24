// =============================================
// INTERFAZ: Repositorio de Riesgos
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Riesgo } from '../entities/Riesgo'
import { NivelRiesgoCategoria } from '../value-objects/NivelRiesgo'
import { IBaseRepository } from './IBaseRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from './common'

export interface RiesgoFilters {
  idProyecto?: number
  idCategoriaRiesgo?: number
  idTipoRiesgo?: number
  idEstadoRiesgo?: number
  idPropietarioRiesgo?: number
  idUsuarioRegistro?: number
  nivelRiesgo?: NivelRiesgoCategoria
  probabilidadMin?: number
  probabilidadMax?: number
  impactoMin?: number
  impactoMax?: number
  nivelRiesgoMin?: number
  nivelRiesgoMax?: number
  fechaRegistro?: DateRangeFilter
  fechaActualizacion?: DateRangeFilter
  soloActivos?: boolean
}

export interface RiesgoSearchOptions {
  query: string
  searchInCausa?: boolean
  searchInConsecuencia?: boolean
}

export interface RiskMatrixData {
  probabilidad: number
  impacto: number
  cantidad: number
  riesgos: Riesgo[]
}

export interface IRiesgoRepository extends IBaseRepository<Riesgo, number> {
  // Búsquedas específicas por proyecto
  findByProyecto(idProyecto: number, options?: {
    pagination?: PaginationOptions
    filters?: Omit<RiesgoFilters, 'idProyecto'>
    soloActivos?: boolean
  }): Promise<PaginatedResult<Riesgo>>
  
  // Búsquedas por propietario
  findByPropietario(idPropietario: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<Riesgo>>
  
  // Búsquedas por categoría y tipo
  findByCategoria(idCategoria: number, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Riesgo>>
  
  findByTipo(idTipo: number, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Riesgo>>
  
  // Búsquedas por estado
  findByEstado(idEstado: number, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Riesgo>>
  
  // Búsquedas por nivel de riesgo
  findByNivelRiesgo(categoria: NivelRiesgoCategoria, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Riesgo>>
  
  findRiesgosCriticos(options?: {
    pagination?: PaginationOptions
    idProyecto?: number
  }): Promise<PaginatedResult<Riesgo>>
  
  findRiesgosAltos(options?: {
    pagination?: PaginationOptions
    idProyecto?: number
  }): Promise<PaginatedResult<Riesgo>>
  
  // Búsquedas por rangos
  findByProbabilidadRange(min: number, max: number): Promise<Riesgo[]>
  findByImpactoRange(min: number, max: number): Promise<Riesgo[]>
  findByNivelRiesgoRange(min: number, max: number): Promise<Riesgo[]>
  
  // Matriz de riesgos
  getRiskMatrix(idProyecto?: number): Promise<RiskMatrixData[][]>
  getRiskDistribution(idProyecto?: number): Promise<{
    muyBajo: number
    bajo: number
    medio: number
    alto: number
    critico: number
    total: number
  }>
  
  // Estadísticas y métricas
  countByCategoria(idProyecto?: number): Promise<{ idCategoria: number; count: number }[]>
  countByTipo(idProyecto?: number): Promise<{ idTipo: number; count: number }[]>
  countByEstado(idProyecto?: number): Promise<{ idEstado: number; count: number }[]>
  countByNivelRiesgo(idProyecto?: number): Promise<{ categoria: NivelRiesgoCategoria; count: number }[]>
  countByPropietario(idProyecto?: number): Promise<{ idPropietario: number; count: number }[]>
  
  // Métricas de proyecto
  getProjectRiskMetrics(idProyecto: number): Promise<{
    totalRiesgos: number
    riesgosActivos: number
    riesgoPromedio: number
    riesgoMaximo: number
    distribucion: { categoria: NivelRiesgoCategoria; count: number }[]
    porcentajeCriticos: number
    porcentajeAltos: number
  }>
  
  // Tendencias y análisis temporal
  getRiskTrends(idProyecto: number, from: Date, to: Date): Promise<{
    fecha: Date
    totalRiesgos: number
    riesgoPromedio: number
    riesgosCriticos: number
  }[]>
  
  // Operaciones de gestión
  assignOwner(id: number, idPropietario: number): Promise<Riesgo>
  updateRiskLevel(id: number, probabilidad: number, impacto: number): Promise<Riesgo>
  changeState(id: number, idEstado: number): Promise<Riesgo>
  
  // Búsquedas avanzadas
  findRiesgosVencidos(): Promise<Riesgo[]>
  findRiesgosSinPropietario(): Promise<Riesgo[]>
  findRiesgosSinInformacionCompleta(): Promise<Riesgo[]>
  findRiesgosRequierenAtencion(): Promise<Riesgo[]>
  
  // Validaciones
  validateRiskAssignment(idProyecto: number, idPropietario: number): Promise<boolean>
  
  // Reportes
  getRiskReport(filters: RiesgoFilters): Promise<{
    resumenEjecutivo: {
      totalRiesgos: number
      riesgoPromedio: number
      distribucion: { categoria: NivelRiesgoCategoria; count: number; porcentaje: number }[]
    }
    riesgosPorProyecto: { idProyecto: number; count: number; riesgoPromedio: number }[]
    riesgosPorCategoria: { idCategoria: number; count: number; riesgoPromedio: number }[]
    topRiesgos: Riesgo[]
    recomendaciones: string[]
  }>
}