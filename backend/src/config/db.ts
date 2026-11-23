import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";

const dbUrl = process.env.DATABASE_URL?.trim() || "";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!dbUrl) {
    console.log("Falta DATABASE_URL o está vacia en las variables de entorno.");
    throw new Error("No DataBase... Error in conection OR not exist");
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
};

export async function connectDb () {
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT NOW()`;
        console.log("Conexión a PostgreSQL + prisma establecida correctamente");
        return prisma;
    } catch (error) {
        console.error("Error al conectar a la base de datos", error);
        process.exit(1);
    }
};

