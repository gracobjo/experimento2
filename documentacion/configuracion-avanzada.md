# ⚙️ Configuración Avanzada

## 🔧 Configuración de Base de Datos

### PostgreSQL Avanzado

#### Configuración de Rendimiento
```sql
-- Ajustar configuración para mejor rendimiento
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

#### Backup y Restauración
```bash
# Backup completo
pg_dump -U despacho_user -d despacho_abogados > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U despacho_user -d despacho_abogados < backup_20241201.sql

# Backup automático con cron
0 2 * * * pg_dump -U despacho_user -d despacho_abogados > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Configuración de Prisma

#### Optimización de Consultas
```typescript
// En tu servicio Prisma
const expedientes = await prisma.expediente.findMany({
  include: {
    client: true,
    lawyer: true,
    documents: {
      take: 10, // Limitar documentos
      orderBy: { uploadedAt: 'desc' }
    }
  },
  where: {
    status: 'ABIERTO'
  }
});
```

#### Migraciones Personalizadas
```bash
# Crear migración personalizada
npx prisma migrate dev --name add_custom_indexes

# Ejecutar migración en producción
npx prisma migrate deploy

# Resetear base de datos
npx prisma migrate reset
```

## 🔐 Configuración de Seguridad

### JWT Avanzado
```typescript
// En auth.service.ts
const token = this.jwtService.sign(
  { 
    userId: user.id, 
    role: user.role,
    permissions: user.permissions 
  },
  { 
    expiresIn: '24h',
    issuer: 'despacho-app',
    audience: 'despacho-users'
  }
);
```

### CORS Configuración
```typescript
// En main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'https://tu-dominio.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

### Rate Limiting
```bash
npm install @nestjs/throttler
```

```typescript
// En app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
})
```

## 📧 Configuración de Email

### SMTP Avanzado
```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="Despacho Legal <noreply@tudominio.com>"
```

### Plantillas de Email
```typescript
// Crear plantillas HTML personalizadas
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .header { background: #2c3e50; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background: #ecf0f1; padding: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Despacho Legal</h1>
    </div>
    <div class="content">
        <p>Hola ${user.name},</p>
        <p>${message}</p>
    </div>
    <div class="footer">
        <p>© 2024 Despacho Legal. Todos los derechos reservados.</p>
    </div>
</body>
</html>
`;
```

## 🤖 Configuración del Chatbot

### Modelos de IA Personalizados
```python
# En main_improved.py
import spacy

# Cargar modelo español
nlp = spacy.load("es_core_news_sm")

# Entrenar modelo personalizado
def train_custom_model():
    # Configurar entrenamiento personalizado
    config = {
        "pipeline": ["tagger", "parser", "ner"],
        "lang": "es",
        "components": {
            "ner": {
                "labels": ["CASO", "CLIENTE", "ABOGADO", "FECHA"]
            }
        }
    }
    return config
```

### Configuración de FastAPI
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Chatbot Legal API",
    description="API para el chatbot de asistencia legal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎨 Configuración del Frontend

### Variables de Entorno Avanzadas
```env
# frontend/.env
VITE_API_URL=http://localhost:3000
VITE_CHATBOT_URL=http://localhost:8000
VITE_APP_NAME="Despacho Legal"
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Configuración de Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  }
})
```

### Configuración de Tailwind CSS
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        legal: {
          blue: '#1e40af',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        'legal': ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
```

## 📊 Monitoreo y Logs

### Configuración de Logs
```typescript
// En main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Application');

// Configurar Winston para logs
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});
```

### Health Checks
```typescript
// En app.controller.ts
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await this.checkDatabaseConnection()
  };
}
```

## 🚀 Optimización de Rendimiento

### Caché con Redis
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
```

```typescript
// En app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600, // 10 minutos
    }),
  ],
})
```

### Compresión
```bash
npm install compression
```

```typescript
// En main.ts
import * as compression from 'compression';

app.use(compression());
```

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
          
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
          
      - name: Build
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build
          
      - name: Deploy
        run: |
          # Comandos de despliegue
```

## 📈 Métricas y Analytics

### Google Analytics
```typescript
// En App.tsx
import ReactGA from 'react-ga4';

ReactGA.initialize('GA-XXXXXXXXX');

function App() {
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);
  
  return (
    // Tu aplicación
  );
}
```

### Métricas Personalizadas
```typescript
// En tu servicio
@Injectable()
export class MetricsService {
  private metrics = {
    totalUsers: 0,
    activeCases: 0,
    appointmentsToday: 0
  };

  incrementMetric(key: string) {
    this.metrics[key]++;
  }

  getMetrics() {
    return this.metrics;
  }
}
``` 