// Script para probar el timeout de inactividad del frontend
// Ejecutar en la consola del navegador

console.log('=== PRUEBA DE TIMEOUT DE INACTIVIDAD ===');

// Simular el comportamiento del componente
let isOpen = true;
let messages = [];
let inactivityTimer = null;
let warningTimer = null;

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);
  
  if (isOpen) {
    console.log('⏰ Iniciando timers de inactividad...');
    
    // Advertencia a los 5 segundos (para pruebas)
    warningTimer = setTimeout(() => {
      if (isOpen) {
        console.log('⚠️ ADVERTENCIA: No hay actividad. El chat se cerrará en 5 segundos.');
        messages.push({
          text: '⚠️ No hay actividad. El chat se cerrará automáticamente en 5 segundos si no respondes.',
          isUser: false,
          timestamp: new Date().toISOString()
        });
        console.log('Mensaje de advertencia agregado:', messages[messages.length - 1]);
      }
    }, 5000);
    
    // Cierre automático a los 10 segundos (para pruebas)
    inactivityTimer = setTimeout(() => {
      if (isOpen) {
        console.log('🔒 CERRANDO CHAT POR INACTIVIDAD');
        isOpen = false;
        messages = [];
        console.log('Chat cerrado automáticamente');
      }
    }, 10000);
  }
}

function simulateUserActivity() {
  console.log('👤 Actividad del usuario detectada');
  messages.push({
    text: 'Mensaje del usuario',
    isUser: true,
    timestamp: new Date().toISOString()
  });
  resetInactivityTimer();
}

function closeChatManually() {
  console.log('🔒 Cerrando chat manualmente');
  isOpen = false;
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);
  messages = [];
  console.log('Chat cerrado manualmente');
}

// Iniciar prueba
console.log('🚀 Iniciando prueba de timeout...');
resetInactivityTimer();

console.log('\n=== INSTRUCCIONES ===');
console.log('1. Para simular actividad del usuario: simulateUserActivity()');
console.log('2. Para cerrar manualmente: closeChatManually()');
console.log('3. Para ver estado actual: console.log({isOpen, messages})');
console.log('4. Los timers están configurados para 5s (advertencia) y 10s (cierre)');
console.log('\n⏰ Esperando 10 segundos para cierre automático...'); 