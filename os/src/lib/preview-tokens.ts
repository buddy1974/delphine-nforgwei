import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const TOKEN_TTL_SECONDS = 10 * 60;

export type PreviewTokenPayload = {
  previewSessionId: string;
  nonce: string;
  exp: number;
};

export type SignedPreviewToken = PreviewTokenPayload & {
  signature: string;
};

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function getPreviewSecret() {
  const secret = process.env.PREVIEW_TOKEN_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "local-dev-preview-token-secret-change-me";
  }
  throw new Error("PREVIEW_TOKEN_SECRET must be set in production.");
}

function signPayload(payload: PreviewTokenPayload) {
  return base64url(
    createHmac("sha256", getPreviewSecret())
      .update(`${payload.previewSessionId}.${payload.nonce}.${payload.exp}`)
      .digest()
  );
}

export function hashPreviewNonce(nonce: string) {
  return createHmac("sha256", getPreviewSecret()).update(nonce).digest("hex");
}

export function createPreviewToken(previewSessionId: string, ttlSeconds = TOKEN_TTL_SECONDS) {
  const payload: PreviewTokenPayload = {
    previewSessionId,
    nonce: base64url(randomBytes(24)),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const token: SignedPreviewToken = {
    ...payload,
    signature: signPayload(payload),
  };
  return {
    token: base64url(JSON.stringify(token)),
    nonceHash: hashPreviewNonce(payload.nonce),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function verifyPreviewToken(rawToken: string): SignedPreviewToken | null {
  try {
    const parsed = JSON.parse(fromBase64url(rawToken)) as SignedPreviewToken;
    if (
      !parsed.previewSessionId ||
      !parsed.nonce ||
      !parsed.exp ||
      !parsed.signature ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) return null;

    const expected = signPayload({
      previewSessionId: parsed.previewSessionId,
      nonce: parsed.nonce,
      exp: parsed.exp,
    });
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(parsed.signature);
    if (expectedBuffer.length !== actualBuffer.length) return null;
    if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export const PREVIEW_TOKEN_TTL_SECONDS = TOKEN_TTL_SECONDS;
