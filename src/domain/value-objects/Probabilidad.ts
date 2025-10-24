// =============================================
// VALUE OBJECT: Probabilidad
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export type ProbabilidadNivel = 1 | 2 | 3 | 4 | 5

export class Probabilidad {
  private readonly value: ProbabilidadNivel

  constructor(probabilidad: number) {
    this.validate(probabilidad)
    this.value = probabilidad as ProbabilidadNivel
  }

  private validate(probabilidad: number): void {
    if (!Number.isInteger(probabilidad)) {
      throw new Error('Probabilidad debe ser un número entero')
    }

    if (probabilidad < 1 || probabilidad > 5) {
      throw new Error('Probabilidad debe estar entre 1 y 5')
    }
  }

  getValue(): ProbabilidadNivel {
    return this.value
  }

  getLabel(): string {
    const labels = {
      1: 'Muy Baja',
      2: 'Baja', 
      3: 'Media',
      4: 'Alta',
      5: 'Muy Alta'
    }
    return labels[this.value]
  }

  getDescription(): string {
    const descriptions = {
      1: 'Menos del 5% de probabilidad',
      2: '5% - 25% de probabilidad',
      3: '25% - 50% de probabilidad', 
      4: '50% - 75% de probabilidad',
      5: 'Más del 75% de probabilidad'
    }
    return descriptions[this.value]
  }

  getColor(): string {
    const colors = {
      1: '#22c55e', // green-500
      2: '#84cc16', // lime-500
      3: '#eab308', // yellow-500
      4: '#f97316', // orange-500
      5: '#ef4444'  // red-500
    }
    return colors[this.value]
  }

  equals(other: Probabilidad): boolean {
    return this.value === other.value
  }

  toString(): string {
    return `${this.value} - ${this.getLabel()}`
  }

  // Método estático para crear desde número
  static fromNumber(probabilidad: number): Probabilidad {
    return new Probabilidad(probabilidad)
  }

  // Validación estática sin crear instancia
  static isValid(probabilidad: number): boolean {
    try {
      new Probabilidad(probabilidad)
      return true
    } catch {
      return false
    }
  }

  // Comparaciones
  isHigher(other: Probabilidad): boolean {
    return this.value > other.value
  }

  isLower(other: Probabilidad): boolean {
    return this.value < other.value
  }

  isCritical(): boolean {
    return this.value >= 4
  }
}