// =============================================
// SERVICIO DE DOMINIO: Gestión Integrada de Riesgos COSO + ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Riesgo } from '../entities/Riesgo'
import { ActivoInformacion } from '../entities/ActivoInformacion'
import { ControlISO27001 } from '../entities/ControlISO27001'
import { Proyecto } from '../entities/Proyecto'
import { RiskCalculationService, RiskDistribution } from './RiskCalculationService'
import { ISO27001RiskService, RiesgoISO27001, AssetRiskProfile } from './ISO27001RiskService'
import { NivelRiesgoCategoria } from '../value-objects/NivelRiesgo'

export interface IntegratedRiskMatrix {
  riesgosCOSO: {
    categoria: NivelRiesgoCategoria
    cantidad: number
    porcentaje: number
    color: string
  }[]
  riesgosISO: {
    categoria: string
    cantidad: number
    porcentaje: number
    color: string
  }[]
  correlaciones: {
    riesgoCOSO: Riesgo
    riesgosISO: RiesgoISO27001[]
    nivelCorrelacion: 'alta' | 'media' | 'baja'
  }[]
}

export interface ConsolidatedRiskDashboard {
  // Métricas COSO
  totalRiesgosCOSO: number
  riesgosCOSOCriticos: number
  promedioRiesgoCOSO: number
  distribucionCOSO: RiskDistribution

  // Métricas ISO 27001
  totalActivosISO: number
  activosCriticos: number
  controlesImplementados: number
  porcentajeImplementacion: number
  riesgosISOResiduales: number

  // Métricas integradas
  riesgoConsolidado: number
  nivelRiesgoEmpresarial: 'muy_bajo' | 'bajo' | 'medio' | 'alto' | 'critico'
  brechasSeguridad: number
  cumplimientoNormativo: number
  
  // Alertas y recomendaciones
  alertasCriticas: string[]
  recomendacionesPrioritarias: string[]
}

export interface RiskCorrelationAnalysis {
  riesgoCOSO: Riesgo
  activosAfectados: ActivoInformacion[]
  controlesRelacionados: ControlISO27001[]
  impactoConsolidado: number
  requiereAtencionIntegrada: boolean
}

export class IntegratedRiskService {

  /**
   * Genera una matriz de riesgos integrada COSO + ISO 27001
   */
  static generateIntegratedRiskMatrix(
    riesgosCOSO: Riesgo[],
    riesgosISO: RiesgoISO27001[],
    activos: ActivoInformacion[]
  ): IntegratedRiskMatrix {
    // Analizar distribución COSO
    const distribucionCOSO = RiskCalculationService.calculateRiskDistribution(riesgosCOSO)
    const totalCOSO = riesgosCOSO.length

    const riesgosCOSOMatrix = [
      {
        categoria: 'MUY_BAJO' as NivelRiesgoCategoria,
        cantidad: distribucionCOSO.muyBajo,
        porcentaje: totalCOSO > 0 ? (distribucionCOSO.muyBajo / totalCOSO) * 100 : 0,
        color: '#22c55e'
      },
      {
        categoria: 'BAJO' as NivelRiesgoCategoria,
        cantidad: distribucionCOSO.bajo,
        porcentaje: totalCOSO > 0 ? (distribucionCOSO.bajo / totalCOSO) * 100 : 0,
        color: '#84cc16'
      },
      {
        categoria: 'MEDIO' as NivelRiesgoCategoria,
        cantidad: distribucionCOSO.medio,
        porcentaje: totalCOSO > 0 ? (distribucionCOSO.medio / totalCOSO) * 100 : 0,
        color: '#eab308'
      },
      {
        categoria: 'ALTO' as NivelRiesgoCategoria,
        cantidad: distribucionCOSO.alto,
        porcentaje: totalCOSO > 0 ? (distribucionCOSO.alto / totalCOSO) * 100 : 0,
        color: '#f97316'
      },
      {
        categoria: 'CRITICO' as NivelRiesgoCategoria,
        cantidad: distribucionCOSO.critico,
        porcentaje: totalCOSO > 0 ? (distribucionCOSO.critico / totalCOSO) * 100 : 0,
        color: '#ef4444'
      }
    ]

    // Analizar distribución ISO 27001
    const distribucionISO = this.analyzeISODistribution(riesgosISO)
    const totalISO = riesgosISO.length

    const riesgosISOMatrix = Object.entries(distribucionISO).map(([categoria, cantidad]) => ({
      categoria,
      cantidad,
      porcentaje: totalISO > 0 ? (cantidad / totalISO) * 100 : 0,
      color: this.getISOCategoryColor(categoria)
    }))

    // Analizar correlaciones
    const correlaciones = this.analyzeRiskCorrelations(riesgosCOSO, riesgosISO, activos)

    return {
      riesgosCOSO: riesgosCOSOMatrix,
      riesgosISO: riesgosISOMatrix,
      correlaciones
    }
  }

  /**
   * Genera un dashboard consolidado de riesgos
   */
  static generateConsolidatedDashboard(
    riesgosCOSO: Riesgo[],
    riesgosISO: RiesgoISO27001[],
    activos: ActivoInformacion[],
    controles: ControlISO27001[],
    proyectos: Proyecto[]
  ): ConsolidatedRiskDashboard {
    // Métricas COSO
    const metricasCOSO = RiskCalculationService.calculateProjectRiskMetrics(riesgosCOSO)
    const promedioInfo = RiskCalculationService.calculateAverageRiskLevel(riesgosCOSO)

    // Métricas ISO 27001
    const metricasISO = ISO27001RiskService.calculateComplianceMetrics(controles)
    const activosCriticos = activos.filter(a => a.isCritico()).length
    const riesgosISOResiduales = riesgosISO.filter(r => r.riesgoResidual > 12).length

    // Calcular riesgo consolidado
    const riesgoConsolidado = this.calculateConsolidatedRisk(
      promedioInfo.promedio,
      riesgosISO,
      metricasISO.porcentajeEfectividad
    )

    const nivelRiesgoEmpresarial = this.categorizeConsolidatedRisk(riesgoConsolidado)

    // Identificar brechas y generar alertas
    const brechas = ISO27001RiskService.identifySecurityGaps(activos, controles, riesgosISO)
    const brechasSeguridad = brechas.activosCriticosSinProteccion.length + 
                            brechas.riesgosSinTratamiento.length

    const alertasCriticas = this.generateCriticalAlerts(
      metricasCOSO,
      metricasISO,
      brechas,
      riesgoConsolidado
    )

    const recomendacionesPrioritarias = this.generatePriorityRecommendations(
      riesgosCOSO,
      riesgosISO,
      controles,
      nivelRiesgoEmpresarial
    )

    return {
      // Métricas COSO
      totalRiesgosCOSO: metricasCOSO.totalRiesgos,
      riesgosCOSOCriticos: metricasCOSO.riesgosCriticos,
      promedioRiesgoCOSO: promedioInfo.promedio,
      distribucionCOSO: metricasCOSO.distribucion,

      // Métricas ISO 27001
      totalActivosISO: activos.length,
      activosCriticos,
      controlesImplementados: metricasISO.controlesImplementados,
      porcentajeImplementacion: metricasISO.porcentajeImplementacion,
      riesgosISOResiduales,

      // Métricas integradas
      riesgoConsolidado,
      nivelRiesgoEmpresarial,
      brechasSeguridad,
      cumplimientoNormativo: metricasISO.porcentajeEfectividad,

      // Alertas y recomendaciones
      alertasCriticas,
      recomendacionesPrioritarias
    }
  }

  /**
   * Analiza correlaciones entre riesgos COSO y ISO 27001
   */
  static analyzeRiskCorrelations(
    riesgosCOSO: Riesgo[],
    riesgosISO: RiesgoISO27001[],
    activos: ActivoInformacion[]
  ): {
    riesgoCOSO: Riesgo
    riesgosISO: RiesgoISO27001[]
    nivelCorrelacion: 'alta' | 'media' | 'baja'
  }[] {
    return riesgosCOSO.map(riesgoCOSO => {
      // Buscar activos relacionados por categoría de riesgo
      const activosRelacionados = this.findRelatedAssets(riesgoCOSO, activos)
      
      // Buscar riesgos ISO relacionados
      const riesgosISORelacionados = riesgosISO.filter(rISO => 
        activosRelacionados.some(activo => activo.getId() === rISO.idActivo)
      )

      // Determinar nivel de correlación
      const nivelCorrelacion = this.determineCorrelationLevel(
        riesgoCOSO,
        riesgosISORelacionados,
        activosRelacionados
      )

      return {
        riesgoCOSO,
        riesgosISO: riesgosISORelacionados,
        nivelCorrelacion
      }
    })
  }

  /**
   * Calcula un riesgo consolidado considerando ambos marcos
   */
  private static calculateConsolidatedRisk(
    promedioCOSO: number,
    riesgosISO: RiesgoISO27001[],
    efectividadControles: number
  ): number {
    // Promedio de riesgos ISO residuales
    const promedioISO = riesgosISO.length > 0
      ? riesgosISO.reduce((suma, r) => suma + r.riesgoResidual, 0) / riesgosISO.length
      : 0

    // Factor de ajuste por efectividad de controles
    const factorControles = (100 - efectividadControles) / 100

    // Fórmula consolidada: (COSO * 0.6 + ISO * 0.4) * factor_controles
    const riesgoBase = (promedioCOSO * 0.6) + (promedioISO * 0.4)
    const riesgoConsolidado = riesgoBase * (1 + factorControles)

    return Math.round(riesgoConsolidado * 100) / 100
  }

  /**
   * Categoriza el riesgo consolidado
   */
  private static categorizeConsolidatedRisk(riesgo: number): 'muy_bajo' | 'bajo' | 'medio' | 'alto' | 'critico' {
    if (riesgo <= 5) return 'muy_bajo'
    if (riesgo <= 10) return 'bajo'
    if (riesgo <= 15) return 'medio'
    if (riesgo <= 20) return 'alto'
    return 'critico'
  }

  /**
   * Analiza la distribución de riesgos ISO 27001
   */
  private static analyzeISODistribution(riesgos: RiesgoISO27001[]): Record<string, number> {
    const distribucion = {
      muy_bajo: 0,
      bajo: 0,
      medio: 0,
      alto: 0,
      critico: 0
    }

    riesgos.forEach(riesgo => {
      if (riesgo.riesgoResidual <= 3) distribucion.muy_bajo++
      else if (riesgo.riesgoResidual <= 6) distribucion.bajo++
      else if (riesgo.riesgoResidual <= 12) distribucion.medio++
      else if (riesgo.riesgoResidual <= 20) distribucion.alto++
      else distribucion.critico++
    })

    return distribucion
  }

  /**
   * Encuentra activos relacionados con un riesgo COSO
   */
  private static findRelatedAssets(riesgo: Riesgo, activos: ActivoInformacion[]): ActivoInformacion[] {
    // Lógica simplificada: relacionar por categoría de riesgo
    const categoriaRiesgo = riesgo.getIdCategoriaRiesgo()
    
    // Mapeo de categorías COSO a tipos de activos ISO
    const mapeoCategoriasActivos: Record<number, string[]> = {
      6: ['software', 'hardware'], // Tecnológico
      7: ['datos', 'software'],    // Seguridad de información
      2: ['servicios', 'personas'], // Operativo
      3: ['datos', 'software'],    // Financiero
      4: ['datos', 'servicios']    // Cumplimiento
    }

    const tiposRelacionados = mapeoCategoriasActivos[categoriaRiesgo] || []
    
    return activos.filter(activo => 
      tiposRelacionados.includes(activo.getTipoActivo()) ||
      activo.isCritico()
    )
  }

  /**
   * Calcula el impacto consolidado
   */
  private static calculateConsolidatedImpact(
    riesgoCOSO: Riesgo,
    riesgosISO: RiesgoISO27001[]
  ): number {
    const impactoCOSO = riesgoCOSO.getNivelRiesgoCalculado().getValor()
    const impactoISO = riesgosISO.length > 0
      ? Math.max(...riesgosISO.map(r => r.riesgoResidual))
      : 0

    return impactoCOSO + impactoISO
  }

  /**
   * Genera alertas críticas
   */
  private static generateCriticalAlerts(
    metricasCOSO: any,
    metricasISO: any,
    brechas: any,
    riesgoConsolidado: number
  ): string[] {
    const alertas: string[] = []

    if (metricasCOSO.riesgosCriticos > 0) {
      alertas.push(`${metricasCOSO.riesgosCriticos} riesgos COSO críticos requieren atención inmediata`)
    }

    if (metricasISO.porcentajeImplementacion < 70) {
      alertas.push(`Implementación ISO 27001 baja: ${metricasISO.porcentajeImplementacion}%`)
    }

    if (brechas.activosCriticosSinProteccion.length > 0) {
      alertas.push(`${brechas.activosCriticosSinProteccion.length} activos críticos sin protección`)
    }

    if (riesgoConsolidado > 20) {
      alertas.push('Riesgo empresarial consolidado en nivel crítico')
    }

    return alertas
  }

  /**
   * Genera recomendaciones prioritarias
   */
  private static generatePriorityRecommendations(
    riesgosCOSO: Riesgo[],
    riesgosISO: RiesgoISO27001[],
    controles: ControlISO27001[],
    nivelRiesgo: string
  ): string[] {
    const recomendaciones: string[] = []

    const riesgosCriticos = riesgosCOSO.filter(r => r.isCritico())
    if (riesgosCriticos.length > 0) {
      recomendaciones.push('Implementar planes de mitigación para riesgos COSO críticos')
    }

    const controlesVencidos = controles.filter(c => c.needsRevision())
    if (controlesVencidos.length > 0) {
      recomendaciones.push(`Revisar ${controlesVencidos.length} controles ISO 27001 vencidos`)
    }

    const riesgosISOAltos = riesgosISO.filter(r => r.riesgoResidual > 15)
    if (riesgosISOAltos.length > 0) {
      recomendaciones.push('Fortalecer controles para riesgos ISO 27001 altos')
    }

    if (nivelRiesgo === 'critico') {
      recomendaciones.push('Activar protocolo de gestión de crisis empresarial')
    }

    return recomendaciones
  }

  /**
   * Determina el nivel de correlación entre riesgos
   */
  private static determineCorrelationLevel(
    riesgoCOSO: Riesgo,
    riesgosISO: RiesgoISO27001[],
    activosRelacionados: ActivoInformacion[]
  ): 'alta' | 'media' | 'baja' {
    const factores = {
      riesgoCritico: riesgoCOSO.isCritico() ? 3 : 0,
      riesgosISOAltos: riesgosISO.filter(r => r.riesgoResidual > 15).length,
      activosCriticos: activosRelacionados.filter(a => a.isCritico()).length,
      cantidadRiesgosISO: riesgosISO.length
    }

    const puntuacion = factores.riesgoCritico + 
                      factores.riesgosISOAltos + 
                      factores.activosCriticos + 
                      (factores.cantidadRiesgosISO > 0 ? 1 : 0)

    if (puntuacion >= 5) return 'alta'
    if (puntuacion >= 3) return 'media'
    return 'baja'
  }

  /**
   * Obtiene el color para categorías ISO
   */
  private static getISOCategoryColor(categoria: string): string {
    const colors: Record<string, string> = {
      muy_bajo: '#22c55e',
      bajo: '#84cc16',
      medio: '#eab308',
      alto: '#f97316',
      critico: '#ef4444'
    }
    return colors[categoria] || '#6b7280'
  }
}