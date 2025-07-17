import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeChatbotParams() {
  console.log('Inicializando parámetros para el chatbot...');

  const chatbotParams = [
    // Información de contacto
    { clave: 'CONTACT_EMAIL', valor: 'info@despacholegal.com', etiqueta: 'Email de contacto', tipo: 'email' },
    { clave: 'CONTACT_PHONE', valor: '(555) 123-4567', etiqueta: 'Teléfono de contacto', tipo: 'string' },
    { clave: 'CONTACT_PHONE_PREFIX', valor: '+34', etiqueta: 'Prefijo telefónico', tipo: 'string' },
    { clave: 'CONTACT_INFO', valor: 'Despacho Legal García & Asociados - Asesoramiento jurídico especializado', etiqueta: 'Información de contacto', tipo: 'text' },
    { clave: 'CONTACT_ADDRESS', valor: 'Av. Principal 123, Ciudad', etiqueta: 'Dirección del despacho', tipo: 'string' },
    
    // Horarios
    { clave: 'SCHEDULE_WEEKDAYS', valor: 'Lunes a Viernes 9:00 AM - 6:00 PM', etiqueta: 'Horario de lunes a viernes', tipo: 'string' },
    { clave: 'SCHEDULE_SATURDAY', valor: 'Sábados 9:00 AM - 1:00 PM', etiqueta: 'Horario de sábados', tipo: 'string' },
    { clave: 'SCHEDULE_EMERGENCY', valor: '24/7 para casos urgentes', etiqueta: 'Horario de emergencias', tipo: 'string' },
    
    // Servicios
    { clave: 'SERVICES_CIVIL', valor: 'Derecho Civil', etiqueta: 'Servicio de Derecho Civil', tipo: 'string' },
    { clave: 'SERVICES_MERCANTIL', valor: 'Derecho Mercantil', etiqueta: 'Servicio de Derecho Mercantil', tipo: 'string' },
    { clave: 'SERVICES_LABORAL', valor: 'Derecho Laboral', etiqueta: 'Servicio de Derecho Laboral', tipo: 'string' },
    { clave: 'SERVICES_FAMILIAR', valor: 'Derecho Familiar', etiqueta: 'Servicio de Derecho Familiar', tipo: 'string' },
    { clave: 'SERVICES_PENAL', valor: 'Derecho Penal', etiqueta: 'Servicio de Derecho Penal', tipo: 'string' },
    { clave: 'SERVICES_ADMINISTRATIVO', valor: 'Derecho Administrativo', etiqueta: 'Servicio de Derecho Administrativo', tipo: 'string' },
    
    // Honorarios
    { clave: 'HONORARIOS_CONSULTA_INICIAL', valor: 'Gratuita', etiqueta: 'Consulta inicial gratuita', tipo: 'string' },
    { clave: 'HONORARIOS_RANGO_MIN', valor: '50.00', etiqueta: 'Honorarios mínimos', tipo: 'number' },
    { clave: 'HONORARIOS_RANGO_MAX', valor: '500.00', etiqueta: 'Honorarios máximos', tipo: 'number' },
    { clave: 'HONORARIOS_PROMEDIO', valor: '150.00', etiqueta: 'Honorarios promedio', tipo: 'number' },
    
    // Información del despacho
    { clave: 'DESPACHO_NOMBRE', valor: 'García & Asociados', etiqueta: 'Nombre del despacho', tipo: 'string' },
    { clave: 'DESPACHO_DESCRIPCION', valor: 'Despacho legal especializado en múltiples áreas del derecho', etiqueta: 'Descripción del despacho', tipo: 'text' },
    { clave: 'DESPACHO_ESPECIALIDADES', valor: 'Derecho Civil, Mercantil, Laboral, Familiar, Penal, Administrativo', etiqueta: 'Especialidades del despacho', tipo: 'text' },
    
    // Redes sociales
    { clave: 'SOCIAL_FACEBOOK', valor: 'https://facebook.com/despacholegal', etiqueta: 'Facebook', tipo: 'url' },
    { clave: 'SOCIAL_TWITTER', valor: 'https://twitter.com/despacholegal', etiqueta: 'Twitter', tipo: 'url' },
    { clave: 'SOCIAL_LINKEDIN', valor: 'https://linkedin.com/company/despacholegal', etiqueta: 'LinkedIn', tipo: 'url' },
    { clave: 'SOCIAL_INSTAGRAM', valor: 'https://instagram.com/despacholegal', etiqueta: 'Instagram', tipo: 'url' },
    
    // Contenido legal
    { clave: 'PRIVACY_POLICY', valor: 'Política de Privacidad del Despacho Legal García & Asociados...', etiqueta: 'Política de Privacidad', tipo: 'html' },
    { clave: 'TERMS_OF_SERVICE', valor: 'Términos de Servicio del Despacho Legal García & Asociados...', etiqueta: 'Términos de Servicio', tipo: 'html' },
    { clave: 'COOKIE_POLICY', valor: 'Política de Cookies del Despacho Legal García & Asociados...', etiqueta: 'Política de Cookies', tipo: 'html' },
    { clave: 'COPYRIGHT_TEXT', valor: '© 2024 Despacho Legal García & Asociados. Todos los derechos reservados.', etiqueta: 'Texto de Copyright', tipo: 'string' }
  ];

  for (const param of chatbotParams) {
    try {
      await prisma.parametro.upsert({
        where: { clave: param.clave },
        update: { 
          valor: param.valor, 
          etiqueta: param.etiqueta, 
          tipo: param.tipo 
        },
        create: param
      });
      console.log(`✅ Parámetro ${param.clave} inicializado`);
    } catch (error) {
      console.error(`❌ Error al inicializar parámetro ${param.clave}:`, error);
    }
  }

  console.log('✅ Parámetros del chatbot inicializados correctamente');
}

async function main() {
  try {
    await initializeChatbotParams();
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 