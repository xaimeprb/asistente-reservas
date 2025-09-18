import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Creamos un tenant inicial
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica123' },
    update: {},
    create: {
      id: 'clinica123',
      nombre: 'Clínica Dental Sonrisas',
      slug: 'clinica123',
      direccion: 'Calle Mayor 1',
      telefono: '600111222',
      email: 'info@clinica.com',
    },
  });

  console.log('✅ Tenant creado:', tenant);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
