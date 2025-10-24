import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { NotificationManagementService } from '@/application/services/NotificationManagementService'
import { NotificacionRepository, PreferenciaNotificacionRepository } from '@/infrastructure/repositories/NotificacionRepository'
import { UsuarioRepository } from '@/infrastructure/repositories/UsuarioRepository'
import { EmailService } from '@/infrastructure/email/EmailService'
import { TipoNotificacion, CanalNotificacion } from '@/domain/entities/Notificacion'

export async function GET(request: NextRequest) {
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
        const preferenciaRepository = new PreferenciaNotificacionRepository(supabase)

        // Obtener preferencias del usuario
        const preferencias = await preferenciaRepository.obtenerPorUsuario(userData.id_usuario)

        const preferenciasFormateadas = preferencias.map(preferencia => ({
            id: preferencia.getIdPreferencia(),
            tipo: preferencia.getTipoNotificacion(),
            canal: preferencia.getCanalNotificacion(),
            activa: preferencia.esActiva(),
            frecuenciaMinutos: preferencia.getFrecuenciaMinutos(),
            horaInicio: preferencia.getHoraInicio(),
            horaFin: preferencia.getHoraFin(),
            diasSemana: preferencia.getDiasSemana(),
            prioridadMinima: preferencia.getPrioridadMinima(),
            esRecurrente: preferencia.esRecurrente(),
            tieneRestriccionHoraria: preferencia.tieneRestriccionHoraria(),
            tieneRestriccionDias: preferencia.tieneRestriccionDias()
        }))

        return NextResponse.json({
            success: true,
            data: {
                preferencias: preferenciasFormateadas,
                tiposDisponibles: Object.values(TipoNotificacion),
                canalesDisponibles: Object.values(CanalNotificacion)
            }
        })

    } catch (error: any) {
        console.error('Error al obtener preferencias:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}

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
        const { preferencias, inicializar = false } = body

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

        let resultado

        if (inicializar) {
            // Crear preferencias por defecto
            resultado = await notificationService.inicializarPreferenciasUsuario(userData.id_usuario)
        } else {
            // Actualizar preferencias existentes
            if (!preferencias || !Array.isArray(preferencias)) {
                return NextResponse.json(
                    { error: 'Se requiere un array de preferencias' },
                    { status: 400 }
                )
            }

            resultado = await notificationService.configurarPreferenciasUsuario(
                userData.id_usuario,
                preferencias
            )
        }

        const preferenciasFormateadas = resultado.map(preferencia => ({
            id: preferencia.getIdPreferencia(),
            tipo: preferencia.getTipoNotificacion(),
            canal: preferencia.getCanalNotificacion(),
            activa: preferencia.esActiva(),
            frecuenciaMinutos: preferencia.getFrecuenciaMinutos(),
            horaInicio: preferencia.getHoraInicio(),
            horaFin: preferencia.getHoraFin(),
            diasSemana: preferencia.getDiasSemana(),
            prioridadMinima: preferencia.getPrioridadMinima()
        }))

        return NextResponse.json({
            success: true,
            data: {
                preferencias: preferenciasFormateadas
            },
            message: inicializar ? 
                'Preferencias inicializadas exitosamente' : 
                'Preferencias actualizadas exitosamente'
        })

    } catch (error: any) {
        console.error('Error al configurar preferencias:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}