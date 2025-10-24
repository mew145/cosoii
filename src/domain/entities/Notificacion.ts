import { DomainError } from '../exceptions'

export enum TipoNotificacion {
    VENCIMIENTO_ACTIVIDAD = 'VENCIMIENTO_ACTIVIDAD',
    RIESGO_CRITICO = 'RIESGO_CRITICO',
    HALLAZGO_PENDIENTE = 'HALLAZGO_PENDIENTE',
    PROYECTO_EXCEDE_TIEMPO = 'PROYECTO_EXCEDE_TIEMPO',
    NUEVA_EVIDENCIA = 'NUEVA_EVIDENCIA',
    AUDITORIA_PROGRAMADA = 'AUDITORIA_PROGRAMADA',
    INCIDENTE_SEGURIDAD = 'INCIDENTE_SEGURIDAD',
    CONTROL_VENCIDO = 'CONTROL_VENCIDO'
}

export enum EstadoNotificacion {
    PENDIENTE = 'PENDIENTE',
    ENVIADA = 'ENVIADA',
    LEIDA = 'LEIDA',
    ERROR = 'ERROR'
}

export enum CanalNotificacion {
    EMAIL = 'EMAIL',
    SISTEMA = 'SISTEMA',
    SMS = 'SMS'
}

export enum PrioridadNotificacion {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA'
}

export interface NotificacionProps {
    idNotificacion?: number
    tipoNotificacion: TipoNotificacion
    titulo: string
    mensaje: string
    idUsuarioDestino: number
    idUsuarioOrigen?: number
    estadoNotificacion: EstadoNotificacion
    canalNotificacion: CanalNotificacion
    prioridadNotificacion: PrioridadNotificacion
    fechaCreacion: Date
    fechaEnvio?: Date
    fechaLeida?: Date
    fechaVencimiento?: Date
    // Referencias a entidades relacionadas
    idRiesgo?: number
    idProyecto?: number
    idAuditoria?: number
    idHallazgo?: number
    idActividad?: number
    idIncidente?: number
    idControl?: number
    // Metadatos adicionales
    metadatos?: Record<string, any>
    intentosEnvio: number
    ultimoError?: string
}

export class Notificacion {
    private constructor(private readonly props: NotificacionProps) {
        this.validate()
    }

    private validate(): void {
        if (!this.props.titulo?.trim()) {
            throw new DomainError('El título de la notificación es requerido')
        }

        if (!this.props.mensaje?.trim()) {
            throw new DomainError('El mensaje de la notificación es requerido')
        }

        if (!this.props.idUsuarioDestino) {
            throw new DomainError('El usuario destino es requerido')
        }

        if (this.props.titulo.length > 255) {
            throw new DomainError('El título no puede exceder 255 caracteres')
        }

        if (this.props.mensaje.length > 2000) {
            throw new DomainError('El mensaje no puede exceder 2000 caracteres')
        }

        if (this.props.intentosEnvio < 0) {
            throw new DomainError('Los intentos de envío no pueden ser negativos')
        }
    }

    // Getters
    getIdNotificacion(): number | undefined {
        return this.props.idNotificacion
    }

    getTipoNotificacion(): TipoNotificacion {
        return this.props.tipoNotificacion
    }

    getTitulo(): string {
        return this.props.titulo
    }

    getMensaje(): string {
        return this.props.mensaje
    }

    getIdUsuarioDestino(): number {
        return this.props.idUsuarioDestino
    }

    getIdUsuarioOrigen(): number | undefined {
        return this.props.idUsuarioOrigen
    }

    getEstadoNotificacion(): EstadoNotificacion {
        return this.props.estadoNotificacion
    }

    getCanalNotificacion(): CanalNotificacion {
        return this.props.canalNotificacion
    }

    getPrioridadNotificacion(): PrioridadNotificacion {
        return this.props.prioridadNotificacion
    }

    getFechaCreacion(): Date {
        return this.props.fechaCreacion
    }

    getFechaEnvio(): Date | undefined {
        return this.props.fechaEnvio
    }

    getFechaLeida(): Date | undefined {
        return this.props.fechaLeida
    }

    getFechaVencimiento(): Date | undefined {
        return this.props.fechaVencimiento
    }

    getIdRiesgo(): number | undefined {
        return this.props.idRiesgo
    }

    getIdProyecto(): number | undefined {
        return this.props.idProyecto
    }

    getIdAuditoria(): number | undefined {
        return this.props.idAuditoria
    }

    getIdHallazgo(): number | undefined {
        return this.props.idHallazgo
    }

    getIdActividad(): number | undefined {
        return this.props.idActividad
    }

    getIdIncidente(): number | undefined {
        return this.props.idIncidente
    }

    getIdControl(): number | undefined {
        return this.props.idControl
    }

    getMetadatos(): Record<string, any> | undefined {
        return this.props.metadatos
    }

    getIntentosEnvio(): number {
        return this.props.intentosEnvio
    }

    getUltimoError(): string | undefined {
        return this.props.ultimoError
    }

    // Métodos de negocio
    esPendiente(): boolean {
        return this.props.estadoNotificacion === EstadoNotificacion.PENDIENTE
    }

    esEnviada(): boolean {
        return this.props.estadoNotificacion === EstadoNotificacion.ENVIADA
    }

    esLeida(): boolean {
        return this.props.estadoNotificacion === EstadoNotificacion.LEIDA
    }

    tieneError(): boolean {
        return this.props.estadoNotificacion === EstadoNotificacion.ERROR
    }

    esCritica(): boolean {
        return this.props.prioridadNotificacion === PrioridadNotificacion.CRITICA
    }

    esVencida(): boolean {
        if (!this.props.fechaVencimiento) return false
        return new Date() > this.props.fechaVencimiento
    }

    puedeReintentarEnvio(): boolean {
        return this.props.intentosEnvio < 3 && !this.esEnviada()
    }

    // Métodos de estado
    marcarComoEnviada(): Notificacion {
        return new Notificacion({
            ...this.props,
            estadoNotificacion: EstadoNotificacion.ENVIADA,
            fechaEnvio: new Date()
        })
    }

    marcarComoLeida(): Notificacion {
        return new Notificacion({
            ...this.props,
            estadoNotificacion: EstadoNotificacion.LEIDA,
            fechaLeida: new Date()
        })
    }

    marcarComoError(error: string): Notificacion {
        return new Notificacion({
            ...this.props,
            estadoNotificacion: EstadoNotificacion.ERROR,
            ultimoError: error,
            intentosEnvio: this.props.intentosEnvio + 1
        })
    }

    reintentar(): Notificacion {
        if (!this.puedeReintentarEnvio()) {
            throw new DomainError('No se puede reintentar el envío de esta notificación')
        }

        return new Notificacion({
            ...this.props,
            estadoNotificacion: EstadoNotificacion.PENDIENTE,
            ultimoError: undefined
        })
    }

    // Factory methods
    static crear(datos: {
        tipoNotificacion: TipoNotificacion
        titulo: string
        mensaje: string
        idUsuarioDestino: number
        idUsuarioOrigen?: number
        canalNotificacion: CanalNotificacion
        prioridadNotificacion: PrioridadNotificacion
        fechaVencimiento?: Date
        idRiesgo?: number
        idProyecto?: number
        idAuditoria?: number
        idHallazgo?: number
        idActividad?: number
        idIncidente?: number
        idControl?: number
        metadatos?: Record<string, any>
    }): Notificacion {
        return new Notificacion({
            ...datos,
            estadoNotificacion: EstadoNotificacion.PENDIENTE,
            fechaCreacion: new Date(),
            intentosEnvio: 0
        })
    }

    static fromDatabase(row: any): Notificacion {
        return new Notificacion({
            idNotificacion: row.id_notificacion,
            tipoNotificacion: row.tipo_notificacion as TipoNotificacion,
            titulo: row.titulo_notificacion,
            mensaje: row.mensaje_notificacion,
            idUsuarioDestino: row.id_usuario_destino,
            idUsuarioOrigen: row.id_usuario_origen,
            estadoNotificacion: row.estado_notificacion as EstadoNotificacion,
            canalNotificacion: row.canal_notificacion as CanalNotificacion,
            prioridadNotificacion: row.prioridad_notificacion as PrioridadNotificacion,
            fechaCreacion: new Date(row.fecha_creacion_notificacion),
            fechaEnvio: row.fecha_envio_notificacion ? new Date(row.fecha_envio_notificacion) : undefined,
            fechaLeida: row.fecha_leida_notificacion ? new Date(row.fecha_leida_notificacion) : undefined,
            fechaVencimiento: row.fecha_vencimiento_notificacion ? new Date(row.fecha_vencimiento_notificacion) : undefined,
            idRiesgo: row.id_riesgo,
            idProyecto: row.id_proyecto,
            idAuditoria: row.id_auditoria,
            idHallazgo: row.id_hallazgo,
            idActividad: row.id_actividad,
            idIncidente: row.id_incidente,
            idControl: row.id_control,
            metadatos: row.metadatos_notificacion,
            intentosEnvio: row.intentos_envio || 0,
            ultimoError: row.ultimo_error_notificacion
        })
    }

    toDatabase() {
        return {
            id_notificacion: this.props.idNotificacion,
            tipo_notificacion: this.props.tipoNotificacion,
            titulo_notificacion: this.props.titulo,
            mensaje_notificacion: this.props.mensaje,
            id_usuario_destino: this.props.idUsuarioDestino,
            id_usuario_origen: this.props.idUsuarioOrigen,
            estado_notificacion: this.props.estadoNotificacion,
            canal_notificacion: this.props.canalNotificacion,
            prioridad_notificacion: this.props.prioridadNotificacion,
            fecha_creacion_notificacion: this.props.fechaCreacion.toISOString(),
            fecha_envio_notificacion: this.props.fechaEnvio?.toISOString(),
            fecha_leida_notificacion: this.props.fechaLeida?.toISOString(),
            fecha_vencimiento_notificacion: this.props.fechaVencimiento?.toISOString(),
            id_riesgo: this.props.idRiesgo,
            id_proyecto: this.props.idProyecto,
            id_auditoria: this.props.idAuditoria,
            id_hallazgo: this.props.idHallazgo,
            id_actividad: this.props.idActividad,
            id_incidente: this.props.idIncidente,
            id_control: this.props.idControl,
            metadatos_notificacion: this.props.metadatos,
            intentos_envio: this.props.intentosEnvio,
            ultimo_error_notificacion: this.props.ultimoError
        }
    }
}