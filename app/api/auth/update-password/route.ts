// =============================================
// API ROUTE: Actualizar Contraseña
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { AuthService, PasswordUpdateRequest } from '@/application/services/AuthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, confirmPassword } = body as PasswordUpdateRequest

    // Validar datos requeridos
    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Contraseña y confirmación son requeridas' },
        { status: 400 }
      )
    }

    // Verificar que el usuario esté autenticado
    const authService = new AuthService()
    const isAuthenticated = await authService.isAuthenticated()
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Actualizar contraseña
    const result = await authService.updatePassword({ password, confirmPassword })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error en API update-password:', error)
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