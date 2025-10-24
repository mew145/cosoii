// =============================================
// ENTIDAD: Riesgo
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Probabilidad } from '../value-objects/Probabilidad'
import { Impacto } from '../value-objects/Impacto'
import { NivelRiesgo } from '../value-objects/NivelRiesgo'

export interface RiesgoProps {
  id: number
  idProyecto: number
  idCategoriaRiesgo: number
  idTipoRiesgo: number
  idVelocidadImpacto?: number
  idEstadoRiesgo: number
  idUsuarioRegistro: number
  idPropietarioRiesgo: number
  tituloRiesgo: string
  descripcionRiesgo: string
  causaRaizRiesgo?: string
  consecuenciaRiesgo?: string
  probabilidad: Probabilidad
  impacto: Impacto
  nivelRiesgoCalculado: NivelRiesgo
  fechaRegistroRiesgo: Date
  fechaActualizacionRiesgo: Date
}

export class Riesgo {
  private readonly props: RiesgoProps

  constructor(props: Omit<RiesgoProps, 'nivelRiesgoCalculado'> & { nivelRiesgoCalculado?: NivelRiesgo }) {
    this.validate(props)
    
    // Calcular nivel de riesgo si no se proporciona
    const nivelRiesgo = props.nivelRiesgoCalculado || 
      new NivelRiesgo(props.probabilidad, props.impacto)

    this.props = {
      ...props,
      nivelRiesgoCalculado: nivelRiesgo
    }
  }

  private validate(props: Omit<RiesgoProps, 'nivelRiesgoCalculado'>): void {
    if (!props.tituloRiesgo || props.tituloRiesgo.trim().length < 5) {
      throw new Error('Título del riesgo debe tener al menos 5 caracteres')
    }

    if (!props.descripcionRiesgo || props.descripcionRiesgo.trim().length < 10) {
      throw new Error('Descripción del riesgo debe tener al menos 10 caracteres')
    }

    if (props.idProyecto <= 0) {
      throw new Error('ID de proyecto debe ser positivo')
    }

    if (props.idUsuarioRegistro <= 0) {
      throw new Error('ID de usuario registro debe ser positivo')
    }

    if (props.idPropietarioRiesgo <= 0) {
      throw new Error('ID de propietario debe ser positivo')
    }
  }

  // Getters
  getId(): number {
    return this.props.id
  }

  getIdProyecto(): number {
    return this.props.idProyecto
  }

  getIdCategoriaRiesgo(): number {
    return this.props.idCategoriaRiesgo
  }

  getIdTipoRiesgo(): number {
    return this.props.idTipoRiesgo
  }

  getIdVelocidadImpacto(): number | undefined {
    return this.props.idVelocidadImpacto
  }

  getIdEstadoRiesgo(): number {
    return this.props.idEstadoRiesgo
  }

  getIdUsuarioRegistro(): number {
    return this.props.idUsuarioRegistro
  }

  getIdPropietarioRiesgo(): number {
    return this.props.idPropietarioRiesgo
  }

  getTituloRiesgo(): string {
    return this.props.tituloRiesgo
  }

  getDescripcionRiesgo(): string {
    return this.props.descripcionRiesgo
  }

  getCausaRaizRiesgo(): string | undefined {
    return this.props.causaRaizRiesgo
  }

  getConsecuenciaRiesgo(): string | undefined {
    return this.props.consecuenciaRiesgo
  }

  getProbabilidad(): Probabilidad {
    return this.props.probabilidad
  }

  getImpacto(): Impacto {
    return this.props.impacto
  }

  getNivelRiesgoCalculado(): NivelRiesgo {
    return this.props.nivelRiesgoCalculado
  }

  getFechaRegistroRiesgo(): Date {
    return this.props.fechaRegistroRiesgo
  }

  getFechaActualizacionRiesgo(): Date {
    return this.props.fechaActualizacionRiesgo
  }

  // Métodos de negocio
  isActivo(): boolean {
    // Verificar si el estado no es final
    return ![5, 6].includes(this.props.idEstadoRiesgo) // cerrado, materializado
  }

  isCritico(): boolean {
    return this.props.nivelRiesgoCalculado.requiresImmediateAction()
  }

  requiresAction(): boolean {
    return this.props.nivelRiesgoCalculado.requiresAction()
  }

  isAcceptable(): boolean {
    return this.props.nivelRiesgoCalculado.isAcceptable()
  }

  needsMonitoring(): boolean {
    return this.props.nivelRiesgoCalculado.needsMonitoring()
  }

  hasCompleteInformation(): boolean {
    return !!(
      this.props.causaRaizRiesgo &&
      this.props.consecuenciaRiesgo &&
      this.props.causaRaizRiesgo.trim().length > 0 &&
      this.props.consecuenciaRiesgo.trim().length > 0
    )
  }

  // Métodos de modificación (retornan nueva instancia)
  actualizarProbabilidadImpacto(nuevaProbabilidad: Probabilidad, nuevoImpacto: Impacto): Riesgo {
    const nuevoNivelRiesgo = new NivelRiesgo(nuevaProbabilidad, nuevoImpacto)
    
    return new Riesgo({
      ...this.props,
      probabilidad: nuevaProbabilidad,
      impacto: nuevoImpacto,
      nivelRiesgoCalculado: nuevoNivelRiesgo,
      fechaActualizacionRiesgo: new Date()
    })
  }

  cambiarEstado(nuevoIdEstado: number): Riesgo {
    return new Riesgo({
      ...this.props,
      idEstadoRiesgo: nuevoIdEstado,
      fechaActualizacionRiesgo: new Date()
    })
  }

  asignarPropietario(nuevoIdPropietario: number): Riesgo {
    if (nuevoIdPropietario <= 0) {
      throw new Error('ID de propietario debe ser positivo')
    }

    return new Riesgo({
      ...this.props,
      idPropietarioRiesgo: nuevoIdPropietario,
      fechaActualizacionRiesgo: new Date()
    })
  }

  actualizarInformacion(datos: {
    tituloRiesgo?: string
    descripcionRiesgo?: string
    causaRaizRiesgo?: string
    consecuenciaRiesgo?: string
  }): Riesgo {
    const datosActualizados = { ...this.props, ...datos }
    
    return new Riesgo({
      ...datosActualizados,
      fechaActualizacionRiesgo: new Date()
    })
  }

  // Método estático para crear nuevo riesgo
  static crear(datos: {
    idProyecto: number
    idCategoriaRiesgo: number
    idTipoRiesgo: number
    idUsuarioRegistro: number
    idPropietarioRiesgo: number
    tituloRiesgo: string
    descripcionRiesgo: string
    causaRaizRiesgo?: string
    consecuenciaRiesgo?: string
    probabilidad: number
    impacto: number
    idVelocidadImpacto?: number
  }): Riesgo {
    const probabilidad = Probabilidad.fromNumber(datos.probabilidad)
    const impacto = Impacto.fromNumber(datos.impacto)

    return new Riesgo({
      id: 0, // Se asignará en la base de datos
      idProyecto: datos.idProyecto,
      idCategoriaRiesgo: datos.idCategoriaRiesgo,
      idTipoRiesgo: datos.idTipoRiesgo,
      idVelocidadImpacto: datos.idVelocidadImpacto,
      idEstadoRiesgo: 1, // identificado por defecto
      idUsuarioRegistro: datos.idUsuarioRegistro,
      idPropietarioRiesgo: datos.idPropietarioRiesgo,
      tituloRiesgo: datos.tituloRiesgo,
      descripcionRiesgo: datos.descripcionRiesgo,
      causaRaizRiesgo: datos.causaRaizRiesgo,
      consecuenciaRiesgo: datos.consecuenciaRiesgo,
      probabilidad,
      impacto,
      fechaRegistroRiesgo: new Date(),
      fechaActualizacionRiesgo: new Date()
    })
  }

  // Método para convertir a objeto plano (para persistencia)
  toPlainObject(): Record<string, any> {
    return {
      id_riesgo: this.props.id,
      id_proyecto: this.props.idProyecto,
      id_categoria_riesgo: this.props.idCategoriaRiesgo,
      id_tipo_riesgo: this.props.idTipoRiesgo,
      id_velocidad_impacto: this.props.idVelocidadImpacto,
      id_estado_riesgo: this.props.idEstadoRiesgo,
      id_usuario_registro: this.props.idUsuarioRegistro,
      id_propietario_riesgo: this.props.idPropietarioRiesgo,
      titulo_riesgo: this.props.tituloRiesgo,
      descripcion_riesgo: this.props.descripcionRiesgo,
      causa_raiz_riesgo: this.props.causaRaizRiesgo,
      consecuencia_riesgo: this.props.consecuenciaRiesgo,
      valor_probabilidad: this.props.probabilidad.getValue(),
      valor_impacto: this.props.impacto.getValue(),
      nivel_riesgo_calculado: this.props.nivelRiesgoCalculado.getValor(),
      fecha_registro_riesgo: this.props.fechaRegistroRiesgo.toISOString(),
      fecha_actualizacion_riesgo: this.props.fechaActualizacionRiesgo.toISOString()
    }
  }

  equals(other: Riesgo): boolean {
    return this.props.id === other.props.id
  }
}