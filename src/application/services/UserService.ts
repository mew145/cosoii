// =============================================
// SERVICIO DE GESTIÓN DE USUARIOS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { createClient } from '@/lib/supabase/client'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { Email } from '@/domain/value-objects/Email'
import { CI } from '@/domain/value-objects/CI'
import { PermissionService } from './PermissionService'
import { PaginationOptions, PaginatedResult } from '@/domain/repositories/common'

export interface CreateUserRequest {
  nombres: string
  apellidos: string
  email: string
  ci: string
  telefono?: string
  departamento?: string
  rol: RolUsuario
  password?: string
  activo?: boolean
}

export interface UpdateUserRequest {
  nombres?: string
  apellidos?: string
  email?: string
  ci?: string
  telefono?: string
  departamento?: string
  rol?: RolUsuario
  activo?: boolean
}

export interface UserFilters {
  rol?: RolUsuario
  departamento?: string
  activo?: boolean
  search?: string
}

export interface UserStats {
  totalUsuarios: number
  usuariosActivos: number
  usuariosInactivos: number
  distribucionPorRol: { rol: RolUsuario; count: number }[]
  distribucionPorDepartamento: { departamento: string; count: number }[]
  usuariosRecientes: Usuario[]
  usuariosSinConexion: Usuario[]
}

export class UserService {
  private supabase = createClient()
  private permissionService = new PermissionService()

  /**
   * Obtiene todos los usuarios con filtros y paginación
   */
  async getUsers(
    filters?: UserFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Usuario>> {
    try {
      let query = this.supabase
        .from('usuarios')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters?.rol) {
        query = query.eq('rol_usuario', filters.rol)
      }

      if (filters?.departamento) {
        query = query.eq('departamento_usuario', filters.departamento)
      }

      if (filters?.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query = query.or(`nombres_usuario.ilike.${searchTerm},apellidos_usuario.ilike.${searchTerm},email_usuario.ilike.${searchTerm},ci_usuario.ilike.${searchTerm}`)
      }

      // Aplicar paginación
      if (pagination) {
        const { page, limit } = pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)
      }

      // Ordenar por fecha de registro descendente
      query = query.order('fecha_registro', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Error obteniendo usuarios: ${error.message}`)
      }

      const usuarios = data?.map(row => this.mapToUsuario(row)) || []
      const total = count || 0
      const page = pagination?.page || 1
      const limit = pagination?.limit || total
      const totalPages = Math.ceil(total / limit)

      return {
        data: usuarios,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }

    } catch (error) {
      console.error('Error en getUsers:', error)
      throw error
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: number): Promise<Usuario | null> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', id)
        .single()

      if (error || !data) {
        return null
      }

      return this.mapToUsuario(data)

    } catch (error) {
      console.error('Error obteniendo usuario por ID:', error)
      return null
    }
  }

  /**
   * Obtiene un usuario por email
   */
  async getUserByEmail(email: string): Promise<Usuario | null> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('email_usuario', email.toLowerCase().trim())
        .single()

      if (error || !data) {
        return null
      }

      return this.mapToUsuario(data)

    } catch (error) {
      console.error('Error obteniendo usuario por email:', error)
      return null
    }
  }

  /**
   * Obtiene un usuario por CI
   */
  async getUserByCI(ci: string): Promise<Usuario | null> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('ci_usuario', ci)
        .single()

      if (error || !data) {
        return null
      }

      return this.mapToUsuario(data)

    } catch (error) {
      console.error('Error obteniendo usuario por CI:', error)
      return null
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: CreateUserRequest, createdBy: number): Promise<Usuario> {
    try {
      // Validar datos
      const validation = await this.validateUserData(userData)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Verificar duplicados
      await this.checkForDuplicates(userData.email, userData.ci)

      // Crear usuario en la base de datos
      const { data, error } = await this.supabase
        .from('usuarios')
        .insert({
          nombres_usuario: userData.nombres.trim(),
          apellidos_usuario: userData.apellidos.trim(),
          email_usuario: userData.email.toLowerCase().trim(),
          ci_usuario: userData.ci,
          telefono_usuario: userData.telefono?.trim(),
          departamento_usuario: userData.departamento?.trim(),
          rol_usuario: userData.rol,
          activo: userData.activo ?? true,
          fecha_registro: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error creando usuario: ${error.message}`)
      }

      const usuario = this.mapToUsuario(data)

      // Asignar permisos predeterminados
      await this.permissionService.setupDefaultPermissions(
        usuario.getId(),
        userData.rol,
        createdBy
      )

      return usuario

    } catch (error) {
      console.error('Error en createUser:', error)
      throw error
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(id: number, userData: UpdateUserRequest, updatedBy: number): Promise<Usuario> {
    try {
      // Obtener usuario actual
      const currentUser = await this.getUserById(id)
      if (!currentUser) {
        throw new Error('Usuario no encontrado')
      }

      // Validar datos si se proporcionan
      if (userData.email || userData.ci) {
        const validation = await this.validateUserData({
          nombres: userData.nombres || currentUser.getNombresUsuario(),
          apellidos: userData.apellidos || currentUser.getApellidosUsuario(),
          email: userData.email || currentUser.getEmailUsuario(),
          ci: userData.ci || currentUser.getCiUsuario(),
          rol: userData.rol || currentUser.getRolUsuario()
        }, id)

        if (!validation.isValid) {
          throw new Error(validation.error)
        }
      }

      // Verificar duplicados si se cambia email o CI
      if (userData.email && userData.email !== currentUser.getEmailUsuario()) {
        await this.checkEmailExists(userData.email, id)
      }

      if (userData.ci && userData.ci !== currentUser.getCiUsuario()) {
        await this.checkCIExists(userData.ci, id)
      }

      // Preparar datos para actualización
      const updateData: any = {
        fecha_actualizacion: new Date().toISOString()
      }

      if (userData.nombres) updateData.nombres_usuario = userData.nombres.trim()
      if (userData.apellidos) updateData.apellidos_usuario = userData.apellidos.trim()
      if (userData.email) updateData.email_usuario = userData.email.toLowerCase().trim()
      if (userData.ci) updateData.ci_usuario = userData.ci
      if (userData.telefono !== undefined) updateData.telefono_usuario = userData.telefono?.trim()
      if (userData.departamento !== undefined) updateData.departamento_usuario = userData.departamento?.trim()
      if (userData.rol) updateData.rol_usuario = userData.rol
      if (userData.activo !== undefined) updateData.activo = userData.activo

      // Actualizar usuario
      const { data, error } = await this.supabase
        .from('usuarios')
        .update(updateData)
        .eq('id_usuario', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error actualizando usuario: ${error.message}`)
      }

      const usuario = this.mapToUsuario(data)

      // Si cambió el rol, actualizar permisos
      if (userData.rol && userData.rol !== currentUser.getRolUsuario()) {
        await this.permissionService.setupDefaultPermissions(
          id,
          userData.rol,
          updatedBy
        )
      }

      return usuario

    } catch (error) {
      console.error('Error en updateUser:', error)
      throw error
    }
  }

  /**
   * Desactiva un usuario
   */
  async deactivateUser(id: number, deactivatedBy: number): Promise<Usuario> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .update({
          activo: false,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error desactivando usuario: ${error.message}`)
      }

      return this.mapToUsuario(data)

    } catch (error) {
      console.error('Error en deactivateUser:', error)
      throw error
    }
  }

  /**
   * Activa un usuario
   */
  async activateUser(id: number, activatedBy: number): Promise<Usuario> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .update({
          activo: true,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error activando usuario: ${error.message}`)
      }

      return this.mapToUsuario(data)

    } catch (error) {
      console.error('Error en activateUser:', error)
      throw error
    }
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async deleteUser(id: number, deletedBy: number): Promise<void> {
    try {
      // En lugar de eliminar, desactivamos el usuario
      await this.deactivateUser(id, deletedBy)

      // Revocar todos los permisos
      const { error } = await this.supabase
        .from('permisos_usuario')
        .update({ activo: false })
        .eq('id_usuario', id)

      if (error) {
        console.error('Error revocando permisos:', error)
      }

    } catch (error) {
      console.error('Error en deleteUser:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(): Promise<UserStats> {
    try {
      // Total de usuarios
      const { count: totalUsuarios } = await this.supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })

      // Usuarios activos
      const { count: usuariosActivos } = await this.supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      // Usuarios inactivos
      const usuariosInactivos = (totalUsuarios || 0) - (usuariosActivos || 0)

      // Distribución por rol
      const { data: rolesData } = await this.supabase
        .from('usuarios')
        .select('rol_usuario')

      const roleCount = new Map<RolUsuario, number>()
      rolesData?.forEach(row => {
        const rol = row.rol_usuario as RolUsuario
        const count = roleCount.get(rol) || 0
        roleCount.set(rol, count + 1)
      })

      const distribucionPorRol = Array.from(roleCount.entries()).map(([rol, count]) => ({
        rol,
        count
      }))

      // Distribución por departamento
      const { data: deptData } = await this.supabase
        .from('usuarios')
        .select('departamento_usuario')
        .not('departamento_usuario', 'is', null)

      const deptCount = new Map<string, number>()
      deptData?.forEach(row => {
        const dept = row.departamento_usuario
        const count = deptCount.get(dept) || 0
        deptCount.set(dept, count + 1)
      })

      const distribucionPorDepartamento = Array.from(deptCount.entries()).map(([departamento, count]) => ({
        departamento,
        count
      }))

      // Usuarios recientes (últimos 5)
      const { data: recentData } = await this.supabase
        .from('usuarios')
        .select('*')
        .order('fecha_registro', { ascending: false })
        .limit(5)

      const usuariosRecientes = recentData?.map(row => this.mapToUsuario(row)) || []

      // Usuarios sin conexión reciente (más de 30 días)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: noConnectionData } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('activo', true)
        .or(`ultima_conexion.is.null,ultima_conexion.lt.${thirtyDaysAgo.toISOString()}`)

      const usuariosSinConexion = noConnectionData?.map(row => this.mapToUsuario(row)) || []

      return {
        totalUsuarios: totalUsuarios || 0,
        usuariosActivos: usuariosActivos || 0,
        usuariosInactivos,
        distribucionPorRol,
        distribucionPorDepartamento,
        usuariosRecientes,
        usuariosSinConexion
      }

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      throw error
    }
  }

  /**
   * Obtiene usuarios por rol
   */
  async getUsersByRole(rol: RolUsuario): Promise<Usuario[]> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('rol_usuario', rol)
        .eq('activo', true)
        .order('nombres_usuario')

      if (error) {
        throw new Error(`Error obteniendo usuarios por rol: ${error.message}`)
      }

      return data?.map(row => this.mapToUsuario(row)) || []

    } catch (error) {
      console.error('Error en getUsersByRole:', error)
      throw error
    }
  }

  /**
   * Obtiene usuarios por departamento
   */
  async getUsersByDepartment(departamento: string): Promise<Usuario[]> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('departamento_usuario', departamento)
        .eq('activo', true)
        .order('nombres_usuario')

      if (error) {
        throw new Error(`Error obteniendo usuarios por departamento: ${error.message}`)
      }

      return data?.map(row => this.mapToUsuario(row)) || []

    } catch (error) {
      console.error('Error en getUsersByDepartment:', error)
      throw error
    }
  }

  // =============================================
  // MÉTODOS PRIVADOS
  // =============================================

  /**
   * Mapea datos de la base de datos a entidad Usuario
   */
  private mapToUsuario(data: any): Usuario {
    // Sanitizar datos para evitar errores de validación
    const nombresUsuario = data.nombres_usuario && data.nombres_usuario.trim().length >= 2 
      ? data.nombres_usuario 
      : 'Usuario'
    
    const apellidosUsuario = data.apellidos_usuario && data.apellidos_usuario.trim().length >= 2 
      ? data.apellidos_usuario 
      : 'Temporal'
    
    const emailUsuario = data.email_usuario && data.email_usuario.includes('@') 
      ? data.email_usuario 
      : `usuario${data.id_usuario}@temporal.com`
    
    const ciUsuario = data.ci_usuario && data.ci_usuario.trim().length > 0 
      ? data.ci_usuario 
      : `temp${data.id_usuario.toString().padStart(6, '0')}`

    return new Usuario({
      id: data.id_usuario,
      idUsuarioAuth: data.id_usuario_auth,
      nombresUsuario,
      apellidosUsuario,
      emailUsuario,
      ciUsuario,
      telefonoUsuario: data.telefono_usuario,
      departamentoUsuario: data.departamento_usuario,
      rolUsuario: data.rol_usuario as RolUsuario,
      activo: data.activo,
      fechaRegistro: new Date(data.fecha_registro),
      fechaActualizacion: new Date(data.fecha_actualizacion),
      ultimaConexion: data.ultima_conexion ? new Date(data.ultima_conexion) : undefined
    })
  }

  /**
   * Valida datos de usuario
   */
  private async validateUserData(
    userData: Partial<CreateUserRequest>, 
    excludeId?: number
  ): Promise<{ isValid: boolean; error?: string }> {
    // Validar email
    if (userData.email) {
      if (!Email.isValid(userData.email)) {
        return { isValid: false, error: 'Email inválido' }
      }
    }

    // Validar CI
    if (userData.ci) {
      if (!CI.isValid(userData.ci)) {
        return { isValid: false, error: 'CI inválido' }
      }
    }

    // Validar nombres y apellidos
    if (userData.nombres && !userData.nombres.trim()) {
      return { isValid: false, error: 'Nombres son requeridos' }
    }

    if (userData.apellidos && !userData.apellidos.trim()) {
      return { isValid: false, error: 'Apellidos son requeridos' }
    }

    return { isValid: true }
  }

  /**
   * Verifica duplicados de email y CI
   */
  private async checkForDuplicates(email: string, ci: string, excludeId?: number): Promise<void> {
    await Promise.all([
      this.checkEmailExists(email, excludeId),
      this.checkCIExists(ci, excludeId)
    ])
  }

  /**
   * Verifica si un email ya existe
   */
  private async checkEmailExists(email: string, excludeId?: number): Promise<void> {
    let query = this.supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('email_usuario', email.toLowerCase().trim())

    if (excludeId) {
      query = query.neq('id_usuario', excludeId)
    }

    const { data, error } = await query.single()

    if (!error && data) {
      throw new Error('El email ya está registrado en el sistema')
    }
  }

  /**
   * Verifica si un CI ya existe
   */
  private async checkCIExists(ci: string, excludeId?: number): Promise<void> {
    let query = this.supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('ci_usuario', ci)

    if (excludeId) {
      query = query.neq('id_usuario', excludeId)
    }

    const { data, error } = await query.single()

    if (!error && data) {
      throw new Error('El CI ya está registrado en el sistema')
    }
  }
}