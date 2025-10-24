import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { FileManagementService } from '@/application/services/FileManagementService'
import { EvidenciaRepository, TipoArchivoRepository, VisibilidadArchivoRepository } from '@/infrastructure/repositories/EvidenciaRepository'
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService'
import { ArchivoSubida } from '@/domain/services/FileStorageService'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    },
                },
            }
        )
        
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Obtener datos del formulario
        const formData = await request.formData()
        const archivo = formData.get('archivo') as File
        const descripcion = formData.get('descripcion') as string
        const idTipoArchivo = parseInt(formData.get('idTipoArchivo') as string)
        const idVisibilidadArchivo = parseInt(formData.get('idVisibilidadArchivo') as string)
        const idRiesgo = formData.get('idRiesgo') ? parseInt(formData.get('idRiesgo') as string) : undefined
        const idAuditoria = formData.get('idAuditoria') ? parseInt(formData.get('idAuditoria') as string) : undefined
        const idHallazgo = formData.get('idHallazgo') ? parseInt(formData.get('idHallazgo') as string) : undefined

        // Validar archivo
        if (!archivo) {
            return NextResponse.json(
                { error: 'No se proporcionó ningún archivo' },
                { status: 400 }
            )
        }

        // Validar parámetros requeridos
        if (!idTipoArchivo || !idVisibilidadArchivo) {
            return NextResponse.json(
                { error: 'Tipo de archivo y visibilidad son requeridos' },
                { status: 400 }
            )
        }

        // Validar que al menos una asociación esté presente
        if (!idRiesgo && !idAuditoria && !idHallazgo) {
            return NextResponse.json(
                { error: 'Debe especificar al menos una asociación (riesgo, auditoría o hallazgo)' },
                { status: 400 }
            )
        }

        // Convertir archivo a formato esperado
        const buffer = await archivo.arrayBuffer()
        const archivoSubida: ArchivoSubida = {
            nombre: archivo.name,
            contenido: new Uint8Array(buffer),
            tipoMime: archivo.type,
            tamaño: archivo.size
        }

        // Obtener ID del usuario desde la base de datos
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('auth_user_id', user.id)
            .single()

        if (userError || !userData) {
            return NextResponse.json(
                { error: 'Usuario no encontrado en el sistema' },
                { status: 404 }
            )
        }

        // Inicializar servicios
        const evidenciaRepository = new EvidenciaRepository(supabase)
        const tipoArchivoRepository = new TipoArchivoRepository(supabase)
        const visibilidadArchivoRepository = new VisibilidadArchivoRepository(supabase)
        const storageService = new SupabaseStorageService(supabase)
        
        const fileService = new FileManagementService(
            evidenciaRepository,
            tipoArchivoRepository,
            visibilidadArchivoRepository,
            storageService
        )

        // Subir archivo
        const resultado = await fileService.subirArchivo({
            archivo: archivoSubida,
            descripcion,
            idTipoArchivo,
            idVisibilidadArchivo,
            idUsuario: userData.id_usuario,
            idRiesgo,
            idAuditoria,
            idHallazgo
        })

        return NextResponse.json({
            success: true,
            data: {
                id: resultado.evidencia.getIdEvidencia(),
                nombreOriginal: resultado.evidencia.getNombreArchivoOriginal(),
                url: resultado.url,
                tamaño: resultado.evidencia.getTamañoEnMB(),
                extension: resultado.evidencia.getExtension(),
                fechaSubida: resultado.evidencia.getFechaSubidaArchivo()
            },
            message: resultado.mensaje
        })

    } catch (error: any) {
        console.error('Error al subir archivo:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    },
                },
            }
        )
        
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Obtener parámetros de consulta
        const { searchParams } = new URL(request.url)
        const idRiesgo = searchParams.get('idRiesgo') ? parseInt(searchParams.get('idRiesgo')!) : undefined
        const idAuditoria = searchParams.get('idAuditoria') ? parseInt(searchParams.get('idAuditoria')!) : undefined
        const idHallazgo = searchParams.get('idHallazgo') ? parseInt(searchParams.get('idHallazgo')!) : undefined
        const limite = parseInt(searchParams.get('limite') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Obtener ID del usuario
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('auth_user_id', user.id)
            .single()

        if (userError || !userData) {
            return NextResponse.json(
                { error: 'Usuario no encontrado en el sistema' },
                { status: 404 }
            )
        }

        // Inicializar servicios
        const evidenciaRepository = new EvidenciaRepository(supabase)
        const tipoArchivoRepository = new TipoArchivoRepository(supabase)
        const visibilidadArchivoRepository = new VisibilidadArchivoRepository(supabase)
        const storageService = new SupabaseStorageService(supabase)
        
        const fileService = new FileManagementService(
            evidenciaRepository,
            tipoArchivoRepository,
            visibilidadArchivoRepository,
            storageService
        )

        // Buscar evidencias
        const filtros = {
            idRiesgo,
            idAuditoria,
            idHallazgo
        }

        const resultado = await fileService.buscarEvidencias(
            filtros,
            userData.id_usuario,
            limite,
            offset
        )

        const evidenciasFormateadas = resultado.evidencias.map(evidencia => ({
            id: evidencia.getIdEvidencia(),
            nombreOriginal: evidencia.getNombreArchivoOriginal(),
            descripcion: evidencia.getDescripcionEvidencia(),
            tamaño: evidencia.getTamañoEnMB(),
            extension: evidencia.getExtension(),
            fechaSubida: evidencia.getFechaSubidaArchivo(),
            idUsuarioSubio: evidencia.getIdUsuarioSubio(),
            idRiesgo: evidencia.getIdRiesgo(),
            idAuditoria: evidencia.getIdAuditoria(),
            idHallazgo: evidencia.getIdHallazgo(),
            esImagen: evidencia.esImagen(),
            esPDF: evidencia.esPDF(),
            esDocumento: evidencia.esDocumento()
        }))

        return NextResponse.json({
            success: true,
            data: {
                evidencias: evidenciasFormateadas,
                total: resultado.total,
                limite,
                offset
            }
        })

    } catch (error: any) {
        console.error('Error al obtener evidencias:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}