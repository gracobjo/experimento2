const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseAndFixClientProfile() {
  try {
    console.log('🔍 Diagnóstico de perfiles de cliente...\n');

    // 1. Buscar el usuario client1@example.com
    const user = await prisma.user.findUnique({
      where: { email: 'client1@example.com' },
      include: { client: true }
    });

    if (!user) {
      console.log('❌ Usuario client1@example.com no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Tiene perfil de cliente: ${user.client ? 'SÍ' : 'NO'}`);

    if (user.client) {
      console.log(`   Client ID: ${user.client.id}`);
    }

    // 2. Buscar expedientes que apuntan al userId (incorrecto)
    const expedientesConUserId = await prisma.expediente.findMany({
      where: { clientId: user.id },
      include: {
        lawyer: true
      }
    });

    console.log(`\n📋 Expedientes que apuntan al userId (incorrecto): ${expedientesConUserId.length}`);
    expedientesConUserId.forEach((exp, index) => {
      console.log(`   ${index + 1}. ${exp.title} (${exp.status})`);
      console.log(`      Abogado: ${exp.lawyer?.name || 'N/A'}`);
    });

    // 3. Buscar expedientes que apuntan al clientId correcto
    if (user.client) {
      const expedientesCorrectos = await prisma.expediente.findMany({
        where: { clientId: user.client.id },
        include: {
          lawyer: true
        }
      });

      console.log(`\n📋 Expedientes que apuntan al clientId correcto: ${expedientesCorrectos.length}`);
      expedientesCorrectos.forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.title} (${exp.status})`);
        console.log(`      Abogado: ${exp.lawyer?.name || 'N/A'}`);
      });
    }

    // 4. Si el usuario no tiene perfil de cliente, crearlo
    if (!user.client) {
      console.log('\n🔧 Creando perfil de cliente...');
      
      const newClient = await prisma.client.create({
        data: {
          userId: user.id,
          dni: `DNI_${user.id.substring(0, 8)}`, // DNI temporal
          phone: null,
          address: null
        }
      });

      console.log(`✅ Perfil de cliente creado con ID: ${newClient.id}`);
      
      // 5. Actualizar expedientes que apuntan al userId para que apunten al clientId
      if (expedientesConUserId.length > 0) {
        const updatedExpedientes = await prisma.expediente.updateMany({
          where: { clientId: user.id },
          data: { clientId: newClient.id }
        });

        console.log(`✅ ${updatedExpedientes.count} expedientes actualizados para usar el nuevo clientId`);
      }
    } else {
      console.log('\n✅ El usuario ya tiene perfil de cliente');
      
      // 6. Corregir expedientes que apuntan al userId en lugar del clientId
      if (expedientesConUserId.length > 0) {
        console.log(`🔧 Actualizando ${expedientesConUserId.length} expedientes que apuntan al userId...`);
        
        const updatedExpedientes = await prisma.expediente.updateMany({
          where: { clientId: user.id },
          data: { clientId: user.client.id }
        });

        console.log(`✅ ${updatedExpedientes.count} expedientes actualizados`);
      }
    }

    // 7. Verificación final
    console.log('\n🔍 Verificación final...');
    
    const finalUser = await prisma.user.findUnique({
      where: { email: 'client1@example.com' },
      include: {
        client: {
          include: {
            expedientes: {
              include: {
                lawyer: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (finalUser?.client) {
      console.log(`✅ Usuario tiene ${finalUser.client.expedientes.length} expedientes asociados:`);
      finalUser.client.expedientes.forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.title} (${exp.status}) - Abogado: ${exp.lawyer?.name || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
diagnoseAndFixClientProfile(); 