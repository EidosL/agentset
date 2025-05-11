// import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  // const connectionString = process.env.DATABASE_URL ?? "";
  // const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    // adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
