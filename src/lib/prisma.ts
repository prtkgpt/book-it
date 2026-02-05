import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Prisma v7 requires either `adapter` or `accelerateUrl`.
    // When using Neon Postgres via Prisma Accelerate or prisma+postgres:// URLs,
    // pass the DATABASE_URL as accelerateUrl.
    accelerateUrl: process.env.DATABASE_URL!,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
