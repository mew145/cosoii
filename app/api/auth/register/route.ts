// =============================================
// API ROUTE: Registro de Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { AuthService, RegisterData } from '@/application/services/AuthService'
import { AuthorizationMiddleware, ModulePermissions } from '@/infrastructure/middleware/AuthorizationMiddleware'

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos (solo administradores pueden crear usuarios)
    const authMiddleware = new AuthorizationMiddleware()
    const permissionCheck = await authMiddleware.checkPermission(request, ModulePermissions.USERS.CREATE)
    
    if (!permissionCheck.authorized) {
      return permissionCheck.response || NextResponse.json(
        { error: 'Sin permisos para crear usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      email,
      password,
      nombres,
      apellidos,
      ci,
      telefono,
      departamento,
      rol
    } = body as RegisterData

    // Validar datos requeridos
    if (!email || !password || !nombres || !apellidos || !ci || !rol) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben ser proporcionados' },
        { status: 400 }
      )
    }

    // Obtener ID del usuario que está creando (para auditoría)
    const currentUser = await new AuthService().getCurrentUser()
    const createdBy = currentUser?.getId()

    // Registrar usuario
    const authService = new AuthService()
    const result = await authService.register({
      email,
      password,
      nombres,
      apellidos,
      ci,
      telefono,
      departamento,
      rol
    }, createdBy)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Registro exitoso
    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: result.user?.getId(),
        nombres: result.user?.getNombresUsuario(),
        apellidos: result.user?.getApellidosUsuario(),
        email: result.user?.getEmailUsuario(),
        ci: result.user?.getCiUsuario(),
        rol: result.user?.getRolUsuario(),
        activo: result.user?.getActivo()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error en API register:', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}