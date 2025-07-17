import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParametrosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.parametro.findMany();
  }

  async findOne(id: string) {
    const parametro = await this.prisma.parametro.findUnique({ where: { id } });
    if (!parametro) throw new NotFoundException('Parámetro no encontrado');
    return parametro;
  }

  async findByClave(clave: string) {
    const parametro = await this.prisma.parametro.findUnique({ where: { clave } });
    if (!parametro) throw new NotFoundException('Parámetro no encontrado');
    return parametro;
  }

  async findContactParams() {
    return this.prisma.parametro.findMany({
      where: {
        clave: {
          in: [
            'CONTACT_EMAIL',
            'CONTACT_PHONE',
            'CONTACT_PHONE_PREFIX',
            'CONTACT_INFO',
            'SOCIAL_FACEBOOK',
            'SOCIAL_TWITTER',
            'SOCIAL_LINKEDIN',
            'SOCIAL_INSTAGRAM'
          ]
        }
      }
    });
  }

  async findLegalContent() {
    return this.prisma.parametro.findMany({
      where: {
        clave: {
          in: [
            'PRIVACY_POLICY',
            'TERMS_OF_SERVICE',
            'COOKIE_POLICY',
            'COPYRIGHT_TEXT'
          ]
        }
      }
    });
  }

  async create(data: { clave: string; valor: string; etiqueta: string; tipo: string }) {
    return this.prisma.parametro.create({ data });
  }

  async update(id: string, data: { valor?: string; etiqueta?: string; tipo?: string }) {
    return this.prisma.parametro.update({ where: { id }, data });
  }

  async updateByClave(clave: string, valor: string) {
    const parametro = await this.prisma.parametro.findUnique({ where: { clave } });
    if (!parametro) {
      throw new NotFoundException(`Parámetro con clave '${clave}' no encontrado`);
    }
    return this.prisma.parametro.update({ where: { clave }, data: { valor } });
  }

  async remove(id: string) {
    return this.prisma.parametro.delete({ where: { id } });
  }

  async initializeDefaultParams() {
    const defaultParams = [
      // Parámetros de contacto
      { clave: 'CONTACT_EMAIL', valor: 'info@despacholegal.com', etiqueta: 'Email de contacto', tipo: 'email' },
      { clave: 'CONTACT_PHONE', valor: '123 456 789', etiqueta: 'Teléfono de contacto', tipo: 'string' },
      { clave: 'CONTACT_PHONE_PREFIX', valor: '+34', etiqueta: 'Prefijo telefónico', tipo: 'string' },
      { clave: 'CONTACT_INFO', valor: 'Despacho Legal - Asesoramiento jurídico especializado', etiqueta: 'Información de contacto', tipo: 'text' },
      
      // Redes sociales
      { clave: 'SOCIAL_FACEBOOK', valor: 'https://facebook.com/despacholegal', etiqueta: 'Facebook', tipo: 'url' },
      { clave: 'SOCIAL_TWITTER', valor: 'https://twitter.com/despacholegal', etiqueta: 'Twitter', tipo: 'url' },
      { clave: 'SOCIAL_LINKEDIN', valor: 'https://linkedin.com/company/despacholegal', etiqueta: 'LinkedIn', tipo: 'url' },
      { clave: 'SOCIAL_INSTAGRAM', valor: 'https://instagram.com/despacholegal', etiqueta: 'Instagram', tipo: 'url' },
      
      // Contenido legal
      { clave: 'PRIVACY_POLICY', valor: 'Política de Privacidad del Despacho Legal...', etiqueta: 'Política de Privacidad', tipo: 'html' },
      { clave: 'TERMS_OF_SERVICE', valor: 'Términos de Servicio del Despacho Legal...', etiqueta: 'Términos de Servicio', tipo: 'html' },
      { clave: 'COOKIE_POLICY', valor: 'Política de Cookies del Despacho Legal...', etiqueta: 'Política de Cookies', tipo: 'html' },
      { clave: 'COPYRIGHT_TEXT', valor: '© 2024 Despacho Legal. Todos los derechos reservados.', etiqueta: 'Texto de Copyright', tipo: 'string' }
    ];

    for (const param of defaultParams) {
      try {
        await this.prisma.parametro.upsert({
          where: { clave: param.clave },
          update: { valor: param.valor, etiqueta: param.etiqueta, tipo: param.tipo },
          create: param
        });
      } catch (error) {
        console.error(`Error al inicializar parámetro ${param.clave}:`, error);
      }
    }
  }
} 