const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Verificando usuarios en la base de datos...');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n👤 Usuario ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Creado: ${user.createdAt}`);
    });

    // Verificar si existe el admin
    const admin = users.find(u => u.email === 'admin@despacho.com');
    if (admin) {
      console.log('\n✅ Usuario admin encontrado');
    } else {
      console.log('\n❌ Usuario admin NO encontrado');
    }

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error);
  }
}

checkUsers()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 