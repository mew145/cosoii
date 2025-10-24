// =============================================
// ENTIDAD: Activo de Información (ISO 27001)
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export interface ActivoInformacionProps {
  id: number
  nombreActivo: string
  descripcionActivo: string
  tipoActivo: TipoActivo
  clasificacionSeguridad: ClasificacionSeguridad
  propietarioActivo: number // id_usuario
  custodioActivo?: number // id_usuario
  ubicacionActivo?: string
  valorActivo: ValorActivo // 1-5 escala de criticidad
  estadoActivo: EstadoActivo
  fechaRegistro: Date
  fechaActualizacion: Date
}

export enum TipoActivo {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  DATOS = 'datos',
  SERVICIOS = 'servicios',
  PERSONAS = 'personas',
  INSTALACIONES = 'instalaciones'
}

export enum ClasificacionSeguridad {
  PUBLICO = 'publico',
  INTERNO = 'interno',
  CONFIDENCIAL = 'confidencial',
  RESTRINGIDO = 'restringido'
}

export enum EstadoActivo {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  RETIRADO = 'retirado',
  EN_MANTENIMIENTO = 'en_mantenimiento'
}

export type ValorActivo = 1 | 2 | 3 | 4 | 5

export class ActivoInformacion {
  private readonly props: ActivoInformacionProps

  constructor(props: ActivoInformacionProps) {
    this.validate(props)
    this.props = { ...props }
  }

  private validate(props: ActivoInformacionProps): void {
    if (!props.nombreActivo || props.nombreActivo.trim().length < 3) {
      throw new Error('Nombre del activo debe tener al menos 3 caracteres')
    }

    if (!props.descripcionActivo || props.descripcionActivo.trim().length < 10) {
      throw new Error('Descripción del activo debe tener al menos 10 caracteres')
    }

    if (props.propietarioActivo <= 0) {
      throw new Error('ID de propietario debe ser positivo')
    }

    if (props.custodioActivo !== undefined && props.custodioActivo <= 0) {
      throw new Error('ID de custodio debe ser positivo')
    }

    if (props.valorActivo < 1 || props.valorActivo > 5) {
      throw new Error('Valor del activo debe estar entre 1 y 5')
    }
  }

  // Getters
  getId(): number {
    return this.props.id
  }

  getNombreActivo(): string {
    return this.props.nombreActivo
  }

  getDescripcionActivo(): string {
    return this.props.descripcionActivo
  }

  getTipoActivo(): TipoActivo {
    return this.props.tipoActivo
  }

  getClasificacionSeguridad(): ClasificacionSeguridad {
    return this.props.clasificacionSeguridad
  }

  getPropietarioActivo(): number {
    return this.props.propietarioActivo
  }

  getCustodioActivo(): number | undefined {
    return this.props.custodioActivo
  }

  getUbicacionActivo(): string | undefined {
    return this.props.ubicacionActivo
  }

  getValorActivo(): ValorActivo {
    return this.props.valorActivo
  }

  getEstadoActivo(): EstadoActivo {
    return this.props.estadoActivo
  }

  getFechaRegistro(): Date {
    return this.props.fechaRegistro
  }

  getFechaActualizacion(): Date {
    return this.props.fechaActualizacion
  }

  // Métodos de negocio
  isActivo(): boolean {
    return this.props.estadoActivo === EstadoActivo.ACTIVO
  }

  isRetirado(): boolean {
    return this.props.estadoActivo === EstadoActivo.RETIRADO
  }

  isCritico(): boolean {
    return this.props.valorActivo >= 4
  }

  isConfidencial(): boolean {
    return this.props.clasificacionSeguridad === ClasificacionSeguridad.CONFIDENCIAL ||
           this.props.clasificacionSeguridad === ClasificacionSeguridad.RESTRINGIDO
  }

  requiresSpecialHandling(): boolean {
    return this.isCritico() || this.isConfidencial()
  }

  getValorLabel(): string {
    const labels = {
      1: 'Muy Bajo',
      2: 'Bajo',
      3: 'Medio',
      4: 'Alto',
      5: 'Crítico'
    }
    return labels[this.props.valorActivo]
  }

  getClasificacionLabel(): string {
    const labels = {
      [ClasificacionSeguridad.PUBLICO]: 'Público',
      [ClasificacionSeguridad.INTERNO]: 'Interno',
      [ClasificacionSeguridad.CONFIDENCIAL]: 'Confidencial',
      [ClasificacionSeguridad.RESTRINGIDO]: 'Restringido'
    }
    return labels[this.props.clasificacionSeguridad]
  }

  getTipoLabel(): string {
    const labels = {
      [TipoActivo.HARDWARE]: 'Hardware',
      [TipoActivo.SOFTWARE]: 'Software',
      [TipoActivo.DATOS]: 'Datos',
      [TipoActivo.SERVICIOS]: 'Servicios',
      [TipoActivo.PERSONAS]: 'Personas',
      [TipoActivo.INSTALACIONES]: 'Instalaciones'
    }
    return labels[this.props.tipoActivo]
  }

  getEstadoLabel(): string {
    const labels = {
      [EstadoActivo.ACTIVO]: 'Activo',
      [EstadoActivo.INACTIVO]: 'Inactivo',
      [EstadoActivo.RETIRADO]: 'Retirado',
      [EstadoActivo.EN_MANTENIMIENTO]: 'En Mantenimiento'
    }
    return labels[this.props.estadoActivo]
  }

  getClasificacionColor(): string {
    const colors = {
      [ClasificacionSeguridad.PUBLICO]: '#22c55e', // green-500
      [ClasificacionSeguridad.INTERNO]: '#3b82f6', // blue-500
      [ClasificacionSeguridad.CONFIDENCIAL]: '#f59e0b', // amber-500
      [ClasificacionSeguridad.RESTRINGIDO]: '#ef4444' // red-500
    }
    return colors[this.props.clasificacionSeguridad]
  }

  getValorColor(): string {
    const colors = {
      1: '#22c55e', // green-500
      2: '#84cc16', // lime-500
      3: '#eab308', // yellow-500
      4: '#f97316', // orange-500
      5: '#ef4444'  // red-500
    }
    return colors[this.props.valorActivo]
  }

  // Métodos de modificación (retornan nueva instancia)
  cambiarEstado(nuevoEstado: EstadoActivo): ActivoInformacion {
    return new ActivoInformacion({
      ...this.props,
      estadoActivo: nuevoEstado,
      fechaActualizacion: new Date()
    })
  }

  reclasificar(nuevaClasificacion: ClasificacionSeguridad): ActivoInformacion {
    return new ActivoInformacion({
      ...this.props,
      clasificacionSeguridad: nuevaClasificacion,
      fechaActualizacion: new Date()
    })
  }

  revalorizar(nuevoValor: ValorActivo): ActivoInformacion {
    return new ActivoInformacion({
      ...this.props,
      valorActivo: nuevoValor,
      fechaActualizacion: new Date()
    })
  }

  asignarPropietario(nuevoIdPropietario: number): ActivoInformacion {
    if (nuevoIdPropietario <= 0) {
      throw new Error('ID de propietario debe ser positivo')
    }

    return new ActivoInformacion({
      ...this.props,
      propietarioActivo: nuevoIdPropietario,
      fechaActualizacion: new Date()
    })
  }

  asignarCustodio(nuevoIdCustodio?: number): ActivoInformacion {
    if (nuevoIdCustodio !== undefined && nuevoIdCustodio <= 0) {
      throw new Error('ID de custodio debe ser positivo')
    }

    return new ActivoInformacion({
      ...this.props,
      custodioActivo: nuevoIdCustodio,
      fechaActualizacion: new Date()
    })
  }

  actualizarUbicacion(nuevaUbicacion?: string): ActivoInformacion {
    return new ActivoInformacion({
      ...this.props,
      ubicacionActivo: nuevaUbicacion,
      fechaActualizacion: new Date()
    })
  }

  actualizarInformacion(datos: {
    nombreActivo?: string
    descripcionActivo?: string
    ubicacionActivo?: string
  }): ActivoInformacion {
    return new ActivoInformacion({
      ...this.props,
      ...datos,
      fechaActualizacion: new Date()
    })
  }

  // Método estático para crear nuevo activo
  static crear(datos: {
    nombreActivo: string
    descripcionActivo: string
    tipoActivo: TipoActivo
    clasificacionSeguridad: ClasificacionSeguridad
    propietarioActivo: number
    custodioActivo?: number
    ubicacionActivo?: string
    valorActivo: ValorActivo
  }): ActivoInformacion {
    return new ActivoInformacion({
      id: 0, // Se asignará en la base de datos
      nombreActivo: datos.nombreActivo,
      descripcionActivo: datos.descripcionActivo,
      tipoActivo: datos.tipoActivo,
      clasificacionSeguridad: datos.clasificacionSeguridad,
      propietarioActivo: datos.propietarioActivo,
      custodioActivo: datos.custodioActivo,
      ubicacionActivo: datos.ubicacionActivo,
      valorActivo: datos.valorActivo,
      estadoActivo: EstadoActivo.ACTIVO,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    })
  }

  // Método para convertir a objeto plano (para persistencia)
  toPlainObject(): Record<string, any> {
    return {
      id_activo: this.props.id,
      nombre_activo: this.props.nombreActivo,
      descripcion_activo: this.props.descripcionActivo,
      tipo_activo: this.props.tipoActivo,
      clasificacion_seguridad: this.props.clasificacionSeguridad,
      propietario_activo: this.props.propietarioActivo,
      custodio_activo: this.props.custodioActivo,
      ubicacion_activo: this.props.ubicacionActivo,
      valor_activo: this.props.valorActivo,
      estado_activo: this.props.estadoActivo,
      fecha_registro: this.props.fechaRegistro.toISOString(),
      fecha_actualizacion: this.props.fechaActualizacion.toISOString()
    }
  }

  equals(other: ActivoInformacion): boolean {
    return this.props.id === other.props.id
  }
}