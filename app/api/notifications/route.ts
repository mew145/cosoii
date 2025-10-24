import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { NotificationManagementService } from '@/application/services/NotificationManagementService'
import { NotificacionRepository, PreferenciaNotificacionRepository } from '@/infrastructure/repositories/NotificacionRepository'
import { UsuarioRepository } from '@/infrastructure/repositories/UsuarioRepository'
import { EmailService } from '@/infrastructure/email/EmailService'
import { TipoNotificacion, CanalNotificacion, PrioridadNotificacion } from '@/domain/entities/Notificacion'

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

        // Obtener parámetros de consulta
        const { searchParams } = new URL(request.url)
        const limite = parseInt(searchParams.get('limite') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const soloNoLeidas = searchParams.get('soloNoLeidas') === 'true'
        const tipoNotificacion = searchParams.get('tipo') as TipoNotificacion
        const prioridad = searchParams.get('prioridad') as PrioridadNotificacion

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

        // Construir filtros
        const filtros: any = {}
        if (soloNoLeidas) filtros.soloNoLeidas = true
        if (tipoNotificacion) filtros.tipoNotificacion = tipoNotificacion
        if (prioridad) filtros.prioridadNotificacion = prioridad

        // Obtener notificaciones
        const resultado = await notificationService.obtenerNotificacionesUsuario(
            userData.id_usuario,
            filtros,
            limite,
            offset
        )

        const notificacionesFormateadas = resultado.notificaciones.map(notificacion => ({
            id: notificacion.getIdNotificacion(),
            tipo: notificacion.getTipoNotificacion(),
            titulo: notificacion.getTitulo(),
            mensaje: notificacion.getMensaje(),
            estado: notificacion.getEstadoNotificacion(),
            canal: notificacion.getCanalNotificacion(),
            prioridad: notificacion.getPrioridadNotificacion(),
            fechaCreacion: notificacion.getFechaCreacion(),
            fechaEnvio: notificacion.getFechaEnvio(),
            fechaLeida: notificacion.getFechaLeida(),
            fechaVencimiento: notificacion.getFechaVencimiento(),
            idRiesgo: notificacion.getIdRiesgo(),
            idProyecto: notificacion.getIdProyecto(),
            idAuditoria: notificacion.getIdAuditoria(),
            idHallazgo: notificacion.getIdHallazgo(),
            idActividad: notificacion.getIdActividad(),
            idIncidente: notificacion.getIdIncidente(),
            idControl: notificacion.getIdControl(),
            metadatos: notificacion.getMetadatos(),
            esPendiente: notificacion.esPendiente(),
            esEnviada: notificacion.esEnviada(),
            esLeida: notificacion.esLeida(),
            esCritica: notificacion.esCritica(),
            esVencida: notificacion.esVencida()
        }))

        return NextResponse.json({
            success: true,
            data: {
                notificaciones: notificacionesFormateadas,
                total: resultado.total,
                noLeidas: resultado.noLeidas,
                limite,
                offset
            }
        })

    } catch (error: any) {
        console.error('Error al obtener notificaciones:', error)
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
        const { 
            tipo, 
            idUsuarioDestino, 
            contexto, 
            forzarEnvio = false,
            canalEspecifico 
        } = body

        // Validar parámetros requeridos
        if (!tipo || !idUsuarioDestino || !contexto) {
            return NextResponse.json(
                { error: 'Tipo, usuario destino y contexto son requeridos' },
                { status: 400 }
            )
        }

        // Obtener ID del usuario origen
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

        // Enviar notificación
        const resultado = await notificationService.enviarNotificacion({
            tipo: tipo as TipoNotificacion,
            idUsuarioDestino,
            contexto,
            idUsuarioOrigen: userData.id_usuario,
            forzarEnvio,
            canalEspecifico: canalEspecifico as CanalNotificacion
        })

        return NextResponse.json({
            success: true,
            data: {
                notificacionesCreadas: resultado.notificacionesCreadas.length,
                notificacionesEnviadas: resultado.notificacionesEnviadas,
                errores: resultado.errores
            },
            message: 'Notificación procesada exitosamente'
        })

    } catch (error: any) {
        console.error('Error al enviar notificación:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}
