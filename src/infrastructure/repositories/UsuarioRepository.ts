// =============================================
// REPOSITORIO CONCRETO: Usuario con Supabase
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Usuario, EstadoUsuario, ProviderOAuth } from '@/domain/entities/Usuario'
import { CI } from '@/domain/value-objects/CI'
import { Email } from '@/domain/value-objects/Email'
import { IUsuarioRepository, UsuarioFilters, UsuarioSearchOptions } from '@/domain/repositories/IUsuarioRepository'
import { PaginationOptions, PaginatedResult, DateRangeFilter } from '@/domain/repositories/common'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class UsuarioRepository extends BaseSupabaseRepository<Usuario, number> implements IUsuarioRepository {
  protected tableName = 'usuarios'
  protected primaryKey = 'id_usuario'

  protected mapFromDatabase(row: any): Usuario {
    return new Usuario({
      id: row.id_usuario,
      nombresUsuario: row.nombres,
      apellidosUsuario: `${row.apellido_paterno} ${row.apellido_materno}`.trim(),
      ciUsuario: row.ci,
      emailUsuario: row.correo_electronico,
      telefonoUsuario: row.telefono_contacto,
      rolUsuario: row.rol_usuario,
      departamentoUsuario: row.departamento_usuario,
      // fechaIngresoEmpresa: row.fecha_ingreso_empresa ? new Date(row.fecha_ingreso_empresa) : undefined,
      fechaRegistro: new Date(row.fecha_registro),
      ultimaConexion: row.ultimo_acceso ? new Date(row.ultimo_acceso) : undefined,
      // estadoUsuario: row.estado_usuario as EstadoUsuario,
      // urlFotoPerfil: row.url_foto_perfil,
      // providerOAuth: row.provider_oauth as ProviderOAuth,
      // providerId: row.provider_id,
      // emailVerificado: row.email_verificado
      activo: row.activo,
      fechaActualizacion: new Date(row.fecha_actualizacion)
    })
  }

  protected mapToDatabase(entity: Omit<Usuario, 'id'>): any {
    const plainObject = (entity as any).toPlainObject ? (entity as any).toPlainObject() : entity
    return {
      nombres: plainObject.nombres,
      apellido_paterno: plainObject.apellido_paterno,
      apellido_materno: plainObject.apellido_materno,
      ci: plainObject.ci,
      correo_electronico: plainObject.correo_electronico,
      telefono_contacto: plainObject.telefono_contacto,
      id_rol: plainObject.id_rol,
      id_departamento: plainObject.id_departamento,
      fecha_ingreso_empresa: plainObject.fecha_ingreso_empresa,
      fecha_registro_sistema: plainObject.fecha_registro_sistema,
      ultimo_acceso: plainObject.ultimo_acceso,
      estado_usuario: plainObject.estado_usuario,
      url_foto_perfil: plainObject.url_foto_perfil,
      provider_oauth: plainObject.provider_oauth,
      provider_id: plainObject.provider_id,
      email_verificado: plainObject.email_verificado
    }
  }

  protected mapUpdateToDatabase(updates: Partial<Usuario>): any {
    // Para updates, usamos un enfoque más simple
    // En la implementación real, esto se manejaría con DTOs
    return updates as any
  }

  // Implementación de métodos específicos de IUsuarioRepository

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('correo_electronico', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error finding user by email: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async findByCI(ci: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('ci', ci)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error finding user by CI: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async findByProviderId(provider: ProviderOAuth, providerId: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('provider_oauth', provider)
      .eq('provider_id', providerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error finding user by provider: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async findByRol(idRol: number, options?: {
    pagination?: PaginationOptions
    includeInactivos?: boolean
  }): Promise<PaginatedResult<Usuario>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('id_rol', idRol)

    if (!options?.includeInactivos) {
      query = query.eq('estado_usuario', EstadoUsuario.ACTIVO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding users by role: ${error.message}`)
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

  async findByDepartamento(idDepartamento: number, options?: {
    pagination?: PaginationOptions
    includeInactivos?: boolean
  }): Promise<PaginatedResult<Usuario>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('id_departamento', idDepartamento)

    if (!options?.includeInactivos) {
      query = query.eq('estado_usuario', EstadoUsuario.ACTIVO)
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding users by department: ${error.message}`)
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

  async findByEstado(estado: EstadoUsuario, options?: {
    pagination?: PaginationOptions
  }): Promise<PaginatedResult<Usuario>> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      .eq('estado_usuario', estado)

    if (options?.pagination) {
      const { page, limit } = options.pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error finding users by state: ${error.message}`)
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

  async findActiveByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('correo_electronico', email)
      .eq('estado_usuario', EstadoUsuario.ACTIVO)
      .eq('email_verificado', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error finding active user by email: ${error.message}`)
    }

    return this.mapFromDatabase(data)
  }

  async findPendingVerification(): Promise<Usuario[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_usuario', EstadoUsuario.PENDIENTE_VERIFICACION)

    if (error) {
      throw new Error(`Error finding pending verification users: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async countByRol(): Promise<{ idRol: number; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_rol')
      .eq('estado_usuario', EstadoUsuario.ACTIVO)

    if (error) {
      throw new Error(`Error counting users by role: ${error.message}`)
    }

    const counts = new Map<number, number>()
    data?.forEach(row => {
      const count = counts.get(row.id_rol) || 0
      counts.set(row.id_rol, count + 1)
    })

    return Array.from(counts.entries()).map(([idRol, count]) => ({ idRol, count }))
  }

  async countByDepartamento(): Promise<{ idDepartamento: number; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id_departamento')
      .eq('estado_usuario', EstadoUsuario.ACTIVO)

    if (error) {
      throw new Error(`Error counting users by department: ${error.message}`)
    }

    const counts = new Map<number, number>()
    data?.forEach(row => {
      const count = counts.get(row.id_departamento) || 0
      counts.set(row.id_departamento, count + 1)
    })

    return Array.from(counts.entries()).map(([idDepartamento, count]) => ({ idDepartamento, count }))
  }

  async countByEstado(): Promise<{ estado: EstadoUsuario; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('estado_usuario')

    if (error) {
      throw new Error(`Error counting users by state: ${error.message}`)
    }

    const counts = new Map<EstadoUsuario, number>()
    data?.forEach(row => {
      const estado = row.estado_usuario as EstadoUsuario
      const count = counts.get(estado) || 0
      counts.set(estado, count + 1)
    })

    return Array.from(counts.entries()).map(([estado, count]) => ({ estado, count }))
  }

  async countByProvider(): Promise<{ provider: ProviderOAuth | null; count: number }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('provider_oauth')

    if (error) {
      throw new Error(`Error counting users by provider: ${error.message}`)
    }

    const counts = new Map<ProviderOAuth | null, number>()
    data?.forEach(row => {
      const provider = row.provider_oauth as ProviderOAuth | null
      const count = counts.get(provider) || 0
      counts.set(provider, count + 1)
    })

    return Array.from(counts.entries()).map(([provider, count]) => ({ provider, count }))
  }

  async activateUser(id: number): Promise<Usuario> {
    return this.update(id, { estadoUsuario: EstadoUsuario.ACTIVO } as any)
  }

  async deactivateUser(id: number): Promise<Usuario> {
    return this.update(id, { estadoUsuario: EstadoUsuario.INACTIVO } as any)
  }

  async blockUser(id: number): Promise<Usuario> {
    return this.update(id, { estadoUsuario: EstadoUsuario.BLOQUEADO } as any)
  }

  async verifyEmail(id: number): Promise<Usuario> {
    return this.update(id, { emailVerificado: true } as any)
  }

  async updateLastAccess(id: number): Promise<Usuario> {
    return this.update(id, { ultimoAcceso: new Date() } as any)
  }

  async isEmailUnique(email: string, excludeId?: number): Promise<boolean> {
    return this.validateUnique('correoElectronico' as any, email, excludeId)
  }

  async isCIUnique(ci: string, excludeId?: number): Promise<boolean> {
    return this.validateUnique('ci' as any, ci, excludeId)
  }

  async findUsersWithoutAccess(days: number): Promise<Usuario[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_usuario', EstadoUsuario.ACTIVO)
      .or(`ultimo_acceso.is.null,ultimo_acceso.lt.${cutoffDate.toISOString()}`)

    if (error) {
      throw new Error(`Error finding users without access: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findExpiredUsers(): Promise<Usuario[]> {
    // Implementar lógica de usuarios expirados según reglas de negocio
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('estado_usuario', EstadoUsuario.INACTIVO)

    if (error) {
      throw new Error(`Error finding expired users: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async findUsersByDateRange(
    field: 'fechaRegistro' | 'fechaIngresoEmpresa' | 'ultimoAcceso',
    from: Date,
    to: Date
  ): Promise<Usuario[]> {
    const dbField = field === 'fechaRegistro' ? 'fecha_registro_sistema' :
                   field === 'fechaIngresoEmpresa' ? 'fecha_ingreso_empresa' :
                   'ultimo_acceso'

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte(dbField, from.toISOString())
      .lte(dbField, to.toISOString())

    if (error) {
      throw new Error(`Error finding users by date range: ${error.message}`)
    }

    return data?.map(row => this.mapFromDatabase(row)) || []
  }

  async getUserActivityReport(from: Date, to: Date): Promise<{
    totalUsuarios: number
    usuariosActivos: number
    nuevosRegistros: number
    ultimosAccesos: number
    porRol: { idRol: number; count: number }[]
    porDepartamento: { idDepartamento: number; count: number }[]
  }> {
    // Implementar reporte de actividad de usuarios
    const totalUsuarios = await this.count()
    const usuariosActivos = await this.count({ estado_usuario: EstadoUsuario.ACTIVO })
    
    const nuevosRegistros = await this.count({
      fecha_registro_sistema: { from: from.toISOString(), to: to.toISOString() }
    })

    const ultimosAccesos = await this.count({
      ultimo_acceso: { from: from.toISOString(), to: to.toISOString() }
    })

    const porRol = await this.countByRol()
    const porDepartamento = await this.countByDepartamento()

    return {
      totalUsuarios,
      usuariosActivos,
      nuevosRegistros,
      ultimosAccesos,
      porRol,
      porDepartamento
    }
  }
}