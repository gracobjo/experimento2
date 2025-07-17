# Despliegue del Chatbot

## 📁 Ubicación
**Carpeta:** `experimento/chatbot/deployment/`

## 🎯 Propósito
Esta carpeta contiene todos los archivos necesarios para el despliegue del chatbot en diferentes entornos.

## 📋 Archivos de Despliegue

### 🐳 Docker
- **[Dockerfile](./Dockerfile)** - Configuración de contenedor Docker
  - Imagen base de Python
  - Instalación de dependencias
  - Configuración del entorno
  - Exposición de puertos
  - Comando de inicio

### 📦 Gestión de Dependencias
- **[requirements.txt](./requirements.txt)** - Dependencias de Python
  - Lista de paquetes requeridos
  - Versiones específicas
  - Compatibilidad garantizada

- **[Pipfile](./Pipfile)** - Configuración de Pipenv
  - Gestión de entorno virtual
  - Dependencias de desarrollo
  - Scripts de automatización

- **[Pipfile.lock](./Pipfile.lock)** - Lock de dependencias
  - Versiones exactas de paquetes
  - Hashes de seguridad
  - Reproducibilidad del entorno

## 🚀 Cómo Desplegar

### Usando Docker
```bash
# Construir imagen
docker build -f deployment/Dockerfile -t chatbot .

# Ejecutar contenedor
docker run -p 5000:5000 chatbot

# Con variables de entorno
docker run -p 5000:5000 -e DATABASE_URL=your_db_url chatbot
```

### Usando Python Directo
```bash
# Instalar dependencias
pip install -r deployment/requirements.txt

# O usando Pipenv
pipenv install --deploy
pipenv run python main_improved_fixed.py
```

### Usando Pipenv
```bash
# Instalar dependencias
cd deployment/
pipenv install

# Ejecutar en entorno virtual
pipenv run python ../main_improved_fixed.py
```

## 📝 Detalles de Configuración

### Dockerfile
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "main_improved_fixed.py"]
```

**Características:**
- Imagen base ligera (slim)
- Instalación optimizada de dependencias
- Exposición del puerto 5000
- Comando de inicio configurado

### requirements.txt
```
flask==2.0.1
requests==2.26.0
python-dotenv==0.19.0
# ... más dependencias
```

**Características:**
- Versiones específicas para estabilidad
- Dependencias mínimas necesarias
- Compatibilidad verificada

### Pipfile
```toml
[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
flask = "==2.0.1"
requests = "==2.26.0"

[dev-packages]
pytest = "*"
```

**Características:**
- Gestión de entorno virtual
- Separación de dependencias de desarrollo
- Scripts de automatización

## 🔧 Configuración de Entornos

### Desarrollo
```bash
# Usar requirements.txt
pip install -r deployment/requirements.txt

# Configurar variables de entorno
cp ../config/config.env.example ../config/config.env
```

### Producción
```bash
# Usar Docker
docker build -f deployment/Dockerfile -t chatbot-prod .
docker run -d -p 5000:5000 chatbot-prod

# O usar Pipenv
pipenv install --deploy
pipenv run python main_improved_fixed.py
```

### Testing
```bash
# Instalar dependencias de desarrollo
pipenv install --dev

# Ejecutar tests
pipenv run pytest
```

## 📊 Monitoreo y Logs

### Logs de Docker
```bash
# Ver logs del contenedor
docker logs chatbot-container

# Seguir logs en tiempo real
docker logs -f chatbot-container
```

### Logs de Python
```bash
# Redirigir salida a archivo
python main_improved_fixed.py > chatbot.log 2>&1

# Usar logging configurado
python main_improved_fixed.py --log-level DEBUG
```

## 🔍 Verificación de Despliegue

### Verificar Contenedor
```bash
# Verificar que el contenedor está corriendo
docker ps | grep chatbot

# Verificar logs
docker logs chatbot-container

# Verificar puerto
netstat -tulpn | grep 5000
```

### Verificar Aplicación
```bash
# Verificar endpoint de salud
curl http://localhost:5000/health

# Verificar respuesta del chatbot
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

## 🛠️ Mantenimiento

### Actualizar Dependencias
```bash
# Actualizar requirements.txt
pip freeze > deployment/requirements.txt

# Actualizar Pipfile
pipenv update
```

### Backup de Configuración
```bash
# Backup de archivos de despliegue
tar -czf deployment-backup-$(date +%Y%m%d).tar.gz deployment/

# Backup de configuración
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## 📋 Checklist de Despliegue

### Antes del Despliegue
- [ ] Verificar que todos los tests pasan
- [ ] Actualizar versiones de dependencias
- [ ] Configurar variables de entorno
- [ ] Hacer backup de configuración actual
- [ ] Verificar compatibilidad de versiones

### Durante el Despliegue
- [ ] Construir imagen Docker (si aplica)
- [ ] Instalar dependencias
- [ ] Configurar entorno
- [ ] Iniciar aplicación
- [ ] Verificar logs de inicio

### Después del Despliegue
- [ ] Verificar que la aplicación responde
- [ ] Ejecutar tests de integración
- [ ] Verificar logs de errores
- [ ] Monitorear rendimiento
- [ ] Documentar cambios

## 🔄 Automatización

### Scripts de Despliegue
```bash
#!/bin/bash
# deploy.sh
echo "Iniciando despliegue..."
docker build -f deployment/Dockerfile -t chatbot .
docker stop chatbot-container || true
docker rm chatbot-container || true
docker run -d --name chatbot-container -p 5000:5000 chatbot
echo "Despliegue completado"
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Chatbot
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -f deployment/Dockerfile -t chatbot .
      - name: Deploy to server
        run: ./deploy.sh
```

---

**Última actualización:** Diciembre 2024  
**Total archivos:** 4 archivos de despliegue  
**Estado:** Organizados y documentados 