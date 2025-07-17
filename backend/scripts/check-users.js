const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany({
      include: {
        client: true,
        expedientesAsLawyer: true,
        appointmentsAsLawyer: true,
        assignedTasks: true,
        createdTasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  CreatedAt: ${user.createdAt}`);
      console.log(`  Client: ${user.client ? 'Yes' : 'No'}`);
      if (user.client) {
        console.log(`    DNI: ${user.client.dni}`);
        console.log(`    Phone: ${user.client.phone || 'N/A'}`);
        console.log(`    Address: ${user.client.address || 'N/A'}`);
      }
      console.log(`  Expedientes as Lawyer: ${user.expedientesAsLawyer?.length || 0}`);
      console.log(`  Appointments as Lawyer: ${user.appointmentsAsLawyer?.length || 0}`);
      console.log(`  Assigned Tasks: ${user.assignedTasks?.length || 0}`);
      console.log(`  Created Tasks: ${user.createdTasks?.length || 0}`);
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 