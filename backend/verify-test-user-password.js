const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function verifyTestUserPassword() {
  try {
    console.log('🔍 VERIFICANDO CONTRASEÑA DEL USUARIO DE PRUEBA\n');
    console.log('=' .repeat(60));

    // Buscar el usuario de prueba
    const testUser = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      }
    });

    if (!testUser) {
      console.log('❌ Usuario de prueba no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Nombre: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Rol: ${testUser.role}`);
    console.log(`   Contraseña hash: ${testUser.password.substring(0, 20)}...`);
    console.log(`   Longitud hash: ${testUser.password.length}`);

    // Probar diferentes contraseñas
    console.log('\n🧪 PROBANDO CONTRASEÑAS\n');
    console.log('-'.repeat(40));

    const testPasswords = [
      'test123',
      'test',
      '123',
      'password',
      'admin',
      'admin123'
    ];

    for (const password of testPasswords) {
      try {
        const isValid = await bcrypt.compare(password, testUser.password);
        console.log(`   "${password}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        
        if (isValid) {
          console.log(`   🎉 ¡Contraseña correcta encontrada: "${password}"!`);
        }
      } catch (error) {
        console.log(`   "${password}": ❌ ERROR - ${error.message}`);
      }
    }

    // Crear un nuevo hash para comparar
    console.log('\n🔧 CREANDO NUEVO HASH PARA COMPARAR\n');
    console.log('-'.repeat(40));
    
    const newHash = await bcrypt.hash('test123', 10);
    console.log(`   Hash original: ${testUser.password.substring(0, 20)}...`);
    console.log(`   Hash nuevo:    ${newHash.substring(0, 20)}...`);
    
    const isNewHashValid = await bcrypt.compare('test123', newHash);
    console.log(`   ¿Nuevo hash válido?: ${isNewHashValid ? '✅ SÍ' : '❌ NO'}`);

    // Verificar si el hash original es válido
    const isOriginalValid = await bcrypt.compare('test123', testUser.password);
    console.log(`   ¿Hash original válido?: ${isOriginalValid ? '✅ SÍ' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestUserPassword();
