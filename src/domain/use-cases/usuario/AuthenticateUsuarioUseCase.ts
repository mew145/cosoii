// =============================================
// CASO DE USO: Autenticar Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Usuario, EstadoUsuario } from '../../entities/Usuario'
import { IUsuarioRepository } from '../../repositories/IUsuarioRepository'
import { NotFoundError, ValidationError } from '../../exceptions'

export interface AuthenticateUsuarioRequest {
  email: string
  password?: string
  provider?: 'google' | 'linkedin' | 'github'
  providerId?: string
}

export interface AuthenticateUsuarioResponse {
  usuario: Usuario
  isFirstLogin: boolean
  requiresPasswordChange: boolean
  sessionToken: string
}

export class AuthenticateUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  async execute(request: AuthenticateUsuarioRequest): Promise<AuthenticateUsuarioResponse> {
    // Validar datos de entrada
    this.validateRequest(request)

    // Buscar usuario
    const usuario = await this.findUser(request)

    // Validar estado del usuario
    this.validateUserState(usuario)

    // Actualizar último acceso
    const usuarioActualizado = await this.usuarioRepository.updateLastAccess(usuario.getId())

    // Determinar si es primer login
    const isFirstLogin = !usuario.getUltimoAcceso()

    // Determinar si requiere cambio de contraseña
    const requiresPasswordChange = this.shouldChangePassword(usuario, isFirstLogin)

    // Generar token de sesión (en implementación real sería JWT)
    const sessionToken = this.generateSessionToken(usuario)

    return {
      usuario: usuarioActualizado,
      isFirstLogin,
      requiresPasswordChange,
      sessionToken
    }
  }

  private validateRequest(request: AuthenticateUsuarioRequest): void {
    if (!request.email) {
      throw new ValidationError('Email es requerido')
    }

    if (!request.provider && !request.password) {
      throw new ValidationError('Password es requerido para autenticación local')
    }

    if (request.provider && !request.providerId) {
      throw new ValidationError('Provider ID es requerido para autenticación OAuth')
    }
  }

  private async findUser(request: AuthenticateUsuarioRequest): Promise<Usuario> {
    let usuario: Usuario | null = null

    if (request.provider && request.providerId) {
      // Autenticación OAuth
      usuario = await this.usuarioRepository.findByProviderId(
        request.provider as any, 
        request.providerId
      )
    } else {
      // Autenticación local
      usuario = await this.usuarioRepository.findActiveByEmail(request.email)
    }

    if (!usuario) {
      throw new NotFoundError('Usuario', request.email)
    }

    return usuario
  }

  private validateUserState(usuario: Usuario): void {
    if (!usuario.canLogin()) {
      const estado = usuario.getEstadoUsuario()
      
      switch (estado) {
        case EstadoUsuario.INACTIVO:
          throw new ValidationError('Usuario inactivo. Contacte al administrador.')
        case EstadoUsuario.BLOQUEADO:
          throw new ValidationError('Usuario bloqueado. Contacte al administrador.')
        case EstadoUsuario.PENDIENTE_VERIFICACION:
          throw new ValidationError('Email pendiente de verificación.')
        default:
          throw new ValidationError('Usuario no puede iniciar sesión.')
      }
    }

    if (!usuario.hasCompletedProfile()) {
      throw new ValidationError('Perfil de usuario incompleto. Complete su información.')
    }
  }

  private shouldChangePassword(usuario: Usuario, isFirstLogin: boolean): boolean {
    // Cambio requerido en primer login para usuarios locales
    if (isFirstLogin && !usuario.isOAuthUser()) {
      return true
    }

    // Cambio requerido si la contraseña es muy antigua (implementación futura)
    // const passwordAge = this.getPasswordAge(usuario)
    // return passwordAge > 90 // días

    return false
  }

  private generateSessionToken(usuario: Usuario): string {
    // En implementación real, generar JWT con claims apropiados
    const payload = {
      userId: usuario.getId(),
      email: usuario.getCorreoElectronico(),
      role: usuario.getIdRol(),
      department: usuario.getIdDepartamento(),
      timestamp: Date.now()
    }

    // Por ahora, retornar un token simple (en producción usar JWT)
    return Buffer.from(JSON.stringify(payload)).toString('base64')
  }
}