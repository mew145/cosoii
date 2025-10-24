// =============================================
// API ROUTE: Gestión de Usuarios
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { UserService, CreateUserRequest, UserFilters } from '@/application/services/UserService'
import { AuthService } from '@/application/services/AuthService'
import { AuthorizationMiddleware, ModulePermissions } from '@/infrastructure/middleware/AuthorizationMiddleware'
import { PaginationOptions } from '@/domain/repositories/common'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const authMiddleware = new AuthorizationMiddleware()
    const permissionCheck = await authMiddleware.checkPermission(request, ModulePermissions.USERS.VIEW)
    
    if (!permissionCheck.authorized) {
      return permissionCheck.response || NextResponse.json(
        { error: 'Sin permisos para ver usuarios' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Extraer filtros
    const filters: UserFilters = {}
    if (searchParams.get('rol')) filters.rol = searchParams.get('rol') as any
    if (searchParams.get('departamento')) filters.departamento = searchParams.get('departamento')!
    if (searchParams.get('activo')) filters.activo = searchParams.get('activo') === 'true'
    if (searchParams.get('search')) filters.search = searchParams.get('search')!

    // Extraer paginación
    const pagination: PaginationOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    }

    const userService = new UserService()
    const result = await userService.getUsers(filters, pagination)

    return NextResponse.json({
      success: true,
      data: result.data.map(user => ({
        id: user.getId(),
        nombres: user.getNombresUsuario(),
        apellidos: user.getApellidosUsuario(),
        email: user.getEmailUsuario(),
        ci: user.getCiUsuario(),
        telefono: user.getTelefonoUsuario(),
        departamento: user.getDepartamentoUsuario(),
        rol: user.getRolUsuario(),
        activo: user.getActivo(),
        fechaRegistro: user.getFechaRegistro(),
        ultimaConexion: user.getUltimaConexion()
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious
      }
    })

  } catch (error) {
    console.error('Error en GET /api/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const authMiddleware = new AuthorizationMiddleware()
    const permissionCheck = await authMiddleware.checkPermission(request, ModulePermissions.USERS.CREATE)
    
    if (!permissionCheck.authorized) {
      return permissionCheck.response || NextResponse.json(
        { error: 'Sin permisos para crear usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const userData = body as CreateUserRequest

    // Obtener usuario actual para auditoría
    const authService = new AuthService()
    const currentUser = await authService.getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Crear usuario
    const userService = new UserService()
    const newUser = await userService.createUser(userData, currentUser.getId())

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: newUser.getId(),
        nombres: newUser.getNombresUsuario(),
        apellidos: newUser.getApellidosUsuario(),
        email: newUser.getEmailUsuario(),
        ci: newUser.getCiUsuario(),
        telefono: newUser.getTelefonoUsuario(),
        departamento: newUser.getDepartamentoUsuario(),
        rol: newUser.getRolUsuario(),
        activo: newUser.getActivo(),
        fechaRegistro: newUser.getFechaRegistro()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/users:', error)
    
    // Manejar errores específicos
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}