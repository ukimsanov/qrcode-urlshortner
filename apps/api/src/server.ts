import "dotenv/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { config } from "./config.js";
import { generateCode } from "./codegen.js";
import { createUrl, findUrlByCode, incrementClick } from "./db.js";
import { cacheGet, cacheSet } from "./cache.js";
import { generateQr, type QrContentType, type QrContentData, type QrCustomization } from "./qr.js";

const app = Fastify({
  logger: true
});

await app.register(helmet);
await app.register(cors, { origin: "*" });
await app.register(sensible);

type ShortenRequestBody = {
  long_url: string;
  alias?: string;
  expires_at?: string;
  content_type?: QrContentType;
  qr_data?: QrContentData;
  qr_customization?: QrCustomization;
};

const isValidUrl = (value: string): boolean => {
  try {
    const u = new URL(value);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
};

app.post("/api/shorten", async (request, reply) => {
  const body = request.body as ShortenRequestBody;
  if (!body?.long_url) {
    return reply.badRequest("long_url is required");
  }
  if (!isValidUrl(body.long_url)) {
    return reply.badRequest("long_url is invalid");
  }

  const expiresAt = body.expires_at ?? null;
  const alias = body.alias?.trim() || undefined;
  const contentType = body.content_type ?? "url";
  const qrCustomization = body.qr_customization;

  // Prepare QR data based on content type
  let qrData: QrContentData;
  if (contentType === "url") {
    qrData = { url: body.long_url };
  } else {
    qrData = body.qr_data ?? {};
  }

  let lastError: unknown;
  for (let i = 0; i < 3; i++) {
    const code = alias ?? generateCode(7);
    try {
      // Generate QR code with content type and customization
      const qrResult = await generateQr({
        contentType,
        data: qrData,
        customization: qrCustomization
      });

      const row = await createUrl({
        shortCode: code,
        longUrl: body.long_url,
        alias,
        expiresAt,
        qrStatus: qrResult.status,
        qrUrl: qrResult.qrUrl,
        contentType,
        qrConfig: qrCustomization
      });

      const shortUrl = `${config.publicBaseUrl}/${row.short_code}`;
      void cacheSet(row.short_code, row.long_url);
      return {
        code: row.short_code,
        short_url: shortUrl,
        qr_url: row.qr_url,
        content_type: row.content_type
      };
    } catch (err: any) {
      lastError = err;
      if (err?.code === "23505") {
        if (alias) {
          return reply.conflict("alias already in use");
        }
        continue;
      }
      throw err;
    }
  }
  app.log.error({ err: lastError }, "Failed to generate short code after retries");
  return reply.internalServerError("failed to generate code");
});

app.get("/api/resolve/:code", async (request, reply) => {
  const { code } = request.params as { code: string };
  if (!code) return reply.notFound();
  const cached = await cacheGet(code);
  if (cached) return { long_url: cached };

  const row = await findUrlByCode(code);
  if (!row) return reply.notFound();
  if (row.expires_at) {
    const expires = new Date(row.expires_at);
    if (expires.getTime() < Date.now()) return reply.gone();
  }
  void cacheSet(code, row.long_url);
  return { long_url: row.long_url };
});

app.post("/api/analytics/hit", async (request, reply) => {
  const { code } = request.body as { code?: string };
  if (!code) return reply.badRequest("code is required");
  await incrementClick(code);
  return { ok: true };
});

const port = config.port;
const host = config.host;

try {
  await app.listen({ port, host });
  app.log.info(`API listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
