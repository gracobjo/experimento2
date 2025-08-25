const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAuthDirectly() {
  try {
    console.log('🔍 PROBANDO AUTENTICACIÓN DIRECTAMENTE EN LA BASE DE DATOS\n');
    console.log('=' .repeat(60));

    // 1. Buscar el usuario de prueba
    console.log('\n1️⃣ Buscando usuario de prueba...');
    const testUser = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      }
    });

    if (!testUser) {
      console.log('❌ Usuario de prueba no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Nombre: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Rol: ${testUser.role}`);
    console.log(`   Contraseña hash: ${testUser.password.substring(0, 20)}...`);

    // 2. Probar la contraseña
    console.log('\n2️⃣ Probando contraseña...');
    const password = 'test123';
    const isValid = await bcrypt.compare(password, testUser.password);
    console.log(`   Contraseña "${password}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

    if (!isValid) {
      console.log('❌ La contraseña no es válida en la base de datos');
      return;
    }

    // 3. Simular el proceso de validación del AuthService
    console.log('\n3️⃣ Simulando validación del AuthService...');
    
    // Buscar usuario por email (como hace validateUser)
    const userByEmail = await prisma.user.findUnique({ 
      where: { email: 'test@example.com' } 
    });
    
    if (!userByEmail) {
      console.log('❌ Usuario no encontrado por email');
      return;
    }

    console.log('✅ Usuario encontrado por email');
    console.log(`   ID: ${userByEmail.id}`);
    console.log(`   Email: ${userByEmail.email}`);

    // Comparar contraseña (como hace validateUser)
    const passwordValid = await bcrypt.compare(password, userByEmail.password);
    console.log(`   Contraseña válida: ${passwordValid ? '✅ SÍ' : '❌ NO'}`);

    if (passwordValid) {
      // Simular la respuesta exitosa
      const { password: _, ...userWithoutPassword } = userByEmail;
      console.log('\n✅ Usuario validado exitosamente:');
      console.log(JSON.stringify(userWithoutPassword, null, 2));
    } else {
      console.log('❌ La contraseña no coincide en la validación');
    }

    // 4. Verificar si hay algún problema con el email
    console.log('\n4️⃣ Verificando formato del email...');
    console.log(`   Email original: "${testUser.email}"`);
    console.log(`   Email trimmed: "${testUser.email.trim()}"`);
    console.log(`   ¿Son iguales?: ${testUser.email === testUser.email.trim() ? '✅ SÍ' : '❌ NO'}`);

    // 5. Probar búsqueda con diferentes variaciones del email
    console.log('\n5️⃣ Probando búsquedas con diferentes variaciones...');
    
    const emailVariations = [
      'test@example.com',
      ' test@example.com',
      'test@example.com ',
      ' test@example.com ',
      'TEST@EXAMPLE.COM',
      'Test@Example.com'
    ];

    for (const emailVar of emailVariations) {
      const user = await prisma.user.findUnique({ where: { email: emailVar } });
      console.log(`   "${emailVar}": ${user ? '✅ Encontrado' : '❌ No encontrado'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthDirectly();
