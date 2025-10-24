// =============================================
// VALUE OBJECT: CI (Cédula de Identidad)
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export class CI {
  private readonly value: string

  constructor(ci: string) {
    this.validate(ci)
    this.value = ci.trim()
  }

  private validate(ci: string): void {
    if (!ci || ci.trim().length === 0) {
      throw new Error('CI no puede estar vacío')
    }

    const cleanCI = ci.trim()

    if (cleanCI.length < 7 || cleanCI.length > 10) {
      throw new Error('CI debe tener entre 7 y 10 dígitos')
    }

    if (!/^\d+$/.test(cleanCI)) {
      throw new Error('CI solo puede contener números')
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: CI): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  // Método estático para crear desde string
  static fromString(ci: string): CI {
    return new CI(ci)
  }

  // Validación estática sin crear instancia
  static isValid(ci: string): boolean {
    try {
      new CI(ci)
      return true
    } catch {
      return false
    }
  }
}