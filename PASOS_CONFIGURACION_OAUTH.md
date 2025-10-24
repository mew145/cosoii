# 🔧 Pasos para Completar la Configuración OAuth

## ✅ Estado Actual
- ✅ Variables de entorno configuradas correctamente
- ✅ Código de la aplicación actualizado
- ✅ Client IDs configurados
- ❌ **Falta configurar Supabase Dashboard**

## 🚀 Pasos Siguientes

### 1. Configurar Supabase Dashboard

#### Abrir Dashboard
Ve a: **https://supabase.com/dashboard/project/prcsicfnvyaoxwfrjnky**

#### Authentication > Settings
1. **Site URL**: `http://localhost:3000`
2. **Redirect URLs**: `http://localhost:3000/api/auth/callback`

#### Authentication > Providers

##### Google OAuth
1. ✅ **Enable Google provider**
2. **Client ID**: `452477689273-1ip2lpmauq66j8fggqqil2j3sond2p11.apps.googleusercontent.com`
3. **Client Secret**: [Necesitas obtenerlo de Google Cloud Console]

##### GitHub OAuth  
1. ✅ **Enable GitHub provider**
2. **Client ID**: `Ov23liAcsF0PwdD9L62w`
3. **Client Secret**: [Necesitas obtenerlo de GitHub Developer Settings]

### 2. Obtener Client Secrets

#### Google Cloud Console
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca tu OAuth 2.0 Client ID
3. Copia el **Client Secret**
4. Pégalo en Supabase Dashboard

#### GitHub Developer Settings
1. Ve a: https://github.com/settings/developers
2. Busca tu OAuth App
3. Genera un nuevo **Client Secret**
4. Pégalo en Supabase Dashboard

### 3. Configurar URLs de Callback en Proveedores

#### En Google Cloud Console
- **Authorized JavaScript origins**: `http://localhost:3000`
- **Authorized redirect URIs**: `https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback`

#### En GitHub Developer Settings
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback`

### 4. Probar la Configuración

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Abrir en el navegador
http://localhost:3000/auth/login

# Hacer clic en "Iniciar sesión con Google"
```

## 🐛 Solución de Problemas

### Si aparece "Error procesando autenticación":
1. Verifica que los proveedores estén habilitados en Supabase
2. Verifica que los Client Secrets estén configurados
3. Verifica que las URLs de callback coincidan exactamente

### Si aparece "Invalid redirect URL":
1. Verifica que `http://localhost:3000/api/auth/callback` esté en Redirect URLs de Supabase
2. Verifica que `https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback` esté en el proveedor OAuth

### Para debug:
- El componente `OAuthDebug` aparecerá en la esquina inferior derecha en desarrollo
- Revisa la consola del navegador para errores detallados
- Ejecuta `node scripts/check-supabase-config.js` para verificar configuración

## 📝 Checklist Final

- [ ] Site URL configurada en Supabase
- [ ] Redirect URLs configuradas en Supabase  
- [ ] Google OAuth habilitado con Client ID y Secret
- [ ] GitHub OAuth habilitado con Client ID y Secret
- [ ] URLs de callback configuradas en Google Cloud Console
- [ ] URLs de callback configuradas en GitHub Developer Settings
- [ ] Servidor de desarrollo ejecutándose
- [ ] Login con Google funcionando

## 🎯 Resultado Esperado

Después de completar estos pasos:
1. El login con Google debería funcionar sin errores
2. Los usuarios nuevos serán redirigidos a `/auth/complete-profile`
3. Los usuarios existentes irán directamente al dashboard
4. El componente de debug mostrará el estado de la sesión

¡Una vez completados estos pasos, el error "Error procesando autenticación" debería desaparecer!