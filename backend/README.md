# Sistema de Gestión Legal - Despacho de Abogados

---

## Prisma ORM: Uso y Operaciones

### 1. Instalar dependencias (si no están instaladas)

```bash
npm install
```

### 2. Configurar la base de datos

Asegúrate de tener el archivo `.env` con la variable `DATABASE_URL` configurada correctamente.

### 3. Generar el cliente de Prisma

Cada vez que modifiques el archivo `prisma/schema.prisma` o apliques una migración, ejecuta:

```bash
npx prisma generate
```

Esto genera el cliente de Prisma en `node_modules/@prisma/client`.

### 4. Validar el esquema de Prisma

Antes de aplicar migraciones, puedes validar el esquema:

```bash
npx prisma validate
```

### 5. Crear una nueva migración

Para crear una nueva migración tras modificar el schema:

```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

Esto aplicará la migración y actualizará la base de datos.

### 6. Aplicar migraciones pendientes (en producción)

```bash
npx prisma migrate deploy
```

### 7. Ver el estado de las migraciones

```bash
npx prisma migrate status
```

### 8. Acceder a Prisma Studio (GUI para la base de datos)

```bash
npx prisma studio
```

### 9. Sincronizar el schema con una base de datos existente

Si ya tienes una base de datos y quieres generar el schema a partir de ella:

```bash
npx prisma db pull
```

### 10. Seed de la base de datos

Si tienes un script de seed (por ejemplo, `prisma/seed.ts`):

```bash
npx ts-node prisma/seed.ts
```

---

## Ejemplos prácticos de uso de Prisma Client y scripts

### Crear perfiles de cliente y abogado automáticamente

```ts
// backend/scripts/createClientProfile.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // CLIENTES
  const clientes = await prisma.user.findMany({ where: { role: Role.CLIENTE } });
  for (const user of clientes) {
    const existing = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!existing) {
      const dni = 'DUMMY' + user.id.slice(0, 8).toUpperCase();
      await prisma.client.create({
        data: { userId: user.id, dni, phone: null, address: null },
      });
      console.log(`Creado perfil client para usuario ${user.email} (dni: ${dni})`);
    }
  }
  // ABOGADOS
  const abogados = await prisma.user.findMany({ where: { role: Role.ABOGADO } });
  for (const user of abogados) {
    const existing = await prisma.lawyer.findUnique({ where: { userId: user.id } });
    if (!existing) {
      const colegiado = 'LAW' + user.id.slice(0, 8).toUpperCase();
      await prisma.lawyer.create({
        data: { userId: user.id, colegiado, phone: null, address: null },
      });
      console.log(`Creado perfil lawyer para usuario ${user.email} (colegiado: ${colegiado})`);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
```

### Seed de usuarios y perfiles

```ts
// backend/scripts/seedUsersAndProfiles.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Usuarios de ejemplo
  const users = [
    { email: 'admin@example.com', password: 'admin123', role: Role.ADMIN, name: 'Admin User' },
    { email: 'lawyer1@example.com', password: 'lawyer123', role: Role.ABOGADO, name: 'Lawyer Uno' },
    { email: 'client1@example.com', password: 'client123', role: Role.CLIENTE, name: 'Cliente Uno' },
    { email: 'lawyer2@example.com', password: 'lawyer123', role: Role.ABOGADO, name: 'Lawyer Dos' },
    { email: 'client2@example.com', password: 'client123', role: Role.CLIENTE, name: 'Cliente Dos' },
  ];

  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: u.password, // En producción, hashea la contraseña
        role: u.role,
        name: u.name,
      },
    });

    if (u.role === Role.CLIENTE) {
      await prisma.client.create({
        data: {
          userId: user.id,
          dni: 'DNI' + user.id.slice(0, 8).toUpperCase(),
          phone: '600000000',
          address: 'Calle Falsa 123',
        },
      });
    }
    if (u.role === Role.ABOGADO) {
      await prisma.lawyer.create({
        data: {
          userId: user.id,
          colegiado: 'LAW' + user.id.slice(0, 8).toUpperCase(),
          phone: '600000001',
          address: 'Avenida Legal 456',
        },
      });
    }
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
```

### Seed avanzado con relaciones y datos completos

Consulta el archivo `prisma/seed.ts` para ver un ejemplo completo de cómo poblar la base de datos con usuarios, clientes, abogados, expedientes, documentos, citas y tareas, usando Prisma Client y relaciones entre modelos.

---

## Notas
- Siempre revisa que la variable `DATABASE_URL` apunte a la base de datos correcta antes de ejecutar migraciones.
- Si tienes dudas sobre algún comando, puedes consultar la [documentación oficial de Prisma](https://www.prisma.io/docs/reference/api-reference/command-reference).

---
