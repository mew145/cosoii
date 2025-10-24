import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'
import { 
    Notificacion, 
    TipoNotificacion, 
    EstadoNotificacion, 
    CanalNotificacion, 
    PrioridadNotificacion 
} from '@/domain/entities/Notificacion'
import { PreferenciaNotificacion } from '@/domain/entities/PreferenciaNotificacion'
import { 
    INotificacionRepository, 
    IPreferenciaNotificacionRepository,
    FiltrosNotificacion 
} from '@/domain/repositories/INotificacionRepository'
import { InfrastructureError } from '@/domain/exceptions'

export class NotificacionRepository extends BaseSupabaseRepository<Notificacion, number> implements INotificacionRepository {
    protected tableName = 'notificaciones'
    protected primaryKey = 'id_notificacion'

    constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
        super()
        this.supabase = supabaseClient
    }

    protected mapFromDatabase(row: any): Notificacion {
        return Notificacion.fromDatabase(row)
    }

    protected mapToDatabase(entity: Omit<Notificacion, 'id'>): any {
        return (entity as any).toDatabase()
    }

    protected mapUpdateToDatabase(updates: Partial<Notificacion>): any {
        return (updates as any).toDatabase()
    }

    async crear(notificacion: Notificacion): Promise<Notificacion> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .insert(notificacion.toDatabase())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al crear notificación: ${error.message}`)
            }

            return Notificacion.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear notificación: ${error}`)
        }
    }

    async obtenerPorId(id: number): Promise<Notificacion | null> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .select('*')
                .eq('id_notificacion', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw new InfrastructureError(`Error al obtener notificación: ${error.message}`)
            }

            return data ? Notificacion.fromDatabase(data) : null
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificación: ${error}`)
        }
    }

    async actualizar(notificacion: Notificacion): Promise<Notificacion> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .update(notificacion.toDatabase())
                .eq('id_notificacion', notificacion.getIdNotificacion())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al actualizar notificación: ${error.message}`)
            }

            return Notificacion.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al actualizar notificación: ${error}`)
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('notificaciones')
                .delete()
                .eq('id_notificacion', id)

            if (error) {
                throw new InfrastructureError(`Error al eliminar notificación: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar notificación: ${error}`)
        }
    }

    async obtenerPorUsuario(idUsuario: number, limite = 50, offset = 0): Promise<{
        notificaciones: Notificacion[]
        total: number
    }> {
        try {
            const { data, error, count } = await this.supabase
                .from('notificaciones')
                .select('*', { count: 'exact' })
                .eq('id_usuario_destino', idUsuario)
                .order('fecha_creacion_notificacion', { ascending: false })
                .range(offset, offset + limite - 1)

            if (error) {
                throw new InfrastructureError(`Error al obtener notificaciones por usuario: ${error.message}`)
            }

            return {
                notificaciones: data.map(row => Notificacion.fromDatabase(row)),
                total: count || 0
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificaciones por usuario: ${error}`)
        }
    }

    async obtenerNoLeidas(idUsuario: number): Promise<Notificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .select('*')
                .eq('id_usuario_destino', idUsuario)
                .in('estado_notificacion', [EstadoNotificacion.PENDIENTE, EstadoNotificacion.ENVIADA])
                .order('fecha_creacion_notificacion', { ascending: false })

            if (error) {
                throw new InfrastructureError(`Error al obtener notificaciones no leídas: ${error.message}`)
            }

            return data.map(row => Notificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificaciones no leídas: ${error}`)
        }
    }

    async obtenerPendientesEnvio(): Promise<Notificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .select('*')
                .eq('estado_notificacion', EstadoNotificacion.PENDIENTE)
                .lt('intentos_envio', 3)
                .order('prioridad_notificacion', { ascending: false })
                .order('fecha_creacion_notificacion', { ascending: true })

            if (error) {
                throw new InfrastructureError(`Error al obtener notificaciones pendientes: ${error.message}`)
            }

            return data.map(row => Notificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificaciones pendientes: ${error}`)
        }
    }

    async obtenerConError(): Promise<Notificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .select('*')
                .eq('estado_notificacion', EstadoNotificacion.ERROR)
                .lt('intentos_envio', 3)
                .order('fecha_creacion_notificacion', { ascending: true })

            if (error) {
                throw new InfrastructureError(`Error al obtener notificaciones con error: ${error.message}`)
            }

            return data.map(row => Notificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificaciones con error: ${error}`)
        }
    }

    async obtenerVencidas(): Promise<Notificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .select('*')
                .not('fecha_vencimiento_notificacion', 'is', null)
                .lt('fecha_vencimiento_notificacion', new Date().toISOString())
                .in('estado_notificacion', [EstadoNotificacion.PENDIENTE, EstadoNotificacion.ENVIADA])
                .order('fecha_vencimiento_notificacion', { ascending: true })

            if (error) {
                throw new InfrastructureError(`Error al obtener notificaciones vencidas: ${error.message}`)
            }

            return data.map(row => Notificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificaciones vencidas: ${error}`)
        }
    }

    async buscar(filtros: FiltrosNotificacion, limite = 50, offset = 0): Promise<{
        notificaciones: Notificacion[]
        total: number
    }> {
        try {
            let query = this.supabase
                .from('notificaciones')
                .select('*', { count: 'exact' })

            // Aplicar filtros
            if (filtros.idUsuarioDestino) {
                query = query.eq('id_usuario_destino', filtros.idUsuarioDestino)
            }
            if (filtros.idUsuarioOrigen) {
                query = query.eq('id_usuario_origen', filtros.idUsuarioOrigen)
            }
            if (filtros.tipoNotificacion) {
                query = query.eq('tipo_notificacion', filtros.tipoNotificacion)
            }
            if (filtros.estadoNotificacion) {
                query = query.eq('estado_notificacion', filtros.estadoNotificacion)
            }
            if (filtros.canalNotificacion) {
                query = query.eq('canal_notificacion', filtros.canalNotificacion)
            }
            if (filtros.prioridadNotificacion) {
                query = query.eq('prioridad_notificacion', filtros.prioridadNotificacion)
            }
            if (filtros.fechaDesde) {
                query = query.gte('fecha_creacion_notificacion', filtros.fechaDesde.toISOString())
            }
            if (filtros.fechaHasta) {
                query = query.lte('fecha_creacion_notificacion', filtros.fechaHasta.toISOString())
            }
            if (filtros.soloNoLeidas) {
                query = query.in('estado_notificacion', [EstadoNotificacion.PENDIENTE, EstadoNotificacion.ENVIADA])
            }
            if (filtros.soloVencidas) {
                query = query.not('fecha_vencimiento_notificacion', 'is', null)
                query = query.lt('fecha_vencimiento_notificacion', new Date().toISOString())
            }
            if (filtros.idRiesgo) {
                query = query.eq('id_riesgo', filtros.idRiesgo)
            }
            if (filtros.idProyecto) {
                query = query.eq('id_proyecto', filtros.idProyecto)
            }
            if (filtros.idAuditoria) {
                query = query.eq('id_auditoria', filtros.idAuditoria)
            }
            if (filtros.idHallazgo) {
                query = query.eq('id_hallazgo', filtros.idHallazgo)
            }
            if (filtros.idActividad) {
                query = query.eq('id_actividad', filtros.idActividad)
            }
            if (filtros.idIncidente) {
                query = query.eq('id_incidente', filtros.idIncidente)
            }
            if (filtros.idControl) {
                query = query.eq('id_control', filtros.idControl)
            }

            const { data, error, count } = await query
                .order('fecha_creacion_notificacion', { ascending: false })
                .range(offset, offset + limite - 1)

            if (error) {
                throw new InfrastructureError(`Error al buscar notificaciones: ${error.message}`)
            }

            return {
                notificaciones: data.map(row => Notificacion.fromDatabase(row)),
                total: count || 0
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al buscar notificaciones: ${error}`)
        }
    }

    async marcarComoLeidasPorUsuario(idUsuario: number, ids?: number[]): Promise<void> {
        try {
            let query = this.supabase
                .from('notificaciones')
                .update({
                    estado_notificacion: EstadoNotificacion.LEIDA,
                    fecha_leida_notificacion: new Date().toISOString()
                })
                .eq('id_usuario_destino', idUsuario)

            if (ids && ids.length > 0) {
                query = query.in('id_notificacion', ids)
            } else {
                query = query.in('estado_notificacion', [EstadoNotificacion.PENDIENTE, EstadoNotificacion.ENVIADA])
            }

            const { error } = await query

            if (error) {
                throw new InfrastructureError(`Error al marcar notificaciones como leídas: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al marcar notificaciones como leídas: ${error}`)
        }
    }

    async eliminarAntiguasPorUsuario(idUsuario: number, diasAntiguedad: number): Promise<number> {
        try {
            const fechaLimite = new Date()
            fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad)

            const { data, error } = await this.supabase
                .from('notificaciones')
                .delete()
                .eq('id_usuario_destino', idUsuario)
                .eq('estado_notificacion', EstadoNotificacion.LEIDA)
                .lt('fecha_creacion_notificacion', fechaLimite.toISOString())
                .select('id_notificacion')

            if (error) {
                throw new InfrastructureError(`Error al eliminar notificaciones antiguas: ${error.message}`)
            }

            return data.length
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar notificaciones antiguas: ${error}`)
        }
    }

    async reintentarEnviosFallidos(): Promise<Notificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .update({
                    estado_notificacion: EstadoNotificacion.PENDIENTE,
                    ultimo_error_notificacion: null
                })
                .eq('estado_notificacion', EstadoNotificacion.ERROR)
                .lt('intentos_envio', 3)
                .select()

            if (error) {
                throw new InfrastructureError(`Error al reintentar envíos fallidos: ${error.message}`)
            }

            return data.map(row => Notificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al reintentar envíos fallidos: ${error}`)
        }
    }

    async obtenerContadorNoLeidas(idUsuario: number): Promise<number> {
        try {
            const { count, error } = await this.supabase
                .from('notificaciones')
                .select('*', { count: 'exact', head: true })
                .eq('id_usuario_destino', idUsuario)
                .in('estado_notificacion', [EstadoNotificacion.PENDIENTE, EstadoNotificacion.ENVIADA])

            if (error) {
                throw new InfrastructureError(`Error al obtener contador de no leídas: ${error.message}`)
            }

            return count || 0
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener contador de no leídas: ${error}`)
        }
    }

    async obtenerEstadisticasPorTipo(idUsuario?: number): Promise<{
        tipo: TipoNotificacion
        total: number
        noLeidas: number
        enviadas: number
        conError: number
    }[]> {
        try {
            let query = this.supabase
                .from('notificaciones')
                .select('tipo_notificacion, estado_notificacion')

            if (idUsuario) {
                query = query.eq('id_usuario_destino', idUsuario)
            }

            const { data, error } = await query

            if (error) {
                throw new InfrastructureError(`Error al obtener estadísticas por tipo: ${error.message}`)
            }

            // Procesar estadísticas
            const estadisticas: Record<string, any> = {}
            
            data.forEach(row => {
                const tipo = row.tipo_notificacion
                if (!estadisticas[tipo]) {
                    estadisticas[tipo] = {
                        tipo,
                        total: 0,
                        noLeidas: 0,
                        enviadas: 0,
                        conError: 0
                    }
                }
                
                estadisticas[tipo].total++
                
                switch (row.estado_notificacion) {
                    case EstadoNotificacion.PENDIENTE:
                        estadisticas[tipo].noLeidas++
                        break
                    case EstadoNotificacion.ENVIADA:
                        estadisticas[tipo].enviadas++
                        estadisticas[tipo].noLeidas++
                        break
                    case EstadoNotificacion.ERROR:
                        estadisticas[tipo].conError++
                        break
                }
            })

            return Object.values(estadisticas)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener estadísticas por tipo: ${error}`)
        }
    }

    // Métodos para consultas por entidad relacionada
    async obtenerPorRiesgo(idRiesgo: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_riesgo', idRiesgo)
    }

    async obtenerPorProyecto(idProyecto: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_proyecto', idProyecto)
    }

    async obtenerPorAuditoria(idAuditoria: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_auditoria', idAuditoria)
    }

    async obtenerPorHallazgo(idHallazgo: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_hallazgo', idHallazgo)
    }

    async obtenerPorActividad(idActividad: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_actividad', idActividad)
    }

    async obtenerPorIncidente(idIncidente: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_incidente', idIncidente)
    }

    async obtenerPorControl(idControl: number): Promise<Notificacion[]> {
        return this.obtenerPorEntidad('id_control', idControl)
    }

    private async obtenerPorEntidad(campo: string, id: number): Promise<Notificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('notificaciones')
                .select('*')
                .eq(campo, id)
                .order('fecha_creacion_notificacion', { ascending: false })

            if (error) {
                throw new InfrastructureError(`Error al obtener notificaciones por ${campo}: ${error.message}`)
            }

            return data.map(row => Notificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener notificaciones por ${campo}: ${error}`)
        }
    }
}

export class PreferenciaNotificacionRepository extends BaseSupabaseRepository<PreferenciaNotificacion, number> implements IPreferenciaNotificacionRepository {
    protected tableName = 'preferencias_notificacion'
    protected primaryKey = 'id_preferencia_notificacion'

    constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
        super()
        this.supabase = supabaseClient
    }

    protected mapFromDatabase(row: any): PreferenciaNotificacion {
        return PreferenciaNotificacion.fromDatabase(row)
    }

    protected mapToDatabase(entity: Omit<PreferenciaNotificacion, 'id'>): any {
        return (entity as any).toDatabase()
    }

    protected mapUpdateToDatabase(updates: Partial<PreferenciaNotificacion>): any {
        return (updates as any).toDatabase()
    }

    async crear(preferencia: PreferenciaNotificacion): Promise<PreferenciaNotificacion> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .insert(preferencia.toDatabase())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al crear preferencia de notificación: ${error.message}`)
            }

            return PreferenciaNotificacion.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear preferencia de notificación: ${error}`)
        }
    }

    async obtenerPorId(id: number): Promise<PreferenciaNotificacion | null> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('*')
                .eq('id_preferencia_notificacion', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw new InfrastructureError(`Error al obtener preferencia de notificación: ${error.message}`)
            }

            return data ? PreferenciaNotificacion.fromDatabase(data) : null
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener preferencia de notificación: ${error}`)
        }
    }

    async actualizar(preferencia: PreferenciaNotificacion): Promise<PreferenciaNotificacion> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .update(preferencia.toDatabase())
                .eq('id_preferencia_notificacion', preferencia.getIdPreferencia())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al actualizar preferencia de notificación: ${error.message}`)
            }

            return PreferenciaNotificacion.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al actualizar preferencia de notificación: ${error}`)
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('preferencias_notificacion')
                .delete()
                .eq('id_preferencia_notificacion', id)

            if (error) {
                throw new InfrastructureError(`Error al eliminar preferencia de notificación: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar preferencia de notificación: ${error}`)
        }
    }

    async obtenerPorUsuario(idUsuario: number): Promise<PreferenciaNotificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('*')
                .eq('id_usuario', idUsuario)
                .order('tipo_notificacion')

            if (error) {
                throw new InfrastructureError(`Error al obtener preferencias por usuario: ${error.message}`)
            }

            return data.map(row => PreferenciaNotificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener preferencias por usuario: ${error}`)
        }
    }

    async obtenerPorUsuarioYTipo(idUsuario: number, tipo: TipoNotificacion): Promise<PreferenciaNotificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('*')
                .eq('id_usuario', idUsuario)
                .eq('tipo_notificacion', tipo)

            if (error) {
                throw new InfrastructureError(`Error al obtener preferencias por usuario y tipo: ${error.message}`)
            }

            return data.map(row => PreferenciaNotificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener preferencias por usuario y tipo: ${error}`)
        }
    }

    async obtenerActivas(idUsuario: number): Promise<PreferenciaNotificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('*')
                .eq('id_usuario', idUsuario)
                .eq('activa_preferencia', true)

            if (error) {
                throw new InfrastructureError(`Error al obtener preferencias activas: ${error.message}`)
            }

            return data.map(row => PreferenciaNotificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener preferencias activas: ${error}`)
        }
    }

    async obtenerPorCanal(canal: CanalNotificacion): Promise<PreferenciaNotificacion[]> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('*')
                .eq('canal_notificacion', canal)
                .eq('activa_preferencia', true)

            if (error) {
                throw new InfrastructureError(`Error al obtener preferencias por canal: ${error.message}`)
            }

            return data.map(row => PreferenciaNotificacion.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener preferencias por canal: ${error}`)
        }
    }

    async crearPreferenciasDefault(idUsuario: number): Promise<PreferenciaNotificacion[]> {
        try {
            const preferenciasDefault = PreferenciaNotificacion.crearPreferenciasDefault(idUsuario)
            const preferenciasCreadas: PreferenciaNotificacion[] = []

            for (const preferencia of preferenciasDefault) {
                // Verificar si ya existe
                const existe = await this.existePreferencia(
                    idUsuario,
                    preferencia.getTipoNotificacion(),
                    preferencia.getCanalNotificacion()
                )

                if (!existe) {
                    const creada = await this.crear(preferencia)
                    preferenciasCreadas.push(creada)
                }
            }

            return preferenciasCreadas
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear preferencias default: ${error}`)
        }
    }

    async activarTodas(idUsuario: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('preferencias_notificacion')
                .update({
                    activa_preferencia: true,
                    fecha_actualizacion_preferencia: new Date().toISOString()
                })
                .eq('id_usuario', idUsuario)

            if (error) {
                throw new InfrastructureError(`Error al activar todas las preferencias: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al activar todas las preferencias: ${error}`)
        }
    }

    async desactivarTodas(idUsuario: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('preferencias_notificacion')
                .update({
                    activa_preferencia: false,
                    fecha_actualizacion_preferencia: new Date().toISOString()
                })
                .eq('id_usuario', idUsuario)

            if (error) {
                throw new InfrastructureError(`Error al desactivar todas las preferencias: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al desactivar todas las preferencias: ${error}`)
        }
    }

    async desactivarPorTipo(idUsuario: number, tipo: TipoNotificacion): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('preferencias_notificacion')
                .update({
                    activa_preferencia: false,
                    fecha_actualizacion_preferencia: new Date().toISOString()
                })
                .eq('id_usuario', idUsuario)
                .eq('tipo_notificacion', tipo)

            if (error) {
                throw new InfrastructureError(`Error al desactivar preferencias por tipo: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al desactivar preferencias por tipo: ${error}`)
        }
    }

    async existePreferencia(idUsuario: number, tipo: TipoNotificacion, canal: CanalNotificacion): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('id_preferencia_notificacion')
                .eq('id_usuario', idUsuario)
                .eq('tipo_notificacion', tipo)
                .eq('canal_notificacion', canal)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw new InfrastructureError(`Error al verificar existencia de preferencia: ${error.message}`)
            }

            return !!data
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al verificar existencia de preferencia: ${error}`)
        }
    }

    async obtenerUsuariosConPreferencia(tipo: TipoNotificacion, canal: CanalNotificacion): Promise<number[]> {
        try {
            const { data, error } = await this.supabase
                .from('preferencias_notificacion')
                .select('id_usuario')
                .eq('tipo_notificacion', tipo)
                .eq('canal_notificacion', canal)
                .eq('activa_preferencia', true)

            if (error) {
                throw new InfrastructureError(`Error al obtener usuarios con preferencia: ${error.message}`)
            }

            return data.map(row => row.id_usuario)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener usuarios con preferencia: ${error}`)
        }
    }

    async obtenerPreferenciasParaEnvio(
        idUsuario: number,
        tipo: TipoNotificacion,
        prioridad: PrioridadNotificacion,
        fechaHora: Date = new Date()
    ): Promise<PreferenciaNotificacion[]> {
        try {
            const preferencias = await this.obtenerPorUsuarioYTipo(idUsuario, tipo)
            
            return preferencias.filter(preferencia => 
                preferencia.puedeEnviarNotificacion(prioridad, fechaHora)
            )
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener preferencias para envío: ${error}`)
        }
    }
}