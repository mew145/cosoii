import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { NotificationManagementService } from '@/application/services/NotificationManagementService'
import { NotificacionRepository, PreferenciaNotificacionRepository } from '@/infrastructure/repositories/NotificacionRepository'
import { UsuarioRepository } from '@/infrastructure/repositories/UsuarioRepository'
import { EmailService } from '@/infrastructure/email/EmailService'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )
        
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { ids } = body // Array de IDs de notificaciones, opcional

        // Obtener ID del usuario
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('auth_user_id', user.id)
            .single()

        if (userError || !userData) {
            return NextResponse.json(
                { error: 'Usuario no encontrado en el sistema' },
                { status: 404 }
            )
        }

        // Inicializar servicios
        const notificacionRepository = new NotificacionRepository(supabase)
        const preferenciaRepository = new PreferenciaNotificacionRepository(supabase)
        const usuarioRepository = new UsuarioRepository()
        const emailService = EmailService.fromEnvironment()
        
        const notificationService = new NotificationManagementService(
            notificacionRepository,
            preferenciaRepository,
            usuarioRepository,
            emailService
        )

        // Marcar como leídas
        await notificationService.marcarComoLeidas(userData.id_usuario, ids)

        return NextResponse.json({
            success: true,
            message: ids ? 
                `${ids.length} notificaciones marcadas como leídas` : 
                'Todas las notificaciones marcadas como leídas'
        })

    } catch (error: any) {
        console.error('Error al marcar notificaciones como leídas:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}