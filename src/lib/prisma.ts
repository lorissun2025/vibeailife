import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Configure for Supabase Session Pooler
    // https://www.prisma.io/docs/guides/database/connecting-to-postgresql#connection-pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Handle cleanup for serverless environments
if (process.env.NODE_ENV === 'production') {
  prisma.$connect();
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
