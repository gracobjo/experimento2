// Script para debuggear la autenticación
// Ejecutar en la consola del navegador

console.log('🔍 Debuggeando autenticación...\n');

// 1. Verificar localStorage
console.log('1️⃣ LocalStorage:');
console.log('   Token:', localStorage.getItem('token') ? '✅ Existe' : '❌ No existe');
console.log('   User:', localStorage.getItem('user') ? '✅ Existe' : '❌ No existe');
console.log('   UserData:', localStorage.getItem('userData') ? '✅ Existe' : '❌ No existe');

// 2. Verificar si hay token
const token = localStorage.getItem('token');
if (token) {
  console.log('\n2️⃣ Token JWT:');
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('   Email:', payload.email);
    console.log('   Role:', payload.role);
    console.log('   Expira:', new Date(payload.exp * 1000).toLocaleString());
    console.log('   Válido:', payload.exp * 1000 > Date.now() ? '✅ Sí' : '❌ No');
  } catch (error) {
    console.log('   ❌ Error decodificando token:', error.message);
  }
}

// 3. Verificar contexto de React (si está disponible)
console.log('\n3️⃣ Contexto de React:');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('   ✅ React DevTools disponible');
} else {
  console.log('   ❌ React DevTools no disponible');
}

// 4. Verificar si hay errores en consola
console.log('\n4️⃣ Errores en consola:');
console.log('   Revisa si hay errores de JavaScript arriba');

// 5. Verificar estado del usuario en el contexto
console.log('\n5️⃣ Estado del usuario:');
console.log('   Ejecuta esto después de hacer login:');
console.log('   console.log("Usuario en contexto:", useAuth().user);');

// 6. Verificar la respuesta del login
console.log('\n6️⃣ Para debuggear el login:');
console.log('   En la consola del navegador, ejecuta:');
console.log('   localStorage.setItem("debug", "true");');
console.log('   Luego haz login y revisa la consola para ver la respuesta completa');
