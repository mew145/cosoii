// =============================================
// SERVICIO DE DOMINIO: Cálculo de Riesgos COSO
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Probabilidad } from '../value-objects/Probabilidad'
import { Impacto } from '../value-objects/Impacto'
import { NivelRiesgo, NivelRiesgoCategoria } from '../value-objects/NivelRiesgo'
import { Riesgo } from '../entities/Riesgo'

export interface RiskMatrix {
  probabilidad: number
  impacto: number
  nivel: number
  categoria: NivelRiesgoCategoria
  color: string
  label: string
}

export interface RiskDistribution {
  muyBajo: number
  bajo: number
  medio: number
  alto: number
  critico: number
  total: number
}

export interface RiskTrend {
  fecha: Date
  nivel: number
  categoria: NivelRiesgoCategoria
}

export class RiskCalculationService {
  
  /**
   * Calcula el nivel de riesgo COSO usando la fórmula: Probabilidad × Impacto
   */
  static calculateRiskLevel(probabilidad: Probabilidad, impacto: Impacto): NivelRiesgo {
    return new NivelRiesgo(probabilidad, impacto)
  }

  /**
   * Calcula el nivel de riesgo desde valores numéricos
   */
  static calculateRiskLevelFromValues(probabilidad: number, impacto: number): NivelRiesgo {
    const prob = Probabilidad.fromNumber(probabilidad)
    const imp = Impacto.fromNumber(impacto)
    return new NivelRiesgo(prob, imp)
  }

  /**
   * Categoriza un riesgo basado en su nivel calculado
   */
  static categorizeRisk(nivelRiesgo: NivelRiesgo): {
    categoria: NivelRiesgoCategoria
    prioridad: number
    requiereAccion: boolean
    esAceptable: boolean
  } {
    const categoria = nivelRiesgo.getCategoria()
    
    return {
      categoria,
      prioridad: this.getPriorityLevel(categoria),
      requiereAccion: nivelRiesgo.requiresAction(),
      esAceptable: nivelRiesgo.isAcceptable()
    }
  }

  /**
   * Obtiene el nivel de prioridad numérico (1-5, donde 5 es más crítico)
   */
  private static getPriorityLevel(categoria: NivelRiesgoCategoria): number {
    const priorities = {
      MUY_BAJO: 1,
      BAJO: 2,
      MEDIO: 3,
      ALTO: 4,
      CRITICO: 5
    }
    return priorities[categoria]
  }

  /**
   * Genera la matriz de riesgos completa (5x5)
   */
  static generateRiskMatrix(): RiskMatrix[][] {
    const matrix: RiskMatrix[][] = []
    
    for (let probabilidad = 1; probabilidad <= 5; probabilidad++) {
      const row: RiskMatrix[] = []
      for (let impacto = 1; impacto <= 5; impacto++) {
        const nivelRiesgo = this.calculateRiskLevelFromValues(probabilidad, impacto)
        
        row.push({
          probabilidad,
          impacto,
          nivel: nivelRiesgo.getValor(),
          categoria: nivelRiesgo.getCategoria(),
          color: nivelRiesgo.getColor(),
          label: nivelRiesgo.getLabel()
        })
      }
      matrix.push(row)
    }
    
    return matrix
  }

  /**
   * Calcula la distribución de riesgos por categoría
   */
  static calculateRiskDistribution(riesgos: Riesgo[]): RiskDistribution {
    const distribution: RiskDistribution = {
      muyBajo: 0,
      bajo: 0,
      medio: 0,
      alto: 0,
      critico: 0,
      total: riesgos.length
    }

    riesgos.forEach(riesgo => {
      const categoria = riesgo.getNivelRiesgoCalculado().getCategoria()
      
      switch (categoria) {
        case 'MUY_BAJO':
          distribution.muyBajo++
          break
        case 'BAJO':
          distribution.bajo++
          break
        case 'MEDIO':
          distribution.medio++
          break
        case 'ALTO':
          distribution.alto++
          break
        case 'CRITICO':
          distribution.critico++
          break
      }
    })

    return distribution
  }

  /**
   * Calcula el promedio de nivel de riesgo de una lista de riesgos
   */
  static calculateAverageRiskLevel(riesgos: Riesgo[]): {
    promedio: number
    categoria: NivelRiesgoCategoria
    riesgosCriticos: number
    riesgosAltos: number
  } {
    if (riesgos.length === 0) {
      return {
        promedio: 0,
        categoria: 'MUY_BAJO',
        riesgosCriticos: 0,
        riesgosAltos: 0
      }
    }

    const sumaTotal = riesgos.reduce((suma, riesgo) => {
      return suma + riesgo.getNivelRiesgoCalculado().getValor()
    }, 0)

    const promedio = sumaTotal / riesgos.length
    const nivelPromedio = NivelRiesgo.fromCalculatedValue(promedio)

    const riesgosCriticos = riesgos.filter(r => r.isCritico()).length
    const riesgosAltos = riesgos.filter(r => r.requiresAction()).length

    return {
      promedio,
      categoria: nivelPromedio.getCategoria(),
      riesgosCriticos,
      riesgosAltos
    }
  }

  /**
   * Identifica riesgos que requieren atención inmediata
   */
  static identifyHighPriorityRisks(riesgos: Riesgo[]): {
    criticos: Riesgo[]
    altos: Riesgo[]
    requierenAccion: Riesgo[]
  } {
    const criticos = riesgos.filter(riesgo => riesgo.isCritico())
    const altos = riesgos.filter(riesgo => 
      riesgo.requiresAction() && !riesgo.isCritico()
    )
    const requierenAccion = riesgos.filter(riesgo => riesgo.requiresAction())

    return {
      criticos,
      altos,
      requierenAccion
    }
  }

  /**
   * Calcula métricas de riesgo para un proyecto
   */
  static calculateProjectRiskMetrics(riesgos: Riesgo[]): {
    totalRiesgos: number
    riesgoPromedio: number
    distribucion: RiskDistribution
    riesgosCriticos: number
    riesgosActivos: number
    porcentajeRiesgoAlto: number
  } {
    const riesgosActivos = riesgos.filter(r => r.isActivo())
    const distribucion = this.calculateRiskDistribution(riesgosActivos)
    const promedioInfo = this.calculateAverageRiskLevel(riesgosActivos)
    
    const riesgosAltos = distribucion.alto + distribucion.critico
    const porcentajeRiesgoAlto = riesgosActivos.length > 0 
      ? (riesgosAltos / riesgosActivos.length) * 100 
      : 0

    return {
      totalRiesgos: riesgos.length,
      riesgoPromedio: promedioInfo.promedio,
      distribucion,
      riesgosCriticos: distribucion.critico,
      riesgosActivos: riesgosActivos.length,
      porcentajeRiesgoAlto: Math.round(porcentajeRiesgoAlto * 100) / 100
    }
  }

  /**
   * Genera recomendaciones basadas en el nivel de riesgo
   */
  static generateRiskRecommendations(nivelRiesgo: NivelRiesgo): {
    accionRecomendada: string
    prioridad: 'baja' | 'media' | 'alta' | 'critica'
    plazoMaximo: string
    requiereAprobacion: boolean
  } {
    const categoria = nivelRiesgo.getCategoria()

    switch (categoria) {
      case 'CRITICO':
        return {
          accionRecomendada: 'Acción inmediata requerida. Implementar controles de emergencia.',
          prioridad: 'critica',
          plazoMaximo: '24 horas',
          requiereAprobacion: true
        }
      
      case 'ALTO':
        return {
          accionRecomendada: 'Desarrollar plan de mitigación urgente.',
          prioridad: 'alta',
          plazoMaximo: '1 semana',
          requiereAprobacion: true
        }
      
      case 'MEDIO':
        return {
          accionRecomendada: 'Monitorear y desarrollar plan de mitigación.',
          prioridad: 'media',
          plazoMaximo: '1 mes',
          requiereAprobacion: false
        }
      
      case 'BAJO':
        return {
          accionRecomendada: 'Monitoreo periódico suficiente.',
          prioridad: 'baja',
          plazoMaximo: '3 meses',
          requiereAprobacion: false
        }
      
      case 'MUY_BAJO':
        return {
          accionRecomendada: 'Aceptar riesgo. Revisión anual.',
          prioridad: 'baja',
          plazoMaximo: '1 año',
          requiereAprobacion: false
        }
      
      default:
        return {
          accionRecomendada: 'Evaluar riesgo.',
          prioridad: 'media',
          plazoMaximo: '1 mes',
          requiereAprobacion: false
        }
    }
  }

  /**
   * Valida si un riesgo está correctamente evaluado
   */
  static validateRiskAssessment(riesgo: Riesgo): {
    esValido: boolean
    errores: string[]
    advertencias: string[]
  } {
    const errores: string[] = []
    const advertencias: string[] = []

    // Validar información completa
    if (!riesgo.hasCompleteInformation()) {
      advertencias.push('Falta información de causa raíz o consecuencias')
    }

    // Validar coherencia de evaluación
    const nivel = riesgo.getNivelRiesgoCalculado()
    if (nivel.requiresImmediateAction() && !riesgo.getCausaRaizRiesgo()) {
      errores.push('Riesgos críticos requieren análisis de causa raíz')
    }

    // Validar asignación de propietario
    if (!riesgo.getIdPropietarioRiesgo()) {
      errores.push('Riesgo debe tener propietario asignado')
    }

    return {
      esValido: errores.length === 0,
      errores,
      advertencias
    }
  }
}