import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { FileManagementService } from '@/application/services/FileManagementService'
import { EvidenciaRepository, TipoArchivoRepository, VisibilidadArchivoRepository } from '@/infrastructure/repositories/EvidenciaRepository'
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService'

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

        const idEvidencia = parseInt(params.id)
        if (isNaN(idEvidencia)) {
            return NextResponse.json(
                { error: 'ID de evidencia inválido' },
                { status: 400 }
            )
        }

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

        // Verificar si es una solicitud de descarga
        const { searchParams } = new URL(request.url)
        const download = searchParams.get('download') === 'true'

        if (download) {
            // Descargar archivo
            const resultado = await fileService.descargarArchivo(idEvidencia, userData.id_usuario)
            
            const headers = new Headers()
            headers.set('Content-Type', resultado.tipoMime)
            headers.set('Content-Disposition', `attachment; filename="${resultado.nombreOriginal}"`)
            
            return new NextResponse(resultado.archivo, { headers })
        } else {
            // Obtener información de la evidencia
            const evidencia = await evidenciaRepository.obtenerPorId(idEvidencia)
            if (!evidencia) {
                return NextResponse.json(
                    { error: 'Evidencia no encontrada' },
                    { status: 404 }
                )
            }

            // Verificar permisos
            const tienePermiso = await evidenciaRepository.validarPermisoAcceso(idEvidencia, userData.id_usuario)
            if (!tienePermiso) {
                return NextResponse.json(
                    { error: 'No tiene permisos para acceder a este archivo' },
                    { status: 403 }
                )
            }

            return NextResponse.json({
                success: true,
                data: {
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
                    esDocumento: evidencia.esDocumento(),
                    url: evidencia.getUrlAlmacenamientoArchivo()
                }
            })
        }

    } catch (error: any) {
        console.error('Error al procesar archivo:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        const idEvidencia = parseInt(params.id)
        if (isNaN(idEvidencia)) {
            return NextResponse.json(
                { error: 'ID de evidencia inválido' },
                { status: 400 }
            )
        }

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

        // Eliminar archivo
        await fileService.eliminarArchivo(idEvidencia, userData.id_usuario)

        return NextResponse.json({
            success: true,
            message: 'Archivo eliminado exitosamente'
        })

    } catch (error: any) {
        console.error('Error al eliminar archivo:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}