import "dotenv/config";
import { defineConfig } from "prisma/config";

function resolvePrismaCliUrl(): string {
  const provider = (process.env.DB_PROVIDER ?? "local").trim().toLowerCase();
  const useNeon =
    provider === "neon" ||
    (provider === "auto" && process.env.NODE_ENV === "production");

  const url = useNeon
    ? process.env.DATABASE_URL_NEON?.trim()
    : process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      useNeon
        ? "Falta DATABASE_URL_NEON para ejecutar Prisma CLI en modo neon."
        : "Falta DATABASE_URL para ejecutar Prisma CLI en modo local.",
    );
  }

  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: resolvePrismaCliUrl(),
  },
});
