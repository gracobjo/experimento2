import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeDefaultParams() {
  console.log('🚀 Inicializando parámetros por defecto...');

  const defaultParams = [
    // Parámetros de contacto
    { 
      clave: 'CONTACT_EMAIL', 
      valor: 'info@despacholegal.com', 
      etiqueta: 'Email de contacto', 
      tipo: 'email' 
    },
    { 
      clave: 'CONTACT_PHONE', 
      valor: '123 456 789', 
      etiqueta: 'Teléfono de contacto', 
      tipo: 'string' 
    },
    { 
      clave: 'CONTACT_PHONE_PREFIX', 
      valor: '+34', 
      etiqueta: 'Prefijo telefónico', 
      tipo: 'string' 
    },
    { 
      clave: 'CONTACT_INFO', 
      valor: 'Despacho Legal - Asesoramiento jurídico especializado', 
      etiqueta: 'Información de contacto', 
      tipo: 'text' 
    },
    
    // Redes sociales
    { 
      clave: 'SOCIAL_FACEBOOK', 
      valor: 'https://facebook.com/despacholegal', 
      etiqueta: 'Facebook', 
      tipo: 'url' 
    },
    { 
      clave: 'SOCIAL_TWITTER', 
      valor: 'https://twitter.com/despacholegal', 
      etiqueta: 'Twitter', 
      tipo: 'url' 
    },
    { 
      clave: 'SOCIAL_LINKEDIN', 
      valor: 'https://linkedin.com/company/despacholegal', 
      etiqueta: 'LinkedIn', 
      tipo: 'url' 
    },
    { 
      clave: 'SOCIAL_INSTAGRAM', 
      valor: 'https://instagram.com/despacholegal', 
      etiqueta: 'Instagram', 
      tipo: 'url' 
    },
    
    // Contenido legal
    { 
      clave: 'PRIVACY_POLICY', 
      valor: `
        <h1>Política de Privacidad</h1>
        <p>Esta política de privacidad describe cómo recopilamos, usamos y protegemos su información personal.</p>
        
        <h2>Información que recopilamos</h2>
        <p>Recopilamos información que usted nos proporciona directamente, como cuando se registra en nuestro sitio web, nos contacta o utiliza nuestros servicios.</p>
        
        <h2>Cómo usamos su información</h2>
        <p>Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, comunicarnos con usted y cumplir con nuestras obligaciones legales.</p>
        
        <h2>Protección de la información</h2>
        <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.</p>
        
        <h2>Sus derechos</h2>
        <p>Usted tiene derecho a acceder, corregir, eliminar y oponerse al procesamiento de su información personal. Para ejercer estos derechos, contáctenos.</p>
        
        <h2>Contacto</h2>
        <p>Si tiene preguntas sobre esta política de privacidad, contáctenos en info@despacholegal.com</p>
      `, 
      etiqueta: 'Política de Privacidad', 
      tipo: 'html' 
    },
    { 
      clave: 'TERMS_OF_SERVICE', 
      valor: `
        <h1>Términos de Servicio</h1>
        <p>Al utilizar nuestros servicios, usted acepta estos términos de servicio.</p>
        
        <h2>Servicios proporcionados</h2>
        <p>Proporcionamos servicios de asesoramiento jurídico y gestión legal a través de nuestra plataforma digital.</p>
        
        <h2>Uso aceptable</h2>
        <p>Usted se compromete a utilizar nuestros servicios únicamente para fines legales y de acuerdo con estos términos.</p>
        
        <h2>Propiedad intelectual</h2>
        <p>Todos los derechos de propiedad intelectual relacionados con nuestros servicios son propiedad de Despacho Legal.</p>
        
        <h2>Limitación de responsabilidad</h2>
        <p>En la máxima medida permitida por la ley, Despacho Legal no será responsable de daños indirectos, incidentales o consecuentes.</p>
        
        <h2>Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación.</p>
        
        <h2>Contacto</h2>
        <p>Si tiene preguntas sobre estos términos, contáctenos en info@despacholegal.com</p>
      `, 
      etiqueta: 'Términos de Servicio', 
      tipo: 'html' 
    },
    { 
      clave: 'COOKIE_POLICY', 
      valor: `
        <h1>Política de Cookies</h1>
        <p>Esta política de cookies explica qué son las cookies, cómo las utilizamos y cómo puede gestionarlas.</p>
        
        <h2>¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar su experiencia y a analizar el tráfico del sitio.</p>
        
        <h2>Tipos de cookies que utilizamos</h2>
        
        <h3>Cookies técnicas (necesarias)</h3>
        <p>Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar. Incluyen:</p>
        <ul>
          <li>Cookies de sesión para mantener su sesión activa</li>
          <li>Cookies de seguridad para proteger contra ataques</li>
          <li>Cookies de preferencias para recordar su configuración</li>
        </ul>
        
        <h3>Cookies analíticas</h3>
        <p>Nos ayudan a entender cómo interactúan los visitantes con nuestro sitio web:</p>
        <ul>
          <li>Análisis de tráfico y uso del sitio</li>
          <li>Identificación de páginas más populares</li>
          <li>Mejora de la experiencia del usuario</li>
        </ul>
        
        <h3>Cookies de funcionalidad</h3>
        <p>Mejoran la funcionalidad del sitio web:</p>
        <ul>
          <li>Recordar sus preferencias de idioma</li>
          <li>Personalizar el contenido mostrado</li>
          <li>Mejorar la navegación</li>
        </ul>
        
        <h2>Gestión de cookies</h2>
        <p>Puede gestionar las cookies a través de la configuración de su navegador:</p>
        <ul>
          <li><strong>Chrome:</strong> Configuración > Privacidad y seguridad > Cookies</li>
          <li><strong>Firefox:</strong> Opciones > Privacidad y seguridad > Cookies</li>
          <li><strong>Safari:</strong> Preferencias > Privacidad > Cookies</li>
          <li><strong>Edge:</strong> Configuración > Cookies y permisos del sitio</li>
        </ul>
        
        <h2>Cookies de terceros</h2>
        <p>Algunos servicios de terceros pueden instalar cookies en su dispositivo:</p>
        <ul>
          <li>Google Analytics para análisis web</li>
          <li>Servicios de chat en vivo</li>
          <li>Herramientas de redes sociales</li>
        </ul>
        
        <h2>Actualizaciones de esta política</h2>
        <p>Podemos actualizar esta política de cookies ocasionalmente. Le notificaremos cualquier cambio significativo.</p>
        
        <h2>Contacto</h2>
        <p>Si tiene preguntas sobre nuestra política de cookies, contáctenos en info@despacholegal.com</p>
        
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
          <p class="text-sm text-blue-700">
            <strong>Nota:</strong> Esta política cumple con las directrices de la Agencia Española de Protección de Datos (AEPD) y el Reglamento General de Protección de Datos (RGPD).
          </p>
        </div>
      `, 
      etiqueta: 'Política de Cookies', 
      tipo: 'html' 
    },
    { 
      clave: 'COPYRIGHT_TEXT', 
      valor: '© 2024 Despacho Legal. Todos los derechos reservados.', 
      etiqueta: 'Texto de Copyright', 
      tipo: 'string' 
    }
  ];

  for (const param of defaultParams) {
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

  console.log('🎉 Inicialización de parámetros completada');
}

async function main() {
  try {
    await initializeDefaultParams();
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 