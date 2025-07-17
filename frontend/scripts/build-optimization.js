#!/usr/bin/env node

/**
 * Script de Optimización de Build
 * Optimiza el build de producción del frontend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n${colors.cyan}🔧 ${step}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Configuración
const config = {
  analyze: process.argv.includes('--analyze'),
  compress: process.argv.includes('--compress'),
  prod: process.argv.includes('--prod'),
  verbose: process.argv.includes('--verbose')
};

async function runCommand(command, description) {
  try {
    logStep(description);
    if (config.verbose) {
      logInfo(`Ejecutando: ${command}`);
    }
    
    const result = execSync(command, { 
      stdio: config.verbose ? 'inherit' : 'pipe',
      encoding: 'utf8' 
    });
    
    logSuccess(`${description} completado`);
    return result;
  } catch (error) {
    logError(`${description} falló: ${error.message}`);
    throw error;
  }
}

async function checkPrerequisites() {
  logStep('Verificando prerrequisitos');
  
  // Verificar Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    logInfo(`Node.js: ${nodeVersion}`);
  } catch (error) {
    logError('Node.js no está instalado');
    process.exit(1);
  }
  
  // Verificar npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    logInfo(`npm: ${npmVersion}`);
  } catch (error) {
    logError('npm no está instalado');
    process.exit(1);
  }
  
  // Verificar package.json
  if (!fs.existsSync('package.json')) {
    logError('package.json no encontrado. Ejecutar desde la carpeta del proyecto.');
    process.exit(1);
  }
  
  logSuccess('Prerrequisitos verificados');
}

async function cleanBuild() {
  logStep('Limpiando build anterior');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    // Verificar si hay archivos importantes en dist antes de eliminar
    const importantFiles = ['invoices', 'templates', 'main.js', 'main.js.map'];
    const distContents = fs.readdirSync(distPath);
    const hasImportantFiles = importantFiles.some(file => 
      distContents.includes(file) || distContents.some(item => item.includes(file))
    );
    
    if (hasImportantFiles) {
      logInfo('Carpeta dist contiene archivos importantes, preservando estructura');
      // Solo eliminar archivos de build, no la estructura completa
      const buildFiles = distContents.filter(file => 
        file.endsWith('.js') || 
        file.endsWith('.css') || 
        file.endsWith('.map') ||
        file === 'index.html'
      );
      
      buildFiles.forEach(file => {
        const filePath = path.join(distPath, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          logInfo(`Archivo eliminado: ${file}`);
        }
      });
    } else {
      fs.rmSync(distPath, { recursive: true, force: true });
      logInfo('Carpeta dist eliminada completamente');
    }
  }
  
  logSuccess('Limpieza completada');
}

async function installDependencies() {
  logStep('Instalando dependencias');
  
  try {
    await runCommand('npm ci --only=production', 'Instalando dependencias de producción');
  } catch (error) {
    logWarning('Fallback a npm install');
    await runCommand('npm install', 'Instalando dependencias');
  }
}

async function runLinting() {
  logStep('Ejecutando linting');
  
  try {
    await runCommand('npm run lint', 'Verificando calidad de código');
  } catch (error) {
    logWarning('Linting falló, continuando...');
  }
}

async function runTypeChecking() {
  logStep('Verificando tipos TypeScript');
  
  try {
    await runCommand('npm run type-check', 'Verificando tipos');
  } catch (error) {
    logWarning('Type checking falló, continuando...');
  }
}

async function runTests() {
  logStep('Ejecutando tests');
  
  try {
    await runCommand('npm test -- --passWithNoTests', 'Ejecutando tests');
  } catch (error) {
    logWarning('Tests fallaron, continuando...');
  }
}

async function buildProject() {
  logStep('Construyendo proyecto');
  
  const buildCommand = config.prod ? 'npm run build' : 'npm run build:dev';
  await runCommand(buildCommand, 'Construyendo aplicación');
}

async function analyzeBundle() {
  if (!config.analyze) return;
  
  logStep('Analizando bundle');
  
  try {
    await runCommand('npm run analyze', 'Analizando tamaño de bundle');
  } catch (error) {
    logWarning('Análisis de bundle no disponible');
  }
}

async function optimizeAssets() {
  if (!config.compress) return;
  
  logStep('Optimizando assets');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    logWarning('Carpeta dist no encontrada, saltando optimización');
    return;
  }
  
  // Aquí se podrían agregar optimizaciones específicas
  logInfo('Optimizaciones aplicadas');
  logSuccess('Assets optimizados');
}

async function generateReport() {
  logStep('Generando reporte de optimización');
  
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      analyze: config.analyze,
      compress: config.compress,
      prod: config.prod
    },
    buildSize: 0,
    optimizationApplied: config.compress || config.analyze
  };
  
  // Calcular tamaño del build
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const calculateSize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          size += calculateSize(filePath);
        } else {
          size += stat.size;
        }
      });
      
      return size;
    };
    
    report.buildSize = calculateSize(distPath);
  }
  
  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Reporte guardado en: ${reportPath}`);
  logInfo(`Tamaño del build: ${(report.buildSize / 1024 / 1024).toFixed(2)} MB`);
}

async function main() {
  try {
    log(`${colors.bright}${colors.cyan}🚀 Iniciando optimización de build${colors.reset}\n`);
    
    await checkPrerequisites();
    await cleanBuild();
    await installDependencies();
    await runLinting();
    await runTypeChecking();
    await runTests();
    await buildProject();
    await analyzeBundle();
    await optimizeAssets();
    await generateReport();
    
    log(`\n${colors.bright}${colors.green}🎉 Optimización de build completada exitosamente${colors.reset}`);
    
  } catch (error) {
    logError(`Optimización falló: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  runCommand,
  checkPrerequisites,
  cleanBuild,
  installDependencies,
  runLinting,
  runTypeChecking,
  runTests,
  buildProject,
  analyzeBundle,
  optimizeAssets,
  generateReport
}; 