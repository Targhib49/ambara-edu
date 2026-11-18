import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * On Vercel a function instance is frozen between requests, and Supabase's
 * pooler closes connections that sit idle. A pooled connection that went
 * quiet before a freeze is often dead when the instance wakes, and the first
 * query on it fails — the "error page, then Coba lagi works" pattern, since
 * the failed connection is discarded and the retry opens a fresh one.
 *
 * Two defences: idle connections are let go quickly, so fewer survive into a
 * freeze; and a read that fails because its connection was gone is retried
 * once, transparently. Writes are not retried — whether one landed before the
 * connection dropped can't be known, and they are rarely the first query
 * after a quiet spell anyway.
 */
const READS = new Set(["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "findMany", "count", "aggregate", "groupBy"]);

// Driver and socket messages, plus the Postgres codes for a connection the
// server (or pooler) ended: 57P01–57P03 (shut down / terminated) and class 08.
const CONNECTION_LOST =
  /connection terminated|server has closed the connection|connection closed|closed the connection|connection ended unexpectedly|terminating connection|ECONNRESET|EPIPE|ETIMEDOUT|socket hang up|\b57P0[123]\b|\b08(000|003|006)\b/i;

export function isConnectionLost(error: unknown, depth = 0): boolean {
  if (typeof error !== "object" || error === null || depth > 4) return false;
  const { code, message, cause, meta } = error as { code?: unknown; message?: unknown; cause?: unknown; meta?: unknown };
  if (code === "P1017" || code === "P1001") return true;
  if (typeof code === "string" && CONNECTION_LOST.test(code)) return true;
  if (typeof message === "string" && CONNECTION_LOST.test(message)) return true;
  return isConnectionLost(cause, depth + 1) || isConnectionLost(meta, depth + 1);
}

function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      // pg's default keeps idle connections for 10s.
      idleTimeoutMillis: 5_000,
    }),
  }).$extends({
    name: "retry-lost-connection",
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!READS.has(operation) || !isConnectionLost(error)) throw error;
          console.warn(`[db] ${model ?? ""}.${operation} lost its connection; retrying once`);
          return query(args);
        }
      },
    },
  });
}

type Db = ReturnType<typeof createClient>;
const globalForPrisma = globalThis as unknown as { prisma?: Db };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
