import {
  ciSchema,
  emailSchema,
  probabilidadSchema,
  impactoSchema,
  usuarioCreateSchema,
  loginSchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('ciSchema', () => {
    it('should validate correct CI', () => {
      const result = ciSchema.safeParse('12345678')
      expect(result.success).toBe(true)
    })

    it('should reject CI with letters', () => {
      const result = ciSchema.safeParse('123abc45')
      expect(result.success).toBe(false)
    })

    it('should reject short CI', () => {
      const result = ciSchema.safeParse('123')
      expect(result.success).toBe(false)
    })

    it('should reject long CI', () => {
      const result = ciSchema.safeParse('12345678901')
      expect(result.success).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('should validate correct email', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('invalid-email')
      expect(result.success).toBe(false)
    })

    it('should reject empty email', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('probabilidadSchema', () => {
    it('should validate values 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        const result = probabilidadSchema.safeParse(i)
        expect(result.success).toBe(true)
      }
    })

    it('should reject values outside 1-5', () => {
      const result1 = probabilidadSchema.safeParse(0)
      const result2 = probabilidadSchema.safeParse(6)
      expect(result1.success).toBe(false)
      expect(result2.success).toBe(false)
    })

    it('should reject non-integers', () => {
      const result = probabilidadSchema.safeParse(2.5)
      expect(result.success).toBe(false)
    })
  })

  describe('impactoSchema', () => {
    it('should validate values 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        const result = impactoSchema.safeParse(i)
        expect(result.success).toBe(true)
      }
    })

    it('should reject values outside 1-5', () => {
      const result1 = impactoSchema.safeParse(0)
      const result2 = impactoSchema.safeParse(6)
      expect(result1.success).toBe(false)
      expect(result2.success).toBe(false)
    })
  })

  describe('usuarioCreateSchema', () => {
    const validUser = {
      nombres: 'Juan Carlos',
      apellido_paterno: 'Pérez',
      apellido_materno: 'González',
      ci: '12345678',
      correo_electronico: 'juan@example.com',
      telefono_contacto: '70123456',
      id_rol: 3,
      id_departamento: 2,
      password: 'password123',
    }

    it('should validate complete user data', () => {
      const result = usuarioCreateSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject user without required fields', () => {
      const { nombres, ...incompleteUser } = validUser
      const result = usuarioCreateSchema.safeParse(incompleteUser)
      expect(result.success).toBe(false)
    })

    it('should accept user without optional fields', () => {
      const { apellido_materno, telefono_contacto, password, ...minimalUser } = validUser
      const result = usuarioCreateSchema.safeParse(minimalUser)
      expect(result.success).toBe(true)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const loginData = {
        correo_electronico: 'test@example.com',
        password: 'password123',
      }
      const result = loginSchema.safeParse(loginData)
      expect(result.success).toBe(true)
    })

    it('should reject login without email', () => {
      const loginData = {
        password: 'password123',
      }
      const result = loginSchema.safeParse(loginData)
      expect(result.success).toBe(false)
    })

    it('should reject login without password', () => {
      const loginData = {
        correo_electronico: 'test@example.com',
      }
      const result = loginSchema.safeParse(loginData)
      expect(result.success).toBe(false)
    })
  })
})
