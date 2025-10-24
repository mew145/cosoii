import { DomainError } from '../exceptions'
import { TipoArchivo } from '../entities/TipoArchivo'

export interface ArchivoSubida {
    nombre: string
    contenido: Buffer | Uint8Array
    tipoMime: string
    tamaño: number
}

export interface ConfiguracionArchivo {
    tamañoMaximoMB: number
    extensionesPermitidas: string[]
    tiposPermitidos: string[]
}

export interface ResultadoSubida {
    nombreArchivoAlmacenado: string
    urlAlmacenamiento: string
    tamaño: number
}

export class FileStorageService {
    private static readonly TAMAÑO_MAXIMO_DEFAULT = 100 // MB
    private static readonly EXTENSIONES_PERMITIDAS_DEFAULT = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
        'txt', 'csv', 'zip', 'rar', '7z'
    ]

    static validarArchivo(
        archivo: ArchivoSubida, 
        configuracion?: Partial<ConfiguracionArchivo>,
        tipoArchivo?: TipoArchivo
    ): void {
        const config = {
            tamañoMaximoMB: configuracion?.tamañoMaximoMB || this.TAMAÑO_MAXIMO_DEFAULT,
            extensionesPermitidas: configuracion?.extensionesPermitidas || this.EXTENSIONES_PERMITIDAS_DEFAULT,
            tiposPermitidos: configuracion?.tiposPermitidos || []
        }

        // Validar nombre del archivo
        if (!archivo.nombre?.trim()) {
            throw new DomainError('El nombre del archivo es requerido')
        }

        // Validar tamaño
        const tamañoMB = archivo.tamaño / (1024 * 1024)
        if (tamañoMB > config.tamañoMaximoMB) {
            throw new DomainError(`El archivo excede el tamaño máximo permitido de ${config.tamañoMaximoMB}MB`)
        }

        if (archivo.tamaño <= 0) {
            throw new DomainError('El archivo está vacío')
        }

        // Validar extensión
        const extension = this.obtenerExtension(archivo.nombre)
        if (!extension) {
            throw new DomainError('El archivo debe tener una extensión válida')
        }

        // Si hay un tipo de archivo específico, validar contra sus extensiones permitidas
        if (tipoArchivo) {
            if (!tipoArchivo.esExtensionPermitida(extension)) {
                const extensionesPermitidas = tipoArchivo.getExtensionesArray()
                throw new DomainError(
                    `La extensión .${extension} no está permitida para este tipo de archivo. ` +
                    `Extensiones permitidas: ${extensionesPermitidas.join(', ')}`
                )
            }
        } else {
            // Validar contra extensiones generales
            if (!config.extensionesPermitidas.includes(extension.toLowerCase())) {
                throw new DomainError(
                    `La extensión .${extension} no está permitida. ` +
                    `Extensiones permitidas: ${config.extensionesPermitidas.join(', ')}`
                )
            }
        }

        // Validar tipo MIME si se especifica
        if (config.tiposPermitidos.length > 0) {
            if (!config.tiposPermitidos.includes(archivo.tipoMime)) {
                throw new DomainError(`El tipo de archivo ${archivo.tipoMime} no está permitido`)
            }
        }

        // Validaciones adicionales de seguridad
        this.validarSeguridadArchivo(archivo)
    }

    static obtenerExtension(nombreArchivo: string): string {
        const partes = nombreArchivo.split('.')
        return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : ''
    }

    static generarNombreUnico(nombreOriginal: string, prefijo?: string): string {
        const extension = this.obtenerExtension(nombreOriginal)
        const nombreSinExtension = nombreOriginal.substring(0, nombreOriginal.lastIndexOf('.'))
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        
        const prefijoFinal = prefijo ? `${prefijo}_` : ''
        const nombreLimpio = this.limpiarNombreArchivo(nombreSinExtension)
        
        return `${prefijoFinal}${nombreLimpio}_${timestamp}_${random}.${extension}`
    }

    static limpiarNombreArchivo(nombre: string): string {
        return nombre
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50) // Limitar longitud
    }

    static obtenerTipoMimeDesdeExtension(extension: string): string {
        const tiposMime: Record<string, string> = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed'
        }

        return tiposMime[extension.toLowerCase()] || 'application/octet-stream'
    }

    static esImagen(extension: string): boolean {
        const extensionesImagen = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
        return extensionesImagen.includes(extension.toLowerCase())
    }

    static esDocumento(extension: string): boolean {
        const extensionesDocumento = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt']
        return extensionesDocumento.includes(extension.toLowerCase())
    }

    static esHojaCalculo(extension: string): boolean {
        const extensionesHoja = ['xls', 'xlsx', 'csv', 'ods']
        return extensionesHoja.includes(extension.toLowerCase())
    }

    static formatearTamaño(bytes: number): string {
        if (bytes === 0) return '0 Bytes'

        const k = 1024
        const tamaños = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i]
    }

    private static validarSeguridadArchivo(archivo: ArchivoSubida): void {
        // Validar nombres de archivo peligrosos
        const nombresPeligrosos = [
            'con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5',
            'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4',
            'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
        ]

        const nombreSinExtension = archivo.nombre.substring(0, archivo.nombre.lastIndexOf('.')).toLowerCase()
        if (nombresPeligrosos.includes(nombreSinExtension)) {
            throw new DomainError('Nombre de archivo no permitido por seguridad')
        }

        // Validar caracteres peligrosos
        const caracteresProhibidos = /[<>:"|?*\x00-\x1f]/
        if (caracteresProhibidos.test(archivo.nombre)) {
            throw new DomainError('El nombre del archivo contiene caracteres no permitidos')
        }

        // Validar extensiones dobles sospechosas
        const extensionesDobles = /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app)\..*$/i
        if (extensionesDobles.test(archivo.nombre)) {
            throw new DomainError('Archivo con extensión doble sospechosa no permitido')
        }
    }
}