// =============================================
// VALUE OBJECT: Nivel de Riesgo
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Probabilidad } from './Probabilidad'
import { Impacto } from './Impacto'

export type NivelRiesgoCategoria = 'MUY_BAJO' | 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO'

export class NivelRiesgo {
  private readonly valor: number
  private readonly categoria: NivelRiesgoCategoria

  constructor(probabilidad: Probabilidad, impacto: Impacto) {
    this.valor = this.calcular(probabilidad, impacto)
    this.categoria = this.determinarCategoria(this.valor)
  }

  private calcular(probabilidad: Probabilidad, impacto: Impacto): number {
    return probabilidad.getValue() * impacto.getValue()
  }

  private determinarCategoria(valor: number): NivelRiesgoCategoria {
    if (valor <= 3) return 'MUY_BAJO'
    if (valor <= 6) return 'BAJO'
    if (valor <= 12) return 'MEDIO'
    if (valor <= 20) return 'ALTO'
    return 'CRITICO'
  }

  getValor(): number {
    return this.valor
  }

  getCategoria(): NivelRiesgoCategoria {
    return this.categoria
  }

  getLabel(): string {
    const labels = {
      MUY_BAJO: 'Muy Bajo',
      BAJO: 'Bajo',
      MEDIO: 'Medio',
      ALTO: 'Alto',
      CRITICO: 'Crítico'
    }
    return labels[this.categoria]
  }

  getColor(): string {
    const colors = {
      MUY_BAJO: '#22c55e', // green-500
      BAJO: '#84cc16',     // lime-500
      MEDIO: '#eab308',    // yellow-500
      ALTO: '#f97316',     // orange-500
      CRITICO: '#ef4444'   // red-500
    }
    return colors[this.categoria]
  }

  getBackgroundColor(): string {
    const bgColors = {
      MUY_BAJO: '#dcfce7', // green-100
      BAJO: '#ecfccb',     // lime-100
      MEDIO: '#fef3c7',    // yellow-100
      ALTO: '#fed7aa',     // orange-100
      CRITICO: '#fecaca'   // red-100
    }
    return bgColors[this.categoria]
  }

  getTextColor(): string {
    const textColors = {
      MUY_BAJO: '#166534', // green-800
      BAJO: '#365314',     // lime-800
      MEDIO: '#92400e',    // yellow-800
      ALTO: '#9a3412',     // orange-800
      CRITICO: '#991b1b'   // red-800
    }
    return textColors[this.categoria]
  }

  getRango(): { min: number; max: number } {
    const rangos = {
      MUY_BAJO: { min: 1, max: 3 },
      BAJO: { min: 4, max: 6 },
      MEDIO: { min: 7, max: 12 },
      ALTO: { min: 13, max: 20 },
      CRITICO: { min: 21, max: 25 }
    }
    return rangos[this.categoria]
  }

  equals(other: NivelRiesgo): boolean {
    return this.valor === other.valor
  }

  toString(): string {
    return `${this.valor} - ${this.getLabel()}`
  }

  // Métodos de comparación
  isHigher(other: NivelRiesgo): boolean {
    return this.valor > other.valor
  }

  isLower(other: NivelRiesgo): boolean {
    return this.valor < other.valor
  }

  // Métodos de clasificación
  requiresImmediateAction(): boolean {
    return this.categoria === 'CRITICO'
  }

  requiresAction(): boolean {
    return this.categoria === 'ALTO' || this.categoria === 'CRITICO'
  }

  isAcceptable(): boolean {
    return this.categoria === 'MUY_BAJO' || this.categoria === 'BAJO'
  }

  needsMonitoring(): boolean {
    return this.categoria === 'MEDIO'
  }

  // Método estático para crear desde valores numéricos
  static fromValues(probabilidad: number, impacto: number): NivelRiesgo {
    return new NivelRiesgo(
      Probabilidad.fromNumber(probabilidad),
      Impacto.fromNumber(impacto)
    )
  }

  // Método estático para crear desde valor calculado
  static fromCalculatedValue(valor: number): NivelRiesgo {
    // Crear instancia temporal para obtener la categoría
    const temp = new NivelRiesgo(
      Probabilidad.fromNumber(1),
      Impacto.fromNumber(1)
    )
    
    // Crear nueva instancia con el valor específico
    const instance = Object.create(NivelRiesgo.prototype)
    instance.valor = valor
    instance.categoria = temp.determinarCategoria(valor)
    return instance
  }
}