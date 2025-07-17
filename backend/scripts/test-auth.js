const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // 1. Login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@despacho.com',
      password: 'password123'
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // 2. Test /auth/me endpoint
    const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Auth/me response:', meResponse.data);
    
    // 3. Test /admin/users endpoint
    const usersResponse = await axios.get('http://localhost:3000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Admin/users response:', usersResponse.data);
    console.log('Number of users:', usersResponse.data.length);
    
    // Save token to file for frontend testing
    const fs = require('fs');
    fs.writeFileSync('token.txt', token);
    console.log('Token saved to token.txt');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAuth(); 