import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  getHealth(): { status: string; timestamp: string; service: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'experimento2-backend',
      uptime: process.uptime()
    };
  }

  @Get('debug-env')
  getDebugEnv(): { jwtSecret: string; databaseUrl: string; nodeEnv: string } {
    return {
      jwtSecret: process.env.JWT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO',
      databaseUrl: process.env.DATABASE_URL ? 'CONFIGURADO' : 'NO CONFIGURADO',
      nodeEnv: process.env.NODE_ENV || 'NO CONFIGURADO',
    };
  }

  @Get('test-health')
  getTestHealth(): { message: string; timestamp: string; endpoints: string[] } {
    return {
      message: 'Health endpoints funcionando correctamente',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/health',
        '/system-health',
        '/connectivity',
        '/debug-env',
        '/test-health',
        '/db-status',
        '/appointments-test'
      ]
    };
  }

  @Get('system-health')
  getSystemHealth(): { status: string; timestamp: string; environment: string; version: string; memory: any } {
    const memUsage = process.memoryUsage();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.version,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
      }
    };
  }

  @Get('db-status')
  async getDbStatus() {
    try {
      // Verificar conexión básica
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Verificar si las tablas existen
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      // Verificar tabla de appointments específicamente
      const appointmentsTable = await this.prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'appointment'
        ORDER BY ordinal_position
      `;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'conectado',
        tables: tables,
        appointmentsTable: appointmentsTable
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }

  @Get('connectivity')
  getConnectivity(): { status: string; timestamp: string; endpoints: string[]; database: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/health',
        '/system-health',
        '/connectivity',
        '/db-status',
        '/appointments-test'
      ],
      database: process.env.DATABASE_URL ? 'CONFIGURADO' : 'NO CONFIGURADO'
    };
  }

  @Get('appointments-test')
  async getAppointmentsTest() {
    try {
      // Intentar hacer una consulta simple a appointments
      const count = await this.prisma.appointment.count();
      
      // Intentar obtener una cita de ejemplo
      const sample = await this.prisma.appointment.findFirst({
        include: {
          lawyer: { select: { id: true, name: true, email: true } },
          client: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      });
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        totalAppointments: count,
        sampleAppointment: sample,
        message: 'Endpoint de appointments funcionando correctamente'
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        message: 'Error en endpoint de appointments'
      };
    }
  }

  @Get('documents-test')
  async getDocumentsTest() {
    try {
      // Verificar si hay documentos en la base de datos
      const documentsCount = await this.prisma.document.count();
      
      // Obtener un documento de ejemplo
      const sampleDocument = await this.prisma.document.findFirst({
        include: {
          expediente: {
            include: {
              client: true,
              lawyer: true
            }
          }
        }
      });
      
      // Verificar configuración de Cloudinary
      const cloudinaryConfig = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'CONFIGURADO' : 'NO CONFIGURADO',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO'
      };
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        totalDocuments: documentsCount,
        sampleDocument: sampleDocument ? {
          id: sampleDocument.id,
          filename: sampleDocument.filename,
          originalName: sampleDocument.originalName,
          mimeType: sampleDocument.mimeType,
          fileSize: sampleDocument.fileSize,
          metadata: sampleDocument.metadata
        } : null,
        cloudinaryConfig: cloudinaryConfig,
        message: 'Endpoint de documentos funcionando correctamente'
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        message: 'Error en endpoint de documentos'
      };
    }
  }
} 