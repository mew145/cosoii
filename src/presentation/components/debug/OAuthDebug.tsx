// =============================================
// COMPONENTE DE DEBUG OAUTH
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { appConfig } from '@/lib/config'

interface OAuthDebugProps {
  show?: boolean
}

export function OAuthDebug({ show = process.env.NODE_ENV === 'development' }: OAuthDebugProps) {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (show) {
      checkSession()
    }
  }, [show])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSession(session)
      
      if (session?.user) {
        setUser(session.user)
        
        // Obtener datos del usuario desde la base de datos
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_usuario_auth', session.user.id)
          .single()
        
        if (userData) {
          setUser({ ...session.user, dbUser: userData })
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  const testOAuth = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        console.error(`${provider} OAuth error:`, error)
        alert(`Error: ${error.message}`)
      } else {
        console.log(`${provider} OAuth URL:`, data.url)
        if (data.url) {
          window.open(data.url, '_blank')
        }
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      alert(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearSession = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  if (!show) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">OAuth Debug</CardTitle>
        <CardDescription className="text-xs">
          Información de desarrollo
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs">
        {/* Estado de configuración */}
        <div>
          <h4 className="font-medium mb-1">Configuración</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <Badge variant={appConfig.supabase.url ? 'default' : 'destructive'}>
                {appConfig.supabase.url ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Google OAuth:</span>
              <Badge variant={appConfig.oauth.google.enabled ? 'default' : 'destructive'}>
                {appConfig.oauth.google.enabled ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>GitHub OAuth:</span>
              <Badge variant={appConfig.oauth.github.enabled ? 'default' : 'destructive'}>
                {appConfig.oauth.github.enabled ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estado de sesión */}
        <div>
          <h4 className="font-medium mb-1">Sesión</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Autenticado:</span>
              <Badge variant={session ? 'default' : 'secondary'}>
                {session ? '✓' : '✗'}
              </Badge>
            </div>
            {user && (
              <>
                <div className="text-xs text-muted-foreground">
                  Email: {user.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  Provider: {user.app_metadata?.provider}
                </div>
                {user.dbUser && (
                  <div className="text-xs text-muted-foreground">
                    DB User: {user.dbUser.nombres_usuario} {user.dbUser.apellidos_usuario}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkSession}
            className="w-full text-xs"
          >
            Verificar Sesión
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => testOAuth('google')}
              disabled={loading}
              className="text-xs"
            >
              Test Google
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => testOAuth('github')}
              disabled={loading}
              className="text-xs"
            >
              Test GitHub
            </Button>
          </div>
          
          {session && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={clearSession}
              className="w-full text-xs"
            >
              Cerrar Sesión
            </Button>
          )}
        </div>

        {/* URLs importantes */}
        <div>
          <h4 className="font-medium mb-1">URLs</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Callback: /api/auth/callback</div>
            <div>Complete: /auth/complete-profile</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}