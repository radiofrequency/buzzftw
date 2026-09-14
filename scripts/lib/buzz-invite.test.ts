import assert from "node:assert/strict";
import { test } from "node:test";
import {
  inviteTokenFromJoinUrl,
  isExpiredInviteToken,
  parseInviteExpiryMs,
  shouldFallbackExpiredPublicInvite,
} from "./buzz-invite.ts";

function v1Token(fields: Record<string, unknown>, sig = "sig"): string {
  const payload = Buffer.from(JSON.stringify(fields)).toString("base64url");
  return `${payload}.${sig}`;
}

function jwtToken(fields: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify(fields)).toString("base64url");
  return `${header}.${payload}.sig`;
}

test("v1 payload.e is unix seconds", () => {
  const token = v1Token({ c: "id", r: "member", e: 1787273685, n: "n" });
  assert.equal(parseInviteExpiryMs(token), 1787273685_000);
});

test("expired v1 is detected; unexpired v1 is not", () => {
  const token = v1Token({ e: 1_787_273_685 });
  assert.equal(isExpiredInviteToken(token, Date.parse("2026-09-14T00:00:00Z")), true);
  assert.equal(isExpiredInviteToken(token, Date.parse("2026-08-01T00:00:00Z")), false);
});

test("v2 tokens have no parseable expiry and are not treated as expired", () => {
  const token = "v2.umQGOlbNHvzs5fDVgxWCcU1N6ZmKr_3QAqPiuM4AgV4";
  assert.equal(parseInviteExpiryMs(token), null);
  assert.equal(isExpiredInviteToken(token, Date.parse("2099-01-01T00:00:00Z")), false);
});

test("URL-encoded v1 tokens still parse", () => {
  const token = v1Token({ e: 1_787_273_685 });
  assert.equal(parseInviteExpiryMs(encodeURIComponent(token)), 1787273685_000);
});

test("opaque or malformed tokens are not treated as expired", () => {
  assert.equal(parseInviteExpiryMs("not-a-token"), null);
  assert.equal(isExpiredInviteToken("not-a-token"), false);
  assert.equal(isExpiredInviteToken("eyJub3Rqc29u.sig"), false);
});

test("3-part JWT payload exp/e is read when the first segment is a header", () => {
  const token = jwtToken({ exp: 1_800_000_000 });
  assert.equal(parseInviteExpiryMs(token), 1_800_000_000_000);
  assert.equal(isExpiredInviteToken(token, 1_799_000_000_000), false);
  assert.equal(isExpiredInviteToken(token, 1_801_000_000_000), true);
});

test("only Public + expired v1 falls back to add-community", () => {
  const expired = v1Token({ e: 1 });
  const live = v1Token({ e: 4_000_000_000 });
  const v2 = "v2.umQGOlbNHvzs5fDVgxWCcU1N6ZmKr_3QAqPiuM4AgV4";
  const now = Date.parse("2026-09-14T00:00:00Z");
  assert.equal(shouldFallbackExpiredPublicInvite("public", expired, now), true);
  assert.equal(shouldFallbackExpiredPublicInvite("invite", expired, now), false);
  assert.equal(shouldFallbackExpiredPublicInvite("public", live, now), false);
  assert.equal(shouldFallbackExpiredPublicInvite("public", v2, now), false);
  assert.equal(shouldFallbackExpiredPublicInvite("public", undefined, now), false);
});

test("inviteTokenFromJoinUrl reads /invite/{code}", () => {
  const token = v1Token({ e: 1 });
  const url = `https://bitcoiners.communities.buzz.xyz/invite/${token}`;
  assert.equal(inviteTokenFromJoinUrl(url), token);
  assert.equal(inviteTokenFromJoinUrl("https://buzz.cashu.space"), undefined);
  assert.equal(
    inviteTokenFromJoinUrl(
      "buzz://add-community?relay=wss%3A%2F%2Fexample&name=x",
    ),
    undefined,
  );
});
