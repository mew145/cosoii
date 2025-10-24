// =============================================
// CASO DE USO: Crear Activo de Información
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ActivoInformacion, TipoActivo, ClasificacionSeguridad, ValorActivo } from '../../entities/ActivoInformacion'
import { IActivoRepository } from '../../repositories/IActivoRepository'
import { ValidationError } from '../../exceptions'

export interface CreateActivoRequest {
  nombreActivo: string
  descripcionActivo: string
  tipoActivo: TipoActivo
  clasificacionSeguridad: ClasificacionSeguridad
  propietarioActivo: number
  custodioActivo?: number
  ubicacionActivo?: string
  valorActivo: ValorActivo
}

export interface CreateActivoResponse {
  activo: ActivoInformacion
  recomendacionesSeguridad: string[]
  controlesRequeridos: string[]
  alertas: string[]
}

export class CreateActivoUseCase {
  constructor(
    private readonly activoRepository: IActivoRepository
  ) {}

  async execute(request: CreateActivoRequest): Promise<CreateActivoResponse> {
    // Validar datos de entrada
    await this.validateRequest(request)

    // Crear el activo
    const activo = ActivoInformacion.crear({
      nombreActivo: request.nombreActivo,
      descripcionActivo: request.descripcionActivo,
      tipoActivo: request.tipoActivo,
      clasificacionSeguridad: request.clasificacionSeguridad,
      propietarioActivo: request.propietarioActivo,
      custodioActivo: request.custodioActivo,
      ubicacionActivo: request.ubicacionActivo,
      valorActivo: request.valorActivo
    })

    // Persistir el activo
    const activoCreado = await this.activoRepository.create(activo as any)

    // Generar recomendaciones de seguridad
    const recomendacionesSeguridad = this.generateSecurityRecommendations(activoCreado)

    // Generar controles requeridos
    const controlesRequeridos = this.generateRequiredControls(activoCreado)

    // Generar alertas si es necesario
    const alertas = this.generateAlertas(activoCreado)

    return {
      activo: activoCreado,
      recomendacionesSeguridad,
      controlesRequeridos,
      alertas
    }
  }

  private async validateRequest(request: CreateActivoRequest): Promise<void> {
    const errors: string[] = []

    // Validar campos requeridos
    if (!request.nombreActivo || request.nombreActivo.trim().length < 3) {
      errors.push('Nombre del activo debe tener al menos 3 caracteres')
    }

    if (!request.descripcionActivo || request.descripcionActivo.trim().length < 10) {
      errors.push('Descripción del activo debe tener al menos 10 caracteres')
    }

    if (request.propietarioActivo <= 0) {
      errors.push('Debe asignar un propietario al activo')
    }

    if (request.custodioActivo !== undefined && request.custodioActivo <= 0) {
      errors.push('ID de custodio inválido')
    }

    if (request.valorActivo < 1 || request.valorActivo > 5) {
      errors.push('Valor del activo debe estar entre 1 y 5')
    }

    // Validar asignación de propietario
    const validacionPropietario = await this.activoRepository.validateOwnershipAssignment(
      request.propietarioActivo
    )
    
    if (!validacionPropietario.isValid) {
      errors.push(`Propietario ya tiene ${validacionPropietario.currentAssets} activos asignados (máximo recomendado: ${validacionPropietario.maxRecommended})`)
    }

    // Validar asignación de custodio si se proporciona
    if (request.custodioActivo) {
      const validacionCustodio = await this.activoRepository.validateCustodianAssignment(
        request.custodioActivo
      )
      
      if (!validacionCustodio.isValid) {
        errors.push(`Custodio ya tiene ${validacionCustodio.currentAssets} activos asignados (máximo recomendado: ${validacionCustodio.maxRecommended})`)
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Datos de activo inválidos', errors)
    }
  }

  private generateSecurityRecommendations(activo: ActivoInformacion): string[] {
    const recomendaciones: string[] = []

    // Recomendaciones por clasificación
    switch (activo.getClasificacionSeguridad()) {
      case ClasificacionSeguridad.RESTRINGIDO:
        recomendaciones.push('Implementar cifrado de extremo a extremo')
        recomendaciones.push('Establecer controles de acceso estrictos')
        recomendaciones.push('Configurar auditoría detallada de accesos')
        break
      case ClasificacionSeguridad.CONFIDENCIAL:
        recomendaciones.push('Implementar cifrado de datos')
        recomendaciones.push('Configurar controles de acceso basados en roles')
        recomendaciones.push('Establecer monitoreo de accesos')
        break
      case ClasificacionSeguridad.INTERNO:
        recomendaciones.push('Configurar autenticación de usuarios')
        recomendaciones.push('Implementar controles de acceso básicos')
        break
    }

    // Recomendaciones por tipo de activo
    switch (activo.getTipoActivo()) {
      case TipoActivo.DATOS:
        recomendaciones.push('Implementar backup automático')
        recomendaciones.push('Configurar versionado de datos')
        break
      case TipoActivo.SOFTWARE:
        recomendaciones.push('Mantener actualizaciones de seguridad')
        recomendaciones.push('Configurar logs de actividad')
        break
      case TipoActivo.HARDWARE:
        recomendaciones.push('Implementar seguridad física')
        recomendaciones.push('Configurar monitoreo de hardware')
        break
    }

    // Recomendaciones por valor
    if (activo.isCritico()) {
      recomendaciones.push('Establecer plan de continuidad de negocio')
      recomendaciones.push('Implementar redundancia y alta disponibilidad')
      recomendaciones.push('Configurar monitoreo 24/7')
    }

    return recomendaciones
  }

  private generateRequiredControls(activo: ActivoInformacion): string[] {
    const controles: string[] = []

    // Controles básicos para todos los activos
    controles.push('A.8.1 - Responsabilidad por los activos')
    controles.push('A.8.2 - Clasificación de la información')

    // Controles por clasificación
    if (activo.isConfidencial()) {
      controles.push('A.10.1 - Controles criptográficos')
      controles.push('A.9.1 - Requisitos de negocio para el control de accesos')
      controles.push('A.9.2 - Gestión de acceso de usuarios')
    }

    // Controles por tipo
    switch (activo.getTipoActivo()) {
      case TipoActivo.DATOS:
        controles.push('A.8.3 - Manejo de medios')
        controles.push('A.11.1 - Áreas seguras')
        break
      case TipoActivo.SOFTWARE:
        controles.push('A.12.6 - Gestión de vulnerabilidades técnicas')
        controles.push('A.14.2 - Seguridad en los procesos de desarrollo')
        break
      case TipoActivo.HARDWARE:
        controles.push('A.11.2 - Protección contra amenazas ambientales')
        controles.push('A.11.1 - Áreas seguras')
        break
    }

    // Controles adicionales para activos críticos
    if (activo.isCritico()) {
      controles.push('A.17.1 - Continuidad de la seguridad de la información')
      controles.push('A.12.3 - Copias de seguridad')
      controles.push('A.16.1 - Gestión de incidentes de seguridad')
    }

    return controles
  }

  private generateAlertas(activo: ActivoInformacion): string[] {
    const alertas: string[] = []

    // Alertas por activos críticos sin custodio
    if (activo.isCritico() && !activo.getCustodioActivo()) {
      alertas.push('Activo crítico sin custodio asignado')
    }

    // Alertas por clasificación alta sin ubicación
    if (activo.isConfidencial() && !activo.getUbicacionActivo()) {
      alertas.push('Activo confidencial sin ubicación especificada')
    }

    // Alertas por combinaciones de riesgo
    if (activo.getTipoActivo() === TipoActivo.DATOS && 
        activo.getClasificacionSeguridad() === ClasificacionSeguridad.RESTRINGIDO) {
      alertas.push('Datos restringidos requieren controles especiales')
    }

    return alertas
  }
}