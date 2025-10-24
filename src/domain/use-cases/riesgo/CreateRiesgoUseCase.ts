// =============================================
// CASO DE USO: Crear Riesgo
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Riesgo } from '../../entities/Riesgo'
import { IRiesgoRepository } from '../../repositories/IRiesgoRepository'
import { RiskCalculationService } from '../../services/RiskCalculationService'
import { ValidationError } from '../../exceptions'

export interface CreateRiesgoRequest {
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
}

export interface CreateRiesgoResponse {
  riesgo: Riesgo
  nivelRiesgoCalculado: {
    valor: number
    categoria: string
    requiereAccion: boolean
    recomendaciones: {
      accionRecomendada: string
      prioridad: string
      plazoMaximo: string
      requiereAprobacion: boolean
    }
  }
}

export class CreateRiesgoUseCase {
  constructor(
    private readonly riesgoRepository: IRiesgoRepository
  ) {}

  async execute(request: CreateRiesgoRequest): Promise<CreateRiesgoResponse> {
    // Validar datos de entrada
    await this.validateRequest(request)

    // Crear el riesgo
    const riesgo = Riesgo.crear({
      idProyecto: request.idProyecto,
      idCategoriaRiesgo: request.idCategoriaRiesgo,
      idTipoRiesgo: request.idTipoRiesgo,
      idUsuarioRegistro: request.idUsuarioRegistro,
      idPropietarioRiesgo: request.idPropietarioRiesgo,
      tituloRiesgo: request.tituloRiesgo,
      descripcionRiesgo: request.descripcionRiesgo,
      causaRaizRiesgo: request.causaRaizRiesgo,
      consecuenciaRiesgo: request.consecuenciaRiesgo,
      probabilidad: request.probabilidad,
      impacto: request.impacto,
      idVelocidadImpacto: request.idVelocidadImpacto
    })

    // Validar la evaluación del riesgo
    const validacion = RiskCalculationService.validateRiskAssessment(riesgo)
    if (!validacion.esValido) {
      throw new ValidationError('Evaluación de riesgo inválida', validacion.errores)
    }

    // Persistir el riesgo
    const riesgoCreado = await this.riesgoRepository.create(riesgo as any)

    // Obtener información del nivel de riesgo
    const nivelRiesgo = riesgoCreado.getNivelRiesgoCalculado()
    const recomendaciones = RiskCalculationService.generateRiskRecommendations(nivelRiesgo)

    return {
      riesgo: riesgoCreado,
      nivelRiesgoCalculado: {
        valor: nivelRiesgo.getValor(),
        categoria: nivelRiesgo.getLabel(),
        requiereAccion: nivelRiesgo.requiresAction(),
        recomendaciones
      }
    }
  }

  private async validateRequest(request: CreateRiesgoRequest): Promise<void> {
    const errors: string[] = []

    // Validar campos requeridos
    if (!request.tituloRiesgo || request.tituloRiesgo.trim().length < 5) {
      errors.push('Título del riesgo debe tener al menos 5 caracteres')
    }

    if (!request.descripcionRiesgo || request.descripcionRiesgo.trim().length < 10) {
      errors.push('Descripción del riesgo debe tener al menos 10 caracteres')
    }

    if (request.idProyecto <= 0) {
      errors.push('Debe especificar un proyecto válido')
    }

    if (request.idCategoriaRiesgo <= 0) {
      errors.push('Debe especificar una categoría de riesgo válida')
    }

    if (request.idTipoRiesgo <= 0) {
      errors.push('Debe especificar un tipo de riesgo válido')
    }

    if (request.idUsuarioRegistro <= 0) {
      errors.push('Usuario de registro inválido')
    }

    if (request.idPropietarioRiesgo <= 0) {
      errors.push('Debe asignar un propietario al riesgo')
    }

    // Validar probabilidad e impacto
    if (request.probabilidad < 1 || request.probabilidad > 5) {
      errors.push('Probabilidad debe estar entre 1 y 5')
    }

    if (request.impacto < 1 || request.impacto > 5) {
      errors.push('Impacto debe estar entre 1 y 5')
    }

    // Validar asignación de propietario
    const validacionPropietario = await this.riesgoRepository.validateRiskAssignment(
      request.idProyecto, 
      request.idPropietarioRiesgo
    )
    
    if (!validacionPropietario) {
      errors.push('El propietario asignado no tiene permisos en este proyecto')
    }

    if (errors.length > 0) {
      throw new ValidationError('Datos de riesgo inválidos', errors)
    }
  }
}