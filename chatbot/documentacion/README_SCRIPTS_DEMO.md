# 🎭 Scripts de Demostración del Chatbot Mejorado

Este directorio contiene scripts que demuestran todas las nuevas funcionalidades del chatbot mejorado con conversaciones reales y variadas.

## 📁 Archivos de Demostración

### 1. `demo_conversaciones_naturales.py`
**Demostración completa de todas las funcionalidades**

Este script demuestra de manera sistemática todas las nuevas capacidades del chatbot:

- 🎯 **Detección de Intenciones**: Saludos, agradecimientos, despedidas, emergencias, quejas, ayuda
- 😊 **Análisis de Sentimientos**: Positivo, negativo, neutral
- 🧠 **Conciencia de Contexto**: Mantenimiento de contexto durante la conversación
- 💝 **Empatía y Comprensión**: Manejo de emociones y problemas
- 🔄 **Transiciones Naturales**: Flujo suave entre temas
- 📚 **Base de Conocimientos Expandida**: Nuevas categorías y respuestas
- 🔄 **Funcionalidad de Reset**: Limpieza de conversación
- 📅 **Agendamiento Mejorado**: Flujo completo de citas
- 🎭 **Conversación Mixta**: Combinación de múltiples funcionalidades

### 2. `conversaciones_legales_especificas.py`
**Conversaciones especializadas por área legal**

Este script muestra cómo el chatbot maneja consultas específicas en diferentes áreas del derecho:

- 💼 **Derecho Laboral**: Despidos, horarios, salarios, acoso laboral, accidentes
- 👨‍👩‍👧‍👦 **Derecho Familiar**: Divorcios, custodia, pensiones, herencias, adopción
- ⚖️ **Derecho Civil**: Contratos, daños, responsabilidad civil, propiedad intelectual
- 🏢 **Derecho Mercantil**: Constitución de empresas, contratos comerciales, quiebras
- 🚨 **Derecho Penal**: Defensa penal, detenciones, multas, delitos económicos
- 🏛️ **Derecho Administrativo**: Sanciones, licencias, expropiaciones
- 🚨 **Emergencias Legales**: Situaciones urgentes y críticas
- ❓ **Consultas Generales**: Información sobre servicios y procesos
- 💝 **Manejo Emocional**: Respuestas empáticas a diferentes emociones
- 🎭 **Casos Complejos**: Situaciones que combinan múltiples áreas

### 3. `ejemplos_conversaciones_reales.py`
**Ejemplos de conversaciones reales y naturales**

Este script presenta ejemplos prácticos de cómo el chatbot maneja situaciones reales:

- 📋 **Ejemplo 1**: Consulta laboral con agendamiento completo de cita
- 📋 **Ejemplo 2**: Consulta familiar sobre divorcio y custodia
- 📋 **Ejemplo 3**: Emergencia legal (desahucio)
- 📋 **Ejemplo 4**: Consulta mercantil para pequeña empresa
- 📋 **Ejemplo 5**: Conversación natural con múltiples temas
- 📋 **Ejemplo 6**: Manejo de situaciones emocionales
- 📋 **Ejemplo 7**: Consulta general sobre servicios
- 📋 **Ejemplo 8**: Reset y nueva conversación

## 🚀 Cómo Usar los Scripts

### Prerrequisitos
1. **Chatbot ejecutándose**: Asegúrate de que el chatbot esté funcionando en el puerto 8000
2. **Dependencias**: Instala las dependencias necesarias
3. **Configuración**: Verifica que las variables de entorno estén configuradas

### Ejecutar las Demostraciones

#### 1. Demostración Completa
```bash
cd experimento/chatbot
python demo_conversaciones_naturales.py
```

#### 2. Conversaciones Legales Específicas
```bash
python conversaciones_legales_especificas.py
```

#### 3. Ejemplos de Conversaciones Reales
```bash
python ejemplos_conversaciones_reales.py
```

### Ejecutar Todos los Scripts
```bash
# Ejecutar todos los scripts en secuencia
python demo_conversaciones_naturales.py
python conversaciones_legales_especificas.py
python ejemplos_conversaciones_reales.py
```

## 📊 Qué Demuestran los Scripts

### 🎯 Funcionalidades Demostradas

1. **Personalización**
   - Extracción automática de nombres
   - Saludos personalizados
   - Respuestas adaptadas al usuario

2. **Inteligencia Artificial**
   - Detección de múltiples intenciones
   - Análisis de sentimientos
   - Contexto de conversación
   - Respuestas contextuales

3. **Conversación Natural**
   - Flujo fluido entre temas
   - Transiciones suaves
   - Respuestas variadas
   - Manejo de emociones

4. **Capacidades Legales**
   - Consultas especializadas por área
   - Manejo de emergencias
   - Orientación profesional
   - Agendamiento inteligente

5. **Gestión de Sesiones**
   - Limpieza automática
   - Preservación de contexto
   - Funcionalidad de reset
   - Manejo de inactividad

### 📈 Métricas de Demostración

- **Total de intercambios**: Más de 100 conversaciones de ejemplo
- **Áreas legales cubiertas**: 6 especialidades principales
- **Tipos de emociones**: 7 diferentes estados emocionales
- **Escenarios de emergencia**: 6 situaciones críticas
- **Flujos de agendamiento**: 3 ejemplos completos

## 🎭 Ejemplos de Salida

### Demostración de Personalización
```
🎯 Personalización con Nombres
--------------------------------------------------
👤 Usuario: Hola, me llamo Ana María Rodríguez
🤖 Chatbot: ¡Hola Ana María! Me alegra verte. ¿En qué puedo ayudarte hoy?
--------------------------------------------------
```

### Demostración de Empatía
```
💝 Empatía y Comprensión
--------------------------------------------------
👤 Usuario: Estoy muy molesto porque me despidieron sin justificación
🤖 Chatbot: Entiendo tu frustración. Estoy aquí para ayudarte a encontrar una solución. ¿Podrías contarme más sobre tu situación?
--------------------------------------------------
```

### Demostración de Emergencia
```
🚨 Emergencias Legales
--------------------------------------------------
👤 Usuario: Me están desahuciando mañana
🤖 Chatbot: Para casos urgentes, puedes llamarnos al (555) 123-4567. Tenemos abogados disponibles para emergencias.
--------------------------------------------------
```

## 🔧 Configuración Avanzada

### Personalizar las Demostraciones

Puedes modificar los scripts para:

1. **Cambiar el puerto del chatbot**:
   ```python
   CHATBOT_URL = "http://localhost:8000"  # Cambiar puerto si es necesario
   ```

2. **Ajustar los tiempos de espera**:
   ```python
   time.sleep(1)  # Cambiar el tiempo entre mensajes
   ```

3. **Agregar nuevos ejemplos**:
   ```python
   def nuevo_ejemplo():
       conversacion = [
           "Tu mensaje aquí",
           "Otro mensaje"
       ]
       # ... resto del código
   ```

### Variables de Entorno Requeridas

```env
# Obligatorio
HF_API_TOKEN=tu_token_huggingface
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Opcionales (para mejor rendimiento)
OPENAI_API_KEY=tu_token_openai
COHERE_API_KEY=tu_token_cohere
ANTHROPIC_API_KEY=tu_token_anthropic
```

## 🎯 Casos de Uso

### Para Desarrolladores
- **Pruebas de funcionalidad**: Verificar que todas las características funcionen
- **Debugging**: Identificar problemas en el flujo de conversación
- **Optimización**: Medir tiempos de respuesta y rendimiento

### Para Usuarios Finales
- **Demostración**: Mostrar las capacidades del chatbot
- **Entrenamiento**: Aprender cómo interactuar con el sistema
- **Evaluación**: Probar diferentes escenarios y casos de uso

### Para Stakeholders
- **Presentación**: Demostrar el valor del chatbot mejorado
- **Evaluación**: Medir la efectividad de las mejoras
- **Planificación**: Identificar áreas para futuras mejoras

## 🚀 Próximos Pasos

1. **Ejecutar las demostraciones** para ver las mejoras en acción
2. **Personalizar los ejemplos** según tus necesidades específicas
3. **Agregar nuevos casos de uso** relevantes para tu despacho
4. **Integrar con sistemas existentes** para automatizar pruebas
5. **Recopilar feedback** de usuarios para futuras mejoras

## 📞 Soporte

Si encuentras problemas con los scripts:

1. **Verificar que el chatbot esté funcionando**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Revisar los logs del chatbot** para errores

3. **Verificar la configuración** de variables de entorno

4. **Consultar la documentación técnica** del chatbot

---

**¡Disfruta explorando todas las nuevas capacidades del chatbot!** 🎉 