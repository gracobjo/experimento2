const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Obtener lista de tablas
    console.log('📋 Obteniendo lista de tablas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`✅ Tablas encontradas: ${tables.length}`);
    
    // Contar usuarios
    console.log('👥 Contando usuarios...');
    const userCount = await prisma.user.count();
    console.log(`✅ Usuarios en la base de datos: ${userCount}`);
    
    // Contar expedientes
    console.log('📁 Contando expedientes...');
    const expedienteCount = await prisma.expediente.count();
    console.log(`✅ Expedientes en la base de datos: ${expedienteCount}`);
    
    // Contar tareas
    console.log('📝 Contando tareas...');
    const taskCount = await prisma.task.count();
    console.log(`✅ Tareas en la base de datos: ${taskCount}`);
    
    // Contar facturas
    console.log('💰 Contando facturas...');
    const invoiceCount = await prisma.invoice.count();
    console.log(`✅ Facturas en la base de datos: ${invoiceCount}`);
    
    console.log('\n📊 RESUMEN DE LA BASE DE DATOS:');
    console.log(`- Tablas: ${tables.length}`);
    console.log(`- Usuarios: ${userCount}`);
    console.log(`- Expedientes: ${expedienteCount}`);
    console.log(`- Tareas: ${taskCount}`);
    console.log(`- Facturas: ${invoiceCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase(); 