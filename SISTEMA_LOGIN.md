# Sistema de Login y Autenticación

## Descripción General

El sistema de login ha sido completamente implementado con autenticación avanzada, gestión de usuarios, roles y permisos. Incluye soporte para OAuth y un sistema completo de autorización.

## 🚀 Cómo Probar el Sistema de Login

### 1. Configuración Inicial

Antes de probar el login, asegúrate de que la base de datos esté configurada:

```bash
# 1. Ejecutar las políticas RLS
psql -h your-supabase-host -U postgres -d postgres -f supabase-rls-policies.sql

# 2. Insertar permisos predeterminados
psql -h your-supabase-host -U postgres -d postgres -f supabase-default-permissions.sql
```

### 2. Crear Usuario Administrador

Puedes crear un usuario administrador de dos formas:

#### Opción A: Usando Supabase Dashboard
1. Ve a Authentication > Users en tu dashboard de Supabase
2. Crea un nuevo usuario con email y contraseña
3. Copia el UUID del usuario
4. Ejecuta este SQL en el SQL Editor:

```sql
INSERT INTO usuarios (
    id_usuario_auth,
    nombres_usuario,
    apellidos_usuario,
    email_usuario,
    ci_usuario,
    rol_usuario,
    activo
) VALUES (
    'UUID_DEL_USUARIO_AQUI',
    'Admin',
    'Sistema',
    'admin@deltacons.com',
    '12345678',
    'administrador',
    true
);
```

#### Opción B: Usando la API de Registro
1. Primero crea un usuario temporal como administrador
2. Usa la API `/api/auth/register` para crear más usuarios

### 3. Acceder al Sistema

1. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

2. **Ve a la página de login:**
```
http://localhost:3000/auth/login
```

3. **Credenciales de prueba:**
- Email: `admin@deltacons.com`
- Contraseña: La que configuraste en Supabase

### 4. Funcionalidades Disponibles

#### 🔐 Autenticación
- **Login con email/contraseña**: Formulario completo con validaciones
- **OAuth**: Soporte para Google, GitHub y LinkedIn
- **Recordar sesión**: Checkbox para mantener sesión activa
- **Recuperar contraseña**: Enlace para reset de contraseña
- **Logout**: Cierre de sesión seguro

#### 👥 Gestión de Usuarios
- **Ver usuarios**: Lista paginada con filtros
- **Crear usuarios**: Solo administradores
- **Editar usuarios**: Actualización de datos y roles
- **Activar/Desactivar**: Control de estado de usuarios
- **Eliminar usuarios**: Soft delete con auditoría

#### 🛡️ Sistema de Permisos
- **7 roles predefinidos**: Desde Administrador hasta Consultor
- **Permisos granulares**: Por módulo y acción
- **Asignación automática**: Permisos por defecto según rol
- **Validación en tiempo real**: Verificación de permisos

## 📋 APIs Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/register` - Registrar usuario (solo admin)
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/update-password` - Actualizar contraseña
- `GET /api/auth/callback` - Callback OAuth

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/[id]` - Obtener usuario específico
- `PUT /api/users/[id]` - Actualizar usuario
- `DELETE /api/users/[id]` - Eliminar usuario

## 🔧 Configuración OAuth

Para habilitar OAuth, configura los providers en Supabase:

### Google OAuth
1. Ve a Google Cloud Console
2. Crea un proyecto y habilita Google+ API
3. Configura OAuth consent screen
4. Crea credenciales OAuth 2.0
5. En Supabase Dashboard > Authentication > Providers:
   - Habilita Google
   - Agrega Client ID y Client Secret
   - URL de redirección: `https://your-project.supabase.co/auth/v1/callback`

### GitHub OAuth
1. Ve a GitHub Settings > Developer settings > OAuth Apps
2. Crea una nueva OAuth App
3. En Supabase Dashboard > Authentication > Providers:
   - Habilita GitHub
   - Agrega Client ID y Client Secret

### LinkedIn OAuth
1. Ve a LinkedIn Developer Portal
2. Crea una nueva aplicación
3. En Supabase Dashboard > Authentication > Providers:
   - Habilita LinkedIn (OIDC)
   - Agrega Client ID y Client Secret

## 🎯 Roles y Permisos

### Roles Disponibles

1. **Administrador** (Nivel 1)
   - Acceso completo al sistema
   - Gestión de usuarios y configuraciones
   - Todos los permisos

2. **Auditor Senior** (Nivel 2)
   - Supervisión de auditorías
   - Aprobación de evaluaciones
   - Gestión de equipos

3. **Oficial de Seguridad** (Nivel 2)
   - Especialista ISO 27001
   - Gestión de activos y controles
   - Investigación de incidentes

4. **Auditor Junior** (Nivel 3)
   - Ejecución de auditorías
   - Registro de hallazgos
   - Sin permisos de eliminación

5. **Gerente de Proyecto** (Nivel 3)
   - Gestión de proyectos específicos
   - Evaluación de riesgos del proyecto
   - Sin permisos de eliminación

6. **Analista de Riesgos** (Nivel 4)
   - Análisis de riesgos
   - Generación de reportes
   - Acceso limitado

7. **Consultor** (Nivel 5)
   - Consultor externo
   - Acceso básico
   - Solo ver, crear y editar

### Módulos y Permisos

- **Usuarios**: ver, crear, editar, eliminar, permisos
- **Riesgos**: ver, crear, editar, eliminar, evaluar, aprobar
- **Proyectos**: ver, crear, editar, eliminar, asignar
- **Activos**: ver, crear, editar, eliminar, clasificar, valorar
- **Controles**: ver, crear, editar, eliminar, implementar, evaluar
- **Incidentes**: ver, crear, editar, eliminar, investigar, cerrar
- **Auditoría**: ver, crear, editar, eliminar, aprobar, ejecutar
- **Reportes**: ver, exportar, ejecutivo, crear

## 🛠️ Desarrollo y Testing

### Estructura de Archivos

```
src/
├── application/services/
│   ├── AuthService.ts          # Servicio de autenticación
│   ├── UserService.ts          # Gestión de usuarios
│   ├── RoleService.ts          # Gestión de roles
│   └── PermissionService.ts    # Gestión de permisos
├── infrastructure/
│   ├── middleware/
│   │   └── AuthorizationMiddleware.ts  # Middleware de autorización
│   └── security/
│       └── ISO27001Policies.ts         # Políticas ISO 27001
├── presentation/
│   ├── hooks/
│   │   └── usePermissions.ts           # Hook de permisos
│   └── components/auth/
│       └── ProtectedRoute.tsx          # Componente de protección
app/
├── api/auth/                   # API routes de autenticación
└── auth/login/                 # Página de login
```

### Testing del Sistema

1. **Test de Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@deltacons.com","password":"tu_password"}'
```

2. **Test de Usuario Actual:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Test de Permisos:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Debugging

Para debuggear el sistema:

1. **Logs del servidor**: Revisa la consola de Next.js
2. **Logs de Supabase**: Ve al dashboard de Supabase > Logs
3. **Network tab**: Inspecciona las requests en DevTools
4. **RLS Policies**: Verifica que las políticas estén activas

## 🔒 Seguridad

### Características de Seguridad Implementadas

- **Row Level Security**: Políticas a nivel de base de datos
- **JWT Tokens**: Autenticación basada en tokens
- **Password Hashing**: Contraseñas hasheadas por Supabase
- **CORS Protection**: Configuración de CORS en APIs
- **Input Validation**: Validación de datos de entrada
- **SQL Injection Protection**: Uso de prepared statements
- **XSS Protection**: Sanitización de datos
- **CSRF Protection**: Tokens CSRF en formularios

### Mejores Prácticas

- Cambiar contraseñas por defecto
- Usar HTTPS en producción
- Configurar variables de entorno seguras
- Revisar logs de acceso regularmente
- Mantener Supabase actualizado
- Implementar rate limiting
- Configurar alertas de seguridad

## 🚀 Próximos Pasos

Una vez que el login esté funcionando, puedes:

1. **Crear más usuarios** con diferentes roles
2. **Probar los permisos** accediendo a diferentes secciones
3. **Configurar OAuth** para login social
4. **Implementar más módulos** del sistema
5. **Personalizar la UI** según necesidades

## 📞 Soporte

Si encuentras problemas:

1. Verifica la configuración de Supabase
2. Revisa los logs del servidor
3. Confirma que las políticas RLS estén activas
4. Verifica las variables de entorno
5. Consulta la documentación de Supabase

¡El sistema de login está listo para usar! 🎉