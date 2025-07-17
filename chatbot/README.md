# Chatbot - Sistema de Gestión Legal

## 📁 Ubicación
**Carpeta:** `experimento/chatbot/`

## 📚 Documentación
**Toda la documentación está organizada en:** `documentacion/`

👉 **[Ver Documentación Completa](./documentacion/README.md)**

## 🚀 Archivos Principales

### 🤖 Chatbot Principal
- **[main_improved_fixed.py](./main_improved_fixed.py)** - Chatbot principal con todas las correcciones implementadas
- **[main.py](./main.py)** - Versión original del chatbot
- **[main_improved.py](./main_improved.py)** - Versión mejorada anterior

### 🧪 Scripts de Prueba
- **[test/](./test/)** - Carpeta con todos los scripts de prueba y demostración
- **[test/README.md](./test/README.md)** - Guía completa de todos los tests disponibles
- **[test/prueba_rapida.py](./test/prueba_rapida.py)** - Pruebas rápidas de correcciones
- **[test/test_fix_conversaciones.py](./test/test_fix_conversaciones.py)** - Pruebas completas del sistema
- **[test/demo_conversaciones_naturales.py](./test/demo_conversaciones_naturales.py)** - Demostraciones de conversaciones naturales

### ⚙️ Configuración
- **[config/](./config/)** - Carpeta con archivos de configuración
- **[config/README.md](./config/README.md)** - Guía de configuración
- **[config/config.env](./config/config.env)** - Variables de entorno
- **[deployment/requirements.txt](./deployment/requirements.txt)** - Dependencias de Python
- **[deployment/Dockerfile](./deployment/Dockerfile)** - Configuración de Docker

## 🎯 Estado Actual

### ✅ Funcionando
- Chatbot con correcciones implementadas
- Detección de intenciones mejorada
- Gestión de contexto de conversación
- Sistema de citas funcional

### 🔄 En Desarrollo
- Ajuste fino de patrones de detección
- Optimización de umbrales
- Pruebas adicionales

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
pip install -r deployment/requirements.txt
```

### 2. Configurar Variables de Entorno
```bash
cp config/config.env.example config/config.env
# Editar config/config.env con tus configuraciones
```

### 3. Ejecutar Chatbot
```bash
python main_improved_fixed.py
```

### 4. Probar Correcciones
```bash
python test/prueba_rapida.py
```

## 📋 Scripts de Demostración

### Conversaciones Naturales
```bash
python test/demo_conversaciones_naturales.py
```

### Casos Legales Específicos
```bash
python test/conversaciones_legales_especificas.py
```

### Ejemplos Reales
```bash
python test/ejemplos_conversaciones_reales.py
```

## 🔧 Herramientas de Desarrollo

### Pruebas del Sistema
- **[test/](./test/)** - Carpeta con todos los scripts de prueba
- **[test/README.md](./test/README.md)** - Guía completa de tests

### Configuración NLP
- `*_nlp_*.json` - Archivos de configuración (en carpeta principal)
- Scripts NLP movidos a **[test/](./test/)**

### Scripts de Utilidad
- **[scripts/](./scripts/)** - Scripts de utilidad y administración
- **[scripts/README.md](./scripts/README.md)** - Guía de scripts
- **[scripts/restart-chatbot.bat](./scripts/restart-chatbot.bat)** - Reinicio del chatbot
- **[scripts/get-clients-with-invoices.ps1](./scripts/get-clients-with-invoices.ps1)** - Gestión de datos

### Versiones del Chatbot
- **[versions/](./versions/)** - Versiones históricas del chatbot
- **[versions/README.md](./versions/README.md)** - Guía de versiones
- **[versions/main.py](./versions/main.py)** - Versión original

### Despliegue
- **[deployment/](./deployment/)** - Archivos de despliegue
- **[deployment/README.md](./deployment/README.md)** - Guía de despliegue

## 📊 Estructura de Carpetas

```
chatbot/
├── documentacion/          # 📚 Toda la documentación
├── test/                   # 🧪 Scripts de prueba y demostración
├── config/                 # ⚙️ Archivos de configuración
├── scripts/                # 🔧 Scripts de utilidad
├── versions/               # 📱 Versiones históricas
├── deployment/             # 🚀 Archivos de despliegue
├── static/                 # 🎨 Archivos estáticos
├── models/                 # 🤖 Modelos de NLP
├── main_improved_fixed.py  # 🤖 Chatbot principal
└── README.md               # 📖 Documentación principal
```

## 🔗 Enlaces Útiles

- **[Documentación Completa](./documentacion/README.md)**
- **[Correcciones Implementadas](./documentacion/CORRECCIONES_CHATBOT.md)**
- **[Guía de Mejoras](./documentacion/README_MEJORAS.md)**
- **[Scripts de Demostración](./documentacion/README_SCRIPTS_DEMO.md)**

## 📞 Soporte

Para consultas sobre el chatbot:
1. Revisar la **[documentación](./documentacion/)**
2. Ejecutar **[pruebas rápidas](./test/prueba_rapida.py)**
3. Verificar **[estado del sistema](./test/check_chatbot_version.py)**

---

**Versión:** Improved Fixed  
**Última actualización:** Diciembre 2024  
**Estado:** Correcciones implementadas y en refinamiento 