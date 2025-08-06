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

    console.log('✅ Seed completado exitosamente!');
    console.log('📋 Datos creados:');
    console.log('- 1 Administrador');
    console.log('- 2 Abogados');
    console.log('- 2 Clientes');
    console.log('- 2 Expedientes');
    console.log('- 2 Tareas');
    
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