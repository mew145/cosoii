import { DomainError } from '../exceptions'

export interface EvidenciaProps {
    idEvidencia?: number
    nombreArchivoOriginal: string
    nombreArchivoAlmacenado: string
    urlAlmacenamientoArchivo: string
    tamañoBytesArchivo: number
    descripcionEvidencia?: string
    fechaSubidaArchivo: Date
    idUsuarioSubio: number
    idTipoArchivo: number
    idVisibilidadArchivo: number
    idRiesgo?: number
    idAuditoria?: number
    idHallazgo?: number
}

export class Evidencia {
    private constructor(private readonly props: EvidenciaProps) {
        this.validate()
    }

    private validate(): void {
        if (!this.props.nombreArchivoOriginal?.trim()) {
            throw new DomainError('El nombre del archivo original es requerido')
        }

        if (!this.props.nombreArchivoAlmacenado?.trim()) {
            throw new DomainError('El nombre del archivo almacenado es requerido')
        }

        if (!this.props.urlAlmacenamientoArchivo?.trim()) {
            throw new DomainError('La URL de almacenamiento es requerida')
        }

        if (!this.props.tamañoBytesArchivo || this.props.tamañoBytesArchivo <= 0) {
            throw new DomainError('El tamaño del archivo debe ser mayor a 0')
        }

        if (!this.props.idUsuarioSubio) {
            throw new DomainError('El ID del usuario que subió el archivo es requerido')
        }

        if (!this.props.idTipoArchivo) {
            throw new DomainError('El tipo de archivo es requerido')
        }

        if (!this.props.idVisibilidadArchivo) {
            throw new DomainError('La visibilidad del archivo es requerida')
        }

        // Validar que al menos una relación esté presente
        if (!this.props.idRiesgo && !this.props.idAuditoria && !this.props.idHallazgo) {
            throw new DomainError('La evidencia debe estar asociada a un riesgo, auditoría o hallazgo')
        }
    }

    // Getters
    getIdEvidencia(): number | undefined {
        return this.props.idEvidencia
    }

    getNombreArchivoOriginal(): string {
        return this.props.nombreArchivoOriginal
    }

    getNombreArchivoAlmacenado(): string {
        return this.props.nombreArchivoAlmacenado
    }

    getUrlAlmacenamientoArchivo(): string {
        return this.props.urlAlmacenamientoArchivo
    }

    getTamañoBytesArchivo(): number {
        return this.props.tamañoBytesArchivo
    }

    getDescripcionEvidencia(): string | undefined {
        return this.props.descripcionEvidencia
    }

    getFechaSubidaArchivo(): Date {
        return this.props.fechaSubidaArchivo
    }

    getIdUsuarioSubio(): number {
        return this.props.idUsuarioSubio
    }

    getIdTipoArchivo(): number {
        return this.props.idTipoArchivo
    }

    getIdVisibilidadArchivo(): number {
        return this.props.idVisibilidadArchivo
    }

    getIdRiesgo(): number | undefined {
        return this.props.idRiesgo
    }

    getIdAuditoria(): number | undefined {
        return this.props.idAuditoria
    }

    getIdHallazgo(): number | undefined {
        return this.props.idHallazgo
    }

    // Métodos de negocio
    getTamañoEnMB(): number {
        return Math.round((this.props.tamañoBytesArchivo / (1024 * 1024)) * 100) / 100
    }

    getExtension(): string {
        const partes = this.props.nombreArchivoOriginal.split('.')
        return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : ''
    }

    esImagen(): boolean {
        const extensionesImagen = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
        return extensionesImagen.includes(this.getExtension())
    }

    esPDF(): boolean {
        return this.getExtension() === 'pdf'
    }

    esDocumento(): boolean {
        const extensionesDocumento = ['doc', 'docx', 'txt', 'rtf', 'odt']
        return extensionesDocumento.includes(this.getExtension())
    }

    esHojaCalculo(): boolean {
        const extensionesHoja = ['xls', 'xlsx', 'csv', 'ods']
        return extensionesHoja.includes(this.getExtension())
    }

    // Factory methods
    static crear(datos: {
        nombreArchivoOriginal: string
        nombreArchivoAlmacenado: string
        urlAlmacenamientoArchivo: string
        tamañoBytesArchivo: number
        descripcionEvidencia?: string
        idUsuarioSubio: number
        idTipoArchivo: number
        idVisibilidadArchivo: number
        idRiesgo?: number
        idAuditoria?: number
        idHallazgo?: number
    }): Evidencia {
        return new Evidencia({
            ...datos,
            fechaSubidaArchivo: new Date()
        })
    }

    static fromDatabase(row: any): Evidencia {
        return new Evidencia({
            idEvidencia: row.id_evidencia,
            nombreArchivoOriginal: row.nombre_archivo_original,
            nombreArchivoAlmacenado: row.nombre_archivo_almacenado,
            urlAlmacenamientoArchivo: row.url_almacenamiento_archivo,
            tamañoBytesArchivo: row.tamaño_bytes_archivo,
            descripcionEvidencia: row.descripcion_evidencia,
            fechaSubidaArchivo: new Date(row.fecha_subida_archivo),
            idUsuarioSubio: row.id_usuario_subio,
            idTipoArchivo: row.id_tipo_archivo,
            idVisibilidadArchivo: row.id_visibilidad_archivo,
            idRiesgo: row.id_riesgo,
            idAuditoria: row.id_auditoria,
            idHallazgo: row.id_hallazgo
        })
    }

    toDatabase() {
        return {
            id_evidencia: this.props.idEvidencia,
            nombre_archivo_original: this.props.nombreArchivoOriginal,
            nombre_archivo_almacenado: this.props.nombreArchivoAlmacenado,
            url_almacenamiento_archivo: this.props.urlAlmacenamientoArchivo,
            tamaño_bytes_archivo: this.props.tamañoBytesArchivo,
            descripcion_evidencia: this.props.descripcionEvidencia,
            fecha_subida_archivo: this.props.fechaSubidaArchivo.toISOString(),
            id_usuario_subio: this.props.idUsuarioSubio,
            id_tipo_archivo: this.props.idTipoArchivo,
            id_visibilidad_archivo: this.props.idVisibilidadArchivo,
            id_riesgo: this.props.idRiesgo,
            id_auditoria: this.props.idAuditoria,
            id_hallazgo: this.props.idHallazgo
        }
    }
}