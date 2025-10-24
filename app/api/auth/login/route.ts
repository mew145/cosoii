// =============================================
// API ROUTE: Login de Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { AuthService, LoginCredentials } from '@/application/services/AuthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body as LoginCredentials

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Intentar login
    const authService = new AuthService()
    const result = await authService.login({ email, password, rememberMe })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Login exitoso
    return NextResponse.json({
      success: true,
      user: {
        id: result.user?.getId(),
        nombres: result.user?.getNombresUsuario(),
        apellidos: result.user?.getApellidosUsuario(),
        email: result.user?.getEmailUsuario(),
        rol: result.user?.getRolUsuario(),
        activo: result.user?.getActivo()
      },
      session: {
        access_token: result.session?.access_token,
        expires_at: result.session?.expires_at
      }
    })

  } catch (error) {
    console.error('Error en API login:', error)
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