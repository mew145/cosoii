// =============================================
// ENTIDAD: Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { CI } from '../value-objects/CI'
import { Email } from '../value-objects/Email'
import { RolUsuario } from '../types/RolUsuario'

export interface UsuarioProps {
  id: number
  idUsuarioAuth?: string
  nombresUsuario: string
  apellidosUsuario: string
  emailUsuario: string
  ciUsuario: string
  telefonoUsuario?: string
  departamentoUsuario?: string
  rolUsuario: RolUsuario
  activo: boolean
  fechaRegistro: Date
  fechaActualizacion: Date
  ultimaConexion?: Date
}

export class Usuario {
  private readonly props: UsuarioProps

  constructor(props: UsuarioProps) {
    this.validate(props)
    this.props = { ...props }
  }

  private validate(props: UsuarioProps): void {
    if (!props.nombresUsuario || props.nombresUsuario.trim().length < 2) {
      throw new Error('Nombres debe tener al menos 2 caracteres')
    }

    if (!props.apellidosUsuario || props.apellidosUsuario.trim().length < 2) {
      throw new Error('Apellidos debe tener al menos 2 caracteres')
    }

    if (!props.emailUsuario || !props.emailUsuario.includes('@')) {
      throw new Error('Email inválido')
    }

    if (!props.ciUsuario || props.ciUsuario.trim().length === 0) {
      throw new Error('CI es requerido')
    }
  }

  // Getters
  getId(): number {
    return this.props.id
  }

  getIdUsuarioAuth(): string | undefined {
    return this.props.idUsuarioAuth
  }

  getNombresUsuario(): string {
    return this.props.nombresUsuario
  }

  getApellidosUsuario(): string {
    return this.props.apellidosUsuario
  }

  getNombreCompleto(): string {
    return `${this.props.nombresUsuario} ${this.props.apellidosUsuario}`
  }

  getEmailUsuario(): string {
    return this.props.emailUsuario
  }

  getCiUsuario(): string {
    return this.props.ciUsuario
  }

  getTelefonoUsuario(): string | undefined {
    return this.props.telefonoUsuario
  }

  getDepartamentoUsuario(): string | undefined {
    return this.props.departamentoUsuario
  }

  getRolUsuario(): RolUsuario {
    return this.props.rolUsuario
  }

  getActivo(): boolean {
    return this.props.activo
  }

  getFechaRegistro(): Date {
    return this.props.fechaRegistro
  }

  getFechaActualizacion(): Date {
    return this.props.fechaActualizacion
  }

  getUltimaConexion(): Date | undefined {
    return this.props.ultimaConexion
  }

  // Alias para compatibilidad
  getUltimoAcceso(): Date | undefined {
    return this.getUltimaConexion()
  }

  getEstadoUsuario(): EstadoUsuario {
    return this.props.activo ? EstadoUsuario.ACTIVO : EstadoUsuario.INACTIVO
  }

  isOAuthUser(): boolean {
    return !!this.props.idUsuarioAuth
  }

  getCorreoElectronico(): string {
    return this.getEmailUsuario()
  }

  getIdRol(): RolUsuario {
    return this.getRolUsuario()
  }

  getIdDepartamento(): string | undefined {
    return this.getDepartamentoUsuario()
  }

  // Métodos de negocio
  isActivo(): boolean {
    return this.props.activo
  }

  canLogin(): boolean {
    return this.props.activo
  }

  hasCompletedProfile(): boolean {
    return !!(
      this.props.nombresUsuario &&
      this.props.apellidosUsuario &&
      this.props.emailUsuario &&
      this.props.ciUsuario &&
      this.props.rolUsuario
    )
  }

  // Métodos de modificación (retornan nueva instancia)
  activar(): Usuario {
    return new Usuario({
      ...this.props,
      activo: true,
      fechaActualizacion: new Date()
    })
  }

  desactivar(): Usuario {
    return new Usuario({
      ...this.props,
      activo: false,
      fechaActualizacion: new Date()
    })
  }

  actualizarUltimaConexion(): Usuario {
    return new Usuario({
      ...this.props,
      ultimaConexion: new Date(),
      fechaActualizacion: new Date()
    })
  }

  cambiarRol(nuevoRol: RolUsuario): Usuario {
    return new Usuario({
      ...this.props,
      rolUsuario: nuevoRol,
      fechaActualizacion: new Date()
    })
  }

  actualizarPerfil(datos: {
    nombresUsuario?: string
    apellidosUsuario?: string
    telefonoUsuario?: string
    departamentoUsuario?: string
  }): Usuario {
    return new Usuario({
      ...this.props,
      ...datos,
      fechaActualizacion: new Date()
    })
  }

  // Método estático para crear nuevo usuario
  static crear(datos: {
    nombresUsuario: string
    apellidosUsuario: string
    emailUsuario: string
    ciUsuario: string
    telefonoUsuario?: string
    departamentoUsuario?: string
    rolUsuario: RolUsuario
    idUsuarioAuth?: string
  }): Usuario {
    return new Usuario({
      id: 0, // Se asignará en la base de datos
      idUsuarioAuth: datos.idUsuarioAuth,
      nombresUsuario: datos.nombresUsuario,
      apellidosUsuario: datos.apellidosUsuario,
      emailUsuario: datos.emailUsuario,
      ciUsuario: datos.ciUsuario,
      telefonoUsuario: datos.telefonoUsuario,
      departamentoUsuario: datos.departamentoUsuario,
      rolUsuario: datos.rolUsuario,
      activo: true,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    })
  }

  // Método para convertir a objeto plano (para persistencia)
  toPlainObject(): Record<string, any> {
    return {
      id_usuario: this.props.id,
      id_usuario_auth: this.props.idUsuarioAuth,
      nombres_usuario: this.props.nombresUsuario,
      apellidos_usuario: this.props.apellidosUsuario,
      email_usuario: this.props.emailUsuario,
      ci_usuario: this.props.ciUsuario,
      telefono_usuario: this.props.telefonoUsuario,
      departamento_usuario: this.props.departamentoUsuario,
      rol_usuario: this.props.rolUsuario,
      activo: this.props.activo,
      fecha_registro: this.props.fechaRegistro.toISOString(),
      fecha_actualizacion: this.props.fechaActualizacion.toISOString(),
      ultima_conexion: this.props.ultimaConexion?.toISOString()
    }
  }

  equals(other: Usuario): boolean {
    return this.props.id === other.props.id
  }
}

// Enums y tipos adicionales
export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
  PENDIENTE = 'pendiente',
  BLOQUEADO = 'bloqueado',
  PENDIENTE_VERIFICACION = 'pendiente_verificacion'
}

export enum ProviderOAuth {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  LOCAL = 'local'
}

// Re-exportar RolUsuario para compatibilidad
export { RolUsuario } from '../types/RolUsuario'