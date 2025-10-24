// =============================================
// CASO DE USO: Crear Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Usuario, EstadoUsuario, ProviderOAuth, RolUsuario } from '../../entities/Usuario'
import { IUsuarioRepository } from '../../repositories/IUsuarioRepository'
import { DuplicateError, ValidationError } from '../../exceptions'

export interface CreateUsuarioRequest {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno?: string
  ci: string
  correoElectronico: string
  telefonoContacto?: string
  idRol: RolUsuario
  idDepartamento: number
  fechaIngresoEmpresa?: Date
  providerOAuth?: ProviderOAuth
  providerId?: string
}

export interface CreateUsuarioResponse {
  usuario: Usuario
  requiresEmailVerification: boolean
  temporaryPassword?: string
}

export class CreateUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  async execute(request: CreateUsuarioRequest): Promise<CreateUsuarioResponse> {
    // Validar datos de entrada
    await this.validateRequest(request)

    // Verificar unicidad de email y CI
    await this.validateUniqueness(request)

    // Crear el usuario
    const usuario = Usuario.crear({
      nombresUsuario: request.nombres,
      apellidosUsuario: `${request.apellidoPaterno} ${request.apellidoMaterno}`.trim(),
      ciUsuario: request.ci,
      emailUsuario: request.correoElectronico,
      telefonoUsuario: request.telefonoContacto,
      rolUsuario: request.idRol,
      departamentoUsuario: request.idDepartamento?.toString()
    })

    // Persistir el usuario
    const usuarioCreado = await this.usuarioRepository.create(usuario as any)

    // Determinar si requiere verificación de email
    const requiresEmailVerification = !request.providerOAuth

    // Generar contraseña temporal si es necesario
    const temporaryPassword = !request.providerOAuth 
      ? this.generateTemporaryPassword() 
      : undefined

    return {
      usuario: usuarioCreado,
      requiresEmailVerification,
      temporaryPassword
    }
  }

  private async validateRequest(request: CreateUsuarioRequest): Promise<void> {
    const errors: string[] = []

    if (!request.nombres || request.nombres.trim().length < 2) {
      errors.push('Nombres debe tener al menos 2 caracteres')
    }

    if (!request.apellidoPaterno || request.apellidoPaterno.trim().length < 2) {
      errors.push('Apellido paterno debe tener al menos 2 caracteres')
    }

    if (!request.ci || request.ci.trim().length < 7) {
      errors.push('CI debe tener al menos 7 dígitos')
    }

    if (!request.correoElectronico || !this.isValidEmail(request.correoElectronico)) {
      errors.push('Email debe tener un formato válido')
    }

    if (!request.idRol || !Object.values(RolUsuario).includes(request.idRol)) {
      errors.push('Debe especificar un rol válido')
    }

    if (request.idDepartamento <= 0) {
      errors.push('Debe especificar un departamento válido')
    }

    if (request.providerOAuth && !request.providerId) {
      errors.push('Provider ID es requerido para usuarios OAuth')
    }

    if (errors.length > 0) {
      throw new ValidationError('Datos de usuario inválidos', errors)
    }
  }

  private async validateUniqueness(request: CreateUsuarioRequest): Promise<void> {
    // Verificar email único
    const emailExists = await this.usuarioRepository.findByEmail(request.correoElectronico)
    if (emailExists) {
      throw new DuplicateError('Usuario', 'email', request.correoElectronico)
    }

    // Verificar CI único
    const ciExists = await this.usuarioRepository.findByCI(request.ci)
    if (ciExists) {
      throw new DuplicateError('Usuario', 'CI', request.ci)
    }

    // Verificar provider ID único si es OAuth
    if (request.providerOAuth && request.providerId) {
      const providerExists = await this.usuarioRepository.findByProviderId(
        request.providerOAuth, 
        request.providerId
      )
      if (providerExists) {
        throw new DuplicateError('Usuario', 'provider ID', request.providerId)
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private generateTemporaryPassword(): string {
    // Generar contraseña temporal segura
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}