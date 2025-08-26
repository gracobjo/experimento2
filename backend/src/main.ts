import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Log temporal para debug de variables de entorno
  console.log('🔍 === VARIABLES DE ENTORNO ===');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO');
  console.log('STORAGE_TYPE:', process.env.STORAGE_TYPE);
  console.log('================================');

  // Configurar trust proxy para Railway y express-rate-limit
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Configurar timeouts
  app.use((req, res, next) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
  });
  
  // Configuración de CORS - debe ir ANTES de otros middleware
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8080',
        'https://experimento2-fenm.vercel.app',
        'https://experimento2-fenm-44u7rmivu-gracobjos-projects.vercel.app',
        'https://experimento2-production-54c0.up.railway.app',
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.railway\.app$/
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Middleware de logging para debug
  app.use((req, res, next) => {
    console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`🔍 Headers:`, req.headers);
    console.log(`🔍 Origin:`, req.headers.origin);
    console.log(`🔍 User-Agent:`, req.headers['user-agent']);
    
    // Log del body para requests POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      console.log(`🔍 Body:`, JSON.stringify(req.body, null, 2));
    }
    
    next();
  });
  
  // Configuración global de pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Security Headers - configuración más permisiva para desarrollo
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5173", "http://localhost:3000", "https://*.railway.app", "https://*.vercel.app", "https://*.netlify.app"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Rate Limiting - configuración mejorada para Railway
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10000, // hasta 10000 peticiones por IP cada minuto
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Agregar esta línea
  });
  app.use('/api/', limiter);

  // Stricter rate limiting for auth endpoints (desarrollo: mucho más permisivo)
  const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10000, // hasta 10000 intentos de login por IP cada minuto
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Agregar esta línea
  });
  app.use('/api/auth/', authLimiter);

  // Compression - excluir rutas de PDF para evitar corrupción de archivos binarios
  app.use(compression({
    filter: (req, res) => {
      // No comprimir rutas de PDF para evitar corrupción de archivos binarios
      if (req.url && req.url.includes('/pdf')) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Configuración de Swagger (debe ir ANTES del prefijo global)
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión Legal API')
    .setDescription(`
      API completa para el sistema de gestión de despacho de abogados.
      
      ## Funcionalidades Principales:
      
      ### 🔐 Autenticación y Usuarios
      - Registro e inicio de sesión de usuarios
      - Gestión de roles (ADMIN, ABOGADO, CLIENTE)
      - Recuperación de contraseñas
      
      ### 📋 Gestión de Casos
      - Creación y gestión de expedientes
      - Asignación de casos a abogados
      - Seguimiento del estado de casos
      
      ### 📅 Citas y Agendas
      - Programación de citas entre abogados y clientes
      - Gestión de calendarios
      - Notificaciones de citas
      
      ### 📝 Documentos
      - Subida y gestión de documentos
      - Organización por expedientes
      - Control de acceso por roles
      
      ### ✅ Tareas y Seguimiento
      - Creación y asignación de tareas
      - Seguimiento de estado y prioridades
      - Notificaciones de tareas vencidas
      
      ### 💰 Facturación
      - Generación de facturas electrónicas
      - Gestión de provisiones de fondos
      - Firma digital de documentos
      
      ### 💬 Chat y Comunicación
      - Mensajería entre usuarios
      - Chat con IA para asistencia
      - Historial de conversaciones
      
      ### 📊 Reportes y Analytics
      - Estadísticas de casos y tareas
      - Reportes de productividad
      - Métricas de abogados
      
      ### ⚙️ Administración
      - Gestión de usuarios y permisos
      - Configuración de parámetros del sistema
      - Monitoreo y auditoría
    `)
    .setVersion('1.0.0')
    .addTag('auth', 'Autenticación y gestión de usuarios')
    .addTag('users', 'Gestión de usuarios y perfiles')
    .addTag('cases', 'Gestión de casos y expedientes')
    .addTag('appointments', 'Gestión de citas y agendas')
    .addTag('documents', 'Gestión de documentos')
    .addTag('tasks', 'Gestión de tareas y seguimiento')
    .addTag('invoices', 'Facturación electrónica')
    .addTag('provision-fondos', 'Gestión de provisiones de fondos')
    .addTag('chat', 'Chat y mensajería')
    .addTag('reports', 'Reportes y estadísticas')
    .addTag('admin', 'Funciones administrativas')
    .addTag('parametros', 'Configuración de parámetros del sistema')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Prefijo global para la API (excluir health endpoints)
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'system-health', method: RequestMethod.GET },
      { path: 'connectivity', method: RequestMethod.GET },
      { path: 'debug-env', method: RequestMethod.GET },
      { path: 'test-health', method: RequestMethod.GET },
      { path: 'api-test', method: RequestMethod.GET },
      { path: 'db-status', method: RequestMethod.GET },
      { path: 'appointments-test', method: RequestMethod.GET },
      { path: 'documents-test', method: RequestMethod.GET },
    ],
  });

  // Configurar Swagger UI con opciones personalizadas
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      },
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Sistema de Gestión Legal - API Documentation',
    customCss: `
      .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #50e3c2; }
    `,
  });

  // Servir archivos estáticos desde la carpeta uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log(`🌍 CORS origins configurados: http://localhost:5173, http://localhost:3000, https://experimento2-fenm.vercel.app, https://experimento2-production-54c0.up.railway.app, *.vercel.app, *.railway.app`);
  console.log(`📁 Archivos estáticos disponibles en /uploads`);
  console.log(`📚 Documentación Swagger disponible en /docs`);
  console.log(`💚 Health check básico disponible en /health`);
  console.log(`🖥️ System health disponible en /system-health`);
  console.log(`🔗 Connectivity check disponible en /connectivity`);
  console.log(`🔧 Debug environment disponible en /debug-env`);
  console.log(`🗄️ Database status disponible en /db-status`);
  console.log(`📅 Appointments test disponible en /appointments-test`);
  console.log(`📄 Documents test disponible en /documents-test`);
}
bootstrap();