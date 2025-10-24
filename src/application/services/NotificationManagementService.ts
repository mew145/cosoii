import { 
    Notificacion, 
    TipoNotificacion, 
    CanalNotificacion, 
    PrioridadNotificacion,
    EstadoNotificacion 
} from '@/domain/entities/Notificacion'
import { PreferenciaNotificacion } from '@/domain/entities/PreferenciaNotificacion'
import { 
    INotificacionRepository, 
    IPreferenciaNotificacionRepository,
    FiltrosNotificacion 
} from '@/domain/repositories/INotificacionRepository'
import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository'
import { NotificationService, ContextoNotificacion } from '@/domain/services/NotificationService'
import { EmailService } from '@/infrastructure/email/EmailService'
import { ApplicationError } from '@/domain/exceptions'

export interface EnviarNotificacionRequest {
    tipo: TipoNotificacion
    idUsuarioDestino: number
    contexto: ContextoNotificacion
    idUsuarioOrigen?: number
    forzarEnvio?: boolean // Ignorar preferencias del usuario
    canalEspecifico?: CanalNotificacion
}

export interface ConfiguracionNotificaciones {
    emailHabilitado: boolean
    smsHabilitado: boolean
    procesarEnLotes: boolean
    tamañoLote: number
    intervaloProcesamiento: number // minutos
    reintentoMaximo: number
    ventanaDuplicados: number // minutos
}

export class NotificationManagementService {
    private configuracion: ConfiguracionNotificaciones = {
        emailHabilitado: true,
        smsHabilitado: false,
        procesarEnLotes: true,
        tamañoLote: 50,
        intervaloProcesamiento: 5,
        reintentoMaximo: 3,
        ventanaDuplicados: 60
    }

    constructor(
        private notificacionRepository: INotificacionRepository,
        private preferenciaRepository: IPreferenciaNotificacionRepository,
        private usuarioRepository: IUsuarioRepository,
        private emailService: EmailService
    ) {}

    async enviarNotificacion(request: EnviarNotificacionRequest): Promise<{
        notificacionesCreadas: Notificacion[]
        notificacionesEnviadas: number
        errores: string[]
    }> {
        try {
            const errores: string[] = []
            const notificacionesCreadas: Notificacion[] = []
            let notificacionesEnviadas = 0

            // 1. Verificar que el usuario destino existe
            const usuarioDestino = await this.usuarioRepository.findById(request.idUsuarioDestino)
            if (!usuarioDestino) {
                throw new ApplicationError('Usuario destino no encontrado')
            }

            // 2. Crear la notificación base
            const notificacionBase = NotificationService.crearNotificacion(
                request.tipo,
                request.idUsuarioDestino,
                request.contexto,
                request.idUsuarioOrigen
            )

            // 3. Verificar duplicados recientes
            if (!request.forzarEnvio) {
                const esDuplicada = await this.verificarDuplicados(notificacionBase)
                if (esDuplicada) {
                    return {
                        notificacionesCreadas: [],
                        notificacionesEnviadas: 0,
                        errores: ['Notificación duplicada ignorada']
                    }
                }
            }

            // 4. Determinar canales de envío
            let canales: CanalNotificacion[] = []
            
            if (request.canalEspecifico) {
                canales = [request.canalEspecifico]
            } else if (request.forzarEnvio) {
                // Para envíos forzados, usar el canal por defecto del tipo
                canales = [notificacionBase.getCanalNotificacion()]
            } else {
                // Consultar preferencias del usuario
                const preferencias = await this.preferenciaRepository.obtenerPreferenciasParaEnvio(
                    request.idUsuarioDestino,
                    request.tipo,
                    notificacionBase.getPrioridadNotificacion()
                )
                canales = NotificationService.determinarCanalesEnvio(preferencias, notificacionBase)
            }

            // 5. Crear y enviar notificaciones por cada canal
            for (const canal of canales) {
                try {
                    const notificacion = Notificacion.crear({
                        tipoNotificacion: notificacionBase.getTipoNotificacion(),
                        titulo: notificacionBase.getTitulo(),
                        mensaje: notificacionBase.getMensaje(),
                        idUsuarioDestino: notificacionBase.getIdUsuarioDestino(),
                        idUsuarioOrigen: notificacionBase.getIdUsuarioOrigen(),
                        canalNotificacion: canal,
                        prioridadNotificacion: notificacionBase.getPrioridadNotificacion(),
                        fechaVencimiento: notificacionBase.getFechaVencimiento(),
                        idRiesgo: notificacionBase.getIdRiesgo(),
                        idProyecto: notificacionBase.getIdProyecto(),
                        idAuditoria: notificacionBase.getIdAuditoria(),
                        idHallazgo: notificacionBase.getIdHallazgo(),
                        idActividad: notificacionBase.getIdActividad(),
                        idIncidente: notificacionBase.getIdIncidente(),
                        idControl: notificacionBase.getIdControl(),
                        metadatos: notificacionBase.getMetadatos()
                    })

                    // Guardar en base de datos
                    const notificacionCreada = await this.notificacionRepository.crear(notificacion)
                    notificacionesCreadas.push(notificacionCreada)

                    // Intentar envío inmediato
                    const resultadoEnvio = await this.enviarPorCanal(notificacionCreada, usuarioDestino)
                    if (resultadoEnvio.success) {
                        notificacionesEnviadas++
                    } else {
                        errores.push(`Error en canal ${canal}: ${resultadoEnvio.error}`)
                    }

                } catch (error) {
                    errores.push(`Error creando notificación para canal ${canal}: ${error}`)
                }
            }

            return {
                notificacionesCreadas,
                notificacionesEnviadas,
                errores
            }

        } catch (error) {
            if (error instanceof ApplicationError) throw error
            throw new ApplicationError(`Error al enviar notificación: ${error}`)
        }
    }

    async procesarNotificacionesPendientes(): Promise<{
        procesadas: number
        enviadas: number
        errores: number
    }> {
        try {
            const notificacionesPendientes = await this.notificacionRepository.obtenerPendientesEnvio()
            
            let procesadas = 0
            let enviadas = 0
            let errores = 0

            // Procesar en lotes
            for (let i = 0; i < notificacionesPendientes.length; i += this.configuracion.tamañoLote) {
                const lote = notificacionesPendientes.slice(i, i + this.configuracion.tamañoLote)
                
                for (const notificacion of lote) {
                    try {
                        procesadas++
                        
                        // Obtener datos del usuario
                        const usuario = await this.usuarioRepository.findById(notificacion.getIdUsuarioDestino())
                        if (!usuario) {
                            await this.marcarComoError(notificacion, 'Usuario no encontrado')
                            errores++
                            continue
                        }

                        // Intentar envío
                        const resultado = await this.enviarPorCanal(notificacion, usuario)
                        if (resultado.success) {
                            enviadas++
                        } else {
                            errores++
                        }

                    } catch (error) {
                        await this.marcarComoError(notificacion, `Error inesperado: ${error}`)
                        errores++
                    }
                }

                // Pausa entre lotes
                if (i + this.configuracion.tamañoLote < notificacionesPendientes.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            }

            return { procesadas, enviadas, errores }

        } catch (error) {
            throw new ApplicationError(`Error al procesar notificaciones pendientes: ${error}`)
        }
    }

    async reintentarNotificacionesFallidas(): Promise<{
        reintentadas: number
        exitosas: number
        fallidaDefinitivamente: number
    }> {
        try {
            const notificacionesConError = await this.notificacionRepository.obtenerConError()
            
            let reintentadas = 0
            let exitosas = 0
            let fallidaDefinitivamente = 0

            for (const notificacion of notificacionesConError) {
                if (!notificacion.puedeReintentarEnvio()) {
                    fallidaDefinitivamente++
                    continue
                }

                try {
                    reintentadas++
                    
                    // Obtener datos del usuario
                    const usuario = await this.usuarioRepository.findById(notificacion.getIdUsuarioDestino())
                    if (!usuario) {
                        await this.marcarComoError(notificacion, 'Usuario no encontrado')
                        continue
                    }

                    // Reintentar envío
                    const notificacionReintentar = notificacion.reintentar()
                    await this.notificacionRepository.actualizar(notificacionReintentar)

                    const resultado = await this.enviarPorCanal(notificacionReintentar, usuario)
                    if (resultado.success) {
                        exitosas++
                    }

                } catch (error) {
                    await this.marcarComoError(notificacion, `Error en reintento: ${error}`)
                }
            }

            return { reintentadas, exitosas, fallidaDefinitivamente }

        } catch (error) {
            throw new ApplicationError(`Error al reintentar notificaciones fallidas: ${error}`)
        }
    }

    async obtenerNotificacionesUsuario(
        idUsuario: number,
        filtros?: Partial<FiltrosNotificacion>,
        limite = 50,
        offset = 0
    ): Promise<{
        notificaciones: Notificacion[]
        total: number
        noLeidas: number
    }> {
        try {
            const filtrosCompletos: FiltrosNotificacion = {
                idUsuarioDestino: idUsuario,
                ...filtros
            }

            const [resultado, contadorNoLeidas] = await Promise.all([
                this.notificacionRepository.buscar(filtrosCompletos, limite, offset),
                this.notificacionRepository.obtenerContadorNoLeidas(idUsuario)
            ])

            return {
                notificaciones: resultado.notificaciones,
                total: resultado.total,
                noLeidas: contadorNoLeidas
            }

        } catch (error) {
            throw new ApplicationError(`Error al obtener notificaciones del usuario: ${error}`)
        }
    }

    async marcarComoLeidas(idUsuario: number, idsNotificaciones?: number[]): Promise<void> {
        try {
            await this.notificacionRepository.marcarComoLeidasPorUsuario(idUsuario, idsNotificaciones)
        } catch (error) {
            throw new ApplicationError(`Error al marcar notificaciones como leídas: ${error}`)
        }
    }

    async configurarPreferenciasUsuario(
        idUsuario: number,
        preferencias: Array<{
            tipo: TipoNotificacion
            canal: CanalNotificacion
            activa: boolean
            frecuenciaMinutos?: number
            horaInicio?: string
            horaFin?: string
            diasSemana?: number[]
            prioridadMinima?: PrioridadNotificacion
        }>
    ): Promise<PreferenciaNotificacion[]> {
        try {
            const preferenciasActualizadas: PreferenciaNotificacion[] = []

            for (const prefData of preferencias) {
                if (!prefData.tipo || !prefData.canal) {
                    continue
                }

                // Buscar preferencia existente
                const existentes = await this.preferenciaRepository.obtenerPorUsuarioYTipo(
                    idUsuario,
                    prefData.tipo
                )

                const existente = existentes.find(p => 
                    p.getCanalNotificacion() === prefData.canal
                )

                if (existente) {
                    // Actualizar existente
                    let actualizada = existente
                    if (prefData.activa !== undefined) {
                        actualizada = prefData.activa ? actualizada.activar() : actualizada.desactivar()
                    }
                    // Aquí se pueden agregar más actualizaciones según sea necesario
                    
                    const guardada = await this.preferenciaRepository.actualizar(actualizada)
                    preferenciasActualizadas.push(guardada)
                } else {
                    // Crear nueva
                    const nueva = PreferenciaNotificacion.crear({
                        idUsuario,
                        tipoNotificacion: prefData.tipo,
                        canalNotificacion: prefData.canal,
                        activa: prefData.activa,
                        frecuenciaMinutos: prefData.frecuenciaMinutos,
                        horaInicio: prefData.horaInicio,
                        horaFin: prefData.horaFin,
                        diasSemana: prefData.diasSemana,
                        prioridadMinima: prefData.prioridadMinima
                    })
                    
                    const guardada = await this.preferenciaRepository.crear(nueva)
                    preferenciasActualizadas.push(guardada)
                }
            }

            return preferenciasActualizadas

        } catch (error) {
            throw new ApplicationError(`Error al configurar preferencias: ${error}`)
        }
    }

    async inicializarPreferenciasUsuario(idUsuario: number): Promise<PreferenciaNotificacion[]> {
        try {
            return await this.preferenciaRepository.crearPreferenciasDefault(idUsuario)
        } catch (error) {
            throw new ApplicationError(`Error al inicializar preferencias: ${error}`)
        }
    }

    async limpiarNotificacionesAntiguas(diasAntiguedad = 90): Promise<{
        usuariosLimpiados: number
        notificacionesEliminadas: number
    }> {
        try {
            // Obtener todos los usuarios
            const usuariosResult = await this.usuarioRepository.findAll()
            const usuarios = usuariosResult.data
            let usuariosLimpiados = 0
            let notificacionesEliminadas = 0

            for (const usuario of usuarios) {
                const eliminadas = await this.notificacionRepository.eliminarAntiguasPorUsuario(
                    usuario.getId(),
                    diasAntiguedad
                )
                
                if (eliminadas > 0) {
                    usuariosLimpiados++
                    notificacionesEliminadas += eliminadas
                }
            }

            return { usuariosLimpiados, notificacionesEliminadas }

        } catch (error) {
            throw new ApplicationError(`Error al limpiar notificaciones antiguas: ${error}`)
        }
    }

    // Métodos de conveniencia para tipos específicos de notificación
    async notificarVencimientoActividad(
        idUsuarioDestino: number,
        idActividad: number,
        descripcionActividad: string,
        fechaVencimiento: Date,
        idUsuarioOrigen?: number
    ): Promise<void> {
        const notificacion = NotificationService.crearNotificacionVencimientoActividad(
            idUsuarioDestino,
            idActividad,
            descripcionActividad,
            fechaVencimiento,
            idUsuarioOrigen
        )

        await this.enviarNotificacion({
            tipo: TipoNotificacion.VENCIMIENTO_ACTIVIDAD,
            idUsuarioDestino,
            contexto: {
                idActividad,
                descripcionActividad,
                fechaVencimiento,
                diasRestantes: Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            },
            idUsuarioOrigen
        })
    }

    async notificarRiesgoCritico(
        idUsuarioDestino: number,
        idRiesgo: number,
        nombreRiesgo: string,
        nivelRiesgo: number,
        idUsuarioOrigen?: number
    ): Promise<void> {
        await this.enviarNotificacion({
            tipo: TipoNotificacion.RIESGO_CRITICO,
            idUsuarioDestino,
            contexto: {
                idRiesgo,
                nombreRiesgo,
                nivelRiesgo
            },
            idUsuarioOrigen,
            forzarEnvio: true // Los riesgos críticos siempre se envían
        })
    }

    async notificarIncidenteSeguridad(
        idUsuarioDestino: number,
        idIncidente: number,
        descripcionIncidente: string,
        severidad: string,
        idUsuarioOrigen?: number
    ): Promise<void> {
        await this.enviarNotificacion({
            tipo: TipoNotificacion.INCIDENTE_SEGURIDAD,
            idUsuarioDestino,
            contexto: {
                idIncidente,
                descripcionIncidente,
                severidad
            },
            idUsuarioOrigen,
            forzarEnvio: true // Los incidentes de seguridad siempre se envían
        })
    }

    // Métodos privados
    private async enviarPorCanal(notificacion: Notificacion, usuario: any): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            switch (notificacion.getCanalNotificacion()) {
                case CanalNotificacion.EMAIL:
                    return await this.enviarPorEmail(notificacion, usuario)
                
                case CanalNotificacion.SISTEMA:
                    // Las notificaciones del sistema solo se guardan en BD
                    const notificacionEnviada = notificacion.marcarComoEnviada()
                    await this.notificacionRepository.actualizar(notificacionEnviada)
                    return { success: true }
                
                case CanalNotificacion.SMS:
                    // TODO: Implementar envío por SMS
                    return { success: false, error: 'SMS no implementado' }
                
                default:
                    return { success: false, error: 'Canal no soportado' }
            }
        } catch (error) {
            const notificacionError = notificacion.marcarComoError(`Error de envío: ${error}`)
            await this.notificacionRepository.actualizar(notificacionError)
            return { success: false, error: `${error}` }
        }
    }

    private async enviarPorEmail(notificacion: Notificacion, usuario: any): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            if (!this.configuracion.emailHabilitado) {
                return { success: false, error: 'Email deshabilitado' }
            }

            const email = this.emailService.createNotificationEmail(
                usuario.getEmailUsuario(),
                usuario.getNombreCompleto(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getPrioridadNotificacion(),
                notificacion.getFechaVencimiento(),
                notificacion.getMetadatos()?.urlAccion
            )

            const resultado = await this.emailService.sendEmail(email)
            
            if (resultado.success) {
                const notificacionEnviada = notificacion.marcarComoEnviada()
                await this.notificacionRepository.actualizar(notificacionEnviada)
                return { success: true }
            } else {
                const notificacionError = notificacion.marcarComoError(resultado.error || 'Error de email')
                await this.notificacionRepository.actualizar(notificacionError)
                return { success: false, error: resultado.error }
            }

        } catch (error) {
            const notificacionError = notificacion.marcarComoError(`Error de email: ${error}`)
            await this.notificacionRepository.actualizar(notificacionError)
            return { success: false, error: `${error}` }
        }
    }

    private async marcarComoError(notificacion: Notificacion, error: string): Promise<void> {
        try {
            const notificacionError = notificacion.marcarComoError(error)
            await this.notificacionRepository.actualizar(notificacionError)
        } catch (updateError) {
            console.error('Error al marcar notificación como error:', updateError)
        }
    }

    private async verificarDuplicados(notificacion: Notificacion): Promise<boolean> {
        try {
            const filtros: FiltrosNotificacion = {
                idUsuarioDestino: notificacion.getIdUsuarioDestino(),
                tipoNotificacion: notificacion.getTipoNotificacion(),
                fechaDesde: new Date(Date.now() - this.configuracion.ventanaDuplicados * 60 * 1000)
            }

            // Agregar filtros por entidad relacionada
            if (notificacion.getIdRiesgo()) filtros.idRiesgo = notificacion.getIdRiesgo()
            if (notificacion.getIdProyecto()) filtros.idProyecto = notificacion.getIdProyecto()
            if (notificacion.getIdAuditoria()) filtros.idAuditoria = notificacion.getIdAuditoria()
            if (notificacion.getIdHallazgo()) filtros.idHallazgo = notificacion.getIdHallazgo()
            if (notificacion.getIdActividad()) filtros.idActividad = notificacion.getIdActividad()
            if (notificacion.getIdIncidente()) filtros.idIncidente = notificacion.getIdIncidente()
            if (notificacion.getIdControl()) filtros.idControl = notificacion.getIdControl()

            const resultado = await this.notificacionRepository.buscar(filtros, 1)
            return resultado.notificaciones.length > 0

        } catch (error) {
            // En caso de error, permitir el envío
            return false
        }
    }
}