// =============================================
// PÁGINA COMPLETAR PERFIL
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { createClient } from '@/lib/supabase/client'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    departamento: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const authService = new AuthService()
  const supabase = createClient()

  // Cargar datos del usuario actual
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUserEmail(user.email || '')
        
        // Cargar datos existentes si los hay
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_usuario_auth', user.id)
          .single()

        if (userData) {
          setFormData({
            nombres: userData.nombres_usuario || '',
            apellidos: userData.apellidos_usuario || '',
            ci: userData.ci_usuario || '',
            telefono: userData.telefono_usuario || '',
            departamento: userData.departamento_usuario || ''
          })
        }

      } catch (error) {
        console.error('Error cargando datos:', error)
        setError('Error cargando datos del usuario')
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar errores al escribir
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validar campos requeridos
      if (!formData.nombres.trim()) {
        setError('Los nombres son requeridos')
        setLoading(false)
        return
      }

      if (!formData.apellidos.trim()) {
        setError('Los apellidos son requeridos')
        setLoading(false)
        return
      }

      if (!formData.ci.trim()) {
        setError('El CI es requerido')
        setLoading(false)
        return
      }

      // Validar formato de CI (básico)
      if (!/^\d{7,8}$/.test(formData.ci.trim())) {
        setError('El CI debe tener 7 u 8 dígitos')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Usuario no encontrado')
        setLoading(false)
        return
      }

      // Verificar si el CI ya existe
      const { data: userWithCI } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('ci_usuario', formData.ci.trim())
        .neq('id_usuario_auth', user.id)
        .single()

      if (userWithCI) {
        setError('El CI ya está registrado por otro usuario')
        setLoading(false)
        return
      }

      console.log('📝 Actualizando perfil del usuario...')
      console.log('👤 Auth ID:', user.id)
      
      // Primero verificar si el usuario existe
      console.log('🔍 Verificando si el usuario existe en BD...')
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', user.id)
        .single()

      console.log('📋 Usuario existente:', existingUser)
      console.log('❓ Error de verificación:', checkError)

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('❌ Usuario no existe en BD, creando...')
          
          // Crear el usuario si no existe
          const email = user.email
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const [nombres = '', ...apellidosParts] = fullName.split(' ')
          const apellidos = apellidosParts.join(' ') || ''

          // Intentar con el esquema nuevo primero, luego con el original
          let newUser, createError
          
          // Intentar con columnas nuevas (nombres_usuario, etc.)
          const newSchemaData = {
            id_usuario_auth: user.id,
            nombres_usuario: formData.nombres.trim(),
            apellidos_usuario: formData.apellidos.trim(),
            email_usuario: email,
            ci_usuario: formData.ci.trim(),
            telefono_usuario: formData.telefono.trim() || null,
            departamento_usuario: formData.departamento.trim() || null,
            rol_usuario: 'auditor',
            activo: true,
            fecha_registro: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
          }
          
          const result1 = await supabase
            .from('usuarios')
            .insert(newSchemaData)
            .select()
            .single()
          
          if (result1.error && result1.error.message.includes('column') && result1.error.message.includes('does not exist')) {
            console.log('🔄 Esquema nuevo no funciona, probando esquema original...')
            
            // Intentar con columnas originales (nombres, apellido_paterno, etc.)
            const originalSchemaData = {
              id_usuario_auth: user.id,
              nombres: formData.nombres.trim(),
              apellido_paterno: formData.apellidos.trim().split(' ')[0] || 'OAuth',
              apellido_materno: formData.apellidos.trim().split(' ')[1] || null,
              correo_electronico: email,
              ci: formData.ci.trim(),
              telefono_contacto: formData.telefono.trim() || null,
              // Campos opcionales del esquema original
              password_hash: null,
              fecha_ingreso_empresa: null,
              estado_usuario: 'activo',
              provider_oauth: user.app_metadata?.provider || 'google',
              provider_id: user.id,
              email_verificado: true
            }
            
            const result2 = await supabase
              .from('usuarios')
              .insert(originalSchemaData)
              .select()
              .single()
            
            newUser = result2.data
            createError = result2.error
          } else {
            newUser = result1.data
            createError = result1.error
          }

          if (createError) {
            console.error('❌ Error creando usuario:', createError)
            setError(`Error creando usuario: ${createError.message}`)
            setLoading(false)
            return
          }

          console.log('✅ Usuario creado exitosamente:', newUser)
          setSuccess('Perfil completado exitosamente. Redirigiendo...')
          
          setTimeout(() => {
            console.log('🔄 Redirigiendo al dashboard...')
            window.location.href = '/dashboard'
          }, 2000)
          return
        } else {
          console.error('❌ Error verificando usuario:', checkError)
          setError(`Error verificando usuario: ${checkError.message}`)
          setLoading(false)
          return
        }
      }

      console.log('📋 Datos a actualizar:', {
        nombres_usuario: formData.nombres.trim(),
        apellidos_usuario: formData.apellidos.trim(),
        ci_usuario: formData.ci.trim(),
        activo: true
      })

      // Actualizar el perfil del usuario existente
      const { data: updatedData, error: updateError } = await supabase
        .from('usuarios')
        .update({
          nombres_usuario: formData.nombres.trim(),
          apellidos_usuario: formData.apellidos.trim(),
          ci_usuario: formData.ci.trim(),
          telefono_usuario: formData.telefono.trim() || null,
          departamento_usuario: formData.departamento.trim() || null,
          activo: true, // Activar el usuario
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario_auth', user.id)
        .select()

      console.log('📊 Resultado actualización:', { updatedData, updateError })

      if (updateError) {
        console.error('❌ Error actualizando:', updateError)
        setError(`Error actualizando el perfil: ${updateError.message}`)
        setLoading(false)
        return
      }

      if (!updatedData || updatedData.length === 0) {
        console.error('❌ No se actualizó ningún registro')
        setError('No se pudo actualizar el perfil. Usuario no encontrado.')
        setLoading(false)
        return
      }

      console.log('✅ Perfil actualizado exitosamente:', updatedData[0])
      setSuccess('Perfil completado exitosamente. Redirigiendo...')
      
      // Verificar que la actualización fue exitosa antes de redirigir
      const { data: verifyData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', user.id)
        .single()

      console.log('🔍 Verificación post-actualización:', verifyData)
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        console.log('🔄 Redirigiendo al dashboard...')
        // Usar window.location para forzar una recarga completa
        window.location.href = '/dashboard'
      }, 2000)

    } catch (error) {
      console.error('Error completando perfil:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Completar Perfil</CardTitle>
          <CardDescription>
            Por favor completa tu información para acceder al sistema
          </CardDescription>
          {userEmail && (
            <p className="text-sm text-muted-foreground mt-2">
              Conectado como: {userEmail}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                name="nombres"
                type="text"
                placeholder="Tus nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input
                id="apellidos"
                name="apellidos"
                type="text"
                placeholder="Tus apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ci">Cédula de Identidad *</Label>
              <Input
                id="ci"
                name="ci"
                type="text"
                placeholder="12345678"
                value={formData.ci}
                onChange={handleInputChange}
                required
                disabled={loading}
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="70123456"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                name="departamento"
                type="text"
                placeholder="Ej: Sistemas, Administración, etc."
                value={formData.departamento}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando perfil...
                </>
              ) : (
                'Completar Perfil'
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              * Campos requeridos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}