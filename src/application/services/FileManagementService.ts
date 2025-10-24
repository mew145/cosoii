import { Evidencia } from '@/domain/entities/Evidencia'
import { TipoArchivo, VisibilidadArchivo } from '@/domain/entities/TipoArchivo'
import { 
    IEvidenciaRepository, 
    ITipoArchivoRepository, 
    IVisibilidadArchivoRepository,
    FiltrosEvidencia 
} from '@/domain/repositories/IEvidenciaRepository'
import { 
    FileStorageService, 
    ArchivoSubida, 
    ConfiguracionArchivo 
} from '@/domain/services/FileStorageService'
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService'
import { ApplicationError } from '@/domain/exceptions'

export interface SubirArchivoRequest {
    archivo: ArchivoSubida
    descripcion?: string
    idTipoArchivo: number
    idVisibilidadArchivo: number
    idUsuario: number
    // Asociaciones (al menos una debe estar presente)
    idRiesgo?: number
    idAuditoria?: number
    idHallazgo?: number
    // Configuración opcional
    configuracion?: Partial<ConfiguracionArchivo>
}

export interface ResultadoSubidaArchivo {
    evidencia: Evidencia
    url: string
    mensaje: string
}

export class FileManagementService {
    constructor(
        private evidenciaRepository: IEvidenciaRepository,
        private tipoArchivoRepository: ITipoArchivoRepository,
        private visibilidadArchivoRepository: IVisibilidadArchivoRepository,
        private storageService: SupabaseStorageService
    ) {}

    async subirArchivo(request: SubirArchivoRequest): Promise<ResultadoSubidaArchivo> {
        try {
            // 1. Validar que al menos una asociación esté presente
            if (!request.idRiesgo && !request.idAuditoria && !request.idHallazgo) {
                throw new ApplicationError('Debe especificar al menos una asociación (riesgo, auditoría o hallazgo)')
            }

            // 2. Obtener y validar tipo de archivo
            const tipoArchivo = await this.tipoArchivoRepository.obtenerPorId(request.idTipoArchivo)
            if (!tipoArchivo) {
                throw new ApplicationError('Tipo de archivo no encontrado')
            }

            // 3. Validar visibilidad
            const visibilidad = await this.visibilidadArchivoRepository.obtenerPorId(request.idVisibilidadArchivo)
            if (!visibilidad) {
                throw new ApplicationError('Visibilidad de archivo no encontrada')
            }

            // 4. Validar archivo usando el servicio de dominio
            FileStorageService.validarArchivo(request.archivo, request.configuracion, tipoArchivo)

            // 5. Generar nombre único para almacenamiento
            const prefijo = this.generarPrefijoArchivo(request)
            const nombreArchivoAlmacenado = FileStorageService.generarNombreUnico(
                request.archivo.nombre, 
                prefijo
            )

            // 6. Verificar que el archivo no exista ya
            const existeEnBD = await this.evidenciaRepository.existeArchivo(nombreArchivoAlmacenado)
            if (existeEnBD) {
                throw new ApplicationError('Ya existe un archivo con ese nombre en el sistema')
            }

            // 7. Determinar carpeta de destino
            const carpeta = this.determinarCarpetaDestino(request)

            // 8. Subir archivo al storage
            const resultadoSubida = await this.storageService.subirArchivo(
                request.archivo,
                nombreArchivoAlmacenado,
                'evidencias',
                carpeta
            )

            // 9. Crear registro en base de datos
            const evidencia = Evidencia.crear({
                nombreArchivoOriginal: request.archivo.nombre,
                nombreArchivoAlmacenado: resultadoSubida.nombreArchivoAlmacenado,
                urlAlmacenamientoArchivo: resultadoSubida.urlAlmacenamiento,
                tamañoBytesArchivo: request.archivo.tamaño,
                descripcionEvidencia: request.descripcion,
                idUsuarioSubio: request.idUsuario,
                idTipoArchivo: request.idTipoArchivo,
                idVisibilidadArchivo: request.idVisibilidadArchivo,
                idRiesgo: request.idRiesgo,
                idAuditoria: request.idAuditoria,
                idHallazgo: request.idHallazgo
            })

            const evidenciaCreada = await this.evidenciaRepository.crear(evidencia)

            return {
                evidencia: evidenciaCreada,
                url: resultadoSubida.urlAlmacenamiento,
                mensaje: 'Archivo subido exitosamente'
            }
        } catch (error) {
            if (error instanceof ApplicationError) throw error
            throw new ApplicationError(`Error al subir archivo: ${error}`)
        }
    }

    async descargarArchivo(idEvidencia: number, idUsuario: number): Promise<{
        archivo: Blob
        nombreOriginal: string
        tipoMime: string
    }> {
        try {
            // 1. Obtener evidencia
            const evidencia = await this.evidenciaRepository.obtenerPorId(idEvidencia)
            if (!evidencia) {
                throw new ApplicationError('Evidencia no encontrada')
            }

            // 2. Validar permisos de acceso
            const tienePermiso = await this.evidenciaRepository.validarPermisoAcceso(idEvidencia, idUsuario)
            if (!tienePermiso) {
                throw new ApplicationError('No tiene permisos para acceder a este archivo')
            }

            // 3. Descargar archivo del storage
            const archivo = await this.storageService.descargarArchivo(
                'evidencias',
                evidencia.getNombreArchivoAlmacenado()
            )

            // 4. Determinar tipo MIME
            const extension = evidencia.getExtension()
            const tipoMime = FileStorageService.obtenerTipoMimeDesdeExtension(extension)

            return {
                archivo,
                nombreOriginal: evidencia.getNombreArchivoOriginal(),
                tipoMime
            }
        } catch (error) {
            if (error instanceof ApplicationError) throw error
            throw new ApplicationError(`Error al descargar archivo: ${error}`)
        }
    }

    async eliminarArchivo(idEvidencia: number, idUsuario: number): Promise<void> {
        try {
            // 1. Obtener evidencia
            const evidencia = await this.evidenciaRepository.obtenerPorId(idEvidencia)
            if (!evidencia) {
                throw new ApplicationError('Evidencia no encontrada')
            }

            // 2. Validar permisos (solo el usuario que subió el archivo o admin puede eliminarlo)
            if (evidencia.getIdUsuarioSubio() !== idUsuario) {
                // Aquí se podría agregar lógica para verificar si es admin
                throw new ApplicationError('Solo el usuario que subió el archivo puede eliminarlo')
            }

            // 3. Eliminar archivo del storage
            await this.storageService.eliminarArchivo(
                'evidencias',
                evidencia.getNombreArchivoAlmacenado()
            )

            // 4. Eliminar registro de base de datos
            await this.evidenciaRepository.eliminar(idEvidencia)
        } catch (error) {
            if (error instanceof ApplicationError) throw error
            throw new ApplicationError(`Error al eliminar archivo: ${error}`)
        }
    }

    async buscarEvidencias(
        filtros: FiltrosEvidencia,
        idUsuario: number,
        limite = 50,
        offset = 0
    ): Promise<{
        evidencias: Evidencia[]
        total: number
    }> {
        try {
            // Aquí se podría agregar lógica para filtrar según permisos del usuario
            return await this.evidenciaRepository.buscar(filtros, limite, offset)
        } catch (error) {
            throw new ApplicationError(`Error al buscar evidencias: ${error}`)
        }
    }

    async obtenerEvidenciasPorRiesgo(idRiesgo: number, idUsuario: number): Promise<Evidencia[]> {
        try {
            const evidencias = await this.evidenciaRepository.obtenerPorRiesgo(idRiesgo)
            
            // Filtrar según permisos del usuario
            const evidenciasPermitidas = []
            for (const evidencia of evidencias) {
                const tienePermiso = await this.evidenciaRepository.validarPermisoAcceso(
                    evidencia.getIdEvidencia()!,
                    idUsuario
                )
                if (tienePermiso) {
                    evidenciasPermitidas.push(evidencia)
                }
            }

            return evidenciasPermitidas
        } catch (error) {
            throw new ApplicationError(`Error al obtener evidencias por riesgo: ${error}`)
        }
    }

    async obtenerTiposArchivo(): Promise<TipoArchivo[]> {
        try {
            return await this.tipoArchivoRepository.obtenerActivos()
        } catch (error) {
            throw new ApplicationError(`Error al obtener tipos de archivo: ${error}`)
        }
    }

    async obtenerVisibilidades(): Promise<VisibilidadArchivo[]> {
        try {
            return await this.visibilidadArchivoRepository.obtenerActivos()
        } catch (error) {
            throw new ApplicationError(`Error al obtener visibilidades: ${error}`)
        }
    }

    async obtenerEstadisticasUsuario(idUsuario: number): Promise<{
        totalArchivos: number
        tamañoTotalMB: number
        archivosPorTipo: { tipoArchivo: string; cantidad: number }[]
        archivosRecientes: Evidencia[]
    }> {
        try {
            const [
                archivosUsuario,
                tamañoTotal,
                archivosPorTipo,
                archivosRecientes
            ] = await Promise.all([
                this.evidenciaRepository.obtenerPorUsuario(idUsuario),
                this.evidenciaRepository.obtenerTamañoTotalPorUsuario(idUsuario),
                this.evidenciaRepository.obtenerContadorPorTipo(),
                this.evidenciaRepository.obtenerEvidenciasRecientes(5)
            ])

            return {
                totalArchivos: archivosUsuario.length,
                tamañoTotalMB: Math.round((tamañoTotal / (1024 * 1024)) * 100) / 100,
                archivosPorTipo,
                archivosRecientes: archivosRecientes.filter(e => e.getIdUsuarioSubio() === idUsuario)
            }
        } catch (error) {
            throw new ApplicationError(`Error al obtener estadísticas: ${error}`)
        }
    }

    private generarPrefijoArchivo(request: SubirArchivoRequest): string {
        if (request.idRiesgo) return `riesgo_${request.idRiesgo}`
        if (request.idAuditoria) return `auditoria_${request.idAuditoria}`
        if (request.idHallazgo) return `hallazgo_${request.idHallazgo}`
        return 'evidencia'
    }

    private determinarCarpetaDestino(request: SubirArchivoRequest): string {
        const año = new Date().getFullYear()
        
        if (request.idRiesgo) {
            return SupabaseStorageService.generarRutaCarpeta('riesgo', request.idRiesgo, año)
        }
        if (request.idAuditoria) {
            return SupabaseStorageService.generarRutaCarpeta('auditoria', request.idAuditoria, año)
        }
        if (request.idHallazgo) {
            return SupabaseStorageService.generarRutaCarpeta('hallazgo', request.idHallazgo, año)
        }
        
        return SupabaseStorageService.generarRutaUsuario(request.idUsuario, año)
    }
}