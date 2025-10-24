import { DomainError } from '../exceptions'

export interface TipoArchivoProps {
    idTipoArchivo?: number
    nombreTipoArchivo: string
    descripcionTipoArchivo?: string
    extensionesPermitidas?: string
}

export class TipoArchivo {
    private constructor(private readonly props: TipoArchivoProps) {
        this.validate()
    }

    private validate(): void {
        if (!this.props.nombreTipoArchivo?.trim()) {
            throw new DomainError('El nombre del tipo de archivo es requerido')
        }
    }

    // Getters
    getIdTipoArchivo(): number | undefined {
        return this.props.idTipoArchivo
    }

    getNombreTipoArchivo(): string {
        return this.props.nombreTipoArchivo
    }

    getDescripcionTipoArchivo(): string | undefined {
        return this.props.descripcionTipoArchivo
    }

    getExtensionesPermitidas(): string | undefined {
        return this.props.extensionesPermitidas
    }

    // Métodos de negocio
    getExtensionesArray(): string[] {
        if (!this.props.extensionesPermitidas) return []
        return this.props.extensionesPermitidas
            .split(',')
            .map(ext => ext.trim().toLowerCase())
            .filter(ext => ext.length > 0)
    }

    esExtensionPermitida(extension: string): boolean {
        const extensiones = this.getExtensionesArray()
        if (extensiones.length === 0) return true // Si no hay restricciones, permitir todo
        return extensiones.includes(extension.toLowerCase())
    }

    // Factory methods
    static crear(datos: {
        nombreTipoArchivo: string
        descripcionTipoArchivo?: string
        extensionesPermitidas?: string
    }): TipoArchivo {
        return new TipoArchivo(datos)
    }

    static fromDatabase(row: any): TipoArchivo {
        return new TipoArchivo({
            idTipoArchivo: row.id_tipo_archivo,
            nombreTipoArchivo: row.nombre_tipo_archivo,
            descripcionTipoArchivo: row.descripcion_tipo_archivo,
            extensionesPermitidas: row.extensiones_permitidas
        })
    }

    toDatabase() {
        return {
            id_tipo_archivo: this.props.idTipoArchivo,
            nombre_tipo_archivo: this.props.nombreTipoArchivo,
            descripcion_tipo_archivo: this.props.descripcionTipoArchivo,
            extensiones_permitidas: this.props.extensionesPermitidas
        }
    }
}

export interface VisibilidadArchivoProps {
    idVisibilidadArchivo?: number
    nombreVisibilidadArchivo: string
    descripcionVisibilidadArchivo?: string
}

export class VisibilidadArchivo {
    private constructor(private readonly props: VisibilidadArchivoProps) {
        this.validate()
    }

    private validate(): void {
        if (!this.props.nombreVisibilidadArchivo?.trim()) {
            throw new DomainError('El nombre de la visibilidad es requerido')
        }
    }

    // Getters
    getIdVisibilidadArchivo(): number | undefined {
        return this.props.idVisibilidadArchivo
    }

    getNombreVisibilidadArchivo(): string {
        return this.props.nombreVisibilidadArchivo
    }

    getDescripcionVisibilidadArchivo(): string | undefined {
        return this.props.descripcionVisibilidadArchivo
    }

    // Métodos de negocio
    esPublico(): boolean {
        return this.props.nombreVisibilidadArchivo.toLowerCase().includes('público') ||
               this.props.nombreVisibilidadArchivo.toLowerCase().includes('publico')
    }

    esPrivado(): boolean {
        return this.props.nombreVisibilidadArchivo.toLowerCase().includes('privado')
    }

    esConfidencial(): boolean {
        return this.props.nombreVisibilidadArchivo.toLowerCase().includes('confidencial')
    }

    // Factory methods
    static crear(datos: {
        nombreVisibilidadArchivo: string
        descripcionVisibilidadArchivo?: string
    }): VisibilidadArchivo {
        return new VisibilidadArchivo(datos)
    }

    static fromDatabase(row: any): VisibilidadArchivo {
        return new VisibilidadArchivo({
            idVisibilidadArchivo: row.id_visibilidad_archivo,
            nombreVisibilidadArchivo: row.nombre_visibilidad_archivo,
            descripcionVisibilidadArchivo: row.descripcion_visibilidad_archivo
        })
    }

    toDatabase() {
        return {
            id_visibilidad_archivo: this.props.idVisibilidadArchivo,
            nombre_visibilidad_archivo: this.props.nombreVisibilidadArchivo,
            descripcion_visibilidad_archivo: this.props.descripcionVisibilidadArchivo
        }
    }
}