import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvConfigService {
  getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn('⚠️ JWT_SECRET no configurado, usando valor por defecto');
      return 'default-jwt-secret-change-in-production';
    }
    return secret;
  }

  getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '24h';
  }

  getPort(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  getNodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  getDatabaseUrl(): string {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL no está configurado');
    }
    return url;
  }

  getCorsOrigin(): string[] {
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin) {
      return corsOrigin.split(',');
    }
    return ['http://localhost:5173', 'http://localhost:3000', 'https://*.railway.app', 'https://*.vercel.app', 'https://*.netlify.app'];
  }

  isProduction(): boolean {
    return this.getNodeEnv() === 'production';
  }
} 