import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { ArchivoSubida, ResultadoSubida } from '@/domain/services/FileStorageService'
import { InfrastructureError } from '@/domain/exceptions'

export interface ConfiguracionBucket {
    nombre: string
    publico: boolean
    tamañoMaximoMB: number
    tiposPermitidos: string[]
}

export class SupabaseStorageService {
    private supabase: ReturnType<typeof createClient<Database>>

    constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
        this.supabase = supabaseClient
    }

    async subirArchivo(
        archivo: ArchivoSubida,
        nombreArchivoAlmacenado: string,
        bucket: string = 'evidencias',
        carpeta?: string
    ): Promise<ResultadoSubida> {
        try {
            const rutaArchivo = carpeta 
                ? `${carpeta}/${nombreArchivoAlmacenado}`
                : nombreArchivoAlmacenado

            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(rutaArchivo, archivo.contenido, {
                    contentType: archivo.tipoMime,
                    cacheControl: '3600',
                    upsert: false // No sobrescribir archivos existentes
                })

            if (error) {
                throw new InfrastructureError(`Error al subir archivo: ${error.message}`)
            }

            // Obtener URL pública o firmada según el bucket
            const urlAlmacenamiento = await this.obtenerUrlArchivo(bucket, data.path)

            return {
                nombreArchivoAlmacenado: data.path,
                urlAlmacenamiento,
                tamaño: archivo.tamaño
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al subir archivo: ${error}`)
        }
    }

    async descargarArchivo(bucket: string, rutaArchivo: string): Promise<Blob> {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .download(rutaArchivo)

            if (error) {
                throw new InfrastructureError(`Error al descargar archivo: ${error.message}`)
            }

            return data
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al descargar archivo: ${error}`)
        }
    }

    async eliminarArchivo(bucket: string, rutaArchivo: string): Promise<void> {
        try {
            const { error } = await this.supabase.storage
                .from(bucket)
                .remove([rutaArchivo])

            if (error) {
                throw new InfrastructureError(`Error al eliminar archivo: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar archivo: ${error}`)
        }
    }

    async obtenerUrlArchivo(bucket: string, rutaArchivo: string, tiempoExpiracion?: number): Promise<string> {
        try {
            // Verificar si el bucket es público
            const esPublico = await this.esBucketPublico(bucket)

            if (esPublico) {
                const { data } = this.supabase.storage
                    .from(bucket)
                    .getPublicUrl(rutaArchivo)
                
                return data.publicUrl
            } else {
                // Generar URL firmada para buckets privados
                const { data, error } = await this.supabase.storage
                    .from(bucket)
                    .createSignedUrl(rutaArchivo, tiempoExpiracion || 3600) // 1 hora por defecto

                if (error) {
                    throw new InfrastructureError(`Error al generar URL firmada: ${error.message}`)
                }

                return data.signedUrl
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener URL: ${error}`)
        }
    }

    async existeArchivo(bucket: string, rutaArchivo: string): Promise<boolean> {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .list(this.obtenerDirectorio(rutaArchivo), {
                    search: this.obtenerNombreArchivo(rutaArchivo)
                })

            if (error) {
                throw new InfrastructureError(`Error al verificar existencia de archivo: ${error.message}`)
            }

            return data.some(archivo => archivo.name === this.obtenerNombreArchivo(rutaArchivo))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al verificar existencia: ${error}`)
        }
    }

    async listarArchivos(bucket: string, carpeta?: string, limite?: number): Promise<{
        nombre: string
        tamaño: number
        fechaModificacion: Date
        tipoMime?: string
    }[]> {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .list(carpeta || '', {
                    limit: limite,
                    sortBy: { column: 'updated_at', order: 'desc' }
                })

            if (error) {
                throw new InfrastructureError(`Error al listar archivos: ${error.message}`)
            }

            return data.map(archivo => ({
                nombre: archivo.name,
                tamaño: archivo.metadata?.size || 0,
                fechaModificacion: new Date(archivo.updated_at || archivo.created_at),
                tipoMime: archivo.metadata?.mimetype
            }))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al listar archivos: ${error}`)
        }
    }

    async crearBucket(configuracion: ConfiguracionBucket): Promise<void> {
        try {
            const { error } = await this.supabase.storage.createBucket(configuracion.nombre, {
                public: configuracion.publico,
                fileSizeLimit: configuracion.tamañoMaximoMB * 1024 * 1024,
                allowedMimeTypes: configuracion.tiposPermitidos
            })

            if (error) {
                throw new InfrastructureError(`Error al crear bucket: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear bucket: ${error}`)
        }
    }

    async obtenerInformacionBucket(bucket: string): Promise<{
        nombre: string
        publico: boolean
        fechaCreacion: Date
        fechaActualizacion: Date
    } | null> {
        try {
            const { data, error } = await this.supabase.storage.getBucket(bucket)

            if (error) {
                if (error.message.includes('not found')) return null
                throw new InfrastructureError(`Error al obtener información del bucket: ${error.message}`)
            }

            return {
                nombre: data.name,
                publico: data.public,
                fechaCreacion: new Date(data.created_at),
                fechaActualizacion: new Date(data.updated_at)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener información del bucket: ${error}`)
        }
    }

    async configurarPoliticasAcceso(bucket: string): Promise<void> {
        try {
            // Esta función requeriría permisos de administrador para ejecutar SQL
            // Por ahora, las políticas se configuran manualmente en Supabase Dashboard
            // o mediante scripts SQL separados
            
            console.log(`Configurar políticas de acceso para bucket: ${bucket}`)
            console.log('Las políticas deben configurarse manualmente en Supabase Dashboard')
        } catch (error) {
            throw new InfrastructureError(`Error al configurar políticas: ${error}`)
        }
    }

    private async esBucketPublico(bucket: string): Promise<boolean> {
        try {
            const info = await this.obtenerInformacionBucket(bucket)
            return info?.publico || false
        } catch (error) {
            // Si no podemos obtener la información, asumimos que es privado
            return false
        }
    }

    private obtenerDirectorio(rutaCompleta: string): string {
        const partes = rutaCompleta.split('/')
        return partes.length > 1 ? partes.slice(0, -1).join('/') : ''
    }

    private obtenerNombreArchivo(rutaCompleta: string): string {
        const partes = rutaCompleta.split('/')
        return partes[partes.length - 1]
    }

    // Métodos de utilidad para generar rutas organizadas
    static generarRutaCarpeta(tipo: 'riesgo' | 'auditoria' | 'hallazgo', id: number, año?: number): string {
        const añoActual = año || new Date().getFullYear()
        return `${tipo}s/${añoActual}/${id}`
    }

    static generarRutaUsuario(idUsuario: number, año?: number): string {
        const añoActual = año || new Date().getFullYear()
        return `usuarios/${añoActual}/${idUsuario}`
    }

    static generarRutaTemporal(): string {
        const fecha = new Date()
        const año = fecha.getFullYear()
        const mes = String(fecha.getMonth() + 1).padStart(2, '0')
        return `temporal/${año}/${mes}`
    }
}