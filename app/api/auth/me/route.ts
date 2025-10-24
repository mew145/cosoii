// =============================================
// API ROUTE: Usuario Actual
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/application/services/AuthService'
import { PermissionService } from '@/application/services/PermissionService'

export async function GET(request: NextRequest) {
  try {
    const authService = new AuthService()
    const permissionService = new PermissionService()

    // Obtener usuario actual
    const user = await authService.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Obtener permisos del usuario
    const permissions = await permissionService.getUserPermissions(user.getId())

    // Obtener sesión actual
    const session = await authService.getCurrentSession()

    return NextResponse.json({
      user: {
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
      },
      permissions: permissions.map(p => ({
        id: p.id_permiso,
        nombre: p.nombre_permiso,
        modulo: p.modulo_permiso,
        accion: p.accion_permiso
      })),
      session: {
        access_token: session?.access_token,
        expires_at: session?.expires_at,
        expires_in: session?.expires_in
      }
    })

  } catch (error) {
    console.error('Error en API me:', error)
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}