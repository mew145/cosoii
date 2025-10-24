# Configuración OAuth - Sistema de Gestión de Riesgos

## 🔧 Configuración en Supabase Dashboard

### 1. Acceder al Dashboard
Ve a: https://supabase.com/dashboard/project/prcsicfnvyaoxwfrjnky

### 2. Configurar URLs de Autenticación

#### Authentication > Settings
- **Site URL**: `http://localhost:3000` (desarrollo) / `https://tu-dominio.com` (producción)
- **Redirect URLs**: 
  - `http://localhost:3000/api/auth/callback` (desarrollo)
  - `https://tu-dominio.com/api/auth/callback` (producción)

### 3. Configurar Proveedores OAuth

#### Authentication > Providers

##### Google OAuth
1. Habilitar Google provider
2. Configurar:
   - **Client ID**: `452477689273-1ip2lpmauq66j8fggqqil2j3sond2p11.apps.googleusercontent.com`
   - **Client Secret**: (obtener de Google Cloud Console)

##### GitHub OAuth
1. Habilitar GitHub provider
2. Configurar:
   - **Client ID**: `Ov23liAcsF0PwdD9L62w`
   - **Client Secret**: (obtener de GitHub Developer Settings)

## 🔑 Configuración de Proveedores Externos

### Google Cloud Console
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Crear credenciales OAuth 2.0
3. Configurar URLs autorizadas:
   - **JavaScript origins**: `http://localhost:3000`, `https://tu-dominio.com`
   - **Redirect URIs**: 
     - `https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback`

### GitHub Developer Settings
1. Ve a: https://github.com/settings/developers
2. Crear nueva OAuth App
3. Configurar:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback`

## 🧪 Verificar Configuración

Ejecutar el script de diagnóstico:
```bash
node scripts/diagnose-oauth.js
```

## 🐛 Solución de Problemas Comunes

### Error: "Error procesando autenticación"
1. Verificar que las URLs de callback estén configuradas correctamente
2. Verificar que los proveedores OAuth estén habilitados en Supabase
3. Verificar que los Client ID y Secret sean correctos

### Error: "Invalid redirect URL"
1. Verificar que la URL de callback esté en la lista de URLs permitidas
2. Verificar que la URL coincida exactamente (incluyendo protocolo y puerto)

### Error: "Provider not enabled"
1. Verificar que el proveedor esté habilitado en Supabase Dashboard
2. Verificar que el Client ID y Secret estén configurados

## 📝 Notas Importantes

1. **Desarrollo vs Producción**: Asegúrate de configurar URLs diferentes para cada entorno
2. **HTTPS**: En producción, todas las URLs deben usar HTTPS
3. **Dominios**: Los dominios deben coincidir exactamente entre todas las configuraciones
4. **Secrets**: Nunca expongas los Client Secrets en el código frontend

## 🔄 Flujo OAuth Completo

1. Usuario hace clic en "Iniciar sesión con Google"
2. Aplicación redirige a Supabase OAuth endpoint
3. Supabase redirige a Google OAuth
4. Usuario autoriza en Google
5. Google redirige de vuelta a Supabase
6. Supabase redirige a `/api/auth/callback` con código
7. Callback intercambia código por sesión
8. Se crea/actualiza usuario en base de datos
9. Usuario es redirigido al dashboard o completar perfil