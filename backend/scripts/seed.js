const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Limpiar tablas dependientes primero
    await prisma.invoiceItem.deleteMany();
    await prisma.provisionFondos.deleteMany();
    await prisma.invoice.deleteMany();

    // Crear usuarios de ejemplo
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Crear admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@despacho.com' },
      update: {},
      create: {
        email: 'admin@despacho.com',
        name: 'Administrador del Sistema',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Crear abogados
    const lawyer1 = await prisma.user.upsert({
      where: { email: 'lawyer1@example.com' },
      update: {},
      create: {
        email: 'lawyer1@example.com',
        name: 'Lawyer Uno',
        password: hashedPassword,
        role: 'ABOGADO',
      },
    });

    const lawyer2 = await prisma.user.upsert({
      where: { email: 'lawyer2@example.com' },
      update: {},
      create: {
        email: 'lawyer2@example.com',
        name: 'Lawyer Dos',
        password: hashedPassword,
        role: 'ABOGADO',
      },
    });

    // Crear clientes
    const client1 = await prisma.user.upsert({
      where: { email: 'client1@example.com' },
      update: {},
      create: {
        email: 'client1@example.com',
        name: 'Cliente Uno',
        password: hashedPassword,
        role: 'CLIENTE',
      },
    });

    const client2 = await prisma.user.upsert({
      where: { email: 'cliente2@email.com' },
      update: {},
      create: {
        email: 'cliente2@email.com',
        name: 'Ana Rodríguez',
        password: hashedPassword,
        role: 'CLIENTE',
      },
    });

    // Crear perfiles de clientes
    const clientProfile1 = await prisma.client.upsert({
      where: { userId: client1.id },
      update: {},
      create: {
        userId: client1.id,
        dni: '12345678A',
        phone: '+34 600 123 456',
        address: 'Calle Mayor 123, Madrid',
      },
    });

    const clientProfile2 = await prisma.client.upsert({
      where: { userId: client2.id },
      update: {},
      create: {
        userId: client2.id,
        dni: '87654321B',
        phone: '+34 600 654 321',
        address: 'Avenida Principal 456, Barcelona',
      },
    });

    // Crear expedientes de ejemplo
    const expediente1 = await prisma.expediente.upsert({
      where: { id: 'exp-001' },
      update: {},
      create: {
        id: 'exp-001',
        title: 'Contrato de Compraventa de Vivienda',
        description: 'Contrato de compraventa de vivienda ubicada en Madrid.',
        status: 'ABIERTO',
        clientId: clientProfile1.id,
        lawyerId: lawyer1.id,
      },
    });

    const expediente2 = await prisma.expediente.upsert({
      where: { id: 'exp-002' },
      update: {},
      create: {
        id: 'exp-002',
        title: 'Demanda Laboral por Despido Improcedente',
        description: 'Demanda contra empresa por despido improcedente.',
        status: 'EN_PROCESO',
        clientId: clientProfile2.id,
        lawyerId: lawyer2.id,
      },
    });

    // Crear tareas de ejemplo
    await prisma.task.upsert({
      where: { id: 'task-001' },
      update: {},
      create: {
        id: 'task-001',
        title: 'Revisar contrato de compraventa',
        description: 'Revisar y corregir el contrato de compraventa',
        dueDate: new Date('2024-02-20T17:00:00Z'),
        priority: 'ALTA',
        status: 'PENDIENTE',
        expedienteId: expediente1.id,
        assignedTo: lawyer1.id,
        createdBy: lawyer1.id,
      },
    });

    await prisma.task.upsert({
      where: { id: 'task-002' },
      update: {},
      create: {
        id: 'task-002',
        title: 'Preparar demanda laboral',
        description: 'Preparar la demanda laboral por despido improcedente',
        dueDate: new Date('2024-02-18T12:00:00Z'),
        priority: 'URGENTE',
        status: 'EN_PROGRESO',
        expedienteId: expediente2.id,
        assignedTo: lawyer2.id,
        createdBy: lawyer2.id,
      },
    });

    // Crear facturas de ejemplo
    const factura1 = await prisma.invoice.upsert({
      where: { id: 'fac-2025-0001-R3-01' },
      update: {},
      create: {
        id: 'fac-2025-0001-R3-01',
        expedienteId: expediente1.id,
        clientId: clientProfile1.id,
        lawyerId: lawyer1.id,
        invoiceNumber: 'fac-2025-0001-R3-01',
        issueDate: new Date('2025-08-13'),
        operationDate: new Date('2025-08-14'),
        creationDate: new Date('2025-08-13'),
        status: 'EMITIDA',
        subtotal: 1001.00,
        discount: 100.10,
        taxAmount: 0.00,
        total: 900.90,
        notes: 'Factura por servicios de asesoría legal en contrato de compraventa',
        paymentMethod: 'TRANSFERENCIA',
        dueDate: new Date('2025-09-13'),
      },
    });

    const factura2 = await prisma.invoice.upsert({
      where: { id: 'fac-2025-0002-R3-02' },
      update: {},
      create: {
        id: 'fac-2025-0002-R3-02',
        expedienteId: expediente2.id,
        clientId: clientProfile2.id,
        lawyerId: lawyer2.id,
        invoiceNumber: 'fac-2025-0002-R3-02',
        issueDate: new Date('2025-08-13'),
        operationDate: new Date('2025-08-14'),
        creationDate: new Date('2025-08-13'),
        status: 'EMITIDA',
        subtotal: 1500.00,
        discount: 150.00,
        taxAmount: 0.00,
        total: 1350.00,
        notes: 'Factura por servicios de asesoría legal en demanda laboral',
        paymentMethod: 'TRANSFERENCIA',
        dueDate: new Date('2025-09-13'),
      },
    });

    // Crear items de factura
    await prisma.invoiceItem.upsert({
      where: { id: 'item-001' },
      update: {},
      create: {
        id: 'item-001',
        invoiceId: factura1.id,
        description: 'minuta',
        quantity: 1,
        unitPrice: 1001.00,
        total: 1001.00,
      },
    });

    await prisma.invoiceItem.upsert({
      where: { id: 'item-002' },
      update: {},
      create: {
        id: 'item-002',
        invoiceId: factura2.id,
        description: 'Asesoría legal y preparación de demanda',
        quantity: 1,
        unitPrice: 1500.00,
        total: 1500.00,
      },
    });

    // Crear parámetros de contacto
    await prisma.parametro.upsert({
      where: { clave: 'CONTACT_EMAIL' },
      update: {},
      create: {
        clave: 'CONTACT_EMAIL',
        valor: 'info@despacho.com',
        etiqueta: 'Email de Contacto',
        tipo: 'email',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'CONTACT_PHONE' },
      update: {},
      create: {
        clave: 'CONTACT_PHONE',
        valor: '+34 600 123 456',
        etiqueta: 'Teléfono de Contacto',
        tipo: 'string',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'CONTACT_PHONE_PREFIX' },
      update: {},
      create: {
        clave: 'CONTACT_PHONE_PREFIX',
        valor: '+34',
        etiqueta: 'Prefijo Telefónico',
        tipo: 'string',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'CONTACT_INFO' },
      update: {},
      create: {
        clave: 'CONTACT_INFO',
        valor: 'Calle Mayor 123, Madrid',
        etiqueta: 'Dirección de Contacto',
        tipo: 'string',
      },
    });

    // Crear parámetros legales
    await prisma.parametro.upsert({
      where: { clave: 'LEGAL_PRIVACY' },
      update: {},
      create: {
        clave: 'LEGAL_PRIVACY',
        valor: 'Política de Privacidad del Despacho Legal',
        etiqueta: 'Política de Privacidad',
        tipo: 'text',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'LEGAL_TERMS' },
      update: {},
      create: {
        clave: 'LEGAL_TERMS',
        valor: 'Términos y Condiciones del Servicio',
        etiqueta: 'Términos y Condiciones',
        tipo: 'text',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'LEGAL_COOKIES' },
      update: {},
      create: {
        clave: 'LEGAL_COOKIES',
        valor: 'Política de Cookies',
        etiqueta: 'Política de Cookies',
        tipo: 'text',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'LEGAL_COPYRIGHT' },
      update: {},
      create: {
        clave: 'LEGAL_COPYRIGHT',
        valor: '© 2024 Despacho Legal. Todos los derechos reservados.',
        etiqueta: 'Copyright',
        tipo: 'string',
      },
    });

    // Crear parámetros de servicios
    await prisma.parametro.upsert({
      where: { clave: 'SERVICE_1_TITLE' },
      update: {},
      create: {
        clave: 'SERVICE_1_TITLE',
        valor: 'Derecho Civil',
        etiqueta: 'Servicio 1 - Título',
        tipo: 'string',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'SERVICE_1_DESCRIPTION' },
      update: {},
      create: {
        clave: 'SERVICE_1_DESCRIPTION',
        valor: 'Asesoramiento en contratos, compraventas y derecho civil',
        etiqueta: 'Servicio 1 - Descripción',
        tipo: 'text',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'SERVICE_1_ICON' },
      update: {},
      create: {
        clave: 'SERVICE_1_ICON',
        valor: 'gavel',
        etiqueta: 'Servicio 1 - Icono',
        tipo: 'string',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'SERVICE_2_TITLE' },
      update: {},
      create: {
        clave: 'SERVICE_2_TITLE',
        valor: 'Derecho Laboral',
        etiqueta: 'Servicio 2 - Título',
        tipo: 'string',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'SERVICE_2_DESCRIPTION' },
      update: {},
      create: {
        clave: 'SERVICE_2_DESCRIPTION',
        valor: 'Asesoramiento en despidos, conflictos laborales y negociaciones',
        etiqueta: 'Servicio 2 - Descripción',
        tipo: 'text',
      },
    });

    await prisma.parametro.upsert({
      where: { clave: 'SERVICE_2_ICON' },
      update: {},
      create: {
        clave: 'SERVICE_2_ICON',
        valor: 'work',
        etiqueta: 'Servicio 2 - Icono',
        tipo: 'string',
      },
    });

    // Crear configuraciones del sitio (SiteConfig) públicas
    await prisma.siteConfig.upsert({
      where: { key: 'SITE_TITLE' },
      update: {},
      create: {
        key: 'SITE_TITLE',
        value: 'Despacho Legal Pérez & García',
        category: 'general',
        isPublic: true,
        description: 'Título principal del sitio web',
      },
    });

    await prisma.siteConfig.upsert({
      where: { key: 'SITE_DESCRIPTION' },
      update: {},
      create: {
        key: 'SITE_DESCRIPTION',
        value: 'Sistema integral de gestión legal para despachos de abogados',
        category: 'general',
        isPublic: true,
        description: 'Descripción del sitio web',
      },
    });

    await prisma.siteConfig.upsert({
      where: { key: 'SITE_LOGO' },
      update: {},
      create: {
        key: 'SITE_LOGO',
        value: '/images/logo.png',
        category: 'branding',
        isPublic: true,
        description: 'URL del logo del sitio',
      },
    });

    await prisma.siteConfig.upsert({
      where: { key: 'SITE_FAVICON' },
      update: {},
      create: {
        key: 'SITE_FAVICON',
        value: '/images/favicon.ico',
        category: 'branding',
        isPublic: true,
        description: 'URL del favicon',
      },
    });

    await prisma.siteConfig.upsert({
      where: { key: 'SITE_THEME_COLOR' },
      update: {},
      create: {
        key: 'SITE_THEME_COLOR',
        value: '#2563eb',
        category: 'branding',
        isPublic: true,
        description: 'Color principal del tema',
      },
    });

    await prisma.siteConfig.upsert({
      where: { key: 'SITE_FOOTER_TEXT' },
      update: {},
      create: {
        key: 'SITE_FOOTER_TEXT',
        value: '© 2024 Despacho Legal. Todos los derechos reservados.',
        category: 'general',
        isPublic: true,
        description: 'Texto del pie de página',
      },
    });

    await prisma.siteConfig.upsert({
      where: { key: 'SITE_MAINTENANCE_MODE' },
      update: {},
      create: {
        key: 'SITE_MAINTENANCE_MODE',
        value: 'false',
        category: 'system',
        isPublic: true,
        description: 'Modo mantenimiento activado',
      },
    });

    console.log('✅ Seed completado exitosamente!');
    console.log('📋 Datos creados:');
    console.log('- 1 Administrador');
    console.log('- 2 Abogados');
    console.log('- 2 Clientes');
    console.log('- 2 Expedientes');
    console.log('- 2 Tareas');
    console.log('- 2 Facturas con items');
    console.log('- 4 Parámetros de contacto');
    console.log('- 4 Parámetros legales');
    console.log('- 6 Parámetros de servicios');
    console.log('- 7 Configuraciones del sitio');
    
    console.log('🔑 Credenciales de acceso:');
    console.log('Admin: admin@despacho.com / password123');
    console.log('Abogado 1: lawyer1@example.com / password123');
    console.log('Abogado 2: lawyer2@example.com / password123');
    console.log('Cliente 1: client1@example.com / password123');
    console.log('Cliente 2: cliente2@email.com / password123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 