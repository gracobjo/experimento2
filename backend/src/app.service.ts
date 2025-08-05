import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Despacho Legal API - Sistema Integral de Gestión Legal';
  }
} 