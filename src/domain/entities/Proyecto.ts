// =============================================
// ENTIDAD: Proyecto
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export interface ProyectoProps {
  id: number
  idCliente: number
  nombreProyecto: string
  descripcionProyecto?: string
  presupuestoProyecto?: number
  fechaInicioProyecto: Date
  fechaFinEstimadaProyecto?: Date
  fechaFinRealProyecto?: Date
  estadoProyecto: EstadoProyecto
  porcentajeAvanceProyecto: number
  idGerenteProyecto: number
  fechaRegistro: Date
  fechaActualizacion: Date
}

export enum EstadoProyecto {
  PLANIFICADO = 'planificado',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
  PAUSADO = 'pausado'
}

export class Proyecto {
  private readonly props: ProyectoProps

  constructor(props: ProyectoProps) {
    this.validate(props)
    this.props = { ...props }
  }

  private validate(props: ProyectoProps): void {
    if (!props.nombreProyecto || props.nombreProyecto.trim().length < 3) {
      throw new Error('Nombre del proyecto debe tener al menos 3 caracteres')
    }

    if (props.idCliente <= 0) {
      throw new Error('ID de cliente debe ser positivo')
    }

    if (props.idGerenteProyecto <= 0) {
      throw new Error('ID de gerente debe ser positivo')
    }

    if (props.porcentajeAvanceProyecto < 0 || props.porcentajeAvanceProyecto > 100) {
      throw new Error('Porcentaje de avance debe estar entre 0 y 100')
    }

    if (props.presupuestoProyecto !== undefined && props.presupuestoProyecto < 0) {
      throw new Error('Presupuesto no puede ser negativo')
    }

    if (props.fechaFinEstimadaProyecto && props.fechaFinEstimadaProyecto < props.fechaInicioProyecto) {
      throw new Error('Fecha fin estimada no puede ser anterior a fecha de inicio')
    }
  }

  // Getters
  getId(): number {
    return this.props.id
  }

  getIdCliente(): number {
    return this.props.idCliente
  }

  getNombreProyecto(): string {
    return this.props.nombreProyecto
  }

  getDescripcionProyecto(): string | undefined {
    return this.props.descripcionProyecto
  }

  getPresupuestoProyecto(): number | undefined {
    return this.props.presupuestoProyecto
  }

  getFechaInicioProyecto(): Date {
    return this.props.fechaInicioProyecto
  }

  getFechaFinEstimadaProyecto(): Date | undefined {
    return this.props.fechaFinEstimadaProyecto
  }

  getFechaFinRealProyecto(): Date | undefined {
    return this.props.fechaFinRealProyecto
  }

  getEstadoProyecto(): EstadoProyecto {
    return this.props.estadoProyecto
  }

  getPorcentajeAvanceProyecto(): number {
    return this.props.porcentajeAvanceProyecto
  }

  getIdGerenteProyecto(): number {
    return this.props.idGerenteProyecto
  }

  getFechaRegistro(): Date {
    return this.props.fechaRegistro
  }

  getFechaActualizacion(): Date {
    return this.props.fechaActualizacion
  }

  // Métodos de negocio
  isActivo(): boolean {
    return this.props.estadoProyecto === EstadoProyecto.EN_PROGRESO || 
           this.props.estadoProyecto === EstadoProyecto.PLANIFICADO
  }

  isCompletado(): boolean {
    return this.props.estadoProyecto === EstadoProyecto.COMPLETADO
  }

  isCancelado(): boolean {
    return this.props.estadoProyecto === EstadoProyecto.CANCELADO
  }

  isPausado(): boolean {
    return this.props.estadoProyecto === EstadoProyecto.PAUSADO
  }

  isEnProgreso(): boolean {
    return this.props.estadoProyecto === EstadoProyecto.EN_PROGRESO
  }

  isRetrasado(): boolean {
    if (!this.props.fechaFinEstimadaProyecto) return false
    const hoy = new Date()
    return hoy > this.props.fechaFinEstimadaProyecto && !this.isCompletado()
  }

  getDuracionEstimadaDias(): number | null {
    if (!this.props.fechaFinEstimadaProyecto) return null
    const diffTime = this.props.fechaFinEstimadaProyecto.getTime() - this.props.fechaInicioProyecto.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  getDuracionRealDias(): number | null {
    if (!this.props.fechaFinRealProyecto) return null
    const diffTime = this.props.fechaFinRealProyecto.getTime() - this.props.fechaInicioProyecto.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  getEstadoAvance(): 'en_tiempo' | 'retrasado' | 'adelantado' | 'completado' {
    if (this.isCompletado()) return 'completado'
    if (this.isRetrasado()) return 'retrasado'
    
    // Lógica simple para determinar si va adelantado
    const duracionEstimada = this.getDuracionEstimadaDias()
    if (duracionEstimada && this.props.porcentajeAvanceProyecto > 0) {
      const diasTranscurridos = Math.ceil((new Date().getTime() - this.props.fechaInicioProyecto.getTime()) / (1000 * 60 * 60 * 24))
      const avanceEsperado = (diasTranscurridos / duracionEstimada) * 100
      
      if (this.props.porcentajeAvanceProyecto > avanceEsperado + 10) {
        return 'adelantado'
      }
    }
    
    return 'en_tiempo'
  }

  // Métodos de modificación (retornan nueva instancia)
  actualizarAvance(nuevoAvance: number): Proyecto {
    if (nuevoAvance < 0 || nuevoAvance > 100) {
      throw new Error('Porcentaje de avance debe estar entre 0 y 100')
    }

    let nuevoEstado = this.props.estadoProyecto
    if (nuevoAvance === 100 && this.props.estadoProyecto === EstadoProyecto.EN_PROGRESO) {
      nuevoEstado = EstadoProyecto.COMPLETADO
    }

    return new Proyecto({
      ...this.props,
      porcentajeAvanceProyecto: nuevoAvance,
      estadoProyecto: nuevoEstado,
      fechaFinRealProyecto: nuevoAvance === 100 ? new Date() : this.props.fechaFinRealProyecto,
      fechaActualizacion: new Date()
    })
  }

  cambiarEstado(nuevoEstado: EstadoProyecto): Proyecto {
    return new Proyecto({
      ...this.props,
      estadoProyecto: nuevoEstado,
      fechaFinRealProyecto: nuevoEstado === EstadoProyecto.COMPLETADO ? new Date() : this.props.fechaFinRealProyecto,
      fechaActualizacion: new Date()
    })
  }

  asignarGerente(nuevoIdGerente: number): Proyecto {
    if (nuevoIdGerente <= 0) {
      throw new Error('ID de gerente debe ser positivo')
    }

    return new Proyecto({
      ...this.props,
      idGerenteProyecto: nuevoIdGerente,
      fechaActualizacion: new Date()
    })
  }

  actualizarFechas(fechaInicio?: Date, fechaFinEstimada?: Date): Proyecto {
    const nuevaFechaInicio = fechaInicio || this.props.fechaInicioProyecto
    const nuevaFechaFin = fechaFinEstimada || this.props.fechaFinEstimadaProyecto

    if (nuevaFechaFin && nuevaFechaFin < nuevaFechaInicio) {
      throw new Error('Fecha fin estimada no puede ser anterior a fecha de inicio')
    }

    return new Proyecto({
      ...this.props,
      fechaInicioProyecto: nuevaFechaInicio,
      fechaFinEstimadaProyecto: nuevaFechaFin,
      fechaActualizacion: new Date()
    })
  }

  actualizarInformacion(datos: {
    nombreProyecto?: string
    descripcionProyecto?: string
    presupuestoProyecto?: number
  }): Proyecto {
    return new Proyecto({
      ...this.props,
      ...datos,
      fechaActualizacion: new Date()
    })
  }

  // Método estático para crear nuevo proyecto
  static crear(datos: {
    idCliente: number
    nombreProyecto: string
    descripcionProyecto?: string
    presupuestoProyecto?: number
    fechaInicioProyecto: Date
    fechaFinEstimadaProyecto?: Date
    idGerenteProyecto: number
  }): Proyecto {
    return new Proyecto({
      id: 0, // Se asignará en la base de datos
      idCliente: datos.idCliente,
      nombreProyecto: datos.nombreProyecto,
      descripcionProyecto: datos.descripcionProyecto,
      presupuestoProyecto: datos.presupuestoProyecto,
      fechaInicioProyecto: datos.fechaInicioProyecto,
      fechaFinEstimadaProyecto: datos.fechaFinEstimadaProyecto,
      fechaFinRealProyecto: undefined,
      estadoProyecto: EstadoProyecto.PLANIFICADO,
      porcentajeAvanceProyecto: 0,
      idGerenteProyecto: datos.idGerenteProyecto,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    })
  }

  // Método para convertir a objeto plano (para persistencia)
  toPlainObject(): Record<string, any> {
    return {
      id_proyecto: this.props.id,
      id_cliente: this.props.idCliente,
      nombre_proyecto: this.props.nombreProyecto,
      descripcion_proyecto: this.props.descripcionProyecto,
      presupuesto_proyecto: this.props.presupuestoProyecto,
      fecha_inicio_proyecto: this.props.fechaInicioProyecto.toISOString(),
      fecha_fin_estimada_proyecto: this.props.fechaFinEstimadaProyecto?.toISOString(),
      fecha_fin_real_proyecto: this.props.fechaFinRealProyecto?.toISOString(),
      estado_proyecto: this.props.estadoProyecto,
      porcentaje_avance_proyecto: this.props.porcentajeAvanceProyecto,
      id_gerente_proyecto: this.props.idGerenteProyecto,
      fecha_registro: this.props.fechaRegistro.toISOString(),
      fecha_actualizacion: this.props.fechaActualizacion.toISOString()
    }
  }

  equals(other: Proyecto): boolean {
    return this.props.id === other.props.id
  }
}