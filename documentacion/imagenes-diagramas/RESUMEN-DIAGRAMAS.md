# Resumen de Diagramas Generados

Este documento contiene un resumen de todos los diagramas Mermaid extraídos del archivo `diagrama-casos-uso.md` y convertidos a imágenes PNG.

## Diagramas Generados

### 1. Diagrama de Casos de Uso Principal
- **Archivo fuente**: `diagrama-casos-uso.mmd`
- **Imagen generada**: `diagrama-casos-uso.png`
- **Descripción**: Diagrama principal de casos de uso del sistema de gestión legal

### 2. Diagrama de Clases Simple
- **Archivo fuente**: `diagrama-clases-simple.mmd`
- **Imagen generada**: `diagrama-clases-simple.png`
- **Descripción**: Diagrama de clases simplificado con las entidades principales (User, Client, Expediente)

### 3. Diagrama de Clases Completo
- **Archivo fuente**: `diagrama-clases-completo.mmd`
- **Imagen generada**: `diagrama-clases-completo.png`
- **Descripción**: Diagrama de clases completo con todas las entidades del sistema:
  - **Entidades principales**: User, Client, Lawyer, Expediente, Document, Appointment, Task
  - **Entidades de facturación**: Invoice, InvoiceItem, ProvisionFondos
  - **Entidades de comunicación**: ChatMessage, TeleassistanceSession
  - **Entidades de configuración**: Contact, Parametro, Layout, MenuConfig, MenuItem, SiteConfig
  - **Relaciones**: Todas las relaciones entre entidades con cardinalidad

### 4. Diagrama de Actividad - Recuperación de Contraseña
- **Archivo fuente**: `diagrama-actividad-recuperacion.mmd`
- **Imagen generada**: `diagrama-actividad-recuperacion.png`
- **Descripción**: Flujo completo del proceso de recuperación de contraseña

### 5. Diagrama de Secuencia - Interacción Usuario-Chatbot
- **Archivo fuente**: `diagrama-secuencia-chat.mmd`
- **Imagen generada**: `diagrama-secuencia-chat.png`
- **Descripción**: Flujo de comunicación entre usuario y chatbot

### 6. Diagrama de Arquitectura del Sistema
- **Archivo fuente**: `diagrama-arquitectura.mmd`
- **Imagen generada**: `diagrama-arquitectura.png`
- **Descripción**: Arquitectura completa del sistema

### 7. Diagrama de Despliegue
- **Archivo fuente**: `diagrama-despliegue.mmd`
- **Imagen generada**: `diagrama-despliegue.png`
- **Descripción**: Infraestructura de despliegue del sistema

### 8. Diagrama de Actividad - Proceso de Facturación Electrónica
- **Archivo fuente**: `diagrama-actividad-facturacion.mmd`
- **Imagen generada**: `diagrama-actividad-facturacion.png`
- **Descripción**: Flujo completo del proceso de facturación electrónica, desde la creación hasta el envío a sistemas externos

### 9. Diagrama de Actividad - Gestión de Casos Legales
- **Archivo fuente**: `diagrama-actividad-gestion-casos.mmd`
- **Imagen generada**: `diagrama-actividad-gestion-casos.png`
- **Descripción**: Flujo completo de gestión de casos legales, desde la solicitud hasta el archivo

### 10. Diagrama de Secuencia - Proceso de Autenticación
- **Archivo fuente**: `diagrama-secuencia-autenticacion.mmd`
- **Imagen generada**: `diagrama-secuencia-autenticacion.png`
- **Descripción**: Proceso completo de autenticación, incluyendo login, validación de JWT y autorización

### 11. Diagrama de Componentes - Arquitectura de Microservicios
- **Archivo fuente**: `diagrama-componentes-microservicios.mmd`
- **Imagen generada**: `diagrama-componentes-microservicios.png`
- **Descripción**: Arquitectura detallada de microservicios del sistema, incluyendo las interacciones entre servicios

## Notas Importantes

### Problemas con Mermaid CLI
- **Error de sintaxis**: Los diagramas de clases con métodos y atributos complejos pueden generar errores de parsing en Mermaid CLI
- **Solución**: Se utilizó una sintaxis alternativa con atributos tipados (`+id: string`) y relaciones con cardinalidad (`"1" *-- "0..*"`)
- **Verificación**: Los diagramas se probaron en el editor en línea de Mermaid para confirmar su validez

### Sintaxis Utilizada
- **Atributos**: Formato `+nombre: tipo` (ej: `+id: string`, `+createdAt: DateTime`)
- **Relaciones**: Formato `"cardinalidad1" *-- "cardinalidad2" entidad : descripción`
- **Tipos de datos**: Se mantuvieron los tipos originales del esquema Prisma

### Archivos Generados
- **Archivos .mmd**: Contienen el código Mermaid original
- **Archivos .png**: Imágenes generadas para documentación
- **Este archivo**: Resumen de todos los diagramas generados

## Uso de los Diagramas

Los diagramas generados pueden utilizarse para:
1. **Documentación técnica**: Explicar la arquitectura del sistema
2. **Presentaciones**: Mostrar la estructura de datos y casos de uso
3. **Desarrollo**: Referencia para implementar nuevas funcionalidades
4. **Mantenimiento**: Entender las relaciones entre entidades

## Comandos de Generación

Para regenerar las imágenes PNG:
```bash
npx @mermaid-js/mermaid-cli -i archivo.mmd -o archivo.png
```

## Estructura de Archivos

```
documentacion/imagenes-diagramas/
├── diagrama-casos-uso.mmd
├── diagrama-casos-uso.png
├── diagrama-clases-simple.mmd
├── diagrama-clases-simple.png
├── diagrama-clases-completo.mmd
├── diagrama-clases-completo.png
├── diagrama-actividad-recuperacion.mmd
├── diagrama-actividad-recuperacion.png
├── diagrama-secuencia-chat.mmd
├── diagrama-secuencia-chat.png
├── diagrama-arquitectura.mmd
├── diagrama-arquitectura.png
├── diagrama-despliegue.mmd
├── diagrama-despliegue.png
├── diagrama-actividad-facturacion.mmd
├── diagrama-actividad-facturacion.png
├── diagrama-actividad-gestion-casos.mmd
├── diagrama-actividad-gestion-casos.png
├── diagrama-secuencia-autenticacion.mmd
├── diagrama-secuencia-autenticacion.png
├── diagrama-componentes-microservicios.mmd
├── diagrama-componentes-microservicios.png
└── RESUMEN_DIAGRAMAS.md
``` 