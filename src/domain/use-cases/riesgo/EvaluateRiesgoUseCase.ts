// =============================================
// CASO DE USO: Evaluar Riesgo
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Riesgo } from '../../entities/Riesgo'
import { IRiesgoRepository } from '../../repositories/IRiesgoRepository'
import { RiskCalculationService } from '../../services/RiskCalculationService'
import { Probabilidad } from '../../value-objects/Probabilidad'
import { Impacto } from '../../value-objects/Impacto'
import { NotFoundError, ValidationError } from '../../exceptions'

export interface EvaluateRiesgoRequest {
  idRiesgo: number
  probabilidad: number
  impacto: number
  causaRaizRiesgo?: string
  consecuenciaRiesgo?: string
  justificacionEvaluacion?: string
  idUsuarioEvaluador: number
}

export interface EvaluateRiesgoResponse {
  riesgo: Riesgo
  evaluacionAnterior: {
    probabilidad: number
    impacto: number
    nivelRiesgo: number
  }
  evaluacionNueva: {
    probabilidad: number
    impacto: number
    nivelRiesgo: number
    categoria: string
  }
  cambioSignificativo: boolean
  recomendaciones: {
    accionRecomendada: string
    prioridad: string
    plazoMaximo: string
    requiereAprobacion: boolean
  }
  alertas: string[]
}

export class EvaluateRiesgoUseCase {
  constructor(
    private readonly riesgoRepository: IRiesgoRepository
  ) {}

  async execute(request: EvaluateRiesgoRequest): Promise<EvaluateRiesgoResponse> {
    // Validar datos de entrada
    this.validateRequest(request)

    // Obtener el riesgo actual
    const riesgoActual = await this.riesgoRepository.findById(request.idRiesgo)
    if (!riesgoActual) {
      throw new NotFoundError('Riesgo', request.idRiesgo)
    }

    // Guardar evaluación anterior
    const evaluacionAnterior = {
      probabilidad: riesgoActual.getProbabilidad().getValue(),
      impacto: riesgoActual.getImpacto().getValue(),
      nivelRiesgo: riesgoActual.getNivelRiesgoCalculado().getValor()
    }

    // Crear nuevos value objects
    const nuevaProbabilidad = Probabilidad.fromNumber(request.probabilidad)
    const nuevoImpacto = Impacto.fromNumber(request.impacto)

    // Actualizar el riesgo con nueva evaluación
    let riesgoActualizado = riesgoActual.actualizarProbabilidadImpacto(
      nuevaProbabilidad, 
      nuevoImpacto
    )

    // Actualizar información adicional si se proporciona
    if (request.causaRaizRiesgo || request.consecuenciaRiesgo) {
      riesgoActualizado = riesgoActualizado.actualizarInformacion({
        causaRaizRiesgo: request.causaRaizRiesgo,
        consecuenciaRiesgo: request.consecuenciaRiesgo
      })
    }

    // Validar la nueva evaluación
    const validacion = RiskCalculationService.validateRiskAssessment(riesgoActualizado)
    if (!validacion.esValido) {
      throw new ValidationError('Nueva evaluación de riesgo inválida', validacion.errores)
    }

    // Persistir los cambios
    const riesgoFinal = await this.riesgoRepository.update(
      request.idRiesgo, 
      riesgoActualizado as any
    )

    // Calcular información de la nueva evaluación
    const nivelRiesgoNuevo = riesgoFinal.getNivelRiesgoCalculado()
    const evaluacionNueva = {
      probabilidad: request.probabilidad,
      impacto: request.impacto,
      nivelRiesgo: nivelRiesgoNuevo.getValor(),
      categoria: nivelRiesgoNuevo.getLabel()
    }

    // Determinar si hay cambio significativo
    const cambioSignificativo = this.isCambioSignificativo(
      evaluacionAnterior, 
      evaluacionNueva
    )

    // Generar recomendaciones
    const recomendaciones = RiskCalculationService.generateRiskRecommendations(nivelRiesgoNuevo)

    // Generar alertas si es necesario
    const alertas = this.generateAlertas(
      evaluacionAnterior, 
      evaluacionNueva, 
      cambioSignificativo,
      validacion.advertencias
    )

    return {
      riesgo: riesgoFinal,
      evaluacionAnterior,
      evaluacionNueva,
      cambioSignificativo,
      recomendaciones,
      alertas
    }
  }

  private validateRequest(request: EvaluateRiesgoRequest): void {
    const errors: string[] = []

    if (request.idRiesgo <= 0) {
      errors.push('ID de riesgo inválido')
    }

    if (request.probabilidad < 1 || request.probabilidad > 5) {
      errors.push('Probabilidad debe estar entre 1 y 5')
    }

    if (request.impacto < 1 || request.impacto > 5) {
      errors.push('Impacto debe estar entre 1 y 5')
    }

    if (request.idUsuarioEvaluador <= 0) {
      errors.push('Usuario evaluador inválido')
    }

    if (errors.length > 0) {
      throw new ValidationError('Datos de evaluación inválidos', errors)
    }
  }

  private isCambioSignificativo(
    anterior: { nivelRiesgo: number }, 
    nueva: { nivelRiesgo: number }
  ): boolean {
    const diferencia = Math.abs(nueva.nivelRiesgo - anterior.nivelRiesgo)
    
    // Cambio significativo si:
    // - Diferencia mayor a 5 puntos
    // - Cambio de categoría (bajo->alto, etc.)
    return diferencia >= 5 || this.hayCambioCategoriaSignificativo(anterior, nueva)
  }

  private hayCambioCategoriaSignificativo(
    anterior: { nivelRiesgo: number }, 
    nueva: { nivelRiesgo: number }
  ): boolean {
    const categoriaAnterior = this.getCategoriaFromNivel(anterior.nivelRiesgo)
    const categoriaNueva = this.getCategoriaFromNivel(nueva.nivelRiesgo)
    
    // Cambios significativos: bajo->alto, medio->crítico, etc.
    const cambiosSignificativos = [
      ['bajo', 'alto'], ['bajo', 'critico'],
      ['medio', 'critico'], ['alto', 'bajo'],
      ['critico', 'bajo'], ['critico', 'medio']
    ]
    
    return cambiosSignificativos.some(([desde, hacia]) => 
      categoriaAnterior === desde && categoriaNueva === hacia
    )
  }

  private getCategoriaFromNivel(nivel: number): string {
    if (nivel <= 6) return 'bajo'
    if (nivel <= 12) return 'medio'
    if (nivel <= 20) return 'alto'
    return 'critico'
  }

  private generateAlertas(
    anterior: { nivelRiesgo: number },
    nueva: { nivelRiesgo: number, categoria: string },
    cambioSignificativo: boolean,
    advertencias: string[]
  ): string[] {
    const alertas: string[] = []

    if (cambioSignificativo) {
      alertas.push('Cambio significativo en el nivel de riesgo detectado')
    }

    if (nueva.nivelRiesgo > 20) {
      alertas.push('Riesgo crítico: requiere atención inmediata')
    }

    if (nueva.nivelRiesgo > anterior.nivelRiesgo + 10) {
      alertas.push('Escalamiento importante del riesgo')
    }

    if (nueva.categoria === 'Crítico' && anterior.nivelRiesgo <= 12) {
      alertas.push('Riesgo escalado a nivel crítico - notificar a dirección')
    }

    // Agregar advertencias de validación
    alertas.push(...advertencias)

    return alertas
  }
}