import { DomainError } from '../exceptions'
import { TipoNotificacion, CanalNotificacion, PrioridadNotificacion } from './Notificacion'

export interface PreferenciaNotificacionProps {
    idPreferencia?: number
    idUsuario: number
    tipoNotificacion: TipoNotificacion
    canalNotificacion: CanalNotificacion
    activa: boolean
    frecuenciaMinutos?: number // Para notificaciones recurrentes
    horaInicio?: string // HH:MM formato 24h
    horaFin?: string // HH:MM formato 24h
    diasSemana?: number[] // 0=Domingo, 1=Lunes, etc.
    prioridadMinima?: PrioridadNotificacion
    fechaCreacion: Date
    fechaActualizacion: Date
}

export class PreferenciaNotificacion {
    private constructor(private readonly props: PreferenciaNotificacionProps) {
        this.validate()
    }

    private validate(): void {
        if (!this.props.idUsuario) {
            throw new DomainError('El ID del usuario es requerido')
        }

        if (this.props.frecuenciaMinutos && this.props.frecuenciaMinutos < 1) {
            throw new DomainError('La frecuencia debe ser mayor a 0 minutos')
        }

        if (this.props.horaInicio && !this.esHoraValida(this.props.horaInicio)) {
            throw new DomainError('Hora de inicio inválida (formato HH:MM)')
        }

        if (this.props.horaFin && !this.esHoraValida(this.props.horaFin)) {
            throw new DomainError('Hora de fin inválida (formato HH:MM)')
        }

        if (this.props.diasSemana) {
            for (const dia of this.props.diasSemana) {
                if (dia < 0 || dia > 6) {
                    throw new DomainError('Los días de la semana deben estar entre 0 (Domingo) y 6 (Sábado)')
                }
            }
        }
    }

    private esHoraValida(hora: string): boolean {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        return regex.test(hora)
    }

    // Getters
    getIdPreferencia(): number | undefined {
        return this.props.idPreferencia
    }

    getIdUsuario(): number {
        return this.props.idUsuario
    }

    getTipoNotificacion(): TipoNotificacion {
        return this.props.tipoNotificacion
    }

    getCanalNotificacion(): CanalNotificacion {
        return this.props.canalNotificacion
    }

    esActiva(): boolean {
        return this.props.activa
    }

    getFrecuenciaMinutos(): number | undefined {
        return this.props.frecuenciaMinutos
    }

    getHoraInicio(): string | undefined {
        return this.props.horaInicio
    }

    getHoraFin(): string | undefined {
        return this.props.horaFin
    }

    getDiasSemana(): number[] | undefined {
        return this.props.diasSemana
    }

    getPrioridadMinima(): PrioridadNotificacion | undefined {
        return this.props.prioridadMinima
    }

    getFechaCreacion(): Date {
        return this.props.fechaCreacion
    }

    getFechaActualizacion(): Date {
        return this.props.fechaActualizacion
    }

    // Métodos de negocio
    puedeEnviarNotificacion(prioridad: PrioridadNotificacion, fechaHora: Date = new Date()): boolean {
        if (!this.props.activa) {
            return false
        }

        // Verificar prioridad mínima
        if (this.props.prioridadMinima) {
            const prioridades = {
                [PrioridadNotificacion.BAJA]: 1,
                [PrioridadNotificacion.MEDIA]: 2,
                [PrioridadNotificacion.ALTA]: 3,
                [PrioridadNotificacion.CRITICA]: 4
            }

            if (prioridades[prioridad] < prioridades[this.props.prioridadMinima]) {
                return false
            }
        }

        // Verificar horario
        if (this.props.horaInicio && this.props.horaFin) {
            const horaActual = fechaHora.toTimeString().substring(0, 5)
            if (horaActual < this.props.horaInicio || horaActual > this.props.horaFin) {
                return false
            }
        }

        // Verificar días de la semana
        if (this.props.diasSemana && this.props.diasSemana.length > 0) {
            const diaActual = fechaHora.getDay()
            if (!this.props.diasSemana.includes(diaActual)) {
                return false
            }
        }

        return true
    }

    esRecurrente(): boolean {
        return this.props.frecuenciaMinutos !== undefined && this.props.frecuenciaMinutos > 0
    }

    tieneRestriccionHoraria(): boolean {
        return this.props.horaInicio !== undefined && this.props.horaFin !== undefined
    }

    tieneRestriccionDias(): boolean {
        return this.props.diasSemana !== undefined && this.props.diasSemana.length > 0
    }

    // Métodos de actualización
    activar(): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            ...this.props,
            activa: true,
            fechaActualizacion: new Date()
        })
    }

    desactivar(): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            ...this.props,
            activa: false,
            fechaActualizacion: new Date()
        })
    }

    cambiarCanal(nuevoCanal: CanalNotificacion): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            ...this.props,
            canalNotificacion: nuevoCanal,
            fechaActualizacion: new Date()
        })
    }

    configurarHorario(horaInicio: string, horaFin: string): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            ...this.props,
            horaInicio,
            horaFin,
            fechaActualizacion: new Date()
        })
    }

    configurarDias(diasSemana: number[]): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            ...this.props,
            diasSemana,
            fechaActualizacion: new Date()
        })
    }

    // Factory methods
    static crear(datos: {
        idUsuario: number
        tipoNotificacion: TipoNotificacion
        canalNotificacion: CanalNotificacion
        activa?: boolean
        frecuenciaMinutos?: number
        horaInicio?: string
        horaFin?: string
        diasSemana?: number[]
        prioridadMinima?: PrioridadNotificacion
    }): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            ...datos,
            activa: datos.activa ?? true,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date()
        })
    }

    static crearPreferenciasDefault(idUsuario: number): PreferenciaNotificacion[] {
        const preferenciasDefault = [
            // Notificaciones críticas por email
            {
                tipoNotificacion: TipoNotificacion.RIESGO_CRITICO,
                canalNotificacion: CanalNotificacion.EMAIL,
                prioridadMinima: PrioridadNotificacion.CRITICA
            },
            {
                tipoNotificacion: TipoNotificacion.INCIDENTE_SEGURIDAD,
                canalNotificacion: CanalNotificacion.EMAIL,
                prioridadMinima: PrioridadNotificacion.ALTA
            },
            // Vencimientos por sistema y email
            {
                tipoNotificacion: TipoNotificacion.VENCIMIENTO_ACTIVIDAD,
                canalNotificacion: CanalNotificacion.SISTEMA,
                prioridadMinima: PrioridadNotificacion.MEDIA
            },
            {
                tipoNotificacion: TipoNotificacion.VENCIMIENTO_ACTIVIDAD,
                canalNotificacion: CanalNotificacion.EMAIL,
                prioridadMinima: PrioridadNotificacion.ALTA,
                horaInicio: '08:00',
                horaFin: '18:00',
                diasSemana: [1, 2, 3, 4, 5] // Lunes a Viernes
            },
            // Hallazgos pendientes semanalmente
            {
                tipoNotificacion: TipoNotificacion.HALLAZGO_PENDIENTE,
                canalNotificacion: CanalNotificacion.EMAIL,
                frecuenciaMinutos: 10080, // 7 días
                diasSemana: [1], // Solo lunes
                horaInicio: '09:00',
                horaFin: '10:00'
            },
            // Notificaciones del sistema
            {
                tipoNotificacion: TipoNotificacion.NUEVA_EVIDENCIA,
                canalNotificacion: CanalNotificacion.SISTEMA,
                prioridadMinima: PrioridadNotificacion.BAJA
            }
        ]

        return preferenciasDefault.map(pref => 
            PreferenciaNotificacion.crear({
                idUsuario,
                ...pref
            })
        )
    }

    static fromDatabase(row: any): PreferenciaNotificacion {
        return new PreferenciaNotificacion({
            idPreferencia: row.id_preferencia_notificacion,
            idUsuario: row.id_usuario,
            tipoNotificacion: row.tipo_notificacion as TipoNotificacion,
            canalNotificacion: row.canal_notificacion as CanalNotificacion,
            activa: row.activa_preferencia,
            frecuenciaMinutos: row.frecuencia_minutos,
            horaInicio: row.hora_inicio,
            horaFin: row.hora_fin,
            diasSemana: row.dias_semana,
            prioridadMinima: row.prioridad_minima as PrioridadNotificacion,
            fechaCreacion: new Date(row.fecha_creacion_preferencia),
            fechaActualizacion: new Date(row.fecha_actualizacion_preferencia)
        })
    }

    toDatabase() {
        return {
            id_preferencia_notificacion: this.props.idPreferencia,
            id_usuario: this.props.idUsuario,
            tipo_notificacion: this.props.tipoNotificacion,
            canal_notificacion: this.props.canalNotificacion,
            activa_preferencia: this.props.activa,
            frecuencia_minutos: this.props.frecuenciaMinutos,
            hora_inicio: this.props.horaInicio,
            hora_fin: this.props.horaFin,
            dias_semana: this.props.diasSemana,
            prioridad_minima: this.props.prioridadMinima,
            fecha_creacion_preferencia: this.props.fechaCreacion.toISOString(),
            fecha_actualizacion_preferencia: this.props.fechaActualizacion.toISOString()
        }
    }
}