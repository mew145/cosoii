// =============================================
// API ROUTE: Usuario Específico
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { UserService, UpdateUserRequest } from '@/application/services/UserService'
import { AuthService } from '@/application/services/AuthService'
import { AuthorizationMiddleware, ModulePermissions } from '@/infrastructure/middleware/AuthorizationMiddleware'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const resolvedParams = await params
    const userId = parseInt(resolvedParams.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const userService = new UserService()
    const user = await userService.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
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
        fechaActualizacion: user.getFechaActualizacion(),
        ultimaConexion: user.getUltimaConexion()
      }
    })

  } catch (error) {
    console.error('Error en GET /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar permisos
    const authMiddleware = new AuthorizationMiddleware()
    const permissionCheck = await authMiddleware.checkPermission(request, ModulePermissions.USERS.EDIT)
    
    if (!permissionCheck.authorized) {
      return permissionCheck.response || NextResponse.json(
        { error: 'Sin permisos para editar usuarios' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const userId = parseInt(resolvedParams.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updateData = body as UpdateUserRequest

    // Obtener usuario actual para auditoría
    const authService = new AuthService()
    const currentUser = await authService.getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Actualizar usuario
    const userService = new UserService()
    const updatedUser = await userService.updateUser(userId, updateData, currentUser.getId())

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: updatedUser.getId(),
        nombres: updatedUser.getNombresUsuario(),
        apellidos: updatedUser.getApellidosUsuario(),
        email: updatedUser.getEmailUsuario(),
        ci: updatedUser.getCiUsuario(),
        telefono: updatedUser.getTelefonoUsuario(),
        departamento: updatedUser.getDepartamentoUsuario(),
        rol: updatedUser.getRolUsuario(),
        activo: updatedUser.getActivo(),
        fechaActualizacion: updatedUser.getFechaActualizacion()
      }
    })

  } catch (error) {
    console.error('Error en PUT /api/users/[id]:', error)
    
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar permisos
    const authMiddleware = new AuthorizationMiddleware()
    const permissionCheck = await authMiddleware.checkPermission(request, ModulePermissions.USERS.DELETE)
    
    if (!permissionCheck.authorized) {
      return permissionCheck.response || NextResponse.json(
        { error: 'Sin permisos para eliminar usuarios' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const userId = parseInt(resolvedParams.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Obtener usuario actual para auditoría
    const authService = new AuthService()
    const currentUser = await authService.getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // No permitir que un usuario se elimine a sí mismo
    if (userId === currentUser.getId()) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    // Eliminar usuario (soft delete)
    const userService = new UserService()
    await userService.deleteUser(userId, currentUser.getId())

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error en DELETE /api/users/[id]:', error)
    
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}