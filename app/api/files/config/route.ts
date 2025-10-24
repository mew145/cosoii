import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { FileManagementService } from '@/application/services/FileManagementService'
import { EvidenciaRepository, TipoArchivoRepository, VisibilidadArchivoRepository } from '@/infrastructure/repositories/EvidenciaRepository'
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService'

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

        // Obtener configuración
        const [tiposArchivo, visibilidades] = await Promise.all([
            fileService.obtenerTiposArchivo(),
            fileService.obtenerVisibilidades()
        ])

        const tiposFormateados = tiposArchivo.map(tipo => ({
            id: tipo.getIdTipoArchivo(),
            nombre: tipo.getNombreTipoArchivo(),
            descripcion: tipo.getDescripcionTipoArchivo(),
            extensionesPermitidas: tipo.getExtensionesArray()
        }))

        const visibilidadesFormateadas = visibilidades.map(visibilidad => ({
            id: visibilidad.getIdVisibilidadArchivo(),
            nombre: visibilidad.getNombreVisibilidadArchivo(),
            descripcion: visibilidad.getDescripcionVisibilidadArchivo(),
            esPublico: visibilidad.esPublico(),
            esPrivado: visibilidad.esPrivado(),
            esConfidencial: visibilidad.esConfidencial()
        }))

        return NextResponse.json({
            success: true,
            data: {
                tiposArchivo: tiposFormateados,
                visibilidades: visibilidadesFormateadas,
                configuracion: {
                    tamañoMaximoMB: 100,
                    extensionesPermitidas: [
                        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
                        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
                        'txt', 'csv', 'zip', 'rar', '7z'
                    ]
                }
            }
        })

    } catch (error: any) {
        console.error('Error al obtener configuración:', error)
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        )
    }
}