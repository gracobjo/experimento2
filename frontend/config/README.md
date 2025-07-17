# Configuración del Frontend

## 📁 Ubicación
**Carpeta:** `experimento/frontend/config/`

## 🎯 Archivos de Configuración

### 📋 Lista de Archivos
- **[eslint.config.js](./eslint.config.js)** - Configuración de ESLint para linting
- **[postcss.config.js](./postcss.config.js)** - Configuración de PostCSS para procesamiento CSS
- **[tailwind.config.js](./tailwind.config.js)** - Configuración de Tailwind CSS
- **[tsconfig.json](./tsconfig.json)** - Configuración de TypeScript
- **[vite.config.ts](./vite.config.ts)** - Configuración de Vite (build tool)

## ⚙️ Configuraciones Detalladas

### 🔍 ESLint (`eslint.config.js`)
Configuración de linting para mantener calidad de código:
- **Reglas:** Estándares de React y TypeScript
- **Formato:** Integración con Prettier
- **Plugins:** React, TypeScript, hooks

### 🎨 PostCSS (`postcss.config.js`)
Procesamiento de CSS:
- **Tailwind CSS:** Framework de utilidades
- **Autoprefixer:** Prefijos automáticos
- **Optimización:** Minificación y purging

### 🌈 Tailwind CSS (`tailwind.config.js`)
Configuración del framework de estilos:
- **Colores:** Paleta personalizada
- **Espaciado:** Sistema de espaciado
- **Breakpoints:** Puntos de quiebre responsivos
- **Plugins:** Extensiones personalizadas

### 📝 TypeScript (`tsconfig.json`)
Configuración del compilador TypeScript:
- **Target:** ES2020
- **Module:** ESNext
- **JSX:** React
- **Strict:** Modo estricto habilitado

### ⚡ Vite (`vite.config.ts`)
Configuración del build tool:
- **Entry:** Punto de entrada principal
- **Output:** Configuración de salida
- **Plugins:** React, TypeScript
- **Dev Server:** Configuración de desarrollo

## 🚀 Configuración por Entorno

### 🏠 Desarrollo Local
```bash
# Variables de entorno
VITE_API_URL=http://localhost:3000
VITE_CHATBOT_URL=http://localhost:5000
VITE_ENV=development
```

### 🏭 Producción
```bash
# Variables de entorno
VITE_API_URL=https://api.tudominio.com
VITE_CHATBOT_URL=https://chatbot.tudominio.com
VITE_ENV=production
```

## 🔧 Personalización

### 🎨 Personalizar Colores
Editar `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... más tonos
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

### 📝 Agregar Reglas ESLint
Editar `eslint.config.js`:
```javascript
export default [
  {
    rules: {
      // Reglas personalizadas
      'no-console': 'warn',
      'prefer-const': 'error'
    }
  }
];
```

### ⚡ Configurar Vite
Editar `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

## 🧪 Testing de Configuración

### ✅ Verificar ESLint
```bash
npm run lint
```

### ✅ Verificar TypeScript
```bash
npm run type-check
```

### ✅ Verificar Build
```bash
npm run build
```

### ✅ Verificar Desarrollo
```bash
npm run dev
```

## 🔗 Enlaces Útiles

### 📚 Documentación
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [Vite Configuration](https://vitejs.dev/config/)

### 🛠️ Herramientas
- [ESLint Playground](https://eslint.org/play/)
- [Tailwind CSS Playground](https://play.tailwindcss.com/)
- [TypeScript Playground](https://www.typescriptlang.org/play/)

## 📝 Notas de Mantenimiento

### 🔄 Actualizaciones
1. **Dependencias:** Mantener actualizadas las versiones
2. **Configuraciones:** Revisar cambios en nuevas versiones
3. **Compatibilidad:** Verificar compatibilidad entre herramientas

### 🐛 Solución de Problemas
1. **Linting:** Verificar reglas en conflicto
2. **Build:** Revisar configuración de Vite
3. **Estilos:** Verificar configuración de Tailwind
4. **TypeScript:** Revisar configuración de tipos

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo Frontend 