# Scripts de Solución Temporal para Servicios Dinámicos

## 📋 Descripción

Este directorio contiene scripts temporales para solucionar el problema de que los servicios no se muestran dinámicamente en el frontend de la aplicación.

## 🚨 Problema Identificado

- **Componente ServiceCards** usa datos estáticos del layout en lugar de consultar la API
- **Vercel no está haciendo deploy** debido al límite de 100 deploys gratuitos por día
- **Los servicios dinámicos** no se muestran en el dashboard ni en el modal

## 🔧 Solución Temporal

Los scripts fuerzan la carga de servicios desde la API y actualizan el DOM dinámicamente.

## 📁 Archivos

- `services-fix.js` - Scripts completos con documentación
- `README.md` - Esta documentación

## 🚀 Cómo Usar

### Opción 1: Script Completo (Recomendado)

1. **Abrir la consola del navegador** (F12)
2. **Ir a** [https://experimento2-fenm.vercel.app/](https://experimento2-fenm.vercel.app/)
3. **Copiar y pegar** todo el contenido de `services-fix.js`
4. **Presionar Enter**
5. **Los servicios se actualizarán automáticamente**

### Opción 2: Scripts Individuales

```javascript
// 1. Diagnóstico
diagnoseServices()

// 2. Solo dashboard
updateDashboardServices()

// 3. Completo con iconos
updateServicesWithIcons()
```

## 📊 Funciones Disponibles

### `diagnoseServices()`
- **Propósito**: Verificar si los servicios llegan correctamente desde la API
- **Uso**: Ejecutar primero para diagnosticar el problema
- **Resultado**: Muestra en consola los datos de los servicios

### `updateDashboardServices()`
- **Propósito**: Actualizar solo las tarjetas del dashboard
- **Uso**: Cuando solo quieres arreglar las tarjetas principales
- **Resultado**: Dashboard actualizado con servicios dinámicos

### `updateServicesWithIcons()`
- **Propósito**: Actualizar dashboard y modal con iconos correctos
- **Uso**: Solución completa que incluye mapeo de iconos
- **Resultado**: Dashboard y modal actualizados con iconos emoji

### Script 5 (Auto-ejecutable)
- **Propósito**: Script que se ejecuta automáticamente y persiste
- **Uso**: Solución más completa que no requiere ejecución manual
- **Resultado**: Se ejecuta automáticamente al cargar la página

## 🎯 Mapeo de Iconos

El script incluye un mapeo automático de iconos:

| Nombre Original | Emoji | Descripción |
|----------------|-------|-------------|
| `gavel` | ⚖️ | Martillo de juez |
| `work` | 👥 | Personas trabajando |
| `family` | 👨‍👩‍👧‍👦 | Familia |
| `civil` | ⚖️ | Derecho civil |
| `laboral` | 👥 | Derecho laboral |
| `penal` | 🚨 | Derecho penal |
| `administrativo` | 🏛️ | Derecho administrativo |
| `mercantil` | 💼 | Derecho mercantil |
| `fiscal` | 💰 | Derecho fiscal |
| `herencias` | 📜 | Herencias y testamentos |
| `divorcios` | 💔 | Divorcios |
| `custodia` | 👶 | Custodia de menores |

## 🔍 Diagnóstico

### Verificar si funciona:

```javascript
// Verificar servicios en la API
fetch('experimento2-production-54c0.up.railway.app/api/parametros/services')
  .then(response => response.json())
  .then(data => console.log('Servicios:', data))
  .catch(error => console.error('Error:', error));
```

### Verificar el deploy:

```javascript
// Verificar si el código actualizado está en producción
fetch('https://experimento2-fenm.vercel.app/src/components/HomeBuilder/ComponentRenderer.tsx')
  .then(response => response.text())
  .then(code => {
    const hasUpdatedCode = code.includes('Always fetch from API - ignore static layout data');
    console.log('¿Código actualizado presente?', hasUpdatedCode);
  });
```

## 📋 Resultado Esperado

Después de ejecutar los scripts, deberías ver:

1. **Dashboard**: 3 tarjetas de servicios con iconos emoji
   - Derecho Civil (⚖️)
   - Derecho Laboral (👥)
   - Herencias (⚖️)

2. **Modal "CONOCER SERVICIOS"**: Los mismos 3 servicios con descripciones completas

## ⚠️ Limitaciones

- **Temporales**: Los scripts se pierden al refrescar la página
- **Manuales**: Requieren ejecución manual en la consola
- **Dependientes**: Requieren que la API esté funcionando

## 🔄 Solución Permanente

La solución permanente requiere:

1. **Deploy de Vercel** completado
2. **Código actualizado** en producción
3. **Componente ServiceCards** modificado para consultar la API

## 📞 Soporte

Si los scripts no funcionan:

1. **Verificar** que la API está funcionando
2. **Comprobar** que no hay errores en la consola
3. **Ejecutar** `diagnoseServices()` para diagnosticar
4. **Esperar** al deploy automático de Vercel

## 🎯 Estado Actual

- ✅ **API funcionando**: Los servicios llegan correctamente
- ✅ **Scripts funcionando**: Actualizan dashboard y modal
- ❌ **Deploy pendiente**: Vercel no ha completado el deploy
- ⏳ **Solución temporal**: Scripts funcionan mientras espera deploy

## 📝 Notas

- Los scripts son **soluciones temporales** hasta que se complete el deploy
- Una vez que Vercel haga deploy, estos scripts ya no serán necesarios
- El código actualizado ya está en el repositorio, solo falta el deploy 