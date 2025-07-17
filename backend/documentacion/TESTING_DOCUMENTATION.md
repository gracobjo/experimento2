# Documentación de Testing - Sistema de Gestión Legal

## 📋 Índice
1. [Tests Existentes](#tests-existentes)
2. [Configuración del Entorno de Testing](#configuración-del-entorno-de-testing)
3. [Estructura de Tests](#estructura-de-tests)
4. [Tipos de Tests](#tipos-de-tests)
5. [Cómo Funcionan los Tests](#cómo-funcionan-los-tests)
6. [Patrones de Testing](#patrones-de-testing)
7. [Cómo Crear Nuevos Tests](#cómo-crear-nuevos-tests)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Comandos de Testing](#comandos-de-testing)
10. [Cobertura de Tests](#cobertura-de-tests)
11. [Mejores Prácticas](#mejores-prácticas)
12. [Solución de Problemas](#solución-de-problemas)

---

## 🧪 Tests Existentes

### 📁 Ubicación de los Tests
Todos los tests se encuentran en el directorio `backend/src/` junto a sus archivos correspondientes:

```
backend/src/
├── cases/
│   ├── cases.service.spec.ts      ✅ Completado
│   └── cases.controller.spec.ts   ✅ Completado
├── documents/
│   ├── documents.service.spec.ts  ✅ Completado
│   └── documents.controller.spec.ts ✅ Completado
├── invoices/
│   ├── invoices.service.spec.ts   ✅ Completado
│   └── invoices.controller.spec.ts ✅ Completado
├── tasks/
│   ├── tasks.service.spec.ts      ✅ Completado
│   └── tasks.controller.spec.ts   ✅ Completado
└── users/
    ├── users.service.spec.ts      ⚠️  Error de archivo binario
    └── users.controller.spec.ts   ❌ Pendiente
```

### 📊 Estado de los Tests

#### ✅ Tests Completados y Funcionando
- **Cases Module**: 100% funcional
  - `cases.service.spec.ts` (165 líneas)
  - `cases.controller.spec.ts` (50 líneas)
- **Invoices Module**: 100% funcional
  - `invoices.service.spec.ts` (101 líneas)
  - `invoices.controller.spec.ts` (81 líneas)
- **Tasks Module**: 100% funcional
  - `tasks.service.spec.ts` (97 líneas)
  - `tasks.controller.spec.ts` (73 líneas)

#### ⚠️ Tests con Problemas Menores
- **Documents Module**: 95% funcional
  - `documents.service.spec.ts` (478 líneas)
  - `documents.controller.spec.ts` (270 líneas)
  - Problemas menores con mocks de Prisma

#### ❌ Tests Pendientes
- **Users Module**: Requiere recreación
- **Auth Module**: No implementado
- **Admin Module**: No implementado
- **Reports Module**: No implementado
- **Appointments Module**: No implementado
- **Contact Module**: No implementado
- **Teleassistance Module**: No implementado
- **Provision-fondos Module**: No implementado
- **Parametros Module**: No implementado
- **Chat Module**: No implementado

---

## 🚀 Comandos de Testing

### 📍 Ubicación para Ejecutar Tests
```bash
cd backend
```

### 🔧 Comandos Principales

#### Ejecutar Todos los Tests
```bash
npm test
```

#### Ejecutar Tests en Modo Watch (Desarrollo)
```bash
npm run test:watch
```

#### Ejecutar Tests con Cobertura
```bash
npm run test:cov
```

#### Ejecutar Tests E2E
```bash
npm run test:e2e
```

### 🎯 Comandos Específicos

#### Ejecutar Tests de un Módulo Específico
```bash
# Tests del módulo cases
npm test -- cases

# Tests del módulo invoices
npm test -- invoices

# Tests del módulo tasks
npm test -- tasks

# Tests del módulo documents
npm test -- documents
```

#### Ejecutar un Archivo de Test Específico
```bash
# Test del servicio de cases
npm test -- cases.service.spec.ts

# Test del controlador de invoices
npm test -- invoices.controller.spec.ts

# Test del servicio de tasks
npm test -- tasks.service.spec.ts
```

#### Ejecutar Tests con Patrón
```bash
# Todos los tests de servicios
npm test -- --testNamePattern="service"

# Todos los tests de controladores
npm test -- --testNamePattern="controller"

# Tests que contengan "create" en el nombre
npm test -- --testNamePattern="create"
```

### 📈 Ver Cobertura de Tests
```bash
# Generar reporte de cobertura
npm run test:cov

# Ver reporte en navegador (si está disponible)
open coverage/lcov-report/index.html
```

---

## 🛠 Configuración del Entorno de Testing

### Dependencias Instaladas
```json
{
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.2",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.3"
  }
}
```

### Configuración de Jest (package.json)
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

## 📁 Estructura de Tests

### Convención de Nomenclatura
- **Archivos de test**: `*.spec.ts`
- **Ubicación**: Mismo directorio que el archivo a testear
- **Ejemplo**: `src/auth/auth.service.ts` → `src/auth/auth.service.spec.ts`

### Estructura de Directorios
```
src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts      ← Test del servicio
│   ├── auth.controller.ts
│   └── auth.controller.spec.ts   ← Test del controlador
├── cases/
│   ├── cases.service.ts
│   ├── cases.service.spec.ts
│   ├── cases.controller.ts
│   └── cases.controller.spec.ts
└── ...
```

---

## 🧪 Tipos de Tests

### 1. Tests Unitarios (Unit Tests)
- **Propósito**: Probar funciones/métodos individuales
- **Alcance**: Una sola clase o función
- **Dependencias**: Mockeadas
- **Ejemplo**: `auth.service.spec.ts`

### 2. Tests de Controladores (Controller Tests)
- **Propósito**: Probar endpoints HTTP
- **Alcance**: Controlador completo
- **Dependencias**: Servicios mockeados
- **Ejemplo**: `cases.controller.spec.ts`

### 3. Tests de Integración (Integration Tests)
- **Propósito**: Probar interacción entre módulos
- **Alcance**: Múltiples servicios
- **Dependencias**: Base de datos de prueba
- **Archivo**: `test/` directory

### 4. Tests E2E (End-to-End Tests)
- **Propósito**: Probar flujos completos
- **Alcance**: Aplicación completa
- **Dependencias**: Base de datos real
- **Archivo**: `test/` directory

---

## ⚙️ Cómo Funcionan los Tests

### 1. Framework de Testing: Jest + NestJS Testing
```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('MiServicio', () => {
  let service: MiServicio;
  let mockDependency: Partial<DependencyService>;

  beforeEach(async () => {
    // Configuración del módulo de testing
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MiServicio,
        { provide: DependencyService, useValue: mockDependency }
      ],
    }).compile();

    service = module.get<MiServicio>(MiServicio);
  });

  it('should do something', () => {
    // Test aquí
  });
});
```

### 2. Ciclo de Vida de los Tests
1. **beforeEach**: Se ejecuta antes de cada test
2. **Test Case**: Ejecuta la lógica del test
3. **Assertions**: Verifica los resultados
4. **Cleanup**: Limpieza automática

### 3. Inyección de Dependencias en Tests
```typescript
// Mock de dependencias
const mockPrismaService = {
  user: {
    findUnique: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn(),
    update: jest.fn(),
  } as any,
};

// Inyección en el módulo de testing
const module: TestingModule = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: PrismaService, useValue: mockPrismaService }
  ],
}).compile();
```

---

## 🎯 Patrones de Testing

### 1. Patrón AAA (Arrange, Act, Assert)
```typescript
it('should validate user credentials', async () => {
  // Arrange (Preparar)
  const email = 'test@example.com';
  const password = 'password123';
  mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

  // Act (Actuar)
  const result = await service.validateUser(email, password);

  // Assert (Verificar)
  expect(result).toBeDefined();
  expect(result.email).toBe(email);
});
```

### 2. Patrón Given-When-Then
```typescript
it('should return user and token on successful login', async () => {
  // Given (Dado que)
  const loginDto = { email: 'test@example.com', password: 'password' };
  mockJwtService.sign.mockReturnValue('fake-jwt-token');

  // When (Cuando)
  const response = await service.login(loginDto);

  // Then (Entonces)
  expect(response).toEqual({
    user: { id: 1, email: 'test@example.com', name: 'Test User', role: 'ADMIN' },
    token: 'fake-jwt-token',
  });
});
```

### 3. Patrón de Mocking Completo
```typescript
// Mock completo de PrismaService
mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  case: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
} as any;
```

---

## 🆕 Cómo Crear Nuevos Tests

### 📋 Pasos para Crear Tests de un Nuevo Módulo

#### 1. Crear el Archivo de Test del Servicio
```bash
# Navegar al directorio del módulo
cd backend/src/[nombre-modulo]

# Crear archivo de test del servicio
touch [nombre-modulo].service.spec.ts
```

#### 2. Crear el Archivo de Test del Controlador
```bash
# Crear archivo de test del controlador
touch [nombre-modulo].controller.spec.ts
```

#### 3. Estructura Básica para Test de Servicio
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { [NombreModulo]Service } from './[nombre-modulo].service';

describe('[NombreModulo]Service', () => {
  let service: [NombreModulo]Service;
  let mockPrismaService: Partial<PrismaService>;

  beforeEach(async () => {
    // Mock de PrismaService
    mockPrismaService = {
      [modelo]: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [NombreModulo]Service,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<[NombreModulo]Service>([NombreModulo]Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests para cada método del servicio
  describe('create', () => {
    it('should create a new [item]', async () => {
      // Arrange
      const createDto = { /* datos de prueba */ };
      const expectedResult = { id: 1, ...createDto };
      mockPrismaService.[modelo].create.mockResolvedValue(expectedResult);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.[modelo].create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  // Más tests...
});
```

#### 4. Estructura Básica para Test de Controlador
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { [NombreModulo]Controller } from './[nombre-modulo].controller';
import { [NombreModulo]Service } from './[nombre-modulo].service';

describe('[NombreModulo]Controller', () => {
  let controller: [NombreModulo]Controller;
  let mock[NombreModulo]Service: Partial<[NombreModulo]Service>;

  beforeEach(async () => {
    mock[NombreModulo]Service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [[NombreModulo]Controller],
      providers: [
        { provide: [NombreModulo]Service, useValue: mock[NombreModulo]Service }
      ],
    }).compile();

    controller = module.get<[NombreModulo]Controller>([NombreModulo]Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Tests para cada endpoint
  describe('POST /[nombre-modulo]', () => {
    it('should create a new [item]', async () => {
      // Arrange
      const createDto = { /* datos de prueba */ };
      const expectedResult = { id: 1, ...createDto };
      const req = { user: { id: 1, role: 'ADMIN' } } as any;
      mock[NombreModulo]Service.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto, req);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mock[NombreModulo]Service.create).toHaveBeenCalledWith(createDto, req.user);
    });
  });

  // Más tests...
});
```

### 🔧 Plantillas Rápidas

#### Plantilla para Test de Servicio
```bash
# Crear plantilla básica
cat > [nombre-modulo].service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { [NombreModulo]Service } from './[nombre-modulo].service';

describe('[NombreModulo]Service', () => {
  let service: [NombreModulo]Service;
  let mockPrismaService: Partial<PrismaService>;

  beforeEach(async () => {
    mockPrismaService = {
      $transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [NombreModulo]Service,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<[NombreModulo]Service>([NombreModulo]Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
EOF
```

#### Plantilla para Test de Controlador
```bash
# Crear plantilla básica
cat > [nombre-modulo].controller.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { [NombreModulo]Controller } from './[nombre-modulo].controller';
import { [NombreModulo]Service } from './[nombre-modulo].service';

describe('[NombreModulo]Controller', () => {
  let controller: [NombreModulo]Controller;
  let mock[NombreModulo]Service: Partial<[NombreModulo]Service>;

  beforeEach(async () => {
    mock[NombreModulo]Service = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [[NombreModulo]Controller],
      providers: [
        { provide: [NombreModulo]Service, useValue: mock[NombreModulo]Service }
      ],
    }).compile();

    controller = module.get<[NombreModulo]Controller>([NombreModulo]Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
EOF
```

---

## 📝 Ejemplos Prácticos

### Ejemplo: Test de Servicio Completo
```typescript
// cases.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CasesService', () => {
  let service: CasesService;
  let mockPrismaService: Partial<PrismaService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'ADMIN',
  };

  const mockCase = {
    id: 1,
    title: 'Test Case',
    description: 'Test Description',
    status: 'PENDING',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = {
      case: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new case', async () => {
      const createCaseDto: CreateCaseDto = {
        title: 'Test Case',
        description: 'Test Description',
        status: 'PENDING',
      };

      mockPrismaService.case.create.mockResolvedValue(mockCase);

      const result = await service.create(createCaseDto, mockUser);

      expect(result).toEqual(mockCase);
      expect(mockPrismaService.case.create).toHaveBeenCalledWith({
        data: {
          ...createCaseDto,
          userId: mockUser.id,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all cases for admin user', async () => {
      const mockCases = [mockCase];
      mockPrismaService.case.findMany.mockResolvedValue(mockCases);
      mockPrismaService.case.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, mockUser);

      expect(result).toEqual({
        data: mockCases,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return only user cases for non-admin user', async () => {
      const nonAdminUser = { ...mockUser, role: 'USER' };
      const mockCases = [mockCase];
      mockPrismaService.case.findMany.mockResolvedValue(mockCases);
      mockPrismaService.case.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, nonAdminUser);

      expect(result).toEqual({
        data: mockCases,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockPrismaService.case.findMany).toHaveBeenCalledWith({
        where: { userId: nonAdminUser.id },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a case by id', async () => {
      mockPrismaService.case.findUnique.mockResolvedValue(mockCase);

      const result = await service.findOne(1, mockUser);

      expect(result).toEqual(mockCase);
      expect(mockPrismaService.case.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: true,
          documents: true,
          tasks: true,
        },
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockPrismaService.case.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not admin and case does not belong to user', async () => {
      const nonAdminUser = { ...mockUser, role: 'USER' };
      const otherUserCase = { ...mockCase, userId: 999 };
      mockPrismaService.case.findUnique.mockResolvedValue(otherUserCase);

      await expect(service.findOne(1, nonAdminUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a case', async () => {
      const updateCaseDto: UpdateCaseDto = {
        title: 'Updated Case',
      };
      const updatedCase = { ...mockCase, ...updateCaseDto };
      mockPrismaService.case.findUnique.mockResolvedValue(mockCase);
      mockPrismaService.case.update.mockResolvedValue(updatedCase);

      const result = await service.update(1, updateCaseDto, mockUser);

      expect(result).toEqual(updatedCase);
      expect(mockPrismaService.case.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateCaseDto,
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockPrismaService.case.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {}, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a case', async () => {
      mockPrismaService.case.findUnique.mockResolvedValue(mockCase);
      mockPrismaService.case.delete.mockResolvedValue(mockCase);

      const result = await service.remove(1, mockUser);

      expect(result).toEqual(mockCase);
      expect(mockPrismaService.case.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockPrismaService.case.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Ejemplo: Test de Controlador Completo
```typescript
// cases.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

describe('CasesController', () => {
  let controller: CasesController;
  let mockCasesService: Partial<CasesService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'ADMIN',
  };

  const mockCase = {
    id: 1,
    title: 'Test Case',
    description: 'Test Description',
    status: 'PENDING',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockCasesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasesController],
      providers: [
        { provide: CasesService, useValue: mockCasesService }
      ],
    }).compile();

    controller = module.get<CasesController>(CasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /cases', () => {
    it('should create a new case', async () => {
      const createCaseDto: CreateCaseDto = {
        title: 'Test Case',
        description: 'Test Description',
        status: 'PENDING',
      };
      const req = { user: mockUser } as any;

      mockCasesService.create.mockResolvedValue(mockCase);

      const result = await controller.create(createCaseDto, req);

      expect(result).toEqual(mockCase);
      expect(mockCasesService.create).toHaveBeenCalledWith(createCaseDto, mockUser);
    });
  });

  describe('GET /cases', () => {
    it('should return all cases', async () => {
      const query = { page: 1, limit: 10 };
      const req = { user: mockUser } as any;
      const expectedResult = {
        data: [mockCase],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCasesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query, req);

      expect(result).toEqual(expectedResult);
      expect(mockCasesService.findAll).toHaveBeenCalledWith(query, mockUser);
    });
  });

  describe('GET /cases/:id', () => {
    it('should return a case by id', async () => {
      const req = { user: mockUser } as any;

      mockCasesService.findOne.mockResolvedValue(mockCase);

      const result = await controller.findOne('1', req);

      expect(result).toEqual(mockCase);
      expect(mockCasesService.findOne).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('PATCH /cases/:id', () => {
    it('should update a case', async () => {
      const updateCaseDto: UpdateCaseDto = {
        title: 'Updated Case',
      };
      const req = { user: mockUser } as any;
      const updatedCase = { ...mockCase, ...updateCaseDto };

      mockCasesService.update.mockResolvedValue(updatedCase);

      const result = await controller.update('1', updateCaseDto, req);

      expect(result).toEqual(updatedCase);
      expect(mockCasesService.update).toHaveBeenCalledWith(1, updateCaseDto, mockUser);
    });
  });

  describe('DELETE /cases/:id', () => {
    it('should remove a case', async () => {
      const req = { user: mockUser } as any;

      mockCasesService.remove.mockResolvedValue(mockCase);

      const result = await controller.remove('1', req);

      expect(result).toEqual(mockCase);
      expect(mockCasesService.remove).toHaveBeenCalledWith(1, mockUser);
    });
  });
});
```

---

## 📊 Cobertura de Tests

### Comandos para Ver Cobertura
```bash
# Generar reporte de cobertura
npm run test:cov

# Ver reporte en navegador
open coverage/lcov-report/index.html

# Ver cobertura en terminal
npm test -- --coverage --verbose
```

### Métricas de Cobertura
- **Statements**: Porcentaje de líneas de código ejecutadas
- **Branches**: Porcentaje de ramas de código ejecutadas
- **Functions**: Porcentaje de funciones ejecutadas
- **Lines**: Porcentaje de líneas ejecutadas

### Objetivo de Cobertura
- **Mínimo recomendado**: 80%
- **Objetivo ideal**: 90%+
- **Cobertura crítica**: 95%+ para servicios de negocio

---

## 🎯 Mejores Prácticas

### 1. Nomenclatura de Tests
```typescript
// ✅ Bueno
describe('UserService', () => {
  describe('create', () => {
    it('should create a new user with valid data', () => {});
    it('should throw error when email already exists', () => {});
  });
});

// ❌ Malo
describe('UserService', () => {
  it('test1', () => {});
  it('test2', () => {});
});
```

### 2. Organización de Tests
```typescript
describe('UserService', () => {
  // Tests de creación
  describe('create', () => {
    it('should create user successfully', () => {});
    it('should validate required fields', () => {});
    it('should handle duplicate email', () => {});
  });

  // Tests de búsqueda
  describe('findAll', () => {
    it('should return all users for admin', () => {});
    it('should filter by role', () => {});
    it('should handle pagination', () => {});
  });

  // Tests de actualización
  describe('update', () => {
    it('should update user successfully', () => {});
    it('should validate permissions', () => {});
  });
});
```

### 3. Mocking Efectivo
```typescript
// ✅ Mock específico
const mockPrismaService = {
  user: {
    findUnique: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(newUser),
  },
} as any;

// ❌ Mock genérico
const mockPrismaService = jest.fn() as any;
```

### 4. Assertions Claras
```typescript
// ✅ Assertions específicos
expect(result).toEqual(expectedUser);
expect(mockService.create).toHaveBeenCalledWith(createDto);
expect(mockService.create).toHaveBeenCalledTimes(1);

// ❌ Assertions vagos
expect(result).toBeDefined();
expect(mockService.create).toHaveBeenCalled();
```

### 5. Manejo de Errores
```typescript
// ✅ Test de errores específicos
it('should throw NotFoundException when user not found', async () => {
  mockService.findById.mockResolvedValue(null);
  
  await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
});

// ❌ Test de errores genéricos
it('should handle errors', async () => {
  mockService.findById.mockRejectedValue(new Error());
  
  await expect(service.update(1, updateDto)).rejects.toThrow();
});
```

---

## 🔧 Solución de Problemas

### Problemas Comunes y Soluciones

#### 1. Error: "Cannot find module"
```bash
# Solución: Verificar que el archivo existe
ls src/[modulo]/[modulo].service.ts

# Si no existe, crear el archivo
touch src/[modulo]/[modulo].service.ts
```

#### 2. Error: "Mock function not found"
```typescript
// Problema: Mock no definido
mockPrismaService.user.findUnique.mockResolvedValue(user);

// Solución: Definir el mock completo
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as any;
```

#### 3. Error: "Type 'undefined' is not assignable"
```typescript
// Problema: Tipo incorrecto en mock
let mockService: any;

// Solución: Usar Partial<T>
let mockService: Partial<MyService>;
```

#### 4. Error: "Cannot read property 'mockResolvedValue'"
```typescript
// Problema: Mock no inicializado
mockService.method.mockResolvedValue(result);

// Solución: Inicializar en beforeEach
beforeEach(() => {
  mockService = {
    method: jest.fn(),
  };
});
```

#### 5. Error: "Test timeout"
```typescript
// Problema: Test asíncrono sin await
it('should do something', () => {
  service.method(); // Sin await
});

// Solución: Usar async/await
it('should do something', async () => {
  await service.method();
});
```

### Debugging de Tests
```bash
# Ejecutar test específico con debug
npm test -- --verbose --testNamePattern="should create user"

# Ejecutar con console.log
npm test -- --verbose --testNamePattern="should create user" --silent=false

# Ejecutar un solo archivo
npm test -- cases.service.spec.ts
```

### Limpieza de Tests
```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Limpiar coverage
rm -rf coverage/

# Reinstalar dependencias si es necesario
rm -rf node_modules/
npm install
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

### Herramientas Útiles
- **Jest**: Framework de testing
- **@nestjs/testing**: Utilidades de testing para NestJS
- **ts-jest**: Transformador de TypeScript para Jest
- **supertest**: Testing de APIs HTTP

### Comandos Útiles
```bash
# Ver versión de Jest
npx jest --version

# Ver configuración de Jest
npx jest --showConfig

# Ejecutar tests con watch mode
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov
```

---

## 🎉 Conclusión

Esta documentación proporciona una guía completa para trabajar con los tests del sistema de gestión legal. Los tests existentes cubren los módulos principales (cases, documents, invoices, tasks) y proporcionan una base sólida para el desarrollo continuo.

Para crear nuevos tests, sigue los patrones establecidos y utiliza las plantillas proporcionadas. Recuerda mantener una alta cobertura de código y seguir las mejores prácticas de testing para asegurar la calidad del software. 