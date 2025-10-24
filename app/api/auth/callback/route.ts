// =============================================
// API ROUTE: Callback OAuth
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
      const supabase = await createClient()
      
      // Intercambiar el código por una sesión
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error intercambiando código:', error)
        const loginUrl = new URL('/auth/login', origin)
        loginUrl.searchParams.set('error', 'Error en autenticación OAuth')
        return NextResponse.redirect(loginUrl)
      }

      if (!data.session || !data.user) {
        const loginUrl = new URL('/auth/login', origin)
        loginUrl.searchParams.set('error', 'No se pudo obtener la sesión')
        return NextResponse.redirect(loginUrl)
      }

      // Verificar si el usuario existe en nuestra base de datos
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', data.user.id)
        .single()

      // Si no existe, crear el usuario
      if (userError || !userData) {
        const email = data.user.email
        const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || ''
        const [nombres = '', ...apellidosParts] = fullName.split(' ')
        const apellidos = apellidosParts.join(' ') || ''

        const { data: newUser, error: createError } = await supabase
          .from('usuarios')
          .insert({
            id_usuario_auth: data.user.id,
            nombres_usuario: nombres || 'Usuario',
            apellidos_usuario: apellidos || 'OAuth',
            email_usuario: email,
            ci_usuario: null,
            telefono_usuario: null,
            departamento_usuario: null,
            rol_usuario: RolUsuario.AUDITOR,
            activo: false, // Requiere activación manual
            fecha_registro: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creando usuario:', createError)
          const loginUrl = new URL('/auth/login', origin)
          loginUrl.searchParams.set('error', 'Error creando usuario')
          return NextResponse.redirect(loginUrl)
        }

        // Redirigir a completar perfil para usuarios nuevos
        const completeProfileUrl = new URL('/auth/complete-profile', origin)
        return NextResponse.redirect(completeProfileUrl)
      }

      // Verificar si el usuario necesita completar su perfil
      if (!userData.ci_usuario || !userData.activo) {
        const completeProfileUrl = new URL('/auth/complete-profile', origin)
        return NextResponse.redirect(completeProfileUrl)
      }

      // Actualizar último acceso
      await supabase
        .from('usuarios')
        .update({
          ultima_conexion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', userData.id_usuario)

      // Redirigir al dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Si no hay código, redirigir a login con error
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set('error', 'Código de autorización no encontrado')
    return NextResponse.redirect(loginUrl)

  } catch (error) {
    console.error('Error en API callback:', error)
    
    const { origin } = new URL(request.url)
    const loginUrl = new URL('/auth/login', origin)
    
    // Proporcionar más detalles del error en desarrollo
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Error procesando autenticación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      : 'Error procesando autenticación'
    
    loginUrl.searchParams.set('error', errorMessage)
    return NextResponse.redirect(loginUrl)
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