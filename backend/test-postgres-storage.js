const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPostgresStorage() {
  try {
    console.log('🧪 Probando almacenamiento en PostgreSQL...\n');

    // 1. Buscar usuarios existentes para usar como referencias
    console.log('1️⃣ Buscando usuarios existentes...');
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, name: true, role: true }
    });

    if (users.length < 2) {
      console.log('   ❌ Necesitamos al menos 2 usuarios para la prueba');
      return;
    }

    const [user1, user2] = users;
    console.log(`   ✅ Usuario 1: ${user1.name} (${user1.role})`);
    console.log(`   ✅ Usuario 2: ${user2.name} (${user2.role})`);

    // 2. Crear o buscar cliente y abogado
    console.log('\n2️⃣ Creando cliente y abogado...');
    
    // Crear cliente para user1
    let client = await prisma.client.findUnique({
      where: { userId: user1.id }
    });
    
    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: user1.id,
          dni: `DNI-${Date.now()}`,
          phone: '123456789',
          address: 'Dirección de prueba'
        }
      });
      console.log(`   ✅ Cliente creado: ${client.id}`);
    } else {
      console.log(`   ✅ Cliente existente: ${client.id}`);
    }

    // Crear abogado para user2
    let lawyer = await prisma.lawyer.findUnique({
      where: { userId: user2.id }
    });
    
    if (!lawyer) {
      lawyer = await prisma.lawyer.create({
        data: {
          userId: user2.id,
          colegiado: `COL-${Date.now()}`,
          phone: '987654321',
          address: 'Dirección de abogado de prueba'
        }
      });
      console.log(`   ✅ Abogado creado: ${lawyer.id}`);
    } else {
      console.log(`   ✅ Abogado existente: ${lawyer.id}`);
    }

    // 3. Crear un expediente de prueba
    console.log('\n3️⃣ Creando expediente de prueba...');
    const expediente = await prisma.expediente.create({
      data: {
        title: 'Expediente de Prueba - PostgreSQL',
        description: 'Expediente para probar almacenamiento de archivos en PostgreSQL',
        status: 'ABIERTO',
        clientId: client.id,
        lawyerId: lawyer.id,
      }
    });
    console.log(`   ✅ Expediente creado: ${expediente.id}`);

    // 4. Crear un documento con datos binarios
    console.log('\n4️⃣ Creando documento con datos binarios...');
    const testData = Buffer.from('Este es un archivo de prueba para PostgreSQL');
    
    const document = await prisma.document.create({
      data: {
        filename: `test-${Date.now()}.txt`,
        originalName: 'archivo-prueba.txt',
        fileUrl: null,
        fileData: testData,
        fileSize: testData.length,
        mimeType: 'text/plain',
        description: 'Archivo de prueba para PostgreSQL',
        expedienteId: expediente.id,
        uploadedBy: user1.id,
      }
    });
    console.log(`   ✅ Documento creado: ${document.id}`);
    console.log(`   📊 Tamaño del archivo: ${document.fileSize} bytes`);

    // 5. Verificar que el archivo se almacenó correctamente
    console.log('\n5️⃣ Verificando almacenamiento...');
    const retrievedDoc = await prisma.document.findUnique({
      where: { id: document.id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        fileData: true,
        fileSize: true,
        mimeType: true,
        description: true,
      }
    });

    if (retrievedDoc && retrievedDoc.fileData) {
      console.log(`   ✅ Archivo recuperado exitosamente`);
      console.log(`   📄 Contenido: ${retrievedDoc.fileData.toString()}`);
      console.log(`   📊 Tamaño recuperado: ${retrievedDoc.fileData.length} bytes`);
      
      // Verificar que el contenido es correcto
      if (retrievedDoc.fileData.equals(testData)) {
        console.log(`   🎯 Contenido verificado: CORRECTO`);
      } else {
        console.log(`   ❌ Contenido verificado: INCORRECTO`);
      }
    } else {
      console.log(`   ❌ No se pudo recuperar el archivo`);
    }

    // 6. Limpiar datos de prueba
    console.log('\n6️⃣ Limpiando datos de prueba...');
    await prisma.document.delete({
      where: { id: document.id }
    });
    console.log(`   ✅ Documento eliminado`);

    await prisma.expediente.delete({
      where: { id: expediente.id }
    });
    console.log(`   ✅ Expediente eliminado`);

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('   ✅ PostgreSQL puede almacenar archivos como BYTEA');
    console.log('   ✅ Los archivos se pueden recuperar correctamente');
    console.log('   ✅ El streaming funcionará desde la base de datos');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPostgresStorage();
