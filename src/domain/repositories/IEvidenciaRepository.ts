import { Evidencia } from '../entities/Evidencia'
import { TipoArchivo, VisibilidadArchivo } from '../entities/TipoArchivo'

export interface FiltrosEvidencia {
    idRiesgo?: number
    idAuditoria?: number
    idHallazgo?: number
    idTipoArchivo?: number
    idVisibilidadArchivo?: number
    idUsuarioSubio?: number
    fechaDesde?: Date
    fechaHasta?: Date
    extension?: string
    busqueda?: string
}

export interface IEvidenciaRepository {
    // CRUD básico
    crear(evidencia: Evidencia): Promise<Evidencia>
    obtenerPorId(id: number): Promise<Evidencia | null>
    actualizar(evidencia: Evidencia): Promise<Evidencia>
    eliminar(id: number): Promise<void>

    // Consultas específicas
    obtenerPorRiesgo(idRiesgo: number): Promise<Evidencia[]>
    obtenerPorAuditoria(idAuditoria: number): Promise<Evidencia[]>
    obtenerPorHallazgo(idHallazgo: number): Promise<Evidencia[]>
    obtenerPorUsuario(idUsuario: number): Promise<Evidencia[]>

    // Búsqueda y filtrado
    buscar(filtros: FiltrosEvidencia, limite?: number, offset?: number): Promise<{
        evidencias: Evidencia[]
        total: number
    }>

    // Estadísticas
    obtenerTamañoTotalPorUsuario(idUsuario: number): Promise<number>
    obtenerContadorPorTipo(): Promise<{ tipoArchivo: string; cantidad: number }[]>
    obtenerEvidenciasRecientes(limite?: number): Promise<Evidencia[]>

    // Validaciones
    existeArchivo(nombreArchivoAlmacenado: string): Promise<boolean>
    validarPermisoAcceso(idEvidencia: number, idUsuario: number): Promise<boolean>
}

export interface ITipoArchivoRepository {
    // CRUD básico
    crear(tipoArchivo: TipoArchivo): Promise<TipoArchivo>
    obtenerPorId(id: number): Promise<TipoArchivo | null>
    obtenerTodos(): Promise<TipoArchivo[]>
    actualizar(tipoArchivo: TipoArchivo): Promise<TipoArchivo>
    eliminar(id: number): Promise<void>

    // Consultas específicas
    obtenerPorExtension(extension: string): Promise<TipoArchivo[]>
    obtenerActivos(): Promise<TipoArchivo[]>
}

export interface IVisibilidadArchivoRepository {
    // CRUD básico
    crear(visibilidad: VisibilidadArchivo): Promise<VisibilidadArchivo>
    obtenerPorId(id: number): Promise<VisibilidadArchivo | null>
    obtenerTodos(): Promise<VisibilidadArchivo[]>
    actualizar(visibilidad: VisibilidadArchivo): Promise<VisibilidadArchivo>
    eliminar(id: number): Promise<void>

    // Consultas específicas
    obtenerPorNombre(nombre: string): Promise<VisibilidadArchivo | null>
    obtenerActivos(): Promise<VisibilidadArchivo[]>
}