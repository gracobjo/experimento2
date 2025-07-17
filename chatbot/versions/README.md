# Versiones del Chatbot

## 📁 Ubicación
**Carpeta:** `experimento/chatbot/versions/`

## 🎯 Propósito
Esta carpeta contiene diferentes versiones del chatbot para referencia histórica y comparación.

## 📋 Versiones Disponibles

### 🏛️ Versión Original
- **[main.py](./main.py)** - Versión original del chatbot
  - Implementación inicial
  - Funcionalidades básicas
  - Sin mejoras de NLP
  - Sin correcciones de comportamiento
  - **Estado:** Histórico - No usar en producción

## 🔄 Historial de Versiones

### v1.0 - Original (main.py)
**Características:**
- Funcionalidad básica de chat
- Detección simple de intenciones
- Sistema de citas básico
- Sin gestión de contexto avanzada
- Sin análisis de sentimientos

**Limitaciones:**
- Comportamiento poco natural
- Detección de intenciones limitada
- Sin correcciones implementadas
- Base de conocimiento básica

**Uso:**
- Solo para referencia histórica
- Comparación de mejoras
- Análisis de evolución del código

## 🚀 Versión Actual

### v2.0 - Improved Fixed (main_improved_fixed.py)
**Ubicación:** `../main_improved_fixed.py` (carpeta principal)

**Mejoras implementadas:**
- ✅ Detección de intenciones mejorada
- ✅ Gestión de contexto de conversación
- ✅ Análisis de sentimientos
- ✅ Base de conocimiento expandida
- ✅ Correcciones de comportamiento natural
- ✅ Sistema de citas optimizado

**Estado:** ✅ Activa - Usar en producción

## 📊 Comparación de Versiones

| Característica | v1.0 (main.py) | v2.0 (main_improved_fixed.py) |
|----------------|----------------|-------------------------------|
| Detección de intenciones | Básica | Avanzada con múltiples intenciones |
| Gestión de contexto | No | Sí, con historial completo |
| Análisis de sentimientos | No | Sí, con detección automática |
| Base de conocimiento | Limitada | Expandida con múltiples categorías |
| Comportamiento natural | No | Sí, con correcciones implementadas |
| Sistema de citas | Básico | Optimizado con validaciones |
| Personalización | No | Sí, con nombre y preferencias |
| Empatía | No | Sí, con respuestas contextuales |

## 🔍 Análisis de Código

### main.py (v1.0)
```python
# Estructura básica
- Funciones simples de detección
- Respuestas estáticas
- Sin gestión de estado
- Lógica de citas básica
```

**Líneas de código:** ~429 líneas
**Complejidad:** Baja
**Mantenibilidad:** Media

### main_improved_fixed.py (v2.0)
```python
# Estructura avanzada
- Detección múltiple de intenciones
- Gestión de contexto completo
- Análisis de sentimientos
- Base de conocimiento dinámica
- Sistema de citas robusto
```

**Líneas de código:** ~1225 líneas
**Complejidad:** Alta
**Mantenibilidad:** Alta

## 🛠️ Migración y Actualización

### De v1.0 a v2.0
1. **Backup:** Guardar versión actual
2. **Configuración:** Actualizar archivos de configuración
3. **Dependencias:** Instalar nuevas dependencias
4. **Pruebas:** Ejecutar tests de compatibilidad
5. **Despliegue:** Cambiar a nueva versión

### Rollback a v1.0
```bash
# En caso de problemas con v2.0
cp versions/main.py main_rollback.py
python main_rollback.py
```

## 📝 Notas de Desarrollo

### Por qué Mantener Versiones
1. **Referencia histórica:** Ver evolución del código
2. **Rollback:** Volver a versión estable si es necesario
3. **Comparación:** Analizar mejoras implementadas
4. **Documentación:** Entender cambios realizados

### Cuándo Crear Nueva Versión
1. **Cambios mayores:** Nuevas funcionalidades
2. **Correcciones críticas:** Bugs importantes
3. **Refactoring:** Reestructuración del código
4. **Optimizaciones:** Mejoras de rendimiento

## 🔧 Herramientas de Comparación

### Comparar Versiones
```bash
# Usando diff
diff versions/main.py main_improved_fixed.py

# Usando git (si está versionado)
git diff versions/main.py main_improved_fixed.py
```

### Análisis de Cambios
- **Funciones agregadas:** Nuevas capacidades
- **Funciones modificadas:** Mejoras implementadas
- **Funciones eliminadas:** Código obsoleto removido
- **Estructura:** Cambios en organización

## 📋 Checklist de Versiones

### Antes de Crear Nueva Versión
- [ ] Probar funcionalidad completa
- [ ] Ejecutar todos los tests
- [ ] Documentar cambios
- [ ] Crear backup de versión actual
- [ ] Actualizar documentación

### Después de Crear Nueva Versión
- [ ] Verificar que funciona correctamente
- [ ] Actualizar README principal
- [ ] Notificar cambios al equipo
- [ ] Planificar despliegue

---

**Última actualización:** Diciembre 2024  
**Versión actual:** v2.0 (main_improved_fixed.py)  
**Versiones históricas:** 1 (main.py)  
**Estado:** Organizadas y documentadas 