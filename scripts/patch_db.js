const { execSync } = require('child_process');
const { randomUUID } = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

async function main() {
  console.log('Generating Prisma Client...');

  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma Client generated successfully');
  } catch (error) {
    console.error('Failed to generate Prisma Client:', error.message);
    process.exit(1);
  }

  console.log('\nRunning database migrations...');

  let prisma;
  let pool;

  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    const connectionString = process.env.DB_PATCH_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    const defaultUser = {
      id: 'quacky',
      name: 'Quacky',
      email: 'quacky@quacky.local',
      handle: 'quacky',
      role: 'Admin',
      verified: true,
    };

    await prisma.user.upsert({
      where: { email: defaultUser.email },
      update: {
        name: defaultUser.name,
        handle: defaultUser.handle,
        role: defaultUser.role,
      },
      create: {
        ...defaultUser,
        emailVerified: true,
        verified: true,
      },
    });

    console.log(`Default user ensured: ${defaultUser.email}`);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Failed to run migrations:', error.message);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }

    if (pool) {
      await pool.end();
    }
  }

  console.log('\nDatabase setup complete!');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
