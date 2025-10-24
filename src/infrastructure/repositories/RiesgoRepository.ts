// =============================================
// REPOSITORIO CONCRETO: Riesgo con Supabase
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { Riesgo } from '@/domain/entities/Riesgo'
import { Probabilidad } from '@/domain/value-objects/Probabilidad'
import { Impacto } from '@/domain/value-objects/Impacto'
import { NivelRiesgo, NivelRiesgoCategoria } from '@/domain/value-objects/NivelRiesgo'
import { IRiesgoRepository, RiesgoFilters, RiesgoSearchOptions, RiskMatrixData } from '@/domain/repositories/IRiesgoRepository'
import { PaginationOptions, PaginatedResult } from '@/domain/repositories/common'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class RiesgoRepository extends BaseSupabaseRepository<Riesgo, number> implements IRiesgoRepository {
    protected tableName = 'riesgos'
    protected primaryKey = 'id_riesgo'

    protected mapFromDatabase(row: any): Riesgo {
        const probabilidad = Probabilidad.fromNumber(row.valor_probabilidad)
        const impacto = Impacto.fromNumber(row.valor_impacto)
        const nivelRiesgo = new NivelRiesgo(probabilidad, impacto)

        return new Riesgo({
            id: row.id_riesgo,
            idProyecto: row.id_proyecto,
            idCategoriaRiesgo: row.id_categoria_riesgo,
            idTipoRiesgo: row.id_tipo_riesgo,
            idVelocidadImpacto: row.id_velocidad_impacto,
            idEstadoRiesgo: row.id_estado_riesgo,
            idUsuarioRegistro: row.id_usuario_registro,
            idPropietarioRiesgo: row.id_propietario_riesgo,
            tituloRiesgo: row.titulo_riesgo,
            descripcionRiesgo: row.descripcion_riesgo,
            causaRaizRiesgo: row.causa_raiz_riesgo,
            consecuenciaRiesgo: row.consecuencia_riesgo,
            probabilidad,
            impacto,
            nivelRiesgoCalculado: nivelRiesgo,
            fechaRegistroRiesgo: new Date(row.fecha_registro_riesgo),
            fechaActualizacionRiesgo: new Date(row.fecha_actualizacion_riesgo)
        })
    }

    protected mapToDatabase(entity: Omit<Riesgo, 'id'>): any {
        const plainObject = (entity as any).toPlainObject ? (entity as any).toPlainObject() : entity
        return {
            id_proyecto: plainObject.id_proyecto,
            id_categoria_riesgo: plainObject.id_categoria_riesgo,
            id_tipo_riesgo: plainObject.id_tipo_riesgo,
            id_velocidad_impacto: plainObject.id_velocidad_impacto,
            id_estado_riesgo: plainObject.id_estado_riesgo,
            id_usuario_registro: plainObject.id_usuario_registro,
            id_propietario_riesgo: plainObject.id_propietario_riesgo,
            titulo_riesgo: plainObject.titulo_riesgo,
            descripcion_riesgo: plainObject.descripcion_riesgo,
            causa_raiz_riesgo: plainObject.causa_raiz_riesgo,
            consecuencia_riesgo: plainObject.consecuencia_riesgo,
            valor_probabilidad: plainObject.valor_probabilidad,
            valor_impacto: plainObject.valor_impacto,
            nivel_riesgo_calculado: plainObject.nivel_riesgo_calculado,
            fecha_registro_riesgo: plainObject.fecha_registro_riesgo,
            fecha_actualizacion_riesgo: plainObject.fecha_actualizacion_riesgo
        }
    }

    protected mapUpdateToDatabase(updates: Partial<Riesgo>): any {
        // Para updates, usamos un enfoque más simple
        // En la implementación real, esto se manejaría con DTOs
        return updates as any
    }

    // Implementación de métodos específicos de IRiesgoRepository

    async findByProyecto(idProyecto: number, options?: {
        pagination?: PaginationOptions
        filters?: Omit<RiesgoFilters, 'idProyecto'>
        soloActivos?: boolean
    }): Promise<PaginatedResult<Riesgo>> {
        let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
            .eq('id_proyecto', idProyecto)

        if (options?.soloActivos) {
            query = query.not('id_estado_riesgo', 'in', '(5,6)') // No cerrados ni materializados
        }

        if (options?.filters) {
            query = this.applyRiskFilters(query, options.filters)
        }

        if (options?.pagination) {
            const { page, limit } = options.pagination
            const offset = (page - 1) * limit
            query = query.range(offset, offset + limit - 1)
        }

        const { data, error, count } = await query

        if (error) {
            throw new Error(`Error finding risks by project: ${error.message}`)
        }

        const items = data?.map(row => this.mapFromDatabase(row)) || []
        const total = count || 0
        const page = options?.pagination?.page || 1
        const limit = options?.pagination?.limit || total
        const totalPages = Math.ceil(total / limit)

        return {
            data: items,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    }

    async findByPropietario(idPropietario: number, options?: {
        pagination?: PaginationOptions
        soloActivos?: boolean
    }): Promise<PaginatedResult<Riesgo>> {
        let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
            .eq('id_propietario_riesgo', idPropietario)

        if (options?.soloActivos) {
            query = query.not('id_estado_riesgo', 'in', '(5,6)')
        }

        if (options?.pagination) {
            const { page, limit } = options.pagination
            const offset = (page - 1) * limit
            query = query.range(offset, offset + limit - 1)
        }

        const { data, error, count } = await query

        if (error) {
            throw new Error(`Error finding risks by owner: ${error.message}`)
        }

        const items = data?.map(row => this.mapFromDatabase(row)) || []
        const total = count || 0
        const page = options?.pagination?.page || 1
        const limit = options?.pagination?.limit || total
        const totalPages = Math.ceil(total / limit)

        return {
            data: items,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    }

    async findByCategoria(idCategoria: number, options?: {
        pagination?: PaginationOptions
    }): Promise<PaginatedResult<Riesgo>> {
        return this.findAll({
            pagination: options?.pagination,
            filters: { id_categoria_riesgo: idCategoria }
        })
    }

    async findByTipo(idTipo: number, options?: {
        pagination?: PaginationOptions
    }): Promise<PaginatedResult<Riesgo>> {
        return this.findAll({
            pagination: options?.pagination,
            filters: { id_tipo_riesgo: idTipo }
        })
    }

    async findByEstado(idEstado: number, options?: {
        pagination?: PaginationOptions
    }): Promise<PaginatedResult<Riesgo>> {
        return this.findAll({
            pagination: options?.pagination,
            filters: { id_estado_riesgo: idEstado }
        })
    }

    async findByNivelRiesgo(categoria: NivelRiesgoCategoria, options?: {
        pagination?: PaginationOptions
    }): Promise<PaginatedResult<Riesgo>> {
        const { min, max } = this.getNivelRiesgoRange(categoria)

        let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
            .gte('nivel_riesgo_calculado', min)
            .lte('nivel_riesgo_calculado', max)

        if (options?.pagination) {
            const { page, limit } = options.pagination
            const offset = (page - 1) * limit
            query = query.range(offset, offset + limit - 1)
        }

        const { data, error, count } = await query

        if (error) {
            throw new Error(`Error finding risks by level: ${error.message}`)
        }

        const items = data?.map(row => this.mapFromDatabase(row)) || []
        const total = count || 0
        const page = options?.pagination?.page || 1
        const limit = options?.pagination?.limit || total
        const totalPages = Math.ceil(total / limit)

        return {
            data: items,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    }

    async findRiesgosCriticos(options?: {
        pagination?: PaginationOptions
        idProyecto?: number
    }): Promise<PaginatedResult<Riesgo>> {
        let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
            .gte('nivel_riesgo_calculado', 21)

        if (options?.idProyecto) {
            query = query.eq('id_proyecto', options.idProyecto)
        }

        if (options?.pagination) {
            const { page, limit } = options.pagination
            const offset = (page - 1) * limit
            query = query.range(offset, offset + limit - 1)
        }

        const { data, error, count } = await query

        if (error) {
            throw new Error(`Error finding critical risks: ${error.message}`)
        }

        const items = data?.map(row => this.mapFromDatabase(row)) || []
        const total = count || 0
        const page = options?.pagination?.page || 1
        const limit = options?.pagination?.limit || total
        const totalPages = Math.ceil(total / limit)

        return {
            data: items,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    }

    async findRiesgosAltos(options?: {
        pagination?: PaginationOptions
        idProyecto?: number
    }): Promise<PaginatedResult<Riesgo>> {
        let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
            .gte('nivel_riesgo_calculado', 13)
            .lte('nivel_riesgo_calculado', 20)

        if (options?.idProyecto) {
            query = query.eq('id_proyecto', options.idProyecto)
        }

        if (options?.pagination) {
            const { page, limit } = options.pagination
            const offset = (page - 1) * limit
            query = query.range(offset, offset + limit - 1)
        }

        const { data, error, count } = await query

        if (error) {
            throw new Error(`Error finding high risks: ${error.message}`)
        }

        const items = data?.map(row => this.mapFromDatabase(row)) || []
        const total = count || 0
        const page = options?.pagination?.page || 1
        const limit = options?.pagination?.limit || total
        const totalPages = Math.ceil(total / limit)

        return {
            data: items,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    }

    async findByProbabilidadRange(min: number, max: number): Promise<Riesgo[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .gte('valor_probabilidad', min)
            .lte('valor_probabilidad', max)

        if (error) {
            throw new Error(`Error finding risks by probability range: ${error.message}`)
        }

        return data?.map(row => this.mapFromDatabase(row)) || []
    }

    async findByImpactoRange(min: number, max: number): Promise<Riesgo[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .gte('valor_impacto', min)
            .lte('valor_impacto', max)

        if (error) {
            throw new Error(`Error finding risks by impact range: ${error.message}`)
        }

        return data?.map(row => this.mapFromDatabase(row)) || []
    }

    async findByNivelRiesgoRange(min: number, max: number): Promise<Riesgo[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .gte('nivel_riesgo_calculado', min)
            .lte('nivel_riesgo_calculado', max)

        if (error) {
            throw new Error(`Error finding risks by risk level range: ${error.message}`)
        }

        return data?.map(row => this.mapFromDatabase(row)) || []
    }

    async getRiskMatrix(idProyecto?: number): Promise<RiskMatrixData[][]> {
        let query = this.supabase
            .from(this.tableName)
            .select('valor_probabilidad, valor_impacto, nivel_riesgo_calculado, *')

        if (idProyecto) {
            query = query.eq('id_proyecto', idProyecto)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`Error getting risk matrix: ${error.message}`)
        }

        // Crear matriz 5x5
        const matrix: RiskMatrixData[][] = []
        for (let prob = 1; prob <= 5; prob++) {
            const row: RiskMatrixData[] = []
            for (let imp = 1; imp <= 5; imp++) {
                const riesgos = data?.filter(r =>
                    r.valor_probabilidad === prob && r.valor_impacto === imp
                ).map(r => this.mapFromDatabase(r)) || []

                row.push({
                    probabilidad: prob,
                    impacto: imp,
                    cantidad: riesgos.length,
                    riesgos
                })
            }
            matrix.push(row)
        }

        return matrix
    }

    async getRiskDistribution(idProyecto?: number): Promise<{
        muyBajo: number
        bajo: number
        medio: number
        alto: number
        critico: number
        total: number
    }> {
        let query = this.supabase
            .from(this.tableName)
            .select('nivel_riesgo_calculado')

        if (idProyecto) {
            query = query.eq('id_proyecto', idProyecto)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`Error getting risk distribution: ${error.message}`)
        }

        const distribution = {
            muyBajo: 0,
            bajo: 0,
            medio: 0,
            alto: 0,
            critico: 0,
            total: data?.length || 0
        }

        data?.forEach(row => {
            const nivel = row.nivel_riesgo_calculado
            if (nivel <= 3) distribution.muyBajo++
            else if (nivel <= 6) distribution.bajo++
            else if (nivel <= 12) distribution.medio++
            else if (nivel <= 20) distribution.alto++
            else distribution.critico++
        })

        return distribution
    }

    // Métodos auxiliares

    private applyRiskFilters(query: any, filters: Partial<RiesgoFilters>): any {
        if (filters.idCategoriaRiesgo) query = query.eq('id_categoria_riesgo', filters.idCategoriaRiesgo)
        if (filters.idTipoRiesgo) query = query.eq('id_tipo_riesgo', filters.idTipoRiesgo)
        if (filters.idEstadoRiesgo) query = query.eq('id_estado_riesgo', filters.idEstadoRiesgo)
        if (filters.idPropietarioRiesgo) query = query.eq('id_propietario_riesgo', filters.idPropietarioRiesgo)
        if (filters.probabilidadMin) query = query.gte('valor_probabilidad', filters.probabilidadMin)
        if (filters.probabilidadMax) query = query.lte('valor_probabilidad', filters.probabilidadMax)
        if (filters.impactoMin) query = query.gte('valor_impacto', filters.impactoMin)
        if (filters.impactoMax) query = query.lte('valor_impacto', filters.impactoMax)
        if (filters.nivelRiesgoMin) query = query.gte('nivel_riesgo_calculado', filters.nivelRiesgoMin)
        if (filters.nivelRiesgoMax) query = query.lte('nivel_riesgo_calculado', filters.nivelRiesgoMax)

        return query
    }

    private getNivelRiesgoRange(categoria: NivelRiesgoCategoria): { min: number; max: number } {
        switch (categoria) {
            case 'MUY_BAJO': return { min: 1, max: 3 }
            case 'BAJO': return { min: 4, max: 6 }
            case 'MEDIO': return { min: 7, max: 12 }
            case 'ALTO': return { min: 13, max: 20 }
            case 'CRITICO': return { min: 21, max: 25 }
            default: return { min: 1, max: 25 }
        }
    }

    // Implementación simplificada de métodos restantes
    async countByCategoria(idProyecto?: number): Promise<{ idCategoria: number; count: number }[]> {
        // Implementación simplificada
        return []
    }

    async countByTipo(idProyecto?: number): Promise<{ idTipo: number; count: number }[]> {
        return []
    }

    async countByEstado(idProyecto?: number): Promise<{ idEstado: number; count: number }[]> {
        return []
    }

    async countByNivelRiesgo(idProyecto?: number): Promise<{ categoria: NivelRiesgoCategoria; count: number }[]> {
        return []
    }

    async countByPropietario(idProyecto?: number): Promise<{ idPropietario: number; count: number }[]> {
        return []
    }

    async getProjectRiskMetrics(idProyecto: number): Promise<any> {
        return {}
    }

    async getRiskTrends(idProyecto: number, from: Date, to: Date): Promise<any[]> {
        return []
    }

    async assignOwner(id: number, idPropietario: number): Promise<Riesgo> {
        return this.update(id, { idPropietarioRiesgo: idPropietario } as any)
    }

    async updateRiskLevel(id: number, probabilidad: number, impacto: number): Promise<Riesgo> {
        const prob = Probabilidad.fromNumber(probabilidad)
        const imp = Impacto.fromNumber(impacto)
        const nivel = new NivelRiesgo(prob, imp)

        return this.update(id, {
            probabilidad: prob,
            impacto: imp,
            nivelRiesgoCalculado: nivel,
            fechaActualizacionRiesgo: new Date()
        } as any)
    }

    async changeState(id: number, idEstado: number): Promise<Riesgo> {
        return this.update(id, {
            idEstadoRiesgo: idEstado,
            fechaActualizacionRiesgo: new Date()
        } as any)
    }

    async findRiesgosVencidos(): Promise<Riesgo[]> {
        return []
    }

    async findRiesgosSinPropietario(): Promise<Riesgo[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .is('id_propietario_riesgo', null)

        if (error) {
            throw new Error(`Error finding risks without owner: ${error.message}`)
        }

        return data?.map(row => this.mapFromDatabase(row)) || []
    }

    async findRiesgosSinInformacionCompleta(): Promise<Riesgo[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .or('causa_raiz_riesgo.is.null,consecuencia_riesgo.is.null')

        if (error) {
            throw new Error(`Error finding incomplete risks: ${error.message}`)
        }

        return data?.map(row => this.mapFromDatabase(row)) || []
    }

    async findRiesgosRequierenAtencion(): Promise<Riesgo[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .gte('nivel_riesgo_calculado', 13)
            .not('id_estado_riesgo', 'in', '(5,6)')

        if (error) {
            throw new Error(`Error finding risks requiring attention: ${error.message}`)
        }

        return data?.map(row => this.mapFromDatabase(row)) || []
    }

    async validateRiskAssignment(idProyecto: number, idPropietario: number): Promise<boolean> {
        // Implementar validación de asignación
        return true
    }

    async getRiskReport(filters: RiesgoFilters): Promise<any> {
        return {}
    }
}