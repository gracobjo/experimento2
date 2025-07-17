# Scripts del Frontend

## 📁 Ubicación
**Carpeta:** `experimento/frontend/scripts/`

## 🎯 Scripts de Utilidad

### 📋 Lista de Scripts
- **[build-optimization.js](./build-optimization.js)** - Optimización de build de producción
- **[performance-monitor.js](./performance-monitor.js)** - Monitoreo de performance
- **[bundle-analyzer.js](./bundle-analyzer.js)** - Análisis de bundle
- **[code-quality.js](./code-quality.js)** - Verificación de calidad de código

## 🚀 Scripts Disponibles

### 🔨 Build Optimization (`build-optimization.js`)
Optimización automática del build de producción:
- **Compresión:** Optimización de assets
- **Tree Shaking:** Eliminación de código no usado
- **Code Splitting:** División inteligente de bundles
- **Caching:** Configuración de cache

```bash
# Ejecutar optimización
node scripts/build-optimization.js

# Con parámetros específicos
node scripts/build-optimization.js --analyze --compress
```

### 📊 Performance Monitor (`performance-monitor.js`)
Monitoreo de métricas de performance:
- **Lighthouse:** Análisis de Core Web Vitals
- **Bundle Size:** Tamaño de bundles
- **Load Time:** Tiempos de carga
- **Memory Usage:** Uso de memoria

```bash
# Monitoreo básico
node scripts/performance-monitor.js

# Monitoreo completo
node scripts/performance-monitor.js --full --report
```

### 📦 Bundle Analyzer (`bundle-analyzer.js`)
Análisis detallado de bundles:
- **Tamaño:** Análisis de tamaño por módulo
- **Dependencias:** Visualización de dependencias
- **Duplicados:** Detección de código duplicado
- **Optimizaciones:** Sugerencias de optimización

```bash
# Análisis básico
node scripts/bundle-analyzer.js

# Análisis con visualización
node scripts/bundle-analyzer.js --visualize
```

### 🔍 Code Quality (`code-quality.js`)
Verificación de calidad de código:
- **Linting:** Verificación de ESLint
- **Type Checking:** Verificación de TypeScript
- **Formatting:** Verificación de Prettier
- **Security:** Análisis de seguridad

```bash
# Verificación completa
node scripts/code-quality.js

# Solo linting
node scripts/code-quality.js --lint-only
```

## 🔧 Configuración de Scripts

### ⚙️ Configuración Global
```javascript
// scripts/config.js
module.exports = {
  build: {
    analyze: true,
    compress: true,
    sourceMap: false
  },
  performance: {
    lighthouse: true,
    bundleSize: true,
    memory: true
  },
  quality: {
    lint: true,
    typeCheck: true,
    format: true,
    security: true
  }
};
```

### 📝 Variables de Entorno
```bash
# .env.scripts
NODE_ENV=production
ANALYZE_BUNDLE=true
PERFORMANCE_MONITORING=true
CODE_QUALITY_CHECKS=true
```

## 🚀 Uso de Scripts

### 📋 Comandos Principales
```bash
# Optimización de build
npm run optimize:build

# Monitoreo de performance
npm run monitor:performance

# Análisis de bundle
npm run analyze:bundle

# Verificación de calidad
npm run check:quality
```

### 🎯 Scripts Específicos

#### 🔨 Optimización
```bash
# Optimización básica
node scripts/build-optimization.js

# Optimización con análisis
node scripts/build-optimization.js --analyze

# Optimización para producción
node scripts/build-optimization.js --prod
```

#### 📊 Monitoreo
```bash
# Monitoreo básico
node scripts/performance-monitor.js

# Monitoreo con reporte
node scripts/performance-monitor.js --report

# Monitoreo continuo
node scripts/performance-monitor.js --watch
```

#### 📦 Análisis
```bash
# Análisis básico
node scripts/bundle-analyzer.js

# Análisis con visualización
node scripts/bundle-analyzer.js --visualize

# Análisis de dependencias
node scripts/bundle-analyzer.js --deps
```

#### 🔍 Calidad
```bash
# Verificación completa
node scripts/code-quality.js

# Solo linting
node scripts/code-quality.js --lint

# Solo type checking
node scripts/code-quality.js --types
```

## 📊 Reportes y Métricas

### 📈 Métricas de Performance
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

### 📦 Métricas de Bundle
- **Total Size:** < 500KB
- **JavaScript:** < 300KB
- **CSS:** < 100KB
- **Images:** < 100KB

### 🔍 Métricas de Calidad
- **Lint Score:** 100%
- **Type Coverage:** > 95%
- **Test Coverage:** > 80%
- **Security Score:** A+

## 🔧 Personalización

### ⚙️ Configuración Personalizada
```javascript
// scripts/custom-config.js
module.exports = {
  customOptimizations: {
    imageCompression: true,
    fontOptimization: true,
    criticalCSS: true
  },
  customMetrics: {
    customLighthouse: true,
    customBundleAnalysis: true
  }
};
```

### 🎯 Scripts Personalizados
```javascript
// scripts/custom-script.js
const { execSync } = require('child_process');

function customOptimization() {
  console.log('Ejecutando optimización personalizada...');
  
  // Lógica personalizada
  execSync('npm run build');
  execSync('npm run analyze');
  
  console.log('Optimización completada');
}

module.exports = { customOptimization };
```

## 🚨 Troubleshooting

### 🔧 Problemas Comunes

#### Scripts No Ejecutan
```bash
# Verificar permisos
chmod +x scripts/*.js

# Verificar Node.js
node --version

# Verificar dependencias
npm install
```

#### Performance Issues
```bash
# Limpiar cache
npm run clean

# Reinstalar dependencias
rm -rf node_modules
npm install

# Verificar configuración
node scripts/code-quality.js --config
```

#### Build Falla
```bash
# Verificar configuración
node scripts/build-optimization.js --check

# Debug mode
node scripts/build-optimization.js --debug

# Verbose output
node scripts/build-optimization.js --verbose
```

## 📋 Best Practices

### ✅ Recomendaciones
1. **Ejecutar regularmente:** Usar scripts en CI/CD
2. **Monitorear métricas:** Revisar reportes periódicamente
3. **Optimizar continuamente:** Mejorar basado en métricas
4. **Documentar cambios:** Mantener documentación actualizada

### ❌ Anti-patterns
1. **Scripts lentos:** Evitar scripts que tomen mucho tiempo
2. **Dependencias pesadas:** Minimizar dependencias de scripts
3. **Configuración hardcodeada:** Usar variables de entorno
4. **Sin manejo de errores:** Siempre incluir error handling

## 🔗 Enlaces Útiles

### 📚 Documentación
- [Node.js Scripts](https://nodejs.org/api/child_process.html)
- [Webpack Optimization](https://webpack.js.org/guides/optimization/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 🛠️ Herramientas
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Performance Monitor](https://github.com/GoogleChrome/lighthouse)

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo Frontend 