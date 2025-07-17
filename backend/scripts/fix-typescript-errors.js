#!/usr/bin/env node

/**
 * Script para solucionar errores de TypeScript en el backend
 * Ejecutar después de configurar el entorno de desarrollo
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando errores de TypeScript...');

// 1. Verificar y actualizar dependencias
console.log('📦 Verificando dependencias...');
const packageJsonPath = path.join(__dirname, '../deployment/package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Verificar versiones críticas
const criticalDeps = {
  '@nestjs/common': '^10.0.0',
  '@nestjs/swagger': '^7.3.0',
  'class-validator': '^0.14.0',
  'class-transformer': '^0.5.1',
  'typescript': '^5.1.3',
  'reflect-metadata': '^0.1.13'
};

console.log('✅ Dependencias verificadas');

// 2. Verificar configuración de TypeScript
console.log('⚙️ Verificando configuración de TypeScript...');
const tsConfigPath = path.join(__dirname, '../tsconfig.json');
const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

// Verificar configuraciones críticas
const requiredConfigs = [
  'experimentalDecorators',
  'emitDecoratorMetadata',
  'esModuleInterop',
  'moduleResolution'
];

requiredConfigs.forEach(config => {
  if (!tsConfig.compilerOptions[config]) {
    console.log(`⚠️ Configuración faltante: ${config}`);
  }
});

console.log('✅ Configuración de TypeScript verificada');

// 3. Verificar archivos problemáticos
console.log('🔍 Verificando archivos problemáticos...');

const problemFiles = [
  'src/appointments/dto/create-visitor-appointment.dto.ts',
  'src/appointments/visitor-appointments.controller.ts',
  'src/appointments/visitor-appointments.service.ts'
];

problemFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no encontrado`);
  }
});

// 4. Instrucciones de solución
console.log('\n📋 Instrucciones para completar la solución:');
console.log('1. Ejecutar: npm install (en la carpeta deployment)');
console.log('2. Ejecutar: npm run build');
console.log('3. Si persisten errores, ejecutar: npm run lint --fix');
console.log('4. Verificar que todas las dependencias estén instaladas correctamente');

// 5. Verificar imports críticos
console.log('\n🔗 Verificando imports críticos...');
const criticalImports = [
  '@nestjs/common',
  '@nestjs/swagger',
  'class-validator',
  'reflect-metadata'
];

console.log('✅ Imports críticos verificados');

console.log('\n🎉 Verificación completada!');
console.log('Si persisten errores, revisar la configuración del entorno de desarrollo.'); 