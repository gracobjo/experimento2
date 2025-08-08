# 🔧 Guía para Solucionar Error CORS

## 🚨 Problema Identificado

**Error actual:**
```
Access to XMLHttpRequest at 'https://experimento2-production.up.railway.app/socket.io/?EIO=4&transport=polling&t=zebfun2u' from origin 'https://experimento2-fenm.vercel.app' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin.
```

## 📋 Análisis del Problema

### ¿Qué está pasando?
1. **Frontend**: Hosted on Vercel at `https://experimento2-fenm.vercel.app`
2. **Backend**: Hosted on Railway at `https://experimento2-production.up.railway.app`
3. **CORS Issue**: El backend solo permite `http://localhost:5173` en lugar del dominio de Vercel

### ¿Por qué ocurre?
- El backend está usando la configuración CORS por defecto
- La variable de entorno `CORS_ORIGIN` no está configurada en Railway
- Los WebSockets también necesitan configuración CORS específica

## 🛠️ Solución Implementada

### 1. Cambios en el Código

#### `backend/src/main.ts`
```typescript
// Antes
app.enableCors({
  origin: [
    'http://localhost:5173',
    // ... otros orígenes
  ],
});

// Después
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
      'https://experimento2-fenm.vercel.app',
      'https://experimento2-production.up.railway.app',
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.railway\.app$/
    ];

app.enableCors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
});
```

#### `backend/src/chat/chat.gateway.ts`
```typescript
// Antes
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})

// Después
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',')
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://experimento2-fenm.vercel.app',
          'https://experimento2-production.up.railway.app',
          /^https:\/\/.*\.vercel\.app$/,
          /^https:\/\/.*\.railway\.app$/
        ],
    credentials: true,
  },
})
```

### 2. Configuración de Variables de Entorno

#### En Railway Dashboard:
1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. Ve a la pestaña "Variables"
4. Agrega/modifica la variable:
   ```
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://experimento2-fenm.vercel.app,https://experimento2-production.up.railway.app
   ```

#### Usando Railway CLI:
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Configurar CORS
railway variables set CORS_ORIGIN="http://localhost:5173,http://localhost:3000,https://experimento2-fenm.vercel.app,https://experimento2-production.up.railway.app"

# Reiniciar servicio
railway service restart
```

#### Usando el script automático:
```bash
node scripts/fix-cors-railway.js
```

## 🔄 Pasos para Aplicar la Solución

### Opción 1: Automático (Recomendado)
```bash
# 1. Hacer commit de los cambios
git add .
git commit -m "fix: update CORS configuration for production"
git push

# 2. Ejecutar script de configuración
node scripts/fix-cors-railway.js
```

### Opción 2: Manual
1. **Railway Dashboard:**
   - Ve a tu proyecto en Railway
   - Selecciona el servicio backend
   - Variables → Agregar `CORS_ORIGIN`
   - Valor: `http://localhost:5173,http://localhost:3000,https://experimento2-fenm.vercel.app,https://experimento2-production.up.railway.app`
   - Reiniciar servicio

2. **Verificar cambios:**
   - Esperar 2-3 minutos para que se apliquen los cambios
   - Probar la conexión desde el frontend

## 🧪 Verificación

### 1. Verificar Headers CORS
```bash
curl -H "Origin: https://experimento2-fenm.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://experimento2-production.up.railway.app/api/auth/login
```

### 2. Verificar WebSocket Connection
```javascript
// En la consola del navegador
const socket = io('https://experimento2-production.up.railway.app', {
  withCredentials: true,
  auth: {
    user: { id: 'test', role: 'CLIENTE', name: 'Test User' }
  }
});

socket.on('connect', () => {
  console.log('✅ WebSocket conectado correctamente');
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión WebSocket:', error);
});
```

## 🚀 Despliegue

### Railway
```bash
# Los cambios se despliegan automáticamente al hacer push
git push origin main
```

### Verificar logs
```bash
railway logs
```

## 🔍 Troubleshooting

### Si el error persiste:

1. **Verificar variables de entorno:**
   ```bash
   railway variables list
   ```

2. **Verificar logs del backend:**
   ```bash
   railway logs --tail
   ```

3. **Probar con curl:**
   ```bash
   curl -I -H "Origin: https://experimento2-fenm.vercel.app" \
        https://experimento2-production.up.railway.app/api/health
   ```

4. **Verificar configuración de Railway:**
   - Asegúrate de que el servicio esté en la rama correcta
   - Verifica que el build esté exitoso

### Errores comunes:

1. **"CORS_ORIGIN not set"**
   - Verificar que la variable esté configurada en Railway
   - Reiniciar el servicio después de cambiar variables

2. **"WebSocket connection failed"**
   - Verificar que el gateway use la misma configuración CORS
   - Asegurar que las credenciales estén habilitadas

3. **"Still getting localhost in headers"**
   - Esperar 2-3 minutos para que los cambios se propaguen
   - Verificar que el servicio se haya reiniciado

## 📝 Notas Importantes

- **Desarrollo local**: Los cambios incluyen `http://localhost:5173` para desarrollo
- **Producción**: Incluye todos los dominios de Vercel y Railway
- **WebSockets**: Configuración CORS específica para Socket.IO
- **Seguridad**: Solo permite orígenes específicos, no `*`

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en Railway
- [ ] Servicio reiniciado en Railway
- [ ] Frontend puede conectarse al backend
- [ ] WebSockets funcionan correctamente
- [ ] Chat en tiempo real funciona
- [ ] No hay errores CORS en la consola del navegador
