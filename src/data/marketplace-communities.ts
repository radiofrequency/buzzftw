/**
 * Curated Buzz community catalog for the marketplace homepage.
 * Directory rows: marketplace-communities.generated.ts (npm run sync:directory).
 */

import { DIRECTORY_COMMUNITIES } from "./marketplace-communities.generated";

export type AccessMode = "public" | "invite";

export type MarketplaceCommunity = {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  tags: string[];
  access: AccessMode;
  /** HTTPS invite or buzz:// deep link */
  joinUrl: string;
  /** Display host (no scheme) */
  host?: string;
  /** Lower = higher on Top carousel */
  featuredRank?: number;
  /** ISO date for New sort */
  listedAt: string;
  source?: "buzzftw" | "external" | "curated";
  /** Soft card accent (css color) */
  accent?: string;
};

function buzzAdd(relayHost: string, name: string): string {
  const relay = encodeURIComponent(`wss://${relayHost}`);
  return `buzz://add-community?relay=${relay}&name=${encodeURIComponent(name)}`;
}

/** Editorial rank / accent — preserved across directory sync. */
export const CURATED_OVERRIDES: Record<string, Partial<MarketplaceCommunity>> = {
  buzzdir: { featuredRank: 1, accent: "#3D6B8C" },
  bitcoiners: { featuredRank: 2, accent: "#F0B429" },
  designers: { featuredRank: 3, accent: "#8BB8D4" },
  creatormagic: { featuredRank: 4, accent: "#C4785A" },
  cashu: { featuredRank: 5, accent: "#5C8A6B" },
  vibecoding: { featuredRank: 6, accent: "#6B5B95" },
  hermesagent: { featuredRank: 7, accent: "#3D6B8C" },
  milysec: { featuredRank: 8, accent: "#8B4D5C" },
  openb: { featuredRank: 9, accent: "#4A7C59" },
  gtmelite: { featuredRank: 10, accent: "#B8860B" },
  tech: { featuredRank: 11, accent: "#5C6370" },
  "dgx-spark": { featuredRank: 12, accent: "#76B900" },
  "devin-builders": { featuredRank: 13, accent: "#2D6A8F" },
  ldk: { featuredRank: 14, accent: "#F7931A" },
  monero: { featuredRank: 15, accent: "#FF6600" },
  "buzzftw-builders": { featuredRank: 16, accent: "#F0B429" },
  thakaly: { featuredRank: 17, accent: "#9B6B9E" },
  "romeo-and-juliet": { featuredRank: 18, accent: "#C45C6A" },
};

/** Rows that are not sourced from buzz.directory. */
export const CURATED_COMMUNITIES: MarketplaceCommunity[] = [
  {
    id: "buzzftw-builders",
    name: "BuzzFTW Builders",
    slug: "builders",
    blurb:
      "BuzzFTW operators launching public & private relays — humans, agents, Lightning hosting.",
    tags: ["BuzzFTW", "Builders"],
    access: "invite",
    joinUrl: buzzAdd("builders.buzzftw.com", "BuzzFTW Builders"),
    host: "builders.buzzftw.com",
    listedAt: "2026-07-30T12:00:00Z",
    source: "buzzftw",
  },
];

export function mergeMarketplaceCommunities(
  directory: MarketplaceCommunity[],
  overrides: Record<string, Partial<MarketplaceCommunity>>,
  curated: MarketplaceCommunity[],
): MarketplaceCommunity[] {
  const byId = new Map<string, MarketplaceCommunity>();
  for (const row of directory) {
    byId.set(row.id, { ...row, ...overrides[row.id] });
  }
  for (const row of curated) {
    if (byId.has(row.id)) continue;
    byId.set(row.id, { ...row, ...overrides[row.id] });
  }
  return [...byId.values()];
}

export const MARKETPLACE_COMMUNITIES: MarketplaceCommunity[] =
  mergeMarketplaceCommunities(
    DIRECTORY_COMMUNITIES,
    CURATED_OVERRIDES,
    CURATED_COMMUNITIES,
  );

const TOP_LIMIT = 12;
const NEW_LIMIT = 12;
const FEATURED_LIMIT = 4;

/** Editorial Top order by featuredRank */
export function topCommunities(limit = TOP_LIMIT): MarketplaceCommunity[] {
  return [...MARKETPLACE_COMMUNITIES]
    .filter((c) => c.featuredRank != null)
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    .slice(0, limit);
}

/** Newest first by listedAt */
export function newCommunities(limit = NEW_LIMIT): MarketplaceCommunity[] {
  return [...MARKETPLACE_COMMUNITIES]
    .sort(
      (a, b) =>
        new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
    )
    .slice(0, limit);
}

/** Hero featured strip (subset of top) */
export function featuredCommunities(limit = FEATURED_LIMIT): MarketplaceCommunity[] {
  return topCommunities(limit);
}

export function allCommunities(): MarketplaceCommunity[] {
  return [...MARKETPLACE_COMMUNITIES].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** Unique tags sorted for filter chips */
export function allTags(): string[] {
  const set = new Set<string>();
  for (const c of MARKETPLACE_COMMUNITIES) {
    for (const t of c.tags) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function marketplaceStats() {
  const all = MARKETPLACE_COMMUNITIES;
  return {
    total: all.length,
    publicCount: all.filter((c) => c.access === "public").length,
    inviteCount: all.filter((c) => c.access === "invite").length,
    tagCount: allTags().length,
  };
}

/** Initial letter or first two for card monogram */
export function communityMonogram(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  return (name[0] ?? "?").toUpperCase();
}

/** Relative age label for "New" UI */
export function relativeListedLabel(listedAt: string, now = Date.now()): string {
  const t = new Date(listedAt).getTime();
  if (Number.isNaN(t)) return "Listed";
  const days = Math.max(0, Math.floor((now - t) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** Site-relative path helper (respects BASE_URL) */
export function sitePath(path: string): string {
  const base = import.meta.env?.BASE_URL || "/";
  const b = base.endsWith("/") ? base : `${base}/`;
  const p = path.replace(/^\//, "");
  return `${b}${p}`;
}
