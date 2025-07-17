const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function checkCases() {
  try {
    console.log('Checking cases in database...');
    
    const cases = await prisma.expediente.findMany({
      include: {
        client: {
          include: {
            user: true
          }
        },
        lawyer: true,
        documents: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${cases.length} cases:`);
    
    cases.forEach((caseItem, index) => {
      console.log(`\nCase ${index + 1}:`);
      console.log(`  ID: ${caseItem.id}`);
      console.log(`  Title: ${caseItem.title}`);
      console.log(`  Description: ${caseItem.description || 'No description'}`);
      console.log(`  Status: ${caseItem.status}`);
      console.log(`  CreatedAt: ${caseItem.createdAt}`);
      console.log(`  Client: ${caseItem.client ? 'Yes' : 'No'}`);
      if (caseItem.client) {
        console.log(`    Client Name: ${caseItem.client.user?.name || 'No name'}`);
        console.log(`    Client Email: ${caseItem.client.user?.email || 'No email'}`);
      }
      console.log(`  Lawyer: ${caseItem.lawyer ? 'Yes' : 'No'}`);
      if (caseItem.lawyer) {
        console.log(`    Lawyer Name: ${caseItem.lawyer.name || 'No name'}`);
        console.log(`    Lawyer Email: ${caseItem.lawyer.email || 'No email'}`);
      }
      console.log(`  Documents: ${caseItem.documents?.length || 0}`);
      console.log(`  Tasks: ${caseItem.tasks?.length || 0}`);
    });

    // Test the API endpoint
    console.log('\nTesting API endpoint...');
    
    // First login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@despacho.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token obtained');
    
    // Test the cases endpoint
    const casesResponse = await axios.get('http://localhost:3000/api/admin/cases', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('API Response:', casesResponse.data);
    console.log('Number of cases from API:', casesResponse.data.length);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCases(); 