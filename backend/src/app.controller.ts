import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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

  @Get('test')
  getTest(): { message: string; timestamp: string } {
    return {
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }
} 