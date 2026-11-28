import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";

export type DatabaseTarget = "local" | "neon";

interface ResolvedDatabaseConfig {
  target: DatabaseTarget;
  url: string;
  maskedHost: string;
}

function resolveDatabaseTarget(): DatabaseTarget {
  const provider = (process.env.DB_PROVIDER ?? "local").trim().toLowerCase();

  if (provider === "neon") return "neon";
  if (provider === "local") return "local";
  if (provider === "auto") {
    return process.env.NODE_ENV === "production" ? "neon" : "local";
  }

  throw new Error(
    `Valor inválido en DB_PROVIDER="${provider}". Usa "local", "neon" o "auto".`,
  );
}

function validateAndMaskUrl(rawUrl: string, target: DatabaseTarget): ResolvedDatabaseConfig {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      `La cadena de conexión para "${target}" no tiene un formato URL válido.`,
    );
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error(
      `Protocolo inválido en conexión "${target}": se esperaba postgresql:// o postgres://.`,
    );
  }

  if (target === "neon") {
    const sslMode = parsed.searchParams.get("sslmode");
    if (sslMode !== "require") {
      throw new Error(
        "La conexión a Neon (DATABASE_URL_NEON) debe incluir sslmode=require.",
      );
    }
  }

  const dbName = parsed.pathname.replace(/^\//, "") || "postgres";
  return {
    target,
    url: rawUrl,
    maskedHost: `${parsed.hostname}/${dbName}`,
  };
}

export function resolveDatabaseConfig(): ResolvedDatabaseConfig {
  const target = resolveDatabaseTarget();

  if (target === "neon") {
    const neonUrl = process.env.DATABASE_URL_NEON?.trim() || "";
    if (!neonUrl) {
      throw new Error(
        "DB_PROVIDER está configurado para Neon, pero falta DATABASE_URL_NEON en las variables de entorno.",
      );
    }
    return validateAndMaskUrl(neonUrl, "neon");
  }

  const localUrl = process.env.DATABASE_URL?.trim() || "";
  if (!localUrl) {
    throw new Error(
      "Falta DATABASE_URL o está vacía en las variables de entorno para la conexión local.",
    );
  }
  return validateAndMaskUrl(localUrl, "local");
}

const resolvedDb = resolveDatabaseConfig();
export const activeDbTarget: DatabaseTarget = resolvedDb.target;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: resolvedDb.url,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDb() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log(
      `Conexión PostgreSQL [${resolvedDb.target.toUpperCase()}] (${resolvedDb.maskedHost}) + Prisma establecida correctamente`,
      result,
    );
    return prisma;
  } catch (error) {
    console.error(
      `Error al conectar a la base de datos [${resolvedDb.target.toUpperCase()}]`,
      error,
    );
    process.exit(1);
  }
}
