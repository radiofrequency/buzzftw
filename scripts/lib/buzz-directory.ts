/**
 * Parsers for https://buzz.directory/ (Next.js, no public JSON API).
 *
 * Adapted from megistusXYZ/relay-outpost `shared/buzz-directory.ts`
 * (MIT/Apache as applicable): listing slugs are NOT relay hosts — a wrong
 * guess can still return NIP-11. Relays come from each detail page's
 * `buzz://add-community?relay=…` or `buzz://join?relay=…&code=…` deep link.
 */

export type DirectoryAccess = "public" | "invite";

export type ListedCommunity = {
  /** Path slug, including the directory's trailing uuid. */
  directorySlug: string;
  name: string;
  access: DirectoryAccess | null;
  description?: string;
  category?: string;
};

export type ResolvedCommunity = ListedCommunity & {
  relayUrl: string;
  inviteCode?: string;
};

const HREF_RE = /\/communities\/([a-z0-9-]+)/g;
const ARTICLE_RE = /<article\b[^>]*>[\s\S]*?<\/article>/gi;
const DIRECTORY_UUID_RE = /-[a-f0-9]{32}$/i;
const ACCESS_RE = /^(Invite|Public|Pub|Approval)$/i;

const CATEGORY_TAGS: Record<string, string> = {
  "ai and agents": "Agents",
  bitcoin: "Bitcoin",
  builders: "Builders",
  "business and gtm": "GTM",
  creators: "Creators",
  culture: "Culture",
  design: "Craft",
  "developer tools": "Builders",
  "hardware and compute": "Hardware",
  "local communities": "Local",
  privacy: "Privacy",
  security: "Security",
};

export function marketplaceIdFromDirectorySlug(directorySlug: string): string {
  return directorySlug.replace(DIRECTORY_UUID_RE, "");
}

export function hostFromRelayUrl(relayUrl: string): string {
  const trimmed = relayUrl.replace(/\/+$/, "");
  try {
    return new URL(trimmed).host;
  } catch {
    return trimmed.replace(/^wss?:\/\//, "");
  }
}

export function mapDirectoryCategory(category?: string): string | undefined {
  if (!category) return undefined;
  const key = category.trim().toLowerCase();
  return CATEGORY_TAGS[key] ?? titleCaseTag(category);
}

function titleCaseTag(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAccess(badge: string): DirectoryAccess | null {
  if (/invite|approval/i.test(badge)) return "invite";
  if (/^pub/i.test(badge)) return "public";
  return null;
}

/**
 * Prefer server-rendered `<article>` cards (stable). Fall back to the RSC
 * payload walk used by relay-outpost when articles are missing.
 */
export function parseBuzzDirectory(html: string): ListedCommunity[] {
  const fromArticles = parseDirectoryArticles(html);
  if (fromArticles.length > 0) return fromArticles;
  return parseDirectoryRsc(html);
}

function parseDirectoryArticles(html: string): ListedCommunity[] {
  const bySlug = new Map<string, ListedCommunity>();
  for (const article of html.match(ARTICLE_RE) ?? []) {
    const href = article.match(/href="\/communities\/([a-z0-9-]+)"/);
    if (!href) continue;
    const directorySlug = href[1];
    if (bySlug.has(directorySlug)) continue;

    const nameMatch = article.match(/<h2\b[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/i);
    const name = decodeHtml(nameMatch?.[1] ?? "");
    if (!name) continue;

    const badgeTexts = [
      ...article.matchAll(
        /<span class="inline-flex items-center rounded-(?:full|md)[^>]*>([\s\S]*?)<\/span>/gi,
      ),
    ].map((m) => decodeHtml(m[1]));

    let access: DirectoryAccess | null = null;
    let category: string | undefined;
    for (const badge of badgeTexts) {
      if (!badge || badge.length > 40) continue;
      if (ACCESS_RE.test(badge)) {
        access ??= normalizeAccess(badge);
        continue;
      }
      if (/^(English|Español|Deutsch|Français)$/i.test(badge)) continue;
      category ??= badge;
    }

    const descMatch = article.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    const description = decodeHtml(descMatch?.[1] ?? "");

    bySlug.set(directorySlug, {
      directorySlug,
      name,
      access,
      ...(description ? { description } : {}),
      ...(category ? { category } : {}),
    });
  }
  return [...bySlug.values()];
}

function parseDirectoryRsc(html: string): ListedCommunity[] {
  const bySlug = new Map<string, ListedCommunity>();
  for (const m of html.matchAll(HREF_RE)) {
    const directorySlug = m[1];
    if (bySlug.has(directorySlug)) continue;

    const start = m.index! + m[0].length;
    let ctx = html.slice(start, start + 800);
    const nextHref = ctx.indexOf("/communities/");
    if (nextHref !== -1) ctx = ctx.slice(0, nextHref);
    const texts = [...ctx.matchAll(/"children\\?":\\?"([^"\\$}{]{1,80})/g)].map(
      (t) => t[1],
    );
    const name = texts.find((t) => !ACCESS_RE.test(t));
    if (!name) continue;
    const badge = texts.find((t) => ACCESS_RE.test(t)) || "";

    let wide = html.slice(start, start + 6000);
    const wideNext = wide.indexOf("/communities/");
    if (wideNext !== -1) wide = wide.slice(0, wideNext);
    const longs = [
      ...wide.matchAll(/"children\\{0,2}":\\{0,2}"([^"\\]{40,300})/g),
    ].map((t) => t[1]);
    const description = longs.find((t) => t !== name);

    bySlug.set(directorySlug, {
      directorySlug,
      name: name.trim(),
      access: normalizeAccess(badge),
      ...(description ? { description } : {}),
    });
  }
  return [...bySlug.values()];
}

/**
 * Relay + public invite code from a community detail page. Returns null when
 * the page does not publish a buzz:// deep link — never guess the host.
 */
export function parseBuzzCommunityRelay(
  html: string,
): { relayUrl: string; inviteCode?: string } | null {
  const encoded = html.match(
    /buzz:\/\/(?:add-community|join)\?relay=(wss?%3A%2F%2F[A-Za-z0-9._%-]+)/,
  );
  if (encoded) {
    let relayUrl: string;
    try {
      relayUrl = decodeURIComponent(encoded[1]).replace(/\/+$/, "");
    } catch {
      return null;
    }
    const tail = html.slice(
      encoded.index! + encoded[0].length,
      encoded.index! + encoded[0].length + 300,
    );
    const code = tail.match(/(?:&amp;|&|\\u0026|&)code=([A-Za-z0-9._%+-]+)/);
    return {
      relayUrl,
      ...(code ? { inviteCode: decodeURIComponent(code[1]) } : {}),
    };
  }

  const plain = html.match(
    /buzz:\/\/(?:add-community|join)\?relay=(wss?:\/\/[^&\s"'\\]+)/,
  );
  if (!plain) return null;
  const relayUrl = decodeHtml(plain[1]).replace(/\/+$/, "");
  const tail = html.slice(
    plain.index! + plain[0].length,
    plain.index! + plain[0].length + 300,
  );
  const code = tail.match(/(?:&amp;|&|\\u0026|&)code=([A-Za-z0-9._%+-]+)/);
  return {
    relayUrl,
    ...(code ? { inviteCode: decodeURIComponent(code[1]) } : {}),
  };
}

export function listingHasNextPage(html: string, currentPage: number): boolean {
  const next = currentPage + 1;
  return (
    html.includes(`/communities?page=${next}`) ||
    html.includes(`?page=${next}"`)
  );
}
