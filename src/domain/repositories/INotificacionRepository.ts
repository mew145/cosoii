import { Notificacion, TipoNotificacion, EstadoNotificacion, CanalNotificacion, PrioridadNotificacion } from '../entities/Notificacion'
import { PreferenciaNotificacion } from '../entities/PreferenciaNotificacion'

export interface FiltrosNotificacion {
    idUsuarioDestino?: number
    idUsuarioOrigen?: number
    tipoNotificacion?: TipoNotificacion
    estadoNotificacion?: EstadoNotificacion
    canalNotificacion?: CanalNotificacion
    prioridadNotificacion?: PrioridadNotificacion
    fechaDesde?: Date
    fechaHasta?: Date
    soloNoLeidas?: boolean
    soloVencidas?: boolean
    idRiesgo?: number
    idProyecto?: number
    idAuditoria?: number
    idHallazgo?: number
    idActividad?: number
    idIncidente?: number
    idControl?: number
}

export interface INotificacionRepository {
    // CRUD básico
    crear(notificacion: Notificacion): Promise<Notificacion>
    obtenerPorId(id: number): Promise<Notificacion | null>
    actualizar(notificacion: Notificacion): Promise<Notificacion>
    eliminar(id: number): Promise<void>

    // Consultas específicas
    obtenerPorUsuario(idUsuario: number, limite?: number, offset?: number): Promise<{
        notificaciones: Notificacion[]
        total: number
    }>
    
    obtenerNoLeidas(idUsuario: number): Promise<Notificacion[]>
    obtenerPendientesEnvio(): Promise<Notificacion[]>
    obtenerConError(): Promise<Notificacion[]>
    obtenerVencidas(): Promise<Notificacion[]>

    // Búsqueda y filtrado
    buscar(filtros: FiltrosNotificacion, limite?: number, offset?: number): Promise<{
        notificaciones: Notificacion[]
        total: number
    }>

    // Operaciones masivas
    marcarComoLeidasPorUsuario(idUsuario: number, ids?: number[]): Promise<void>
    eliminarAntiguasPorUsuario(idUsuario: number, diasAntiguedad: number): Promise<number>
    reintentarEnviosFallidos(): Promise<Notificacion[]>

    // Estadísticas
    obtenerContadorNoLeidas(idUsuario: number): Promise<number>
    obtenerEstadisticasPorTipo(idUsuario?: number): Promise<{
        tipo: TipoNotificacion
        total: number
        noLeidas: number
        enviadas: number
        conError: number
    }[]>

    // Consultas por entidad relacionada
    obtenerPorRiesgo(idRiesgo: number): Promise<Notificacion[]>
    obtenerPorProyecto(idProyecto: number): Promise<Notificacion[]>
    obtenerPorAuditoria(idAuditoria: number): Promise<Notificacion[]>
    obtenerPorHallazgo(idHallazgo: number): Promise<Notificacion[]>
    obtenerPorActividad(idActividad: number): Promise<Notificacion[]>
    obtenerPorIncidente(idIncidente: number): Promise<Notificacion[]>
    obtenerPorControl(idControl: number): Promise<Notificacion[]>
}

export interface IPreferenciaNotificacionRepository {
    // CRUD básico
    crear(preferencia: PreferenciaNotificacion): Promise<PreferenciaNotificacion>
    obtenerPorId(id: number): Promise<PreferenciaNotificacion | null>
    actualizar(preferencia: PreferenciaNotificacion): Promise<PreferenciaNotificacion>
    eliminar(id: number): Promise<void>

    // Consultas específicas
    obtenerPorUsuario(idUsuario: number): Promise<PreferenciaNotificacion[]>
    obtenerPorUsuarioYTipo(idUsuario: number, tipo: TipoNotificacion): Promise<PreferenciaNotificacion[]>
    obtenerActivas(idUsuario: number): Promise<PreferenciaNotificacion[]>
    obtenerPorCanal(canal: CanalNotificacion): Promise<PreferenciaNotificacion[]>

    // Operaciones masivas
    crearPreferenciasDefault(idUsuario: number): Promise<PreferenciaNotificacion[]>
    activarTodas(idUsuario: number): Promise<void>
    desactivarTodas(idUsuario: number): Promise<void>
    desactivarPorTipo(idUsuario: number, tipo: TipoNotificacion): Promise<void>

    // Validaciones
    existePreferencia(idUsuario: number, tipo: TipoNotificacion, canal: CanalNotificacion): Promise<boolean>
    
    // Consultas para procesamiento
    obtenerUsuariosConPreferencia(tipo: TipoNotificacion, canal: CanalNotificacion): Promise<number[]>
    obtenerPreferenciasParaEnvio(
        idUsuario: number, 
        tipo: TipoNotificacion, 
        prioridad: PrioridadNotificacion,
        fechaHora?: Date
    ): Promise<PreferenciaNotificacion[]>
}