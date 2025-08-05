import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
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

  @Get('test-health')
  getTestHealth(): { message: string; timestamp: string; endpoints: string[] } {
    return {
      message: 'Health endpoints funcionando correctamente',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/health',
        '/debug-env',
        '/test-health'
      ]
    };
  }
} 