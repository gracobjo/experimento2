# Tests y Demostraciones del Chatbot

## 📁 Ubicación
**Carpeta:** `experimento/chatbot/test/`

## 🎯 Propósito
Esta carpeta contiene todos los archivos de prueba, demostración y herramientas de desarrollo del chatbot.

## 📋 Categorías de Archivos

### 🧪 Pruebas Principales
- **[prueba_rapida.py](./prueba_rapida.py)** - Pruebas rápidas de correcciones del chatbot
- **[test_fix_conversaciones.py](./test_fix_conversaciones.py)** - Pruebas completas del sistema de conversaciones
- **[test_natural_conversation.py](./test_natural_conversation.py)** - Pruebas de conversaciones naturales
- **[test_improved_conversation.py](./test_improved_conversation.py)** - Pruebas de conversaciones mejoradas

### 🎭 Demostraciones
- **[demo_conversaciones_naturales.py](./demo_conversaciones_naturales.py)** - Demostraciones de conversaciones naturales
- **[conversaciones_legales_especificas.py](./conversaciones_legales_especificas.py)** - Casos legales específicos
- **[ejemplos_conversaciones_reales.py](./ejemplos_conversaciones_reales.py)** - Ejemplos de conversaciones reales

### 🔧 Pruebas de Funcionalidad
- **[test_appointment_flow.py](./test_appointment_flow.py)** - Pruebas del flujo de citas
- **[test_appointment_creation.py](./test_appointment_creation.py)** - Pruebas de creación de citas
- **[test_edit_flow.py](./test_edit_flow.py)** - Pruebas de edición de citas
- **[test_end_chat.py](./test_end_chat.py)** - Pruebas de finalización de chat
- **[test_dates.py](./test_dates.py)** - Pruebas de manejo de fechas
- **[test_context_fix.py](./test_context_fix.py)** - Pruebas de corrección de contexto

### 📧 Sistema de Email
- **[test_email_system.py](./test_email_system.py)** - Pruebas del sistema de email
- **[test_chatbot_email.py](./test_chatbot_email.py)** - Pruebas de integración email-chatbot
- **[quick_start_email_testing.py](./quick_start_email_testing.py)** - Inicio rápido de pruebas de email
- **[setup_email_system.py](./setup_email_system.py)** - Configuración del sistema de email

### 🔗 Conexión Backend
- **[test_backend_connection.py](./test_backend_connection.py)** - Pruebas de conexión al backend
- **[test_backend_corrected.py](./test_backend_corrected.py)** - Pruebas corregidas del backend
- **[test_backend_detailed.py](./test_backend_detailed.py)** - Pruebas detalladas del backend
- **[check_backend.py](./check_backend.py)** - Verificación del estado del backend

### 🤖 Procesamiento de Lenguaje Natural (NLP)
- **[test_nlp_improvements.py](./test_nlp_improvements.py)** - Pruebas de mejoras NLP
- **[implement_nlp_improvements.py](./implement_nlp_improvements.py)** - Implementación de mejoras NLP
- **[simple_nlp_improvements.py](./simple_nlp_improvements.py)** - Mejoras NLP simplificadas
- **[nlp_alternatives.py](./nlp_alternatives.py)** - Alternativas de NLP
- **[install_nlp_windows.py](./install_nlp_windows.py)** - Instalación de NLP en Windows

### 🔍 Herramientas de Depuración
- **[debug_conversation_data.py](./debug_conversation_data.py)** - Depuración de datos de conversación
- **[debug_chatbot.py](./debug_chatbot.py)** - Depuración del chatbot
- **[test_manual.py](./test_manual.py)** - Pruebas manuales

### ✅ Verificación y Estado
- **[verify_appointment_created.py](./verify_appointment_created.py)** - Verificación de citas creadas
- **[check_chatbot_version.py](./check_chatbot_version.py)** - Verificación de versión del chatbot
- **[check_ports.py](./check_ports.py)** - Verificación de puertos

### 🚀 Inicio y Configuración
- **[start_chatbot.py](./start_chatbot.py)** - Inicio del chatbot
- **[start_and_test_system.py](./start_and_test_system.py)** - Inicio y prueba del sistema
- **[reset_chatbot.py](./reset_chatbot.py)** - Reinicio del chatbot

### ⚡ Pruebas Rápidas
- **[quick_test.py](./quick_test.py)** - Pruebas rápidas generales
- **[test_chatbot_conversation.py](./test_chatbot_conversation.py)** - Pruebas rápidas de conversación

### 📱 Versiones Alternativas
- **[main_improved.py](./main_improved.py)** - Versión mejorada del chatbot
- **[main_simple_improved.py](./main_simple_improved.py)** - Versión simple mejorada
- **[main_windows_compatible.py](./main_windows_compatible.py)** - Versión compatible con Windows

## 🚀 Cómo Usar

### Para Pruebas Rápidas
```bash
cd test/
python prueba_rapida.py
```

### Para Demostraciones
```bash
python demo_conversaciones_naturales.py
python conversaciones_legales_especificas.py
python ejemplos_conversaciones_reales.py
```

### Para Pruebas Completas
```bash
python test_fix_conversaciones.py
```

### Para Verificar Estado
```bash
python check_chatbot_version.py
python check_backend.py
python check_ports.py
```

### Para Configuración
```bash
python setup_email_system.py
python install_nlp_windows.py
```

## 📊 Organización por Prioridad

### 🔴 Alta Prioridad (Pruebas Esenciales)
1. `prueba_rapida.py` - Verificación rápida de correcciones
2. `test_fix_conversaciones.py` - Pruebas completas
3. `check_chatbot_version.py` - Estado del sistema

### 🟡 Media Prioridad (Demostraciones)
1. `demo_conversaciones_naturales.py` - Demostraciones principales
2. `conversaciones_legales_especificas.py` - Casos específicos
3. `ejemplos_conversaciones_reales.py` - Ejemplos reales

### 🟢 Baja Prioridad (Herramientas de Desarrollo)
1. Archivos de depuración (`debug_*.py`)
2. Versiones alternativas (`main_*.py`)
3. Herramientas de configuración

## 🔧 Configuración de Entorno

### Dependencias Requeridas
```bash
pip install -r ../requirements.txt
```

### Variables de Entorno
```bash
cp ../config.env.example ../config.env
# Editar config.env según necesidades
```

### Configuración NLP (Windows)
```bash
python install_nlp_windows.py
```

## 📝 Notas de Uso

### Para Desarrolladores
- Usar `prueba_rapida.py` para verificación rápida
- Usar `test_fix_conversaciones.py` para pruebas completas
- Usar archivos de debug para problemas específicos

### Para Testing
- Ejecutar demostraciones para verificar funcionalidad
- Usar herramientas de verificación para estado del sistema
- Revisar logs de depuración para problemas

### Para Configuración
- Seguir guías de configuración específicas
- Verificar estado antes de cambios
- Probar después de modificaciones

---

**Última actualización:** Diciembre 2024  
**Total de archivos:** 40+ scripts de prueba y demostración  
**Estado:** Organizados y documentados 