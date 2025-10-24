import { 
    Notificacion, 
    TipoNotificacion, 
    CanalNotificacion, 
    PrioridadNotificacion,
    EstadoNotificacion 
} from '../entities/Notificacion'
import { PreferenciaNotificacion } from '../entities/PreferenciaNotificacion'
import { DomainError } from '../exceptions'

export interface TemplateNotificacion {
    titulo: string
    mensaje: string
    prioridad: PrioridadNotificacion
    canal: CanalNotificacion
    vencimientoHoras?: number
}

export interface ContextoNotificacion {
    // Datos del usuario
    nombreUsuario?: string
    emailUsuario?: string
    
    // Datos de la entidad relacionada
    nombreRiesgo?: string
    nombreProyecto?: string
    nombreAuditoria?: string
    descripcionHallazgo?: string
    descripcionActividad?: string
    
    // Fechas importantes
    fechaVencimiento?: Date
    fechaCreacion?: Date
    
    // Valores numéricos
    nivelRiesgo?: number
    porcentajeAvance?: number
    diasRestantes?: number
    
    // URLs y enlaces
    urlEntidad?: string
    urlAccion?: string
    
    // Metadatos adicionales
    [key: string]: any
}

export class NotificationService {
    private static readonly TEMPLATES: Record<TipoNotificacion, TemplateNotificacion> = {
        [TipoNotificacion.VENCIMIENTO_ACTIVIDAD]: {
            titulo: 'Actividad próxima a vencer',
            mensaje: 'La actividad "{descripcionActividad}" vence en {diasRestantes} días.',
            prioridad: PrioridadNotificacion.ALTA,
            canal: CanalNotificacion.EMAIL,
            vencimientoHoras: 72
        },
        [TipoNotificacion.RIESGO_CRITICO]: {
            titulo: 'Riesgo crítico identificado',
            mensaje: 'El riesgo "{nombreRiesgo}" ha alcanzado un nivel crítico ({nivelRiesgo}). Se requiere atención inmediata.',
            prioridad: PrioridadNotificacion.CRITICA,
            canal: CanalNotificacion.EMAIL
        },
        [TipoNotificacion.HALLAZGO_PENDIENTE]: {
            titulo: 'Recordatorio: Hallazgos pendientes',
            mensaje: 'Tienes hallazgos pendientes de cierre. Descripción: "{descripcionHallazgo}".',
            prioridad: PrioridadNotificacion.MEDIA,
            canal: CanalNotificacion.EMAIL,
            vencimientoHoras: 168 // 7 días
        },
        [TipoNotificacion.PROYECTO_EXCEDE_TIEMPO]: {
            titulo: 'Proyecto excede tiempo planificado',
            mensaje: 'El proyecto "{nombreProyecto}" ha excedido el 80% del tiempo planificado ({porcentajeAvance}%).',
            prioridad: PrioridadNotificacion.ALTA,
            canal: CanalNotificacion.EMAIL
        },
        [TipoNotificacion.NUEVA_EVIDENCIA]: {
            titulo: 'Nueva evidencia cargada',
            mensaje: 'Se ha cargado nueva evidencia en {nombreRiesgo || nombreAuditoria || "el sistema"}.',
            prioridad: PrioridadNotificacion.BAJA,
            canal: CanalNotificacion.SISTEMA
        },
        [TipoNotificacion.AUDITORIA_PROGRAMADA]: {
            titulo: 'Auditoría programada',
            mensaje: 'Se ha programado una nueva auditoría: "{nombreAuditoria}" para el {fechaVencimiento}.',
            prioridad: PrioridadNotificacion.MEDIA,
            canal: CanalNotificacion.EMAIL
        },
        [TipoNotificacion.INCIDENTE_SEGURIDAD]: {
            titulo: 'Incidente de seguridad reportado',
            mensaje: 'Se ha reportado un incidente de seguridad que requiere su atención inmediata.',
            prioridad: PrioridadNotificacion.CRITICA,
            canal: CanalNotificacion.EMAIL
        },
        [TipoNotificacion.CONTROL_VENCIDO]: {
            titulo: 'Control vencido',
            mensaje: 'El control de seguridad ha vencido y requiere revisión.',
            prioridad: PrioridadNotificacion.ALTA,
            canal: CanalNotificacion.EMAIL
        }
    }

    static crearNotificacion(
        tipo: TipoNotificacion,
        idUsuarioDestino: number,
        contexto: ContextoNotificacion,
        idUsuarioOrigen?: number,
        configuracionPersonalizada?: Partial<TemplateNotificacion>
    ): Notificacion {
        const template = { ...this.TEMPLATES[tipo], ...configuracionPersonalizada }
        
        const titulo = this.procesarTemplate(template.titulo, contexto)
        const mensaje = this.procesarTemplate(template.mensaje, contexto)
        
        const fechaVencimiento = template.vencimientoHoras 
            ? new Date(Date.now() + template.vencimientoHoras * 60 * 60 * 1000)
            : undefined

        return Notificacion.crear({
            tipoNotificacion: tipo,
            titulo,
            mensaje,
            idUsuarioDestino,
            idUsuarioOrigen,
            canalNotificacion: template.canal,
            prioridadNotificacion: template.prioridad,
            fechaVencimiento,
            metadatos: contexto,
            // Asociaciones basadas en el contexto
            idRiesgo: contexto.idRiesgo,
            idProyecto: contexto.idProyecto,
            idAuditoria: contexto.idAuditoria,
            idHallazgo: contexto.idHallazgo,
            idActividad: contexto.idActividad,
            idIncidente: contexto.idIncidente,
            idControl: contexto.idControl
        })
    }

    static crearNotificacionVencimientoActividad(
        idUsuarioDestino: number,
        idActividad: number,
        descripcionActividad: string,
        fechaVencimiento: Date,
        idUsuarioOrigen?: number
    ): Notificacion {
        const diasRestantes = Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        return this.crearNotificacion(
            TipoNotificacion.VENCIMIENTO_ACTIVIDAD,
            idUsuarioDestino,
            {
                idActividad,
                descripcionActividad,
                fechaVencimiento,
                diasRestantes,
                urlAccion: `/actividades/${idActividad}`
            },
            idUsuarioOrigen
        )
    }

    static crearNotificacionRiesgoCritico(
        idUsuarioDestino: number,
        idRiesgo: number,
        nombreRiesgo: string,
        nivelRiesgo: number,
        idUsuarioOrigen?: number
    ): Notificacion {
        return this.crearNotificacion(
            TipoNotificacion.RIESGO_CRITICO,
            idUsuarioDestino,
            {
                idRiesgo,
                nombreRiesgo,
                nivelRiesgo,
                urlEntidad: `/riesgos/${idRiesgo}`,
                urlAccion: `/riesgos/${idRiesgo}/mitigar`
            },
            idUsuarioOrigen
        )
    }

    static crearNotificacionHallazgoPendiente(
        idUsuarioDestino: number,
        idHallazgo: number,
        descripcionHallazgo: string,
        fechaVencimiento: Date,
        idUsuarioOrigen?: number
    ): Notificacion {
        const diasRestantes = Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        return this.crearNotificacion(
            TipoNotificacion.HALLAZGO_PENDIENTE,
            idUsuarioDestino,
            {
                idHallazgo,
                descripcionHallazgo,
                fechaVencimiento,
                diasRestantes,
                urlEntidad: `/hallazgos/${idHallazgo}`,
                urlAccion: `/hallazgos/${idHallazgo}/cerrar`
            },
            idUsuarioOrigen
        )
    }

    static crearNotificacionProyectoExcedetiempo(
        idUsuarioDestino: number,
        idProyecto: number,
        nombreProyecto: string,
        porcentajeAvance: number,
        idUsuarioOrigen?: number
    ): Notificacion {
        return this.crearNotificacion(
            TipoNotificacion.PROYECTO_EXCEDE_TIEMPO,
            idUsuarioDestino,
            {
                idProyecto,
                nombreProyecto,
                porcentajeAvance,
                urlEntidad: `/proyectos/${idProyecto}`,
                urlAccion: `/proyectos/${idProyecto}/revisar`
            },
            idUsuarioOrigen
        )
    }

    static crearNotificacionNuevaEvidencia(
        idUsuarioDestino: number,
        idEvidencia: number,
        nombreArchivo: string,
        contextoEntidad: {
            idRiesgo?: number
            nombreRiesgo?: string
            idAuditoria?: number
            nombreAuditoria?: string
            idHallazgo?: number
        },
        idUsuarioOrigen?: number
    ): Notificacion {
        return this.crearNotificacion(
            TipoNotificacion.NUEVA_EVIDENCIA,
            idUsuarioDestino,
            {
                ...contextoEntidad,
                nombreArchivo,
                urlAccion: `/evidencias/${idEvidencia}`
            },
            idUsuarioOrigen
        )
    }

    static crearNotificacionIncidenteSeguridad(
        idUsuarioDestino: number,
        idIncidente: number,
        descripcionIncidente: string,
        severidad: string,
        idUsuarioOrigen?: number
    ): Notificacion {
        return this.crearNotificacion(
            TipoNotificacion.INCIDENTE_SEGURIDAD,
            idUsuarioDestino,
            {
                idIncidente,
                descripcionIncidente,
                severidad,
                urlEntidad: `/incidentes/${idIncidente}`,
                urlAccion: `/incidentes/${idIncidente}/responder`
            },
            idUsuarioOrigen,
            {
                mensaje: `Incidente de seguridad (${severidad}): ${descripcionIncidente}. Se requiere atención inmediata.`
            }
        )
    }

    static validarPreferenciasUsuario(
        preferencias: PreferenciaNotificacion[],
        notificacion: Notificacion,
        fechaHora: Date = new Date()
    ): PreferenciaNotificacion[] {
        return preferencias.filter(preferencia => 
            preferencia.getTipoNotificacion() === notificacion.getTipoNotificacion() &&
            preferencia.getCanalNotificacion() === notificacion.getCanalNotificacion() &&
            preferencia.puedeEnviarNotificacion(notificacion.getPrioridadNotificacion(), fechaHora)
        )
    }

    static determinarCanalesEnvio(
        preferencias: PreferenciaNotificacion[],
        notificacion: Notificacion,
        fechaHora: Date = new Date()
    ): CanalNotificacion[] {
        const preferenciasValidas = this.validarPreferenciasUsuario(preferencias, notificacion, fechaHora)
        
        if (preferenciasValidas.length === 0) {
            // Si no hay preferencias válidas pero es crítica, enviar por email
            if (notificacion.esCritica()) {
                return [CanalNotificacion.EMAIL]
            }
            return []
        }

        return preferenciasValidas.map(p => p.getCanalNotificacion())
    }

    static calcularProximoIntento(intentosRealizados: number): Date {
        // Backoff exponencial: 5min, 15min, 1h
        const intervalos = [5, 15, 60] // minutos
        const intervalo = intervalos[Math.min(intentosRealizados, intervalos.length - 1)]
        return new Date(Date.now() + intervalo * 60 * 1000)
    }

    static esNotificacionDuplicada(
        notificacionExistente: Notificacion,
        nuevaNotificacion: Notificacion,
        ventanaMinutos: number = 60
    ): boolean {
        // Verificar si es el mismo tipo y usuario
        if (notificacionExistente.getTipoNotificacion() !== nuevaNotificacion.getTipoNotificacion() ||
            notificacionExistente.getIdUsuarioDestino() !== nuevaNotificacion.getIdUsuarioDestino()) {
            return false
        }

        // Verificar si están relacionadas con la misma entidad
        const mismEntidad = (
            notificacionExistente.getIdRiesgo() === nuevaNotificacion.getIdRiesgo() &&
            notificacionExistente.getIdProyecto() === nuevaNotificacion.getIdProyecto() &&
            notificacionExistente.getIdAuditoria() === nuevaNotificacion.getIdAuditoria() &&
            notificacionExistente.getIdHallazgo() === nuevaNotificacion.getIdHallazgo() &&
            notificacionExistente.getIdActividad() === nuevaNotificacion.getIdActividad() &&
            notificacionExistente.getIdIncidente() === nuevaNotificacion.getIdIncidente() &&
            notificacionExistente.getIdControl() === nuevaNotificacion.getIdControl()
        )

        if (!mismEntidad) {
            return false
        }

        // Verificar ventana de tiempo
        const tiempoTranscurrido = Date.now() - notificacionExistente.getFechaCreacion().getTime()
        const ventanaMs = ventanaMinutos * 60 * 1000
        
        return tiempoTranscurrido < ventanaMs
    }

    private static procesarTemplate(template: string, contexto: ContextoNotificacion): string {
        let resultado = template

        // Reemplazar variables en formato {variable}
        resultado = resultado.replace(/\{(\w+)\}/g, (match, variable) => {
            const valor = contexto[variable]
            if (valor !== undefined && valor !== null) {
                if (valor instanceof Date) {
                    return valor.toLocaleDateString('es-ES')
                }
                return String(valor)
            }
            return match // Mantener la variable si no se encuentra
        })

        // Reemplazar expresiones condicionales {variable || "default"}
        resultado = resultado.replace(/\{([^}]+)\s*\|\|\s*([^}]+)\}/g, (match, expression, defaultValue) => {
            try {
                // Evaluar la expresión de forma segura
                const valor = this.evaluarExpresionSegura(expression, contexto)
                return valor || defaultValue.replace(/['"]/g, '')
            } catch {
                return defaultValue.replace(/['"]/g, '')
            }
        })

        return resultado
    }

    private static evaluarExpresionSegura(expression: string, contexto: ContextoNotificacion): any {
        // Lista blanca de variables permitidas
        const variablesPermitidas = Object.keys(contexto)
        
        // Verificar que la expresión solo contenga variables permitidas
        const variablesEnExpresion = expression.match(/\w+/g) || []
        for (const variable of variablesEnExpresion) {
            if (!variablesPermitidas.includes(variable)) {
                throw new Error(`Variable no permitida: ${variable}`)
            }
        }

        // Evaluar solo variables simples por seguridad
        if (variablesEnExpresion.length === 1) {
            return contexto[variablesEnExpresion[0]]
        }

        throw new Error('Expresión compleja no permitida')
    }
}