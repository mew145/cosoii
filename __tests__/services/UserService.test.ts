// =============================================
// TESTS: UserService
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { UserService, CreateUserRequest, UpdateUserRequest, UserFilters } from '@/application/services/UserService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { PaginationOptions } from '@/domain/repositories/common'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          range: jest.fn()
        }))
      })),
      or: jest.fn(() => ({
        range: jest.fn(),
        order: jest.fn(() => ({
          range: jest.fn()
        }))
      })),
      order: jest.fn(() => ({
        range: jest.fn()
      })),
      range: jest.fn(),
      single: jest.fn()
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock PermissionService
jest.mock('@/application/services/PermissionService', () => ({
  PermissionService: jest.fn().mockImplementation(() => ({
    setupDefaultPermissions: jest.fn()
  }))
}))

describe('UserService', () => {
  let userService: UserService
  
  const mockUserData = {
    id_usuario: 1,
    id_usuario_auth: 'auth-123',
    nombres_usuario: 'Juan Carlos',
    apellidos_usuario: 'Pérez González',
    email_usuario: 'juan@example.com',
    ci_usuario: '12345678',
    telefono_usuario: '70123456',
    departamento_usuario: 'IT',
    rol_usuario: RolUsuario.GERENTE,
    activo: true,
    fecha_registro: '2024-01-01T00:00:00Z',
    fecha_actualizacion: '2024-01-01T00:00:00Z',
    ultima_conexion: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    userService = new UserService()
    jest.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should return paginated users without filters', async () => {
      const mockResponse = {
        data: [mockUserData],
        error: null,
        count: 1
      }

      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve(mockResponse))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const pagination: PaginationOptions = { page: 1, limit: 10 }
      const result = await userService.getUsers({}, pagination)

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(1)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('usuarios')
    })

    it('should apply search filter', async () => {
      const mockResponse = {
        data: [mockUserData],
        error: null,
        count: 1
      }

      const mockQuery = {
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve(mockResponse))
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const filters: UserFilters = { search: 'Juan' }
      const pagination: PaginationOptions = { page: 1, limit: 10 }
      
      await userService.getUsers(filters, pagination)

      expect(mockQuery.select().or).toHaveBeenCalled()
    })

    it('should apply role filter', async () => {
      const mockResponse = {
        data: [mockUserData],
        error: null,
        count: 1
      }

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve(mockResponse))
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const filters: UserFilters = { rol: RolUsuario.GERENTE }
      const pagination: PaginationOptions = { page: 1, limit: 10 }
      
      await userService.getUsers(filters, pagination)

      expect(mockQuery.select().eq).toHaveBeenCalledWith('rol_usuario', RolUsuario.GERENTE)
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
              count: null
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const pagination: PaginationOptions = { page: 1, limit: 10 }
      
      await expect(userService.getUsers({}, pagination)).rejects.toThrow('Error obteniendo usuarios: Database error')
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockUserData,
              error: null
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await userService.getUserById(1)

      expect(result).toBeInstanceOf(Usuario)
      expect(result?.getId()).toBe(1)
      expect(mockQuery.select().eq).toHaveBeenCalledWith('id_usuario', 1)
    })

    it('should return null when user not found', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await userService.getUserById(999)

      expect(result).toBeNull()
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockInsertQuery = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockUserData,
              error: null
            }))
          }))
        }))
      }

      const mockSelectQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      }

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelectQuery) // First call for email check
        .mockReturnValueOnce(mockSelectQuery) // Second call for CI check
        .mockReturnValueOnce(mockInsertQuery) // Third call for insert

      const createRequest: CreateUserRequest = {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'juan@example.com',
        ci: '12345678',
        telefono: '70123456',
        departamento: 'IT',
        rol: RolUsuario.GERENTE
      }

      const result = await userService.createUser(createRequest, 1)

      expect(result).toBeInstanceOf(Usuario)
      expect(result.getNombresUsuario()).toBe('Juan Carlos')
      // Note: Permission service is mocked, so we can't easily test the call
    })

    it('should reject duplicate email', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { id_usuario: 2 },
              error: null
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const createRequest: CreateUserRequest = {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'existing@example.com',
        ci: '12345678',
        rol: RolUsuario.GERENTE
      }

      await expect(userService.createUser(createRequest, 1)).rejects.toThrow('El email ya está registrado en el sistema')
    })

    it('should validate required fields', async () => {
      const createRequest: CreateUserRequest = {
        nombres: '',
        apellidos: 'Pérez González',
        email: 'juan@example.com',
        ci: '12345678',
        rol: RolUsuario.GERENTE
      }

      await expect(userService.createUser(createRequest, 1)).rejects.toThrow('Nombres son requeridos')
    })

    it('should validate email format', async () => {
      const createRequest: CreateUserRequest = {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'invalid-email',
        ci: '12345678',
        rol: RolUsuario.GERENTE
      }

      await expect(userService.createUser(createRequest, 1)).rejects.toThrow('Email inválido')
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockSelectQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockUserData,
              error: null
            }))
          }))
        }))
      }

      const mockUpdateQuery = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { ...mockUserData, nombres_usuario: 'Juan Updated' },
                error: null
              }))
            }))
          }))
        }))
      }

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelectQuery) // Get current user
        .mockReturnValueOnce(mockUpdateQuery) // Update user

      const updateRequest: UpdateUserRequest = {
        nombres: 'Juan Updated'
      }

      const result = await userService.updateUser(1, updateRequest, 1)

      expect(result).toBeInstanceOf(Usuario)
      expect(result.getNombresUsuario()).toBe('Juan Updated')
    })

    it('should reject update for non-existent user', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const updateRequest: UpdateUserRequest = {
        nombres: 'Juan Updated'
      }

      await expect(userService.updateUser(999, updateRequest, 1)).rejects.toThrow('Usuario no encontrado')
    })
  })

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const mockQuery = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { ...mockUserData, activo: true },
                error: null
              }))
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await userService.activateUser(1, 1)

      expect(result).toBeInstanceOf(Usuario)
      expect(result.getActivo()).toBe(true)
      expect(mockQuery.update).toHaveBeenCalledWith({
        activo: true,
        fecha_actualizacion: expect.any(String)
      })
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const mockQuery = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { ...mockUserData, activo: false },
                error: null
              }))
            }))
          }))
        }))
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await userService.deactivateUser(1, 1)

      expect(result).toBeInstanceOf(Usuario)
      expect(result.getActivo()).toBe(false)
      expect(mockQuery.update).toHaveBeenCalledWith({
        activo: false,
        fecha_actualizacion: expect.any(String)
      })
    })
  })

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockCountQuery = {
        select: jest.fn(() => Promise.resolve({ count: 10 }))
      }

      const mockDataQuery = {
        select: jest.fn(() => Promise.resolve({
          data: [
            { rol_usuario: RolUsuario.GERENTE },
            { rol_usuario: RolUsuario.AUDITOR }
          ]
        }))
      }

      const mockRecentQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: [mockUserData]
            }))
          }))
        }))
      }

      mockSupabaseClient.from
        .mockReturnValueOnce(mockCountQuery) // Total users
        .mockReturnValueOnce(mockCountQuery) // Active users
        .mockReturnValueOnce(mockDataQuery) // Role distribution
        .mockReturnValueOnce(mockDataQuery) // Department distribution
        .mockReturnValueOnce(mockRecentQuery) // Recent users
        .mockReturnValueOnce(mockDataQuery) // Users without connection

      const stats = await userService.getUserStats()

      expect(stats.totalUsuarios).toBe(10)
      expect(stats.usuariosActivos).toBe(10)
      expect(stats.distribucionPorRol).toHaveLength(2)
      expect(stats.usuariosRecientes).toHaveLength(1)
    })
  })
})