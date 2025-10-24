// =============================================
// SERVICIO DE AUTENTICACIÓN
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { Email } from '@/domain/value-objects/Email'
import { CI } from '@/domain/value-objects/CI'
import { PermissionService } from './PermissionService'
import type { AuthError, User, Session } from '@supabase/supabase-js'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  nombres: string
  apellidos: string
  ci: string
  telefono?: string
  departamento?: string
  rol?: RolUsuario
}

export interface AuthResponse {
  success: boolean
  error?: string
  user?: Usuario
  session?: Session | null
}

export interface PasswordResetRequest {
  email: string
  redirectTo?: string
}

export interface PasswordUpdateRequest {
  password: string
  confirmPassword?: string
  accessToken?: string
}

export interface OAuthProvider {
  provider: 'google' | 'microsoft'
  redirectTo?: string
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthService {
  private supabase = createBrowserClient()
  private permissionService = new PermissionService()

  /**
   * Iniciar sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials

      // Validar email
      if (!Email.isValid(email)) {
        return {
          success: false,
          error: 'Email inválido'
        }
      }

      // Intentar login con Supabase
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error)
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Error en la autenticación'
        }
      }

      // Obtener datos del usuario desde la base de datos
      const usuario = await this.getUserFromDatabase(data.user.id)
      
      if (!usuario) {
        return {
          success: false,
          error: 'Usuario no encontrado en la base de datos'
        }
      }

      // Actualizar último acceso
      await this.updateLastLogin(usuario.getId())

      return {
        success: true,
        user: usuario,
        session: data.session
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error interno del servidor'
      }
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData, createdBy?: number): Promise<AuthResponse> {
    try {
      // Validar datos
      const validationResult = await this.validateRegistrationData(userData)
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        }
      }

      // Verificar unicidad de email y CI
      const emailExists = await this.checkEmailExists(userData.email)
      if (emailExists) {
        return {
          success: false,
          error: 'El email ya está registrado'
        }
      }

      const ciExists = await this.checkCIExists(userData.ci)
      if (ciExists) {
        return {
          success: false,
          error: 'El CI ya está registrado'
        }
      }

      // Crear usuario en Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        options: {
          data: {
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            ci: userData.ci,
            telefono: userData.telefono,
            departamento: userData.departamento
          }
        }
      })

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error)
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Error creando el usuario'
        }
      }

      // Crear registro en la base de datos
      const usuario = await this.createUserRecord(data.user.id, userData, createdBy)
      
      if (!usuario) {
        return {
          success: false,
          error: 'Error creando el registro del usuario'
        }
      }

      return {
        success: true,
        user: usuario,
        session: data.session
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error interno del servidor'
      }
    }
  }

  /**
   * Login con OAuth
   */
  async loginWithOAuth(provider: 'google' | 'github', redirectTo?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/api/auth/callback`
        }
      })

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error)
        }
      }

      return { success: true }

    } catch (error: any) {
      return {
        success: false,
        error: 'Error en autenticación OAuth'
      }
    }
  }

  /**
   * Manejar callback de OAuth
   */
  async handleOAuthCallback(): Promise<AuthResponse> {
    try {
      // Obtener la sesión actual después del callback OAuth
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession()

      if (sessionError) {
        return {
          success: false,
          error: this.translateAuthError(sessionError)
        }
      }

      if (!session || !session.user) {
        return {
          success: false,
          error: 'No se pudo obtener la sesión de usuario'
        }
      }

      // Verificar si el usuario ya existe en nuestra base de datos
      let usuario = await this.getUserFromDatabase(session.user.id)

      // Si no existe, crear el registro del usuario
      if (!usuario) {
        usuario = await this.createUserFromOAuth(session.user)
        
        if (!usuario) {
          return {
            success: false,
            error: 'Error creando el registro del usuario'
          }
        }
      }

      // Actualizar último acceso
      await this.updateLastLogin(usuario.getId())

      return {
        success: true,
        user: usuario,
        session: session
      }

    } catch (error: any) {
      console.error('Error en handleOAuthCallback:', error)
      return {
        success: false,
        error: 'Error procesando autenticación OAuth'
      }
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error)
        }
      }

      return { success: true }

    } catch (error: any) {
      return {
        success: false,
        error: 'Error cerrando sesión'
      }
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      return await this.getUserFromDatabase(user.id)

    } catch (error) {
      return null
    }
  }

  /**
   * Obtener sesión actual
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error || !session) {
        return null
      }

      return session

    } catch (error) {
      return null
    }
  }

  /**
   * Verificar si está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!session
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
    try {
      if (!Email.isValid(request.email)) {
        return {
          success: false,
          error: 'Email inválido'
        }
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        request.email.toLowerCase().trim(),
        {
          redirectTo: request.redirectTo || `${window.location.origin}/auth/reset-password`
        }
      )

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error)
        }
      }

      return { success: true }

    } catch (error: any) {
      return {
        success: false,
        error: 'Error enviando email de recuperación'
      }
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(request: PasswordUpdateRequest): Promise<{ success: boolean; error?: string }> {
    try {
      if (!request.password || request.password.length < 6) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        }
      }

      const { error } = await this.supabase.auth.updateUser({
        password: request.password
      })

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error)
        }
      }

      return { success: true }

    } catch (error: any) {
      return {
        success: false,
        error: 'Error actualizando contraseña'
      }
    }
  }

  // Métodos privados de utilidad

  private async getUserFromDatabase(authId: string): Promise<Usuario | null> {
    try {
      console.log('🔍 Buscando usuario en BD con authId:', authId)
      
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', authId)
        .single()

      if (error) {
        console.log('❌ Error consultando BD:', error.message)
        return null
      }

      if (!data) {
        console.log('❌ Usuario no encontrado en BD')
        return null
      }

      console.log('✅ Usuario encontrado en BD:', data.nombres_usuario, data.apellidos_usuario)

      return new Usuario({
        id: data.id_usuario,
        idUsuarioAuth: data.id_usuario_auth,
        nombresUsuario: data.nombres_usuario,
        apellidosUsuario: data.apellidos_usuario,
        emailUsuario: data.email_usuario,
        ciUsuario: data.ci_usuario,
        telefonoUsuario: data.telefono_usuario,
        departamentoUsuario: data.departamento_usuario,
        rolUsuario: data.rol_usuario,
        activo: data.activo,
        fechaRegistro: new Date(data.fecha_registro),
        fechaActualizacion: new Date(data.fecha_actualizacion),
        ultimaConexion: data.ultima_conexion ? new Date(data.ultima_conexion) : undefined
      })

    } catch (error) {
      console.log('❌ Excepción en getUserFromDatabase:', error)
      return null
    }
  }

  private async createUserRecord(authId: string, userData: RegisterData, createdBy?: number): Promise<Usuario | null> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .insert({
          id_usuario_auth: authId,
          nombres_usuario: userData.nombres,
          apellidos_usuario: userData.apellidos,
          email_usuario: userData.email,
          ci_usuario: userData.ci,
          telefono_usuario: userData.telefono,
          departamento_usuario: userData.departamento,
          rol_usuario: userData.rol || RolUsuario.AUDITOR,
          activo: true,
          fecha_registro: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single()

      if (error || !data) {
        return null
      }

      return new Usuario({
        id: data.id_usuario,
        idUsuarioAuth: data.id_usuario_auth,
        nombresUsuario: data.nombres_usuario,
        apellidosUsuario: data.apellidos_usuario,
        emailUsuario: data.email_usuario,
        ciUsuario: data.ci_usuario,
        telefonoUsuario: data.telefono_usuario,
        departamentoUsuario: data.departamento_usuario,
        rolUsuario: data.rol_usuario,
        activo: data.activo,
        fechaRegistro: new Date(data.fecha_registro),
        fechaActualizacion: new Date(data.fecha_actualizacion)
      })

    } catch (error) {
      return null
    }
  }

  private async createUserFromOAuth(authUser: any): Promise<Usuario | null> {
    try {
      // Extraer información del usuario OAuth
      const email = authUser.email
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
      const [nombres = '', ...apellidosParts] = fullName.split(' ')
      const apellidos = apellidosParts.join(' ') || ''

      const { data, error } = await this.supabase
        .from('usuarios')
        .insert({
          id_usuario_auth: authUser.id,
          nombres_usuario: nombres || 'Usuario',
          apellidos_usuario: apellidos || 'OAuth',
          email_usuario: email,
          ci_usuario: null, // Se completará después
          telefono_usuario: null,
          departamento_usuario: null,
          rol_usuario: RolUsuario.AUDITOR,
          activo: false, // Requiere activación manual
          fecha_registro: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single()

      if (error || !data) {
        console.error('Error creando usuario OAuth:', error)
        return null
      }

      return new Usuario({
        id: data.id_usuario,
        idUsuarioAuth: data.id_usuario_auth,
        nombresUsuario: data.nombres_usuario,
        apellidosUsuario: data.apellidos_usuario,
        emailUsuario: data.email_usuario,
        ciUsuario: data.ci_usuario,
        telefonoUsuario: data.telefono_usuario,
        departamentoUsuario: data.departamento_usuario,
        rolUsuario: data.rol_usuario,
        activo: data.activo,
        fechaRegistro: new Date(data.fecha_registro),
        fechaActualizacion: new Date(data.fecha_actualizacion)
      })

    } catch (error) {
      console.error('Error en createUserFromOAuth:', error)
      return null
    }
  }

  private async validateRegistrationData(userData: RegisterData): Promise<{ isValid: boolean; error?: string }> {
    // Validar email
    if (!Email.isValid(userData.email)) {
      return { isValid: false, error: 'Email inválido' }
    }

    // Validar CI
    if (!CI.isValid(userData.ci)) {
      return { isValid: false, error: 'CI inválido' }
    }

    // Validar nombres y apellidos
    if (!userData.nombres || userData.nombres.trim().length < 2) {
      return { isValid: false, error: 'Nombres debe tener al menos 2 caracteres' }
    }

    if (!userData.apellidos || userData.apellidos.trim().length < 2) {
      return { isValid: false, error: 'Apellidos debe tener al menos 2 caracteres' }
    }

    // Validar contraseña
    if (!userData.password || userData.password.length < 6) {
      return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    return { isValid: true }
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email_usuario', email.toLowerCase().trim())
        .single()

      return !!data

    } catch (error) {
      return false
    }
  }

  private async checkCIExists(ci: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('ci_usuario', ci.trim())
        .single()

      return !!data

    } catch (error) {
      return false
    }
  }

  private async updateLastLogin(userId: number): Promise<void> {
    try {
      await this.supabase
        .from('usuarios')
        .update({
          ultima_conexion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', userId)

    } catch (error) {
      // Log error but don't throw
    }
  }

  private translateAuthError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Credenciales inválidas'
      case 'Email not confirmed':
        return 'Email no confirmado'
      case 'User already registered':
        return 'Usuario ya registrado'
      case 'Password should be at least 6 characters':
        return 'La contraseña debe tener al menos 6 caracteres'
      default:
        return 'Error de autenticación'
    }
  }
}