# Testing del Backend

## 📁 Ubicación
**Carpeta:** `experimento/backend/testing/`

## 🎯 Propósito
Esta carpeta contiene la configuración y archivos relacionados con las pruebas del backend del sistema de gestión legal.

## 📋 Archivos de Testing

### ⚙️ Configuración de Jest
- **[jest.setup.ts](./jest.setup.ts)** - Configuración de Jest para testing
  - Configuración de entorno de pruebas
  - Setup de base de datos de testing
  - Configuración de variables de entorno
  - Configuración de mocks y stubs
  - Configuración de cobertura de código

## 🚀 Cómo Usar

### Configuración Inicial
```bash
# Instalar dependencias de testing
npm install --save-dev @nestjs/testing jest supertest

# Configurar variables de entorno para testing
cp ../config/env.example .env.test
```

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:e2e

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch
```

## 📝 Detalles de Configuración

### jest.setup.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

// Configuración de entorno de pruebas
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Configuración de Jest
export const createTestingModule = async (imports: any[]) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      ...imports,
    ],
  }).compile();
};
```

**Características:**
- Configuración de entorno de pruebas
- Setup de base de datos de testing
- Configuración de variables de entorno
- Configuración de mocks y stubs

## 🔧 Configuración de Entornos

### Desarrollo
```bash
# Configuración básica
NODE_ENV=development
DATABASE_URL=postgresql://dev:dev@localhost:5432/dev_db
```

### Testing
```bash
# Configuración de pruebas
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
JWT_SECRET=test_secret
```

### Producción
```bash
# Configuración de producción
NODE_ENV=production
DATABASE_URL=postgresql://prod:prod@localhost:5432/prod_db
JWT_SECRET=production_secret
```

## 📊 Tipos de Testing

### Pruebas Unitarias
```typescript
// Ejemplo de prueba unitaria
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Pruebas de Integración
```typescript
// Ejemplo de prueba de integración
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

### Pruebas de Base de Datos
```typescript
// Ejemplo de prueba de base de datos
describe('Database Tests', () => {
  let prisma: PrismaService;

  beforeEach(async () => {
    // Setup de base de datos de testing
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    // Cleanup después de cada prueba
    await prisma.user.deleteMany();
  });
});
```

## 🔍 Verificación de Testing

### Verificar Configuración
```bash
# Verificar configuración de Jest
npx jest --showConfig

# Verificar cobertura
npx jest --coverage

# Verificar tipos
npx tsc --noEmit
```

### Verificar Base de Datos
```bash
# Verificar conexión a base de datos de testing
npx prisma db push --preview-feature

# Ejecutar migraciones de testing
npx prisma migrate dev --name test
```

## 🛠️ Mantenimiento

### Actualizar Configuración
- Revisar cambios en dependencias de testing
- Actualizar configuración de Jest según necesidades
- Mantener base de datos de testing actualizada

### Backup de Configuración
```bash
# Backup de configuración de testing
cp testing/jest.setup.ts testing/jest.setup.backup.$(date +%Y%m%d).ts

# Backup de variables de entorno de testing
cp .env.test .env.test.backup.$(date +%Y%m%d)
```

## 📋 Checklist de Testing

### Antes de Ejecutar Tests
- [ ] Verificar configuración de Jest
- [ ] Configurar variables de entorno de testing
- [ ] Verificar conexión a base de datos de testing
- [ ] Ejecutar migraciones de testing
- [ ] Verificar dependencias de testing

### Durante Testing
- [ ] Ejecutar tests unitarios
- [ ] Ejecutar tests de integración
- [ ] Verificar cobertura de código
- [ ] Revisar logs de errores
- [ ] Verificar rendimiento de tests

### Después de Testing
- [ ] Limpiar base de datos de testing
- [ ] Generar reporte de cobertura
- [ ] Documentar resultados
- [ ] Actualizar configuración si es necesario

## 📊 Métricas de Testing

### Cobertura de Código
- **Objetivo:** >80% de cobertura
- **Líneas cubiertas:** Verificar en reporte
- **Funciones cubiertas:** Verificar en reporte
- **Branches cubiertos:** Verificar en reporte

### Rendimiento de Tests
- **Tiempo de ejecución:** <5 minutos
- **Tests unitarios:** <1 minuto
- **Tests de integración:** <3 minutos
- **Tests e2e:** <5 minutos

### Calidad de Tests
- **Tests pasando:** 100%
- **Tests fallando:** 0
- **Tests pendientes:** Documentar
- **Tests obsoletos:** Remover

---

**Última actualización:** Diciembre 2024  
**Total archivos:** 1 archivo de configuración de testing  
**Estado:** Organizado y documentado 