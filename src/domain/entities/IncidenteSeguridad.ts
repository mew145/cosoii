// =============================================
// ENTIDAD: Incidente de Seguridad (ISO 27001)
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export interface IncidenteSeguridadProps {
  id: number
  tituloIncidente: string
  descripcionIncidente: string
  tipoIncidente: TipoIncidente
  severidadIncidente: SeveridadIncidente
  estadoIncidente: EstadoIncidente
  activosAfectados: number[] // ids de activos
  fechaDeteccion: Date
  fechaReporte: Date
  reportadoPor: number // id_usuario
  asignadoA: number // id_usuario
  impactoNegocio: string
  accionesInmediatas: string
  causaRaiz?: string
  leccionesAprendidas?: string
  fechaResolucion?: Date
  fechaRegistro: Date
  fechaActualizacion: Date
}

export enum TipoIncidente {
  ACCESO_NO_AUTORIZADO = 'acceso_no_autorizado',
  MALWARE = 'malware',
  PHISHING = 'phishing',
  PERDIDA_DATOS = 'perdida_datos',
  DENEGACION_SERVICIO = 'denegacion_servicio',
  VIOLACION_POLITICAS = 'violacion_politicas',
  FALLA_SISTEMA = 'falla_sistema',
  ROBO_INFORMACION = 'robo_informacion',
  OTRO = 'otro'
}

export enum SeveridadIncidente {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export enum EstadoIncidente {
  REPORTADO = 'reportado',
  EN_INVESTIGACION = 'en_investigacion',
  CONTENIDO = 'contenido',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado'
}

export class IncidenteSeguridad {
  private readonly props: IncidenteSeguridadProps

  constructor(props: IncidenteSeguridadProps) {
    this.validate(props)
    this.props = { ...props }
  }

  private validate(props: IncidenteSeguridadProps): void {
    if (!props.tituloIncidente || props.tituloIncidente.trim().length < 5) {
      throw new Error('Título del incidente debe tener al menos 5 caracteres')
    }

    if (!props.descripcionIncidente || props.descripcionIncidente.trim().length < 10) {
      throw new Error('Descripción del incidente debe tener al menos 10 caracteres')
    }

    if (!props.impactoNegocio || props.impactoNegocio.trim().length < 10) {
      throw new Error('Impacto en el negocio debe tener al menos 10 caracteres')
    }

    if (!props.accionesInmediatas || props.accionesInmediatas.trim().length < 10) {
      throw new Error('Acciones inmediatas debe tener al menos 10 caracteres')
    }

    if (props.reportadoPor <= 0) {
      throw new Error('ID de quien reporta debe ser positivo')
    }

    if (props.asignadoA <= 0) {
      throw new Error('ID de asignado debe ser positivo')
    }

    if (props.fechaReporte < props.fechaDeteccion) {
      throw new Error('Fecha de reporte no puede ser anterior a fecha de detección')
    }
  }

  // Getters
  getId(): number {
    return this.props.id
  }

  getTituloIncidente(): string {
    return this.props.tituloIncidente
  }

  getDescripcionIncidente(): string {
    return this.props.descripcionIncidente
  }

  getTipoIncidente(): TipoIncidente {
    return this.props.tipoIncidente
  }

  getSeveridadIncidente(): SeveridadIncidente {
    return this.props.severidadIncidente
  }

  getEstadoIncidente(): EstadoIncidente {
    return this.props.estadoIncidente
  }

  getActivosAfectados(): number[] {
    return [...this.props.activosAfectados]
  }

  getFechaDeteccion(): Date {
    return this.props.fechaDeteccion
  }

  getFechaReporte(): Date {
    return this.props.fechaReporte
  }

  getReportadoPor(): number {
    return this.props.reportadoPor
  }

  getAsignadoA(): number {
    return this.props.asignadoA
  }

  getImpactoNegocio(): string {
    return this.props.impactoNegocio
  }

  getAccionesInmediatas(): string {
    return this.props.accionesInmediatas
  }

  getCausaRaiz(): string | undefined {
    return this.props.causaRaiz
  }

  getLeccionesAprendidas(): string | undefined {
    return this.props.leccionesAprendidas
  }

  getFechaResolucion(): Date | undefined {
    return this.props.fechaResolucion
  }

  getFechaRegistro(): Date {
    return this.props.fechaRegistro
  }

  getFechaActualizacion(): Date {
    return this.props.fechaActualizacion
  }

  // Métodos de negocio
  isAbierto(): boolean {
    return ![EstadoIncidente.RESUELTO, EstadoIncidente.CERRADO].includes(this.props.estadoIncidente)
  }

  isCerrado(): boolean {
    return this.props.estadoIncidente === EstadoIncidente.CERRADO
  }

  isResuelto(): boolean {
    return this.props.estadoIncidente === EstadoIncidente.RESUELTO
  }

  isCritico(): boolean {
    return this.props.severidadIncidente === SeveridadIncidente.CRITICA
  }

  isAlto(): boolean {
    return this.props.severidadIncidente === SeveridadIncidente.ALTA || this.isCritico()
  }

  requiresImmediateAttention(): boolean {
    return this.isCritico() && this.isAbierto()
  }

  hasMultipleAssets(): boolean {
    return this.props.activosAfectados.length > 1
  }

  hasRootCauseAnalysis(): boolean {
    return !!this.props.causaRaiz && this.props.causaRaiz.trim().length > 0
  }

  hasLessonsLearned(): boolean {
    return !!this.props.leccionesAprendidas && this.props.leccionesAprendidas.trim().length > 0
  }

  isCompleteInvestigation(): boolean {
    return this.hasRootCauseAnalysis() && this.hasLessonsLearned()
  }

  getTiempoDeteccionHoras(): number {
    const diffTime = this.props.fechaReporte.getTime() - this.props.fechaDeteccion.getTime()
    return Math.round(diffTime / (1000 * 60 * 60))
  }

  getTiempoResolucionHoras(): number | null {
    if (!this.props.fechaResolucion) return null
    const diffTime = this.props.fechaResolucion.getTime() - this.props.fechaReporte.getTime()
    return Math.round(diffTime / (1000 * 60 * 60))
  }

  getTipoLabel(): string {
    const labels = {
      [TipoIncidente.ACCESO_NO_AUTORIZADO]: 'Acceso No Autorizado',
      [TipoIncidente.MALWARE]: 'Malware',
      [TipoIncidente.PHISHING]: 'Phishing',
      [TipoIncidente.PERDIDA_DATOS]: 'Pérdida de Datos',
      [TipoIncidente.DENEGACION_SERVICIO]: 'Denegación de Servicio',
      [TipoIncidente.VIOLACION_POLITICAS]: 'Violación de Políticas',
      [TipoIncidente.FALLA_SISTEMA]: 'Falla de Sistema',
      [TipoIncidente.ROBO_INFORMACION]: 'Robo de Información',
      [TipoIncidente.OTRO]: 'Otro'
    }
    return labels[this.props.tipoIncidente]
  }

  getSeveridadLabel(): string {
    const labels = {
      [SeveridadIncidente.BAJA]: 'Baja',
      [SeveridadIncidente.MEDIA]: 'Media',
      [SeveridadIncidente.ALTA]: 'Alta',
      [SeveridadIncidente.CRITICA]: 'Crítica'
    }
    return labels[this.props.severidadIncidente]
  }

  getEstadoLabel(): string {
    const labels = {
      [EstadoIncidente.REPORTADO]: 'Reportado',
      [EstadoIncidente.EN_INVESTIGACION]: 'En Investigación',
      [EstadoIncidente.CONTENIDO]: 'Contenido',
      [EstadoIncidente.RESUELTO]: 'Resuelto',
      [EstadoIncidente.CERRADO]: 'Cerrado'
    }
    return labels[this.props.estadoIncidente]
  }

  getSeveridadColor(): string {
    const colors = {
      [SeveridadIncidente.BAJA]: '#22c55e', // green-500
      [SeveridadIncidente.MEDIA]: '#eab308', // yellow-500
      [SeveridadIncidente.ALTA]: '#f97316', // orange-500
      [SeveridadIncidente.CRITICA]: '#ef4444' // red-500
    }
    return colors[this.props.severidadIncidente]
  }

  getEstadoColor(): string {
    const colors = {
      [EstadoIncidente.REPORTADO]: '#f59e0b', // amber-500
      [EstadoIncidente.EN_INVESTIGACION]: '#3b82f6', // blue-500
      [EstadoIncidente.CONTENIDO]: '#8b5cf6', // violet-500
      [EstadoIncidente.RESUELTO]: '#10b981', // emerald-500
      [EstadoIncidente.CERRADO]: '#6b7280' // gray-500
    }
    return colors[this.props.estadoIncidente]
  }

  // Métodos de modificación (retornan nueva instancia)
  cambiarEstado(nuevoEstado: EstadoIncidente): IncidenteSeguridad {
    const fechaResolucion = nuevoEstado === EstadoIncidente.RESUELTO 
      ? new Date() 
      : this.props.fechaResolucion

    return new IncidenteSeguridad({
      ...this.props,
      estadoIncidente: nuevoEstado,
      fechaResolucion,
      fechaActualizacion: new Date()
    })
  }

  cambiarSeveridad(nuevaSeveridad: SeveridadIncidente): IncidenteSeguridad {
    return new IncidenteSeguridad({
      ...this.props,
      severidadIncidente: nuevaSeveridad,
      fechaActualizacion: new Date()
    })
  }

  reasignar(nuevoAsignadoA: number): IncidenteSeguridad {
    if (nuevoAsignadoA <= 0) {
      throw new Error('ID de asignado debe ser positivo')
    }

    return new IncidenteSeguridad({
      ...this.props,
      asignadoA: nuevoAsignadoA,
      fechaActualizacion: new Date()
    })
  }

  agregarActivoAfectado(idActivo: number): IncidenteSeguridad {
    if (idActivo <= 0) {
      throw new Error('ID de activo debe ser positivo')
    }

    if (this.props.activosAfectados.includes(idActivo)) {
      return this // Ya está incluido
    }

    const nuevosActivos = [...this.props.activosAfectados, idActivo]

    return new IncidenteSeguridad({
      ...this.props,
      activosAfectados: nuevosActivos,
      fechaActualizacion: new Date()
    })
  }

  removerActivoAfectado(idActivo: number): IncidenteSeguridad {
    const nuevosActivos = this.props.activosAfectados.filter(id => id !== idActivo)

    return new IncidenteSeguridad({
      ...this.props,
      activosAfectados: nuevosActivos,
      fechaActualizacion: new Date()
    })
  }

  establecerCausaRaiz(causaRaiz: string): IncidenteSeguridad {
    if (!causaRaiz || causaRaiz.trim().length < 10) {
      throw new Error('Causa raíz debe tener al menos 10 caracteres')
    }

    return new IncidenteSeguridad({
      ...this.props,
      causaRaiz: causaRaiz.trim(),
      fechaActualizacion: new Date()
    })
  }

  establecerLeccionesAprendidas(lecciones: string): IncidenteSeguridad {
    if (!lecciones || lecciones.trim().length < 10) {
      throw new Error('Lecciones aprendidas debe tener al menos 10 caracteres')
    }

    return new IncidenteSeguridad({
      ...this.props,
      leccionesAprendidas: lecciones.trim(),
      fechaActualizacion: new Date()
    })
  }

  actualizarInformacion(datos: {
    tituloIncidente?: string
    descripcionIncidente?: string
    impactoNegocio?: string
    accionesInmediatas?: string
  }): IncidenteSeguridad {
    return new IncidenteSeguridad({
      ...this.props,
      ...datos,
      fechaActualizacion: new Date()
    })
  }

  // Método estático para crear nuevo incidente
  static crear(datos: {
    tituloIncidente: string
    descripcionIncidente: string
    tipoIncidente: TipoIncidente
    severidadIncidente: SeveridadIncidente
    activosAfectados: number[]
    fechaDeteccion: Date
    reportadoPor: number
    asignadoA: number
    impactoNegocio: string
    accionesInmediatas: string
  }): IncidenteSeguridad {
    return new IncidenteSeguridad({
      id: 0, // Se asignará en la base de datos
      tituloIncidente: datos.tituloIncidente,
      descripcionIncidente: datos.descripcionIncidente,
      tipoIncidente: datos.tipoIncidente,
      severidadIncidente: datos.severidadIncidente,
      estadoIncidente: EstadoIncidente.REPORTADO,
      activosAfectados: datos.activosAfectados,
      fechaDeteccion: datos.fechaDeteccion,
      fechaReporte: new Date(),
      reportadoPor: datos.reportadoPor,
      asignadoA: datos.asignadoA,
      impactoNegocio: datos.impactoNegocio,
      accionesInmediatas: datos.accionesInmediatas,
      causaRaiz: undefined,
      leccionesAprendidas: undefined,
      fechaResolucion: undefined,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    })
  }

  // Método para convertir a objeto plano (para persistencia)
  toPlainObject(): Record<string, any> {
    return {
      id_incidente: this.props.id,
      titulo_incidente: this.props.tituloIncidente,
      descripcion_incidente: this.props.descripcionIncidente,
      tipo_incidente: this.props.tipoIncidente,
      severidad_incidente: this.props.severidadIncidente,
      estado_incidente: this.props.estadoIncidente,
      activos_afectados: this.props.activosAfectados,
      fecha_deteccion: this.props.fechaDeteccion.toISOString(),
      fecha_reporte: this.props.fechaReporte.toISOString(),
      reportado_por: this.props.reportadoPor,
      asignado_a: this.props.asignadoA,
      impacto_negocio: this.props.impactoNegocio,
      acciones_inmediatas: this.props.accionesInmediatas,
      causa_raiz: this.props.causaRaiz,
      lecciones_aprendidas: this.props.leccionesAprendidas,
      fecha_resolucion: this.props.fechaResolucion?.toISOString(),
      fecha_registro: this.props.fechaRegistro.toISOString(),
      fecha_actualizacion: this.props.fechaActualizacion.toISOString()
    }
  }

  equals(other: IncidenteSeguridad): boolean {
    return this.props.id === other.props.id
  }
}