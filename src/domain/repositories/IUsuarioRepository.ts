// =============================================
// INTERFAZ: Repositorio de Usuarios
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Usuario, EstadoUsuario, ProviderOAuth } from '../entities/Usuario'
import { IBaseRepository } from './IBaseRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from './common'

export interface UsuarioFilters {
  estado?: EstadoUsuario
  idRol?: number
  idDepartamento?: number
  providerOAuth?: ProviderOAuth
  emailVerificado?: boolean
  fechaRegistro?: DateRangeFilter
  fechaIngresoEmpresa?: DateRangeFilter
}

export interface UsuarioSearchOptions {
  query: string
  includeInactivos?: boolean
}

export interface IUsuarioRepository extends IBaseRepository<Usuario, number> {
  // Búsquedas específicas
  findByEmail(email: string): Promise<Usuario | null>
  findByCI(ci: string): Promise<Usuario | null>
  findByProviderId(provider: ProviderOAuth, providerId: string): Promise<Usuario | null>
  
  // Filtros específicos de negocio
  findByRol(idRol: number, options?: {
    pagination?: PaginationOptions
    includeInactivos?: boolean
  }): Promise<PaginatedResult<Usuario>>
  
  findByDepartamento(idDepartamento: number, options?: {
    pagination?: PaginationOptions
    includeInactivos?: boolean
  }): Promise<PaginatedResult<Usuario>>
  
  findByEstado(estado: EstadoUsuario, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Usuario>>
  
  // Operaciones de autenticación
  findActiveByEmail(email: string): Promise<Usuario | null>
  findPendingVerification(): Promise<Usuario[]>
  
  // Estadísticas y métricas
  countByRol(): Promise<{ idRol: number; count: number }[]>
  countByDepartamento(): Promise<{ idDepartamento: number; count: number }[]>
  countByEstado(): Promise<{ estado: EstadoUsuario; count: number }[]>
  countByProvider(): Promise<{ provider: ProviderOAuth | null; count: number }[]>
  
  // Operaciones de gestión
  activateUser(id: number): Promise<Usuario>
  deactivateUser(id: number): Promise<Usuario>
  blockUser(id: number): Promise<Usuario>
  verifyEmail(id: number): Promise<Usuario>
  updateLastAccess(id: number): Promise<Usuario>
  
  // Validaciones específicas
  isEmailUnique(email: string, excludeId?: number): Promise<boolean>
  isCIUnique(ci: string, excludeId?: number): Promise<boolean>
  
  // Búsquedas avanzadas
  findUsersWithoutAccess(days: number): Promise<Usuario[]>
  findExpiredUsers(): Promise<Usuario[]>
  findUsersByDateRange(
    field: 'fechaRegistro' | 'fechaIngresoEmpresa' | 'ultimoAcceso',
    from: Date,
    to: Date
  ): Promise<Usuario[]>
  
  // Reportes
  getUserActivityReport(from: Date, to: Date): Promise<{
    totalUsuarios: number
    usuariosActivos: number
    nuevosRegistros: number
    ultimosAccesos: number
    porRol: { idRol: number; count: number }[]
    porDepartamento: { idDepartamento: number; count: number }[]
  }>
}