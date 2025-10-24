// =============================================
// API ROUTE: Restablecimiento de Contraseña
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { AuthService, PasswordResetRequest } from '@/application/services/AuthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, redirectTo } = body as PasswordResetRequest

    // Validar email requerido
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Solicitar restablecimiento
    const authService = new AuthService()
    const result = await authService.requestPasswordReset({ email, redirectTo })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Se ha enviado un enlace de restablecimiento a tu email'
    })

  } catch (error) {
    console.error('Error en API forgot-password:', error)
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