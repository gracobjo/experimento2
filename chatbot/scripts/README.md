# Scripts de Utilidad del Chatbot

## 📁 Ubicación
**Carpeta:** `experimento/chatbot/scripts/`

## 🎯 Propósito
Esta carpeta contiene scripts de utilidad para el manejo y administración del chatbot.

## 📋 Scripts Disponibles

### 🔄 Gestión del Chatbot
- **[restart-chatbot.bat](./restart-chatbot.bat)** - Script para reiniciar el chatbot
  - Detiene el proceso actual del chatbot
  - Inicia una nueva instancia
  - Verifica el estado del servicio
  - Útil para aplicar cambios sin reiniciar manualmente

### 📊 Gestión de Datos
- **[get-clients-with-invoices.ps1](./get-clients-with-invoices.ps1)** - Script PowerShell para obtener clientes con facturas
  - Consulta la base de datos
  - Filtra clientes con facturas
  - Genera reportes de clientes
  - Exporta datos para análisis

## 🚀 Cómo Usar

### Reiniciar Chatbot
```bash
# En Windows
.\restart-chatbot.bat

# O ejecutar directamente
cd scripts/
restart-chatbot.bat
```

### Obtener Datos de Clientes
```powershell
# En PowerShell
.\get-clients-with-invoices.ps1

# Con parámetros específicos
.\get-clients-with-invoices.ps1 -DateRange "2024-01-01,2024-12-31"
```

## 📝 Detalles de los Scripts

### restart-chatbot.bat
```batch
@echo off
echo Deteniendo chatbot...
taskkill /f /im python.exe
timeout /t 2
echo Iniciando chatbot...
python main_improved_fixed.py
```

**Funcionalidades:**
- Detiene procesos Python existentes
- Espera 2 segundos para liberar recursos
- Inicia el chatbot principal
- Manejo de errores básico

### get-clients-with-invoices.ps1
```powershell
# Script para consultar clientes con facturas
# Parámetros configurables
# Exportación de datos
```

**Funcionalidades:**
- Conexión a base de datos
- Consultas SQL optimizadas
- Filtrado por fechas
- Exportación a CSV/Excel
- Logging de operaciones

## 🔧 Configuración

### Para restart-chatbot.bat
- Asegurarse de que `main_improved_fixed.py` esté en la carpeta principal
- Verificar permisos de ejecución
- Configurar ruta correcta si es necesario

### Para get-clients-with-invoices.ps1
- Configurar conexión a base de datos
- Ajustar parámetros de consulta
- Configurar permisos de PowerShell
- Verificar dependencias

## 📊 Casos de Uso

### Reinicio del Sistema
1. **Después de cambios de código:** Reiniciar para aplicar modificaciones
2. **En caso de errores:** Reiniciar para recuperar el servicio
3. **Mantenimiento:** Reiniciar para limpiar memoria y recursos

### Análisis de Datos
1. **Reportes mensuales:** Obtener clientes con facturas del mes
2. **Análisis de tendencias:** Datos históricos de clientes
3. **Auditoría:** Verificar integridad de datos
4. **Backup:** Exportar datos para respaldo

## 🔍 Monitoreo y Logs

### Logs de Reinicio
- Verificar que el chatbot se inicie correctamente
- Revisar mensajes de error si los hay
- Confirmar que el puerto esté disponible

### Logs de Consultas
- Verificar conexión a base de datos
- Revisar tiempo de ejecución de consultas
- Confirmar exportación de datos

## 🛠️ Mantenimiento

### Actualización de Scripts
- Revisar rutas y configuraciones
- Actualizar parámetros según necesidades
- Probar en entorno de desarrollo

### Backup de Scripts
- Mantener copias de seguridad
- Versionar cambios importantes
- Documentar modificaciones

## 📋 Checklist de Uso

### Antes de Usar restart-chatbot.bat
- [ ] Verificar que no hay usuarios activos
- [ ] Hacer backup de datos si es necesario
- [ ] Confirmar que los cambios están guardados

### Antes de Usar get-clients-with-invoices.ps1
- [ ] Verificar conexión a base de datos
- [ ] Confirmar permisos de acceso
- [ ] Revisar parámetros de consulta

---

**Última actualización:** Diciembre 2024  
**Total scripts:** 2 scripts de utilidad  
**Estado:** Organizados y documentados 