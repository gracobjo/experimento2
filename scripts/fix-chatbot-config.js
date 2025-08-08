#!/usr/bin/env node

/**
 * Script para verificar y corregir la configuración del chatbot
 * 
 * Uso: node scripts/fix-chatbot-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando configuración del chatbot...');

// Configuración correcta
const correctConfig = {
  BACKEND_URL: 'https://experimento2-production.up.railway.app',
  CHATBOT_PORT: '8000',
  CHATBOT_HOST: '0.0.0.0',
  CORS_ORIGINS: 'https://experimento2-fenm.vercel.app,https://experimento2-production.up.railway.app,http://localhost:5173,http://localhost:3000'
};

// Verificar archivo de configuración
const configPath = path.join(__dirname, '../chatbot/config/config.env');
const mainPath = path.join(__dirname, '../chatbot/main_improved_fixed.py');

console.log('📋 Verificando archivos de configuración...');

// Verificar si existe el archivo de configuración
if (!fs.existsSync(configPath)) {
  console.log('❌ Archivo de configuración no encontrado');
  console.log('📝 Creando archivo de configuración...');
  
  let configContent = '';
  for (const [key, value] of Object.entries(correctConfig)) {
    configContent += `${key}=${value}\n`;
  }
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Archivo de configuración creado');
} else {
  console.log('✅ Archivo de configuración encontrado');
  
  // Leer y verificar configuración
  const configContent = fs.readFileSync(configPath, 'utf8');
  const lines = configContent.split('\n');
  
  let needsUpdate = false;
  const updatedLines = [];
  
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (correctConfig[key]) {
        if (value !== correctConfig[key]) {
          console.log(`🔄 Actualizando ${key}: ${value} → ${correctConfig[key]}`);
          updatedLines.push(`${key}=${correctConfig[key]}`);
          needsUpdate = true;
        } else {
          updatedLines.push(line);
        }
      } else {
        updatedLines.push(line);
      }
    } else {
      updatedLines.push(line);
    }
  }
  
  if (needsUpdate) {
    fs.writeFileSync(configPath, updatedLines.join('\n'));
    console.log('✅ Configuración actualizada');
  } else {
    console.log('✅ Configuración correcta');
  }
}

// Verificar archivo principal del chatbot
console.log('📋 Verificando archivo principal del chatbot...');

if (fs.existsSync(mainPath)) {
  let mainContent = fs.readFileSync(mainPath, 'utf8');
  
  // Verificar si la URL del backend está correcta
  if (mainContent.includes('BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")')) {
    console.log('🔄 Actualizando URL del backend en main.py...');
    mainContent = mainContent.replace(
      'BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")',
      'BACKEND_URL = os.getenv("BACKEND_URL", "https://experimento2-production.up.railway.app")'
    );
    fs.writeFileSync(mainPath, mainContent);
    console.log('✅ URL del backend actualizada');
  } else {
    console.log('✅ URL del backend correcta');
  }
} else {
  console.log('❌ Archivo principal del chatbot no encontrado');
}

console.log('\n📝 Instrucciones para aplicar los cambios:');
console.log('1. Reinicia el servicio del chatbot');
console.log('2. Verifica que el backend esté funcionando en Railway');
console.log('3. Prueba el flujo de citas desde el frontend');

console.log('\n🔍 Para verificar la configuración:');
console.log('- Chatbot: https://chatbot-legal-production-b91c.up.railway.app/health');
console.log('- Backend: https://experimento2-production.up.railway.app/health');
console.log('- Frontend: https://experimento2-fenm.vercel.app');
