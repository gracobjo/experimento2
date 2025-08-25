const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 CREANDO USUARIO DE PRUEBA\n');
    console.log('=' .repeat(60));

    // Verificar si ya existe un usuario de prueba
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      }
    });

    if (existingUser) {
      console.log('⚠️ El usuario de prueba ya existe');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nombre: ${existingUser.name}`);
      console.log(`   Rol: ${existingUser.role}`);
      
      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash('test123', 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Contraseña actualizada a: test123');
      return;
    }

    // Crear nuevo usuario de prueba
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuario de prueba creado exitosamente');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Nombre: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Rol: ${testUser.role}`);
    console.log(`   Contraseña: test123`);

    // Crear cliente asociado
    const client = await prisma.client.create({
      data: {
        userId: testUser.id,
        dni: 'TEST123456',
        phone: '+34 600 000 000',
        address: 'Dirección de Prueba'
      }
    });

    console.log('\n✅ Cliente asociado creado');
    console.log(`   DNI: ${client.dni}`);
    console.log(`   Teléfono: ${client.phone}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
