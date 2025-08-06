import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(): { message: string; timestamp: string } {
    return {
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api-test')
  getApiTest(): { message: string; timestamp: string; endpoints: string[] } {
    return {
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/health',
        '/debug-env',
        '/api/test',
        '/api/docs',
        '/api-test'
      ]
    };
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
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

  @Get('simple-test')
  getSimpleTest(): { message: string } {
    return {
      message: 'Endpoint simple funcionando',
    };
  }

  @Get('db-status')
  async getDbStatus(): Promise<{ 
    connected: boolean; 
    tables: any[]; 
    userCount: number;
    error?: string;
  }> {
    try {
      // Verificar conexión
      await this.prisma.$connect();
      
      // Obtener lista de tablas
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      // Contar usuarios
      const userCount = await this.prisma.user.count();
      
      await this.prisma.$disconnect();
      
      return {
        connected: true,
        tables: tables as any[],
        userCount,
      };
    } catch (error) {
      return {
        connected: false,
        tables: [],
        userCount: 0,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
} 