import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'
import { Evidencia } from '@/domain/entities/Evidencia'
import { TipoArchivo, VisibilidadArchivo } from '@/domain/entities/TipoArchivo'
import { 
    IEvidenciaRepository, 
    ITipoArchivoRepository, 
    IVisibilidadArchivoRepository,
    FiltrosEvidencia 
} from '@/domain/repositories/IEvidenciaRepository'
import { InfrastructureError } from '@/domain/exceptions'

export class EvidenciaRepository extends BaseSupabaseRepository<Evidencia, number> implements IEvidenciaRepository {
    protected tableName = 'evidencias'
    protected primaryKey = 'id_evidencia'

    constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
        super()
        this.supabase = supabaseClient
    }

    protected mapFromDatabase(row: any): Evidencia {
        return Evidencia.fromDatabase(row)
    }

    protected mapToDatabase(entity: Omit<Evidencia, 'id'>): any {
        return (entity as any).toDatabase()
    }

    protected mapUpdateToDatabase(updates: Partial<Evidencia>): any {
        return (updates as any).toDatabase()
    }

    async crear(evidencia: Evidencia): Promise<Evidencia> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .insert(evidencia.toDatabase())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al crear evidencia: ${error.message}`)
            }

            return Evidencia.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear evidencia: ${error}`)
        }
    }

    async obtenerPorId(id: number): Promise<Evidencia | null> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('*')
                .eq('id_evidencia', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw new InfrastructureError(`Error al obtener evidencia: ${error.message}`)
            }

            return data ? Evidencia.fromDatabase(data) : null
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener evidencia: ${error}`)
        }
    }

    async actualizar(evidencia: Evidencia): Promise<Evidencia> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .update(evidencia.toDatabase())
                .eq('id_evidencia', evidencia.getIdEvidencia())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al actualizar evidencia: ${error.message}`)
            }

            return Evidencia.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al actualizar evidencia: ${error}`)
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('evidencias')
                .delete()
                .eq('id_evidencia', id)

            if (error) {
                throw new InfrastructureError(`Error al eliminar evidencia: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar evidencia: ${error}`)
        }
    }

    async obtenerPorRiesgo(idRiesgo: number): Promise<Evidencia[]> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('*')
                .eq('id_riesgo', idRiesgo)
                .order('fecha_subida_archivo', { ascending: false })

            if (error) {
                throw new InfrastructureError(`Error al obtener evidencias por riesgo: ${error.message}`)
            }

            return data.map(row => Evidencia.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener evidencias por riesgo: ${error}`)
        }
    }

    async obtenerPorAuditoria(idAuditoria: number): Promise<Evidencia[]> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('*')
                .eq('id_auditoria', idAuditoria)
                .order('fecha_subida_archivo', { ascending: false })

            if (error) {
                throw new InfrastructureError(`Error al obtener evidencias por auditoría: ${error.message}`)
            }

            return data.map(row => Evidencia.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener evidencias por auditoría: ${error}`)
        }
    }

    async obtenerPorHallazgo(idHallazgo: number): Promise<Evidencia[]> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('*')
                .eq('id_hallazgo', idHallazgo)
                .order('fecha_subida_archivo', { ascending: false })

            if (error) {
                throw new InfrastructureError(`Error al obtener evidencias por hallazgo: ${error.message}`)
            }

            return data.map(row => Evidencia.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener evidencias por hallazgo: ${error}`)
        }
    }

    async obtenerPorUsuario(idUsuario: number): Promise<Evidencia[]> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('*')
                .eq('id_usuario_subio', idUsuario)
                .order('fecha_subida_archivo', { ascending: false })

            if (error) {
                throw new InfrastructureError(`Error al obtener evidencias por usuario: ${error.message}`)
            }

            return data.map(row => Evidencia.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener evidencias por usuario: ${error}`)
        }
    }

    async buscar(filtros: FiltrosEvidencia, limite = 50, offset = 0): Promise<{
        evidencias: Evidencia[]
        total: number
    }> {
        try {
            let query = this.supabase
                .from('evidencias')
                .select('*', { count: 'exact' })

            // Aplicar filtros
            if (filtros.idRiesgo) {
                query = query.eq('id_riesgo', filtros.idRiesgo)
            }
            if (filtros.idAuditoria) {
                query = query.eq('id_auditoria', filtros.idAuditoria)
            }
            if (filtros.idHallazgo) {
                query = query.eq('id_hallazgo', filtros.idHallazgo)
            }
            if (filtros.idTipoArchivo) {
                query = query.eq('id_tipo_archivo', filtros.idTipoArchivo)
            }
            if (filtros.idVisibilidadArchivo) {
                query = query.eq('id_visibilidad_archivo', filtros.idVisibilidadArchivo)
            }
            if (filtros.idUsuarioSubio) {
                query = query.eq('id_usuario_subio', filtros.idUsuarioSubio)
            }
            if (filtros.fechaDesde) {
                query = query.gte('fecha_subida_archivo', filtros.fechaDesde.toISOString())
            }
            if (filtros.fechaHasta) {
                query = query.lte('fecha_subida_archivo', filtros.fechaHasta.toISOString())
            }
            if (filtros.busqueda) {
                query = query.or(`nombre_archivo_original.ilike.%${filtros.busqueda}%,descripcion_evidencia.ilike.%${filtros.busqueda}%`)
            }

            const { data, error, count } = await query
                .order('fecha_subida_archivo', { ascending: false })
                .range(offset, offset + limite - 1)

            if (error) {
                throw new InfrastructureError(`Error al buscar evidencias: ${error.message}`)
            }

            return {
                evidencias: data.map(row => Evidencia.fromDatabase(row)),
                total: count || 0
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al buscar evidencias: ${error}`)
        }
    }

    async obtenerTamañoTotalPorUsuario(idUsuario: number): Promise<number> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('tamaño_bytes_archivo')
                .eq('id_usuario_subio', idUsuario)

            if (error) {
                throw new InfrastructureError(`Error al obtener tamaño total: ${error.message}`)
            }

            return data.reduce((total, row) => total + ((row as any).tamaño_bytes_archivo || 0), 0)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener tamaño total: ${error}`)
        }
    }

    async obtenerContadorPorTipo(): Promise<{ tipoArchivo: string; cantidad: number }[]> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select(`
                    id_tipo_archivo,
                    tipos_archivo!inner(nombre_tipo_archivo)
                `)

            if (error) {
                throw new InfrastructureError(`Error al obtener contador por tipo: ${error.message}`)
            }

            const contador: Record<string, number> = {}
            data.forEach(row => {
                const tipoArchivo = (row.tipos_archivo as any)?.nombre_tipo_archivo || 'Sin tipo'
                contador[tipoArchivo] = (contador[tipoArchivo] || 0) + 1
            })

            return Object.entries(contador).map(([tipoArchivo, cantidad]) => ({
                tipoArchivo,
                cantidad
            }))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener contador por tipo: ${error}`)
        }
    }

    async obtenerEvidenciasRecientes(limite = 10): Promise<Evidencia[]> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('*')
                .order('fecha_subida_archivo', { ascending: false })
                .limit(limite)

            if (error) {
                throw new InfrastructureError(`Error al obtener evidencias recientes: ${error.message}`)
            }

            return data.map(row => Evidencia.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener evidencias recientes: ${error}`)
        }
    }

    async existeArchivo(nombreArchivoAlmacenado: string): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('evidencias')
                .select('id_evidencia')
                .eq('nombre_archivo_almacenado', nombreArchivoAlmacenado)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw new InfrastructureError(`Error al verificar existencia de archivo: ${error.message}`)
            }

            return !!data
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al verificar existencia de archivo: ${error}`)
        }
    }

    async validarPermisoAcceso(idEvidencia: number, idUsuario: number): Promise<boolean> {
        try {
            // Esta lógica puede ser más compleja dependiendo de los requerimientos de negocio
            // Por ahora, verificamos si el usuario subió el archivo o tiene permisos administrativos
            const { data, error } = await this.supabase
                .from('evidencias')
                .select(`
                    id_usuario_subio,
                    id_visibilidad_archivo,
                    visibilidades_archivo!inner(nombre_visibilidad_archivo)
                `)
                .eq('id_evidencia', idEvidencia)
                .single()

            if (error) {
                throw new InfrastructureError(`Error al validar permisos: ${error.message}`)
            }

            // Si el usuario subió el archivo, tiene acceso
            if (data.id_usuario_subio === idUsuario) {
                return true
            }

            // Si el archivo es público, todos tienen acceso
            const visibilidad = (data.visibilidades_archivo as any)?.nombre_visibilidad_archivo
            if (visibilidad?.toLowerCase().includes('público') || visibilidad?.toLowerCase().includes('publico')) {
                return true
            }

            // Aquí se pueden agregar más reglas de negocio para permisos
            // Por ejemplo, verificar roles, departamentos, etc.

            return false
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al validar permisos: ${error}`)
        }
    }
}

export class TipoArchivoRepository extends BaseSupabaseRepository<TipoArchivo, number> implements ITipoArchivoRepository {
    protected tableName = 'tipos_archivo'
    protected primaryKey = 'id_tipo_archivo'

    constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
        super()
        this.supabase = supabaseClient
    }

    protected mapFromDatabase(row: any): TipoArchivo {
        return TipoArchivo.fromDatabase(row)
    }

    protected mapToDatabase(entity: Omit<TipoArchivo, 'id'>): any {
        return (entity as any).toDatabase()
    }

    protected mapUpdateToDatabase(updates: Partial<TipoArchivo>): any {
        return (updates as any).toDatabase()
    }

    async crear(tipoArchivo: TipoArchivo): Promise<TipoArchivo> {
        try {
            const { data, error } = await this.supabase
                .from('tipos_archivo')
                .insert(tipoArchivo.toDatabase())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al crear tipo de archivo: ${error.message}`)
            }

            return TipoArchivo.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear tipo de archivo: ${error}`)
        }
    }

    async obtenerPorId(id: number): Promise<TipoArchivo | null> {
        try {
            const { data, error } = await this.supabase
                .from('tipos_archivo')
                .select('*')
                .eq('id_tipo_archivo', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw new InfrastructureError(`Error al obtener tipo de archivo: ${error.message}`)
            }

            return data ? TipoArchivo.fromDatabase(data) : null
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener tipo de archivo: ${error}`)
        }
    }

    async obtenerTodos(): Promise<TipoArchivo[]> {
        try {
            const { data, error } = await this.supabase
                .from('tipos_archivo')
                .select('*')
                .order('nombre_tipo_archivo')

            if (error) {
                throw new InfrastructureError(`Error al obtener tipos de archivo: ${error.message}`)
            }

            return data.map(row => TipoArchivo.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener tipos de archivo: ${error}`)
        }
    }

    async actualizar(tipoArchivo: TipoArchivo): Promise<TipoArchivo> {
        try {
            const { data, error } = await this.supabase
                .from('tipos_archivo')
                .update(tipoArchivo.toDatabase())
                .eq('id_tipo_archivo', tipoArchivo.getIdTipoArchivo())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al actualizar tipo de archivo: ${error.message}`)
            }

            return TipoArchivo.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al actualizar tipo de archivo: ${error}`)
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('tipos_archivo')
                .delete()
                .eq('id_tipo_archivo', id)

            if (error) {
                throw new InfrastructureError(`Error al eliminar tipo de archivo: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar tipo de archivo: ${error}`)
        }
    }

    async obtenerPorExtension(extension: string): Promise<TipoArchivo[]> {
        try {
            const { data, error } = await this.supabase
                .from('tipos_archivo')
                .select('*')
                .ilike('extensiones_permitidas', `%${extension}%`)

            if (error) {
                throw new InfrastructureError(`Error al obtener tipos por extensión: ${error.message}`)
            }

            return data
                .map(row => TipoArchivo.fromDatabase(row))
                .filter(tipo => tipo.esExtensionPermitida(extension))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener tipos por extensión: ${error}`)
        }
    }

    async obtenerActivos(): Promise<TipoArchivo[]> {
        // Por ahora retornamos todos, pero se puede agregar un campo de estado activo
        return this.obtenerTodos()
    }
}

export class VisibilidadArchivoRepository extends BaseSupabaseRepository<VisibilidadArchivo, number> implements IVisibilidadArchivoRepository {
    protected tableName = 'visibilidades_archivo'
    protected primaryKey = 'id_visibilidad_archivo'

    constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
        super()
        this.supabase = supabaseClient
    }

    protected mapFromDatabase(row: any): VisibilidadArchivo {
        return VisibilidadArchivo.fromDatabase(row)
    }

    protected mapToDatabase(entity: Omit<VisibilidadArchivo, 'id'>): any {
        return (entity as any).toDatabase()
    }

    protected mapUpdateToDatabase(updates: Partial<VisibilidadArchivo>): any {
        return (updates as any).toDatabase()
    }

    async crear(visibilidad: VisibilidadArchivo): Promise<VisibilidadArchivo> {
        try {
            const { data, error } = await this.supabase
                .from('visibilidades_archivo')
                .insert(visibilidad.toDatabase())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al crear visibilidad de archivo: ${error.message}`)
            }

            return VisibilidadArchivo.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al crear visibilidad de archivo: ${error}`)
        }
    }

    async obtenerPorId(id: number): Promise<VisibilidadArchivo | null> {
        try {
            const { data, error } = await this.supabase
                .from('visibilidades_archivo')
                .select('*')
                .eq('id_visibilidad_archivo', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw new InfrastructureError(`Error al obtener visibilidad de archivo: ${error.message}`)
            }

            return data ? VisibilidadArchivo.fromDatabase(data) : null
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener visibilidad de archivo: ${error}`)
        }
    }

    async obtenerTodos(): Promise<VisibilidadArchivo[]> {
        try {
            const { data, error } = await this.supabase
                .from('visibilidades_archivo')
                .select('*')
                .order('nombre_visibilidad_archivo')

            if (error) {
                throw new InfrastructureError(`Error al obtener visibilidades de archivo: ${error.message}`)
            }

            return data.map(row => VisibilidadArchivo.fromDatabase(row))
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener visibilidades de archivo: ${error}`)
        }
    }

    async actualizar(visibilidad: VisibilidadArchivo): Promise<VisibilidadArchivo> {
        try {
            const { data, error } = await this.supabase
                .from('visibilidades_archivo')
                .update(visibilidad.toDatabase())
                .eq('id_visibilidad_archivo', visibilidad.getIdVisibilidadArchivo())
                .select()
                .single()

            if (error) {
                throw new InfrastructureError(`Error al actualizar visibilidad de archivo: ${error.message}`)
            }

            return VisibilidadArchivo.fromDatabase(data)
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al actualizar visibilidad de archivo: ${error}`)
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('visibilidades_archivo')
                .delete()
                .eq('id_visibilidad_archivo', id)

            if (error) {
                throw new InfrastructureError(`Error al eliminar visibilidad de archivo: ${error.message}`)
            }
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al eliminar visibilidad de archivo: ${error}`)
        }
    }

    async obtenerPorNombre(nombre: string): Promise<VisibilidadArchivo | null> {
        try {
            const { data, error } = await this.supabase
                .from('visibilidades_archivo')
                .select('*')
                .eq('nombre_visibilidad_archivo', nombre)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw new InfrastructureError(`Error al obtener visibilidad por nombre: ${error.message}`)
            }

            return data ? VisibilidadArchivo.fromDatabase(data) : null
        } catch (error) {
            if (error instanceof InfrastructureError) throw error
            throw new InfrastructureError(`Error inesperado al obtener visibilidad por nombre: ${error}`)
        }
    }

    async obtenerActivos(): Promise<VisibilidadArchivo[]> {
        // Por ahora retornamos todos, pero se puede agregar un campo de estado activo
        return this.obtenerTodos()
    }
}