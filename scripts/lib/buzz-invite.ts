/**
 * Buzz invite-token helpers for directory sync.
 *
 * v1 tokens are `base64url(json).sig` (sometimes a 3-part JWT). The payload
 * carries expiry as `e` (unix seconds). v2 tokens (`v2.…`) are opaque — no
 * expiry can be read from the code, and invite pages are an SPA shell with
 * no expiry in the HTML.
 */

export function inviteTokenFromJoinUrl(joinUrl: string): string | undefined {
  try {
    const path = new URL(joinUrl).pathname;
    const m = path.match(/\/invite\/([^/]+)$/);
    if (!m) return undefined;
    return decodeURIComponent(m[1]);
  } catch {
    return undefined;
  }
}

/** Expiry as epoch milliseconds, or null when the token has no parseable `e`/`exp`. */
export function parseInviteExpiryMs(token: string): number | null {
  const raw = safeDecode(token);
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 2) return null;
  if (parts[0] === "v2") return null;

  return expiryFromSegment(parts[0]) ?? expiryFromSegment(parts[1]);
}

export function isExpiredInviteToken(
  token: string,
  now = Date.now(),
): boolean {
  const exp = parseInviteExpiryMs(token);
  return exp != null && exp < now;
}

/**
 * Public listings can join via relay when the published invite is dead.
 * Invite-only listings must not be rewritten to add-community.
 */
export function shouldFallbackExpiredPublicInvite(
  access: "public" | "invite",
  token: string | undefined,
  now = Date.now(),
): boolean {
  return access === "public" && token != null && isExpiredInviteToken(token, now);
}

function safeDecode(token: string): string | undefined {
  try {
    return decodeURIComponent(token);
  } catch {
    return undefined;
  }
}

function expiryFromSegment(segment: string): number | null {
  const obj = decodeJsonSegment(segment);
  if (!obj) return null;
  const raw = obj.e ?? obj.exp;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return raw > 1e12 ? raw : raw * 1000;
}

function decodeJsonSegment(segment: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(segment, "base64url").toString("utf8");
    const value: unknown = JSON.parse(json);
    if (typeof value !== "object" || value == null || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}
