// =============================================
// VALUE OBJECT: Email
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export class Email {
  private readonly value: string

  constructor(email: string) {
    this.validate(email)
    this.value = email.toLowerCase().trim()
  }

  private validate(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email no puede estar vacío')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new Error('Formato de email inválido')
    }

    if (email.trim().length > 255) {
      throw new Error('Email no puede exceder 255 caracteres')
    }
  }

  getValue(): string {
    return this.value
  }

  getDomain(): string {
    return this.value.split('@')[1]
  }

  getLocalPart(): string {
    return this.value.split('@')[0]
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  // Método estático para crear desde string
  static fromString(email: string): Email {
    return new Email(email)
  }

  // Validación estática sin crear instancia
  static isValid(email: string): boolean {
    try {
      new Email(email)
      return true
    } catch {
      return false
    }
  }

  // Verificar si es email corporativo
  isCorporateEmail(): boolean {
    const corporateDomains = ['deltaconsult.com', 'empresa.com']
    return corporateDomains.includes(this.getDomain())
  }
}