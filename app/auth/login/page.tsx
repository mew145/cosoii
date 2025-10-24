// =============================================
// PÁGINA DE LOGIN - DELTA CONSULT LTDA
// Consultoría en Gestión de Riesgos
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
const Separator = ({ className }: { className?: string }) => (
  <div className={`h-[1px] w-full bg-slate-200 ${className || ''}`} />
)
import { Eye, EyeOff, Loader2, Shield, AlertTriangle, ArrowLeft } from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { BRAND_INFO } from '@/lib/constants/brand'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const authService = new AuthService()

  // Verificar si hay errores en la URL (de OAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated()
      if (isAuthenticated) {
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        router.push(redirectTo)
      }
    }
    checkAuth()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      })

      if (result.success) {
        setSuccess('Login exitoso. Redirigiendo...')
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          const redirectTo = searchParams.get('redirectTo') || '/dashboard'
          router.push(redirectTo)
        }, 1000)
      } else {
        setError(result.error || 'Error en el login')
      }

    } catch (error) {
      console.error('Error en login:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      setError('')

      const result = await authService.loginWithOAuth(
        provider,
        `${window.location.origin}/api/auth/callback`
      )

      if (!result.success) {
        setError(result.error || 'Error en autenticación OAuth')
        setLoading(false)
      }
      // Si es exitoso, la redirección se maneja automáticamente

    } catch (error) {
      console.error('Error en OAuth:', error)
      setError('Error en autenticación OAuth')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {BRAND_INFO.name}
                </h1>
                <p className="text-sm text-slate-600">{BRAND_INFO.tagline}</p>
              </div>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-xl border-slate-200">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Bienvenido</CardTitle>
            <CardDescription className="text-slate-800 font-semibold">
              Accede a tu cuenta de {BRAND_INFO.name}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <Shield className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">{success}</AlertDescription>
              </Alert>
            )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-800 font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-800 font-medium">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm text-slate-800 font-medium">
                  Recordarme
                </Label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* OAuth Section */}
          <div className="space-y-4 pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">O continúa con</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('https://linkedin.com/company/delta-consult-ltda', '_blank')}
                disabled={loading}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4 mr-1" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>

          </CardContent>

          <CardFooter className="text-center pt-6">
            <div className="w-full space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-500">
                  ¿Necesitas acceso al sistema?
                </p>
                <Link href="/auth/request-access" className="text-blue-600 hover:text-blue-700 font-medium">
                  Solicitar acceso →
                </Link>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400">
                  © 2024 {BRAND_INFO.fullName}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}