import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixClientRelationships() {
  console.log('🔧 Iniciando corrección de relaciones cliente-expediente...');

  try {
    // 1. Obtener todos los usuarios con rol CLIENTE
    const clientUsers = await prisma.user.findMany({
      where: { role: 'CLIENTE' },
      include: {
        client: true // Incluir el perfil de cliente si existe
      }
    });

    console.log(`📋 Encontrados ${clientUsers.length} usuarios cliente:`);
    clientUsers.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}) - Perfil: ${user.client ? 'SÍ' : 'NO'}`);
    });

    // 2. Para cada usuario cliente, asegurar que tenga un perfil y corregir expedientes
    for (const user of clientUsers) {
      console.log(`\n🔍 Procesando cliente: ${user.email}`);

      // Buscar o crear el perfil de cliente
      let clientProfile = user.client;
      
      if (!clientProfile) {
        console.log(`  ⚠️  No tiene perfil de cliente. Creando...`);
        clientProfile = await prisma.client.create({
          data: {
            userId: user.id,
            dni: `DNI-${user.id.slice(0, 8)}`,
            phone: '+34 600 000 000',
            address: 'Dirección por defecto',
          }
        });
        console.log(`  ✅ Perfil creado con ID: ${clientProfile.id}`);
      } else {
        console.log(`  ✅ Ya tiene perfil con ID: ${clientProfile.id}`);
      }

      // 3. Buscar todos los expedientes que deberían pertenecer a este cliente
      // Buscar por email del usuario en el perfil de cliente
      const expedientes = await prisma.expediente.findMany({
        where: {
          client: {
            user: {
              email: user.email
            }
          }
        },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      });

      console.log(`  📁 Encontrados ${expedientes.length} expedientes para este cliente`);

      // 4. Actualizar los expedientes para que usen el perfil correcto
      for (const expediente of expedientes) {
        if (expediente.clientId !== clientProfile.id) {
          console.log(`  🔄 Actualizando expediente ${expediente.id} (${expediente.title})`);
          console.log(`     Antes: clientId = ${expediente.clientId}`);
          console.log(`     Después: clientId = ${clientProfile.id}`);

          await prisma.expediente.update({
            where: { id: expediente.id },
            data: { clientId: clientProfile.id }
          });
        } else {
          console.log(`  ✅ Expediente ${expediente.id} ya tiene el clientId correcto`);
        }
      }

      // 5. También buscar expedientes por el ID del usuario (por si acaso)
      const expedientesByUserId = await prisma.expediente.findMany({
        where: {
          client: {
            userId: user.id
          }
        }
      });

      console.log(`  📁 Expedientes por userId: ${expedientesByUserId.length}`);

      // 6. Verificar que no haya expedientes huérfanos o duplicados
      const allClientExpedientes = await prisma.expediente.findMany({
        where: {
          client: {
            user: {
              email: user.email
            }
          }
        }
      });

      console.log(`  📊 Total de expedientes después de la corrección: ${allClientExpedientes.length}`);
    }

    // 7. Verificación final
    console.log('\n🔍 Verificación final:');
    
    for (const user of clientUsers) {
      const finalExpedientes = await prisma.expediente.findMany({
        where: {
          client: {
            userId: user.id
          }
        },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      });

      console.log(`  ${user.email}: ${finalExpedientes.length} expedientes`);
      finalExpedientes.forEach(exp => {
        console.log(`    - ${exp.id}: ${exp.title} (clientId: ${exp.clientId})`);
      });
    }

    console.log('\n✅ Corrección completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  }
}

// Ejecutar la corrección
fixClientRelationships()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 