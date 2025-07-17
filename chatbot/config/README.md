# Configuración del Chatbot

## 📁 Ubicación
**Carpeta:** `experimento/chatbot/config/`

## 🎯 Propósito
Esta carpeta contiene todos los archivos de configuración del chatbot.

## 📋 Archivos de Configuración

### 🔧 Variables de Entorno
- **[config.env](./config.env)** - Variables de entorno del chatbot
  - Configuración de base de datos
  - Credenciales de servicios
  - Configuración de email
  - Parámetros del sistema

### 🤖 Configuración NLP
- **[simple_nlp_config.json](./simple_nlp_config.json)** - Configuración NLP simplificada
  - Parámetros de procesamiento de lenguaje natural
  - Configuración de modelos
  - Umbrales de detección

- **[windows_nlp_config.json](./windows_nlp_config.json)** - Configuración NLP para Windows
  - Configuración específica para sistemas Windows
  - Parámetros optimizados para Windows
  - Configuración de dependencias

### 🔍 Análisis de Código
- **[.psscriptanalyzer.psd1](./.psscriptanalyzer.psd1)** - Configuración de PowerShell Script Analyzer
  - Reglas de análisis de código PowerShell
  - Configuración de linting
  - Estándares de código

## 🚀 Cómo Usar

### Configuración Inicial
```bash
# Copiar archivo de ejemplo
cp config.env.example config.env

# Editar configuración
nano config.env
```

### Configuración NLP
```bash
# Para sistemas generales
cp simple_nlp_config.json nlp_config.json

# Para Windows
cp windows_nlp_config.json nlp_config.json
```

### Verificación de Configuración
```bash
# Verificar variables de entorno
python -c "import os; print('Config loaded:', 'config.env' in os.listdir('.'))"

# Verificar configuración NLP
python -c "import json; json.load(open('simple_nlp_config.json'))"
```

## 📝 Notas de Configuración

### Variables de Entorno (config.env)
- **DATABASE_URL** - URL de conexión a la base de datos
- **EMAIL_HOST** - Servidor de email
- **EMAIL_PORT** - Puerto del servidor de email
- **EMAIL_USER** - Usuario de email
- **EMAIL_PASS** - Contraseña de email
- **JWT_SECRET** - Clave secreta para JWT
- **CHATBOT_PORT** - Puerto del chatbot

### Configuración NLP
- **threshold** - Umbral de detección de intenciones
- **confidence** - Nivel de confianza mínimo
- **language** - Idioma de procesamiento
- **models** - Modelos de NLP a usar

### PowerShell Script Analyzer
- **Rules** - Reglas de análisis de código
- **Severity** - Nivel de severidad de las reglas
- **IncludeDefaultRules** - Incluir reglas por defecto

## 🔧 Personalización

### Para Diferentes Entornos
1. **Desarrollo:** Usar `simple_nlp_config.json`
2. **Producción:** Usar configuración optimizada
3. **Windows:** Usar `windows_nlp_config.json`

### Para Diferentes Servicios
1. **Email:** Configurar en `config.env`
2. **Base de datos:** Configurar en `config.env`
3. **NLP:** Configurar en archivos JSON

## 📊 Estado de Configuración

### ✅ Configurado
- Variables de entorno básicas
- Configuración NLP para diferentes sistemas
- Análisis de código PowerShell

### 🔄 Configurable
- Parámetros específicos del entorno
- Configuración de servicios externos
- Optimización de rendimiento

---

**Última actualización:** Diciembre 2024  
**Total archivos:** 4 archivos de configuración  
**Estado:** Organizados y documentados 