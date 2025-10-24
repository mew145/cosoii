// =============================================
// VALUE OBJECT: Impacto
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export type ImpactoNivel = 1 | 2 | 3 | 4 | 5

export class Impacto {
  private readonly value: ImpactoNivel

  constructor(impacto: number) {
    this.validate(impacto)
    this.value = impacto as ImpactoNivel
  }

  private validate(impacto: number): void {
    if (!Number.isInteger(impacto)) {
      throw new Error('Impacto debe ser un número entero')
    }

    if (impacto < 1 || impacto > 5) {
      throw new Error('Impacto debe estar entre 1 y 5')
    }
  }

  getValue(): ImpactoNivel {
    return this.value
  }

  getLabel(): string {
    const labels = {
      1: 'Muy Bajo',
      2: 'Bajo',
      3: 'Medio', 
      4: 'Alto',
      5: 'Muy Alto'
    }
    return labels[this.value]
  }

  getDescription(): string {
    const descriptions = {
      1: 'Impacto mínimo en objetivos',
      2: 'Impacto menor en objetivos',
      3: 'Impacto moderado en objetivos',
      4: 'Impacto significativo en objetivos', 
      5: 'Impacto crítico en objetivos'
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

  equals(other: Impacto): boolean {
    return this.value === other.value
  }

  toString(): string {
    return `${this.value} - ${this.getLabel()}`
  }

  // Método estático para crear desde número
  static fromNumber(impacto: number): Impacto {
    return new Impacto(impacto)
  }

  // Validación estática sin crear instancia
  static isValid(impacto: number): boolean {
    try {
      new Impacto(impacto)
      return true
    } catch {
      return false
    }
  }

  // Comparaciones
  isHigher(other: Impacto): boolean {
    return this.value > other.value
  }

  isLower(other: Impacto): boolean {
    return this.value < other.value
  }

  isCritical(): boolean {
    return this.value >= 4
  }

  // Calcular impacto financiero estimado (ejemplo)
  getFinancialImpactRange(): { min: number; max: number } {
    const ranges = {
      1: { min: 0, max: 10000 },
      2: { min: 10000, max: 50000 },
      3: { min: 50000, max: 200000 },
      4: { min: 200000, max: 1000000 },
      5: { min: 1000000, max: Number.MAX_SAFE_INTEGER }
    }
    return ranges[this.value]
  }
}