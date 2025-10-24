// =============================================
// CASO DE USO: Implementar Control ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ControlISO27001, EstadoImplementacion, NivelMadurez } from '../../entities/ControlISO27001'
import { IControlISORepository } from '../../repositories/IControlISORepository'
import { NotFoundError, ValidationError } from '../../exceptions'

export interface ImplementControlRequest {
  idControl: number
  estadoImplementacion: EstadoImplementacion
  nivelMadurez?: NivelMadurez
  evidencias?: string[]
  justificacion?: string
  fechaImplementacion?: Date
  idUsuarioImplementador: number
}

export interface ImplementControlResponse {
  control: ControlISO27001
  impactoEnCumplimiento: {
    porcentajeAnterior: number
    porcentajeNuevo: number
    mejora: number
  }
  controlesRelacionados: {
    control: ControlISO27001
    impacto: 'positivo' | 'neutro' | 'requiere_atencion'
  }[]
  recomendacionesSiguientes: string[]
}

export class ImplementControlUseCase {
  constructor(
    private readonly controlRepository: IControlISORepository
  ) {}

  async execute(request: ImplementControlRequest): Promise<ImplementControlResponse> {
    // Validar datos de entrada
    this.validateRequest(request)

    // Obtener el control actual
    const controlActual = await this.controlRepository.findById(request.idControl)
    if (!controlActual) {
      throw new NotFoundError('Control', request.idControl)
    }

    // Calcular porcentaje de cumplimiento anterior
    const metricsAnterior = await this.controlRepository.getControlMetrics()
    const porcentajeAnterior = metricsAnterior.porcentajeImplementacion

    // Actualizar estado de implementación
    let controlActualizado = controlActual.cambiarEstadoImplementacion(request.estadoImplementacion)

    // Actualizar nivel de madurez si se proporciona
    if (request.nivelMadurez !== undefined) {
      controlActualizado = controlActualizado.actualizarMadurez(request.nivelMadurez)
    }

    // Agregar evidencias si se proporcionan
    if (request.evidencias && request.evidencias.length > 0) {
      for (const evidencia of request.evidencias) {
        controlActualizado = controlActualizado.agregarEvidencia(evidencia)
      }
    }

    // Actualizar fecha de revisión
    controlActualizado = controlActualizado.actualizarRevision()

    // Persistir los cambios
    const controlFinal = await this.controlRepository.update(
      request.idControl,
      controlActualizado as any
    )

    // Calcular nuevo porcentaje de cumplimiento
    const metricsNuevo = await this.controlRepository.getControlMetrics()
    const porcentajeNuevo = metricsNuevo.porcentajeImplementacion

    // Analizar controles relacionados
    const controlesRelacionados = await this.analyzeRelatedControls(controlFinal)

    // Generar recomendaciones siguientes
    const recomendacionesSiguientes = await this.generateNextRecommendations(controlFinal)

    return {
      control: controlFinal,
      impactoEnCumplimiento: {
        porcentajeAnterior,
        porcentajeNuevo,
        mejora: porcentajeNuevo - porcentajeAnterior
      },
      controlesRelacionados,
      recomendacionesSiguientes
    }
  }

  private validateRequest(request: ImplementControlRequest): void {
    const errors: string[] = []

    if (request.idControl <= 0) {
      errors.push('ID de control inválido')
    }

    if (request.idUsuarioImplementador <= 0) {
      errors.push('Usuario implementador inválido')
    }

    if (request.nivelMadurez !== undefined && 
        (request.nivelMadurez < 0 || request.nivelMadurez > 5)) {
      errors.push('Nivel de madurez debe estar entre 0 y 5')
    }

    // Validar coherencia entre estado y madurez
    if (request.estadoImplementacion === EstadoImplementacion.NO_IMPLEMENTADO && 
        request.nivelMadurez && request.nivelMadurez > 0) {
      errors.push('Control no implementado no puede tener nivel de madurez mayor a 0')
    }

    if (request.estadoImplementacion === EstadoImplementacion.IMPLEMENTADO && 
        request.nivelMadurez !== undefined && request.nivelMadurez < 2) {
      errors.push('Control implementado debe tener nivel de madurez mínimo de 2')
    }

    if (errors.length > 0) {
      throw new ValidationError('Datos de implementación inválidos', errors)
    }
  }

  private async analyzeRelatedControls(control: ControlISO27001): Promise<{
    control: ControlISO27001
    impacto: 'positivo' | 'neutro' | 'requiere_atencion'
  }[]> {
    // Obtener controles del mismo dominio
    const controlesDominio = await this.controlRepository.findByDomainNumber(
      control.getDomainNumber()
    )

    return controlesDominio
      .filter(c => c.getId() !== control.getId())
      .map(c => ({
        control: c,
        impacto: this.determineControlImpact(control, c)
      }))
      .slice(0, 5) // Limitar a 5 controles relacionados
  }

  private determineControlImpact(
    controlImplementado: ControlISO27001, 
    controlRelacionado: ControlISO27001
  ): 'positivo' | 'neutro' | 'requiere_atencion' {
    // Si el control relacionado no está implementado y el implementado es efectivo
    if (!controlRelacionado.isImplementado() && controlImplementado.isEfectivo()) {
      return 'requiere_atencion'
    }

    // Si ambos están implementados
    if (controlRelacionado.isImplementado() && controlImplementado.isImplementado()) {
      return 'positivo'
    }

    return 'neutro'
  }

  private async generateNextRecommendations(control: ControlISO27001): Promise<string[]> {
    const recomendaciones: string[] = []

    // Recomendaciones basadas en el estado actual
    if (control.isImplementado()) {
      if (control.getNivelMadurez() < 3) {
        recomendaciones.push('Mejorar el nivel de madurez del control para mayor efectividad')
      }

      if (!control.hasEvidences()) {
        recomendaciones.push('Documentar evidencias de implementación del control')
      }

      recomendaciones.push('Programar revisión periódica del control')
    }

    // Recomendaciones para controles del mismo dominio
    const analisisGaps = await this.controlRepository.findGapAnalysis()
    const dominioActual = control.getDominioControl()
    
    const brechasDominio = analisisGaps.dominiosIncompletos.find(
      d => d.dominio === dominioActual
    )

    if (brechasDominio && brechasDominio.brechas > 0) {
      recomendaciones.push(`Implementar ${brechasDominio.brechas} controles restantes del dominio ${dominioActual}`)
    }

    // Recomendaciones específicas por tipo de control
    switch (control.getTipoControl()) {
      case 'preventivo':
        recomendaciones.push('Considerar implementar controles detectivos complementarios')
        break
      case 'detectivo':
        recomendaciones.push('Verificar que existan controles correctivos asociados')
        break
      case 'correctivo':
        recomendaciones.push('Evaluar la efectividad de los controles preventivos relacionados')
        break
    }

    return recomendaciones.slice(0, 5) // Limitar a 5 recomendaciones
  }
}