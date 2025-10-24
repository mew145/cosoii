// =============================================
// ENTIDAD: Control ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export interface ControlISO27001Props {
    id: number
    codigoControl: string // A.5.1, A.6.1, etc.
    nombreControl: string
    descripcionControl: string
    dominioControl: string // A.5 Políticas de seguridad, A.6 Organización, etc.
    tipoControl: TipoControl
    categoriaControl: CategoriaControl
    estadoImplementacion: EstadoImplementacion
    nivelMadurez: NivelMadurez // 0-5
    responsableControl: number // id_usuario
    fechaImplementacion?: Date
    fechaRevision: Date
    evidenciasControl: string[]
    fechaRegistro: Date
    fechaActualizacion: Date
}

export enum TipoControl {
    PREVENTIVO = 'preventivo',
    DETECTIVO = 'detectivo',
    CORRECTIVO = 'correctivo'
}

export enum CategoriaControl {
    TECNICO = 'tecnico',
    ADMINISTRATIVO = 'administrativo',
    FISICO = 'fisico'
}

export enum EstadoImplementacion {
    NO_IMPLEMENTADO = 'no_implementado',
    PARCIALMENTE_IMPLEMENTADO = 'parcialmente_implementado',
    IMPLEMENTADO = 'implementado',
    NO_APLICABLE = 'no_aplicable'
}

export type NivelMadurez = 0 | 1 | 2 | 3 | 4 | 5

export class ControlISO27001 {
    private readonly props: ControlISO27001Props

    constructor(props: ControlISO27001Props) {
        this.validate(props)
        this.props = { ...props }
    }

    private validate(props: ControlISO27001Props): void {
        if (!props.codigoControl || !this.isValidControlCode(props.codigoControl)) {
            throw new Error('Código de control debe seguir el formato ISO 27001 (ej: A.5.1)')
        }

        if (!props.nombreControl || props.nombreControl.trim().length < 5) {
            throw new Error('Nombre del control debe tener al menos 5 caracteres')
        }

        if (!props.descripcionControl || props.descripcionControl.trim().length < 10) {
            throw new Error('Descripción del control debe tener al menos 10 caracteres')
        }

        if (props.responsableControl <= 0) {
            throw new Error('ID de responsable debe ser positivo')
        }

        if (props.nivelMadurez < 0 || props.nivelMadurez > 5) {
            throw new Error('Nivel de madurez debe estar entre 0 y 5')
        }
    }

    private isValidControlCode(code: string): boolean {
        // Formato: A.X.Y donde X es el dominio (5-18) y Y es el control específico
        const regex = /^A\.\d{1,2}\.\d{1,2}$/
        return regex.test(code)
    }

    // Getters
    getId(): number {
        return this.props.id
    }

    getCodigoControl(): string {
        return this.props.codigoControl
    }

    getNombreControl(): string {
        return this.props.nombreControl
    }

    getDescripcionControl(): string {
        return this.props.descripcionControl
    }

    getDominioControl(): string {
        return this.props.dominioControl
    }

    getTipoControl(): TipoControl {
        return this.props.tipoControl
    }

    getCategoriaControl(): CategoriaControl {
        return this.props.categoriaControl
    }

    getEstadoImplementacion(): EstadoImplementacion {
        return this.props.estadoImplementacion
    }

    getNivelMadurez(): NivelMadurez {
        return this.props.nivelMadurez
    }

    getResponsableControl(): number {
        return this.props.responsableControl
    }

    getFechaImplementacion(): Date | undefined {
        return this.props.fechaImplementacion
    }

    getFechaRevision(): Date {
        return this.props.fechaRevision
    }

    getEvidenciasControl(): string[] {
        return [...this.props.evidenciasControl]
    }

    getFechaRegistro(): Date {
        return this.props.fechaRegistro
    }

    getFechaActualizacion(): Date {
        return this.props.fechaActualizacion
    }

    // Métodos de negocio
    isImplementado(): boolean {
        return this.props.estadoImplementacion === EstadoImplementacion.IMPLEMENTADO
    }

    isParcialmenteImplementado(): boolean {
        return this.props.estadoImplementacion === EstadoImplementacion.PARCIALMENTE_IMPLEMENTADO
    }

    isNoImplementado(): boolean {
        return this.props.estadoImplementacion === EstadoImplementacion.NO_IMPLEMENTADO
    }

    isNoAplicable(): boolean {
        return this.props.estadoImplementacion === EstadoImplementacion.NO_APLICABLE
    }

    isEfectivo(): boolean {
        return this.isImplementado() && this.props.nivelMadurez >= 3
    }

    isMaduro(): boolean {
        return this.props.nivelMadurez >= 4
    }

    requiresAttention(): boolean {
        return this.isNoImplementado() || (this.isParcialmenteImplementado() && this.props.nivelMadurez < 2)
    }

    needsRevision(): boolean {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return this.props.fechaRevision < sixMonthsAgo
    }

    hasEvidences(): boolean {
        return this.props.evidenciasControl.length > 0
    }

    getDomainNumber(): number {
        const match = this.props.codigoControl.match(/^A\.(\d{1,2})\./)
        return match ? parseInt(match[1]) : 0
    }

    getControlNumber(): number {
        const match = this.props.codigoControl.match(/^A\.\d{1,2}\.(\d{1,2})$/)
        return match ? parseInt(match[1]) : 0
    }

    getEstadoLabel(): string {
        const labels = {
            [EstadoImplementacion.NO_IMPLEMENTADO]: 'No Implementado',
            [EstadoImplementacion.PARCIALMENTE_IMPLEMENTADO]: 'Parcialmente Implementado',
            [EstadoImplementacion.IMPLEMENTADO]: 'Implementado',
            [EstadoImplementacion.NO_APLICABLE]: 'No Aplicable'
        }
        return labels[this.props.estadoImplementacion]
    }

    getTipoLabel(): string {
        const labels = {
            [TipoControl.PREVENTIVO]: 'Preventivo',
            [TipoControl.DETECTIVO]: 'Detectivo',
            [TipoControl.CORRECTIVO]: 'Correctivo'
        }
        return labels[this.props.tipoControl]
    }

    getCategoriaLabel(): string {
        const labels = {
            [CategoriaControl.TECNICO]: 'Técnico',
            [CategoriaControl.ADMINISTRATIVO]: 'Administrativo',
            [CategoriaControl.FISICO]: 'Físico'
        }
        return labels[this.props.categoriaControl]
    }

    getNivelMadurezLabel(): string {
        const labels = {
            0: 'No Existe',
            1: 'Inicial',
            2: 'Repetible',
            3: 'Definido',
            4: 'Gestionado',
            5: 'Optimizado'
        }
        return labels[this.props.nivelMadurez]
    }

    getEstadoColor(): string {
        const colors = {
            [EstadoImplementacion.NO_IMPLEMENTADO]: '#ef4444', // red-500
            [EstadoImplementacion.PARCIALMENTE_IMPLEMENTADO]: '#f59e0b', // amber-500
            [EstadoImplementacion.IMPLEMENTADO]: '#22c55e', // green-500
            [EstadoImplementacion.NO_APLICABLE]: '#6b7280' // gray-500
        }
        return colors[this.props.estadoImplementacion]
    }

    getMadurezColor(): string {
        const colors = {
            0: '#ef4444', // red-500
            1: '#f97316', // orange-500
            2: '#f59e0b', // amber-500
            3: '#eab308', // yellow-500
            4: '#84cc16', // lime-500
            5: '#22c55e'  // green-500
        }
        return colors[this.props.nivelMadurez]
    }

    // Métodos de modificación (retornan nueva instancia)
    cambiarEstadoImplementacion(nuevoEstado: EstadoImplementacion): ControlISO27001 {
        const fechaImplementacion = nuevoEstado === EstadoImplementacion.IMPLEMENTADO
            ? new Date()
            : this.props.fechaImplementacion

        return new ControlISO27001({
            ...this.props,
            estadoImplementacion: nuevoEstado,
            fechaImplementacion,
            fechaActualizacion: new Date()
        })
    }

    actualizarMadurez(nuevoNivel: NivelMadurez): ControlISO27001 {
        return new ControlISO27001({
            ...this.props,
            nivelMadurez: nuevoNivel,
            fechaActualizacion: new Date()
        })
    }

    asignarResponsable(nuevoIdResponsable: number): ControlISO27001 {
        if (nuevoIdResponsable <= 0) {
            throw new Error('ID de responsable debe ser positivo')
        }

        return new ControlISO27001({
            ...this.props,
            responsableControl: nuevoIdResponsable,
            fechaActualizacion: new Date()
        })
    }

    agregarEvidencia(evidencia: string): ControlISO27001 {
        if (!evidencia || evidencia.trim().length === 0) {
            throw new Error('Evidencia no puede estar vacía')
        }

        const nuevasEvidencias = [...this.props.evidenciasControl, evidencia.trim()]

        return new ControlISO27001({
            ...this.props,
            evidenciasControl: nuevasEvidencias,
            fechaActualizacion: new Date()
        })
    }

    removerEvidencia(evidencia: string): ControlISO27001 {
        const nuevasEvidencias = this.props.evidenciasControl.filter(e => e !== evidencia)

        return new ControlISO27001({
            ...this.props,
            evidenciasControl: nuevasEvidencias,
            fechaActualizacion: new Date()
        })
    }

    actualizarRevision(): ControlISO27001 {
        return new ControlISO27001({
            ...this.props,
            fechaRevision: new Date(),
            fechaActualizacion: new Date()
        })
    }

    actualizarInformacion(datos: {
        nombreControl?: string
        descripcionControl?: string
        dominioControl?: string
    }): ControlISO27001 {
        return new ControlISO27001({
            ...this.props,
            ...datos,
            fechaActualizacion: new Date()
        })
    }

    // Método estático para crear nuevo control
    static crear(datos: {
        codigoControl: string
        nombreControl: string
        descripcionControl: string
        dominioControl: string
        tipoControl: TipoControl
        categoriaControl: CategoriaControl
        responsableControl: number
        evidenciasControl?: string[]
    }): ControlISO27001 {
        return new ControlISO27001({
            id: 0, // Se asignará en la base de datos
            codigoControl: datos.codigoControl,
            nombreControl: datos.nombreControl,
            descripcionControl: datos.descripcionControl,
            dominioControl: datos.dominioControl,
            tipoControl: datos.tipoControl,
            categoriaControl: datos.categoriaControl,
            estadoImplementacion: EstadoImplementacion.NO_IMPLEMENTADO,
            nivelMadurez: 0,
            responsableControl: datos.responsableControl,
            fechaImplementacion: undefined,
            fechaRevision: new Date(),
            evidenciasControl: datos.evidenciasControl || [],
            fechaRegistro: new Date(),
            fechaActualizacion: new Date()
        })
    }

    // Método para convertir a objeto plano (para persistencia)
    toPlainObject(): Record<string, any> {
        return {
            id_control: this.props.id,
            codigo_control: this.props.codigoControl,
            nombre_control: this.props.nombreControl,
            descripcion_control: this.props.descripcionControl,
            dominio_control: this.props.dominioControl,
            tipo_control: this.props.tipoControl,
            categoria_control: this.props.categoriaControl,
            estado_implementacion: this.props.estadoImplementacion,
            nivel_madurez: this.props.nivelMadurez,
            responsable_control: this.props.responsableControl,
            fecha_implementacion: this.props.fechaImplementacion?.toISOString(),
            fecha_revision: this.props.fechaRevision.toISOString(),
            evidencias_control: this.props.evidenciasControl,
            fecha_registro: this.props.fechaRegistro.toISOString(),
            fecha_actualizacion: this.props.fechaActualizacion.toISOString()
        }
    }

    equals(other: ControlISO27001): boolean {
        return this.props.id === other.props.id
    }
}