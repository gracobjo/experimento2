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
    console.log('[PARAMETROS] Buscando parámetro con clave:', clave);
    
    const parametro = await this.prisma.parametro.findUnique({ where: { clave } });
    
    console.log('[PARAMETROS] Resultado de búsqueda:', parametro ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    if (!parametro) {
      console.log('[PARAMETROS] Parámetro no encontrado, lanzando NotFoundException');
      throw new NotFoundException('Parámetro no encontrado');
    }
    
    console.log('[PARAMETROS] Parámetro encontrado:', { id: parametro.id, clave: parametro.clave, valor: parametro.valor.substring(0, 100) + '...' });
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
    const legalParams = await this.prisma.parametro.findMany({
      where: {
        clave: {
          startsWith: 'LEGAL_'
        }
      },
      orderBy: {
        clave: 'asc'
      }
    });

    return legalParams;
  }

  async findServices() {
    console.log('[PARAMETROS] findServices - Iniciando búsqueda de servicios...');
    
    const services = await this.prisma.parametro.findMany({
      where: {
        clave: {
          startsWith: 'SERVICE_'
        }
      },
      orderBy: {
        clave: 'asc'
      }
    });

    console.log('[PARAMETROS] findServices - Parámetros encontrados con SERVICE_:', services.length);
    console.log('[PARAMETROS] findServices - Claves encontradas:', services.map(s => s.clave));

    // Transformar los servicios a un formato más útil
    const servicesMap = new Map();
    services.forEach(service => {
      const parts = service.clave.split('_');
      console.log('[PARAMETROS] findServices - Procesando clave:', service.clave, 'parts:', parts);
      
      if (parts.length >= 3) {
        const serviceId = parts[1];
        const field = parts[2];
        
        if (!servicesMap.has(serviceId)) {
          servicesMap.set(serviceId, {
            id: serviceId,
            orden: parseInt(parts[1]) || 0
          });
          console.log('[PARAMETROS] findServices - Nuevo servicio creado:', serviceId);
        }
        
        servicesMap.get(serviceId)[field] = service.valor;
        console.log('[PARAMETROS] findServices - Campo agregado:', field, '=', service.valor);
      } else {
        console.log('[PARAMETROS] findServices - Clave ignorada (formato incorrecto):', service.clave);
      }
    });

    const result = Array.from(servicesMap.values()).sort((a, b) => a.orden - b.orden);
    console.log('[PARAMETROS] findServices - Resultado final:', result);
    
    return result;
  }

  async updateService(serviceId: string, serviceData: {
    title: string;
    description: string;
    icon: string;
    orden?: number;
  }) {
    const updates = [
      this.updateByClave(`SERVICE_${serviceId}_TITLE`, serviceData.title),
      this.updateByClave(`SERVICE_${serviceId}_DESCRIPTION`, serviceData.description),
      this.updateByClave(`SERVICE_${serviceId}_ICON`, serviceData.icon)
    ];

    if (serviceData.orden !== undefined) {
      updates.push(this.updateByClave(`SERVICE_${serviceId}_ORDER`, serviceData.orden.toString()));
    }

    await Promise.all(updates);
    return this.findServices();
  }

  async deleteService(serviceId: string) {
    const servicesToDelete = await this.prisma.parametro.findMany({
      where: {
        clave: {
          startsWith: `SERVICE_${serviceId}_`
        }
      }
    });

    for (const service of servicesToDelete) {
      await this.prisma.parametro.delete({
        where: { id: service.id }
      });
    }

    return this.findServices();
  }

  async addService(serviceData: {
    title: string;
    description: string;
    icon: string;
    orden?: number;
  }) {
    const serviceId = `SERVICE_${Date.now()}`;
    const orden = serviceData.orden || 0;

    const newService = await this.prisma.parametro.createMany({
      data: [
        {
          clave: `${serviceId}_TITLE`,
          valor: serviceData.title,
          etiqueta: `Título del servicio ${serviceId}`,
          tipo: 'string'
        },
        {
          clave: `${serviceId}_DESCRIPTION`,
          valor: serviceData.description,
          etiqueta: `Descripción del servicio ${serviceId}`,
          tipo: 'text'
        },
        {
          clave: `${serviceId}_ICON`,
          valor: serviceData.icon,
          etiqueta: `Icono del servicio ${serviceId}`,
          tipo: 'string'
        },
        {
          clave: `${serviceId}_ORDER`,
          valor: orden.toString(),
          etiqueta: `Orden del servicio ${serviceId}`,
          tipo: 'number'
        }
      ]
    });

    return this.findServices();
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
      { clave: 'COPYRIGHT_TEXT', valor: '© 2024 Despacho Legal. Todos los derechos reservados.', etiqueta: 'Texto de Copyright', tipo: 'string' },
      // URL de verificación de facturas
      { clave: 'VERIFICACION_URL_BASE', valor: 'https://tudominio.com/verificar/', etiqueta: 'URL base de verificación de facturas', tipo: 'url' }
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