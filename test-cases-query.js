const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCasesQuery() {
  console.log('🔍 PROBANDO CONSULTA DE CASOS DIRECTAMENTE EN LA BASE DE DATOS\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar conexión
    console.log('\n1️⃣ Verificando conexión...');
    await prisma.$connect();
    console.log('   ✅ Conexión exitosa');

    // 2. Verificar si hay expedientes en la base de datos
    console.log('\n2️⃣ Verificando expedientes en la base de datos...');
    
    const expedientesCount = await prisma.expediente.count();
    console.log('   📊 Total de expedientes:', expedientesCount);

    if (expedientesCount > 0) {
      const expedientes = await prisma.expediente.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          clientId: true,
          lawyerId: true,
          createdAt: true
        }
      });
      
      console.log('   📋 Primeros expedientes:');
      expedientes.forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.title} (${exp.status})`);
        console.log(`         Cliente: ${exp.clientId}, Abogado: ${exp.lawyerId}`);
      });
    }

    // 3. Verificar si hay clientes
    console.log('\n3️⃣ Verificando clientes...');
    
    const clientesCount = await prisma.client.count();
    console.log('   📊 Total de clientes:', clientesCount);

    if (clientesCount > 0) {
      const clientes = await prisma.client.findMany({
        take: 3,
        select: {
          id: true,
          userId: true,
          dni: true
        }
      });
      
      console.log('   👤 Primeros clientes:');
      clientes.forEach((cli, index) => {
        console.log(`      ${index + 1}. DNI: ${cli.dni}, UserID: ${cli.userId}`);
      });
    }

    // 4. Verificar si hay usuarios
    console.log('\n4️⃣ Verificando usuarios...');
    
    const usuariosCount = await prisma.user.count();
    console.log('   📊 Total de usuarios:', usuariosCount);

    if (usuariosCount > 0) {
      const usuarios = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('   👥 Primeros usuarios:');
      usuarios.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // 5. Probar la consulta compleja que está fallando
    console.log('\n5️⃣ Probando consulta compleja de expedientes...');
    
    try {
      const expedientesCompletos = await prisma.expediente.findMany({
        take: 2,
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          lawyer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          documents: {
            orderBy: {
              uploadedAt: 'desc'
            },
            take: 5
          },
          _count: {
            select: {
              documents: true,
              tasks: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log('   ✅ Consulta compleja exitosa');
      console.log('   📊 Expedientes obtenidos:', expedientesCompletos.length);
      
      if (expedientesCompletos.length > 0) {
        const exp = expedientesCompletos[0];
        console.log('   📋 Primer expediente:');
        console.log(`      Título: ${exp.title}`);
        console.log(`      Cliente: ${exp.client?.user?.name || 'N/A'}`);
        console.log(`      Abogado: ${exp.lawyer?.name || 'N/A'}`);
        console.log(`      Documentos: ${exp._count.documents}`);
        console.log(`      Tareas: ${exp._count.tasks}`);
      }
      
    } catch (error) {
      console.log('   ❌ Error en consulta compleja:', error.message);
      console.log('   🔍 Este es probablemente el error que causa el 500');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

testCasesQuery();
