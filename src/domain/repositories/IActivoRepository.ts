// =============================================
// INTERFAZ: Repositorio de Activos de Información (ISO 27001)
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ActivoInformacion, TipoActivo, ClasificacionSeguridad, EstadoActivo, ValorActivo } from '../entities/ActivoInformacion'
import { IBaseRepository } from './IBaseRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from './common'

export interface ActivoFilters {
  tipoActivo?: TipoActivo
  clasificacionSeguridad?: ClasificacionSeguridad
  estadoActivo?: EstadoActivo
  valorActivo?: ValorActivo
  valorActivoMin?: ValorActivo
  valorActivoMax?: ValorActivo
  propietarioActivo?: number
  custodioActivo?: number
  ubicacionActivo?: string
  fechaRegistro?: DateRangeFilter
  fechaActualizacion?: DateRangeFilter
  soloCriticos?: boolean
  soloActivos?: boolean
}

export interface ActivoSearchOptions {
  query: string
  searchInDescription?: boolean
  searchInLocation?: boolean
}

export interface ActivoMetrics {
  totalActivos: number
  activosActivos: number
  activosCriticos: number
  activosConfidenciales: number
  distribucionPorTipo: { tipo: TipoActivo; count: number }[]
  distribucionPorClasificacion: { clasificacion: ClasificacionSeguridad; count: number }[]
  distribucionPorValor: { valor: ValorActivo; count: number }[]
}

export interface IActivoRepository extends IBaseRepository<ActivoInformacion, number> {
  // Búsquedas específicas por tipo
  findByTipo(tipo: TipoActivo, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  // Búsquedas por clasificación de seguridad
  findByClasificacion(clasificacion: ClasificacionSeguridad, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  findConfidenciales(): Promise<ActivoInformacion[]>
  findRestringidos(): Promise<ActivoInformacion[]>
  
  // Búsquedas por valor/criticidad
  findByValor(valor: ValorActivo, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  findCriticos(options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  findByValorRange(min: ValorActivo, max: ValorActivo): Promise<ActivoInformacion[]>
  
  // Búsquedas por propietario y custodio
  findByPropietario(idPropietario: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  findByCustodio(idCustodio: number, options?: {
    pagination?: PaginationOptions
    soloActivos?: boolean
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  findSinCustodio(): Promise<ActivoInformacion[]>
  
  // Búsquedas por ubicación
  findByUbicacion(ubicacion: string): Promise<ActivoInformacion[]>
  findSinUbicacion(): Promise<ActivoInformacion[]>
  
  // Búsquedas por estado
  findByEstado(estado: EstadoActivo, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<ActivoInformacion>>
  
  findActivos(): Promise<ActivoInformacion[]>
  findInactivos(): Promise<ActivoInformacion[]>
  findRetirados(): Promise<ActivoInformacion[]>
  findEnMantenimiento(): Promise<ActivoInformacion[]>
  
  // Estadísticas y métricas
  countByTipo(): Promise<{ tipo: TipoActivo; count: number }[]>
  countByClasificacion(): Promise<{ clasificacion: ClasificacionSeguridad; count: number }[]>
  countByValor(): Promise<{ valor: ValorActivo; count: number }[]>
  countByEstado(): Promise<{ estado: EstadoActivo; count: number }[]>
  countByPropietario(): Promise<{ idPropietario: number; count: number }[]>
  countByUbicacion(): Promise<{ ubicacion: string; count: number }[]>
  
  getActivoMetrics(): Promise<ActivoMetrics>
  
  // Análisis de riesgos por activos
  getAssetRiskProfile(idActivo: number): Promise<{
    activo: ActivoInformacion
    riesgosAsociados: number
    controlesImplementados: number
    nivelProteccion: 'bajo' | 'medio' | 'alto'
    requiereAtencion: boolean
  }>
  
  getHighRiskAssets(): Promise<{
    activo: ActivoInformacion
    factoresRiesgo: string[]
    recomendaciones: string[]
  }[]>
  
  // Operaciones de gestión
  reclassify(id: number, nuevaClasificacion: ClasificacionSeguridad): Promise<ActivoInformacion>
  revalue(id: number, nuevoValor: ValorActivo): Promise<ActivoInformacion>
  changeState(id: number, nuevoEstado: EstadoActivo): Promise<ActivoInformacion>
  assignOwner(id: number, idPropietario: number): Promise<ActivoInformacion>
  assignCustodian(id: number, idCustodio?: number): Promise<ActivoInformacion>
  updateLocation(id: number, ubicacion?: string): Promise<ActivoInformacion>
  
  // Validaciones específicas
  validateOwnershipAssignment(idPropietario: number): Promise<{
    isValid: boolean
    currentAssets: number
    maxRecommended: number
  }>
  
  validateCustodianAssignment(idCustodio: number): Promise<{
    isValid: boolean
    currentAssets: number
    maxRecommended: number
  }>
  
  // Búsquedas avanzadas
  findActivosRequierenRevision(): Promise<ActivoInformacion[]>
  findActivosSinControles(): Promise<ActivoInformacion[]>
  findActivosConClasificacionIncorrecta(): Promise<{
    activo: ActivoInformacion
    clasificacionSugerida: ClasificacionSeguridad
    razon: string
  }[]>
  
  findActivosDuplicados(): Promise<{
    grupo: ActivoInformacion[]
    criterio: string
  }[]>
  
  // Inventario y auditoría
  getInventoryReport(): Promise<{
    resumen: ActivoMetrics
    activosPorTipo: { tipo: TipoActivo; activos: ActivoInformacion[] }[]
    activosPorClasificacion: { clasificacion: ClasificacionSeguridad; activos: ActivoInformacion[] }[]
    activosCriticos: ActivoInformacion[]
    brechasInventario: {
      activosSinPropietario: ActivoInformacion[]
      activosSinCustodio: ActivoInformacion[]
      activosSinUbicacion: ActivoInformacion[]
      activosDesactualizados: ActivoInformacion[]
    }
    recomendaciones: string[]
  }>
  
  getComplianceReport(): Promise<{
    cumplimientoClasificacion: number
    cumplimientoPropietarios: number
    cumplimientoCustodios: number
    cumplimientoUbicaciones: number
    activosNoConformes: ActivoInformacion[]
    accionesCorrectivas: string[]
  }>
  
  // Análisis de tendencias
  getAssetTrends(from: Date, to: Date): Promise<{
    fecha: Date
    totalActivos: number
    nuevosActivos: number
    activosRetirados: number
    cambiosClasificacion: number
  }[]>
}