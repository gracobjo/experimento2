// Script para establecer el token en localStorage
// Ejecutar en la consola del navegador en http://localhost:5173

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGRlc3BhY2hvLmNvbSIsInN1YiI6IjBkY2ZlYmVlLTc0MjAtNGM2MS1iYTE5LTM5ZGJjYWFiMmQ4NiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MjY3Mzg0MywiZXhwIjoxNzUyNzYwMjQzfQ.gdEWRIw8mFCXiWD_ZkXe4B8aqtqw90NxIscO632OHYA';

localStorage.setItem('token', token);
console.log('Token establecido en localStorage');
console.log('Token verificado:', localStorage.getItem('token'));

// Recargar la página para que el contexto de autenticación se actualice
window.location.reload(); 