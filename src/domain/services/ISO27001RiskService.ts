// =============================================
// SERVICIO DE DOMINIO: Cálculo de Riesgos ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { ActivoInformacion, ValorActivo } from '../entities/ActivoInformacion'
import { ControlISO27001 } from '../entities/ControlISO27001'

export interface CIAImpact {
  confidencialidad: number // 1-5
  integridad: number // 1-5
  disponibilidad: number // 1-5
}

export interface RiesgoISO27001 {
  idActivo: number
  amenaza: string
  vulnerabilidad: string
  probabilidad: number // 1-5
  impactosCIA: CIAImpact
  riesgoInherente: number
  controlesAplicables: number[]
  efectividadControles: number
  riesgoResidual: number
  nivelAceptable: boolean
  tratamiento: TratamientoRiesgo
}

export enum TratamientoRiesgo {
  ACEPTAR = 'aceptar',
  MITIGAR = 'mitigar',
  TRANSFERIR = 'transferir',
  EVITAR = 'evitar'
}

export interface RiskAssessmentResult {
  riesgoInherente: number
  riesgoResidual: number
  nivelRiesgo: 'muy_bajo' | 'bajo' | 'medio' | 'alto' | 'critico'
  requiereAccion: boolean
  tratamientoRecomendado: TratamientoRiesgo
}

export interface AssetRiskProfile {
  activo: ActivoInformacion
  riesgosIdentificados: number
  riesgoPromedio: number
  riesgoMaximo: number
  controlesImplementados: number
  efectividadPromedio: number
  requiereAtencion: boolean
}

export class ISO27001RiskService {

  /**
   * Calcula el riesgo inherente basado en probabilidad e impactos CIA
   */
  static calculateInherentRisk(
    probabilidad: number,
    impactosCIA: CIAImpact
  ): number {
    // Validar entradas
    this.validateRiskInputs(probabilidad, impactosCIA)

    // Calcular impacto máximo de CIA (el más alto de los tres)
    const impactoMaximo = Math.max(
      impactosCIA.confidencialidad,
      impactosCIA.integridad,
      impactosCIA.disponibilidad
    )

    // Fórmula: Probabilidad × Impacto Máximo
    return probabilidad * impactoMaximo
  }

  /**
   * Calcula el riesgo residual después de aplicar controles
   */
  static calculateResidualRisk(
    riesgoInherente: number,
    controles: ControlISO27001[]
  ): number {
    if (controles.length === 0) {
      return riesgoInherente
    }

    // Calcular efectividad promedio de controles implementados
    const controlesImplementados = controles.filter(c => c.isImplementado())
    
    if (controlesImplementados.length === 0) {
      return riesgoInherente
    }

    const efectividadPromedio = controlesImplementados.reduce((suma, control) => {
      return suma + this.getControlEffectiveness(control)
    }, 0) / controlesImplementados.length

    // Aplicar reducción basada en efectividad (0-100%)
    const factorReduccion = efectividadPromedio / 100
    const riesgoResidual = riesgoInherente * (1 - factorReduccion)

    // El riesgo residual nunca puede ser menor a 1
    return Math.max(1, Math.round(riesgoResidual))
  }

  /**
   * Calcula la efectividad de un control basado en su madurez e implementación
   */
  private static getControlEffectiveness(control: ControlISO27001): number {
    if (!control.isImplementado()) {
      return 0
    }

    const nivelMadurez = control.getNivelMadurez()
    const tieneEvidencias = control.hasEvidences()
    const necesitaRevision = control.needsRevision()

    // Efectividad base según madurez (0-5 -> 0-80%)
    let efectividad = (nivelMadurez / 5) * 80

    // Bonificación por evidencias (+10%)
    if (tieneEvidencias) {
      efectividad += 10
    }

    // Penalización por falta de revisión (-15%)
    if (necesitaRevision) {
      efectividad -= 15
    }

    // Asegurar que esté en rango 0-100
    return Math.max(0, Math.min(100, efectividad))
  }

  /**
   * Evalúa un riesgo completo y proporciona recomendaciones
   */
  static assessRisk(
    probabilidad: number,
    impactosCIA: CIAImpact,
    controles: ControlISO27001[] = []
  ): RiskAssessmentResult {
    const riesgoInherente = this.calculateInherentRisk(probabilidad, impactosCIA)
    const riesgoResidual = this.calculateResidualRisk(riesgoInherente, controles)
    
    const nivelRiesgo = this.categorizeRiskLevel(riesgoResidual)
    const requiereAccion = riesgoResidual > 12 // Alto o crítico
    const tratamientoRecomendado = this.recommendTreatment(riesgoResidual, controles)

    return {
      riesgoInherente,
      riesgoResidual,
      nivelRiesgo,
      requiereAccion,
      tratamientoRecomendado
    }
  }

  /**
   * Categoriza el nivel de riesgo
   */
  private static categorizeRiskLevel(riesgo: number): 'muy_bajo' | 'bajo' | 'medio' | 'alto' | 'critico' {
    if (riesgo <= 3) return 'muy_bajo'
    if (riesgo <= 6) return 'bajo'
    if (riesgo <= 12) return 'medio'
    if (riesgo <= 20) return 'alto'
    return 'critico'
  }

  /**
   * Recomienda tratamiento de riesgo
   */
  private static recommendTreatment(
    riesgoResidual: number,
    controles: ControlISO27001[]
  ): TratamientoRiesgo {
    const controlesEfectivos = controles.filter(c => c.isEfectivo()).length

    if (riesgoResidual <= 6) {
      return TratamientoRiesgo.ACEPTAR
    }

    if (riesgoResidual >= 21) {
      return controlesEfectivos === 0 
        ? TratamientoRiesgo.EVITAR 
        : TratamientoRiesgo.TRANSFERIR
    }

    return TratamientoRiesgo.MITIGAR
  }

  /**
   * Calcula el perfil de riesgo de un activo
   */
  static calculateAssetRiskProfile(
    activo: ActivoInformacion,
    riesgos: RiesgoISO27001[],
    controles: ControlISO27001[]
  ): AssetRiskProfile {
    const riesgosActivo = riesgos.filter(r => r.idActivo === activo.getId())
    const controlesActivo = controles.filter(c => 
      riesgosActivo.some(r => r.controlesAplicables.includes(c.getId()))
    )

    const riesgoPromedio = riesgosActivo.length > 0
      ? riesgosActivo.reduce((suma, r) => suma + r.riesgoResidual, 0) / riesgosActivo.length
      : 0

    const riesgoMaximo = riesgosActivo.length > 0
      ? Math.max(...riesgosActivo.map(r => r.riesgoResidual))
      : 0

    const controlesImplementados = controlesActivo.filter(c => c.isImplementado()).length

    const efectividadPromedio = controlesActivo.length > 0
      ? controlesActivo.reduce((suma, c) => suma + this.getControlEffectiveness(c), 0) / controlesActivo.length
      : 0

    const requiereAtencion = riesgoMaximo > 12 || 
                            (activo.isCritico() && efectividadPromedio < 70)

    return {
      activo,
      riesgosIdentificados: riesgosActivo.length,
      riesgoPromedio: Math.round(riesgoPromedio * 100) / 100,
      riesgoMaximo,
      controlesImplementados,
      efectividadPromedio: Math.round(efectividadPromedio),
      requiereAtencion
    }
  }

  /**
   * Genera matriz de riesgos para activos críticos
   */
  static generateAssetRiskMatrix(
    activos: ActivoInformacion[],
    riesgos: RiesgoISO27001[]
  ): {
    activo: ActivoInformacion
    riesgoMaximo: number
    categoria: string
    color: string
  }[] {
    return activos.map(activo => {
      const riesgosActivo = riesgos.filter(r => r.idActivo === activo.getId())
      const riesgoMaximo = riesgosActivo.length > 0
        ? Math.max(...riesgosActivo.map(r => r.riesgoResidual))
        : 0

      const categoria = this.categorizeRiskLevel(riesgoMaximo)
      const color = this.getRiskColor(categoria)

      return {
        activo,
        riesgoMaximo,
        categoria,
        color
      }
    })
  }

  /**
   * Calcula métricas de cumplimiento ISO 27001
   */
  static calculateComplianceMetrics(
    controles: ControlISO27001[]
  ): {
    totalControles: number
    controlesImplementados: number
    porcentajeImplementacion: number
    madurezPromedio: number
    controlesEfectivos: number
    porcentajeEfectividad: number
    dominiosCompletos: number
  } {
    const totalControles = controles.length
    const controlesImplementados = controles.filter(c => c.isImplementado()).length
    const controlesEfectivos = controles.filter(c => c.isEfectivo()).length

    const porcentajeImplementacion = totalControles > 0
      ? (controlesImplementados / totalControles) * 100
      : 0

    const porcentajeEfectividad = totalControles > 0
      ? (controlesEfectivos / totalControles) * 100
      : 0

    const madurezPromedio = controles.length > 0
      ? controles.reduce((suma, c) => suma + c.getNivelMadurez(), 0) / controles.length
      : 0

    // Calcular dominios completos (todos los controles implementados)
    const dominios = new Set(controles.map(c => c.getDomainNumber()))
    let dominiosCompletos = 0

    dominios.forEach(dominio => {
      const controlesDominio = controles.filter(c => c.getDomainNumber() === dominio)
      const implementadosDominio = controlesDominio.filter(c => c.isImplementado()).length
      
      if (implementadosDominio === controlesDominio.length) {
        dominiosCompletos++
      }
    })

    return {
      totalControles,
      controlesImplementados,
      porcentajeImplementacion: Math.round(porcentajeImplementacion * 100) / 100,
      madurezPromedio: Math.round(madurezPromedio * 100) / 100,
      controlesEfectivos,
      porcentajeEfectividad: Math.round(porcentajeEfectividad * 100) / 100,
      dominiosCompletos
    }
  }

  /**
   * Identifica brechas de seguridad críticas
   */
  static identifySecurityGaps(
    activos: ActivoInformacion[],
    controles: ControlISO27001[],
    riesgos: RiesgoISO27001[]
  ): {
    activosSinControles: ActivoInformacion[]
    controlesVencidos: ControlISO27001[]
    riesgosSinTratamiento: RiesgoISO27001[]
    activosCriticosSinProteccion: ActivoInformacion[]
  } {
    const activosSinControles = activos.filter(activo => {
      const riesgosActivo = riesgos.filter(r => r.idActivo === activo.getId())
      const tieneControles = riesgosActivo.some(r => r.controlesAplicables.length > 0)
      return !tieneControles && activo.isCritico()
    })

    const controlesVencidos = controles.filter(c => c.needsRevision())

    const riesgosSinTratamiento = riesgos.filter(r => 
      r.riesgoResidual > 12 && r.tratamiento === TratamientoRiesgo.ACEPTAR
    )

    const activosCriticosSinProteccion = activos.filter(activo => {
      if (!activo.isCritico()) return false
      
      const riesgosActivo = riesgos.filter(r => r.idActivo === activo.getId())
      const controlesEfectivos = riesgosActivo.reduce((total, riesgo) => {
        const controlesRiesgo = controles.filter(c => 
          riesgo.controlesAplicables.includes(c.getId()) && c.isEfectivo()
        )
        return total + controlesRiesgo.length
      }, 0)

      return controlesEfectivos === 0
    })

    return {
      activosSinControles,
      controlesVencidos,
      riesgosSinTratamiento,
      activosCriticosSinProteccion
    }
  }

  /**
   * Valida las entradas de riesgo
   */
  private static validateRiskInputs(probabilidad: number, impactosCIA: CIAImpact): void {
    if (probabilidad < 1 || probabilidad > 5) {
      throw new Error('Probabilidad debe estar entre 1 y 5')
    }

    if (impactosCIA.confidencialidad < 1 || impactosCIA.confidencialidad > 5) {
      throw new Error('Impacto en confidencialidad debe estar entre 1 y 5')
    }

    if (impactosCIA.integridad < 1 || impactosCIA.integridad > 5) {
      throw new Error('Impacto en integridad debe estar entre 1 y 5')
    }

    if (impactosCIA.disponibilidad < 1 || impactosCIA.disponibilidad > 5) {
      throw new Error('Impacto en disponibilidad debe estar entre 1 y 5')
    }
  }

  /**
   * Obtiene el color asociado a una categoría de riesgo
   */
  private static getRiskColor(categoria: string): string {
    const colors = {
      muy_bajo: '#22c55e', // green-500
      bajo: '#84cc16',     // lime-500
      medio: '#eab308',    // yellow-500
      alto: '#f97316',     // orange-500
      critico: '#ef4444'   // red-500
    }
    return colors[categoria as keyof typeof colors] || '#6b7280'
  }
}