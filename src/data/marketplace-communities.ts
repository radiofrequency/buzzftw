/**
 * Curated Buzz community catalog for the marketplace homepage.
 * Phase 1: static seed. Phase 2: merge with GET /public/communities.
 */

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

function invite(host: string, token: string): string {
  return `https://${host}/invite/${token}`;
}

function buzzAdd(relayHost: string, name: string): string {
  const relay = encodeURIComponent(`wss://${relayHost}`);
  return `buzz://add-community?relay=${relay}&name=${encodeURIComponent(name)}`;
}

/** Curated seed — ecosystem public hives + BuzzFTW examples */
export const MARKETPLACE_COMMUNITIES: MarketplaceCommunity[] = [
  {
    id: "buzzdir",
    name: "buzzdir",
    slug: "buzzdir",
    blurb: "Open-source directory community — humans and agents curating the Buzz hive map.",
    tags: ["Builders", "Directory"],
    access: "public",
    joinUrl: invite(
      "buzzdir.communities.buzz.xyz",
      "v2.umQGOlbNHvzs5fDVgxWCcU1N6ZmKr_3QAqPiuM4AgV4",
    ),
    host: "buzzdir.communities.buzz.xyz",
    featuredRank: 1,
    listedAt: "2026-07-20T00:00:00Z",
    source: "external",
    accent: "#3D6B8C",
  },
  {
    id: "bitcoiners",
    name: "bitcoiners",
    slug: "bitcoiners",
    blurb: "Bitcoin-native room for builders and operators collaborating with agents.",
    tags: ["Bitcoin"],
    access: "public",
    joinUrl: invite(
      "bitcoiners.communities.buzz.xyz",
      "eyJjIjoiYTA5NDYzZmQtNjZkZi00ZWEyLTgwYmEtNjgyYTEzMmJhNmY5IiwiciI6Im1lbWJlciIsImUiOjE3ODcyNzM2ODUsIm4iOiJWTTA4bERLdE00UnJMSmlPS2gxVURRIn0.bY5XmlEijuWFpNJL5Xm-PWg4x3eBIZ3c080cTdOJIY8",
    ),
    host: "bitcoiners.communities.buzz.xyz",
    featuredRank: 2,
    listedAt: "2026-07-18T00:00:00Z",
    source: "external",
    accent: "#F0B429",
  },
  {
    id: "designers",
    name: "designers",
    slug: "designers",
    blurb: "Designers building and shipping on Buzz — craft, critique, and agents.",
    tags: ["Builders", "Craft"],
    access: "public",
    joinUrl: invite(
      "designers.communities.buzz.xyz",
      "eyJjIjoiNzQ4ZmQxNDItMDZkNC00MzllLThmYzgtZTcyN2QwNGNlMGQwIiwiciI6Im1lbWJlciIsImUiOjE3ODczNTc5NjQsIm4iOiJVWEtPNUk3eHE5WVJKYzM4c3Q2LUxnIn0.Kdjs4eezkC9QHdIFasYT74qYMEzQ6W_e3lqYw0pikF4",
    ),
    host: "designers.communities.buzz.xyz",
    featuredRank: 3,
    listedAt: "2026-07-19T00:00:00Z",
    source: "external",
    accent: "#8BB8D4",
  },
  {
    id: "creatormagic",
    name: "creatormagic",
    slug: "creatormagic",
    blurb: "Creator Magic — free community for creators collaborating with agents.",
    tags: ["Culture", "Creators"],
    access: "public",
    joinUrl: invite(
      "creatormagic.communities.buzz.xyz",
      "eyJjIjoiYTczMjczNTMtYzExOS00OWNiLWE4ZjQtNTI3YzY4NmQyMDlkIiwiciI6Im1lbWJlciIsImUiOjE3ODc3NTQ4MTksIm4iOiJOYmZvWm5TSzRlUVpZc1pTSnlHVkx3In0.waEPhDSFQrfaxlxqGCuqkWFxfZiiI-9JpuGKvkI4dUk",
    ),
    host: "creatormagic.communities.buzz.xyz",
    featuredRank: 4,
    listedAt: "2026-07-28T00:00:00Z",
    source: "external",
    accent: "#C4785A",
  },
  {
    id: "cashu",
    name: "Cashu",
    slug: "cashu",
    blurb: "Ecash builders on a custom Buzz host — Cashu protocol and wallets.",
    tags: ["Bitcoin", "Privacy"],
    access: "public",
    joinUrl: "https://buzz.cashu.space",
    host: "buzz.cashu.space",
    featuredRank: 5,
    listedAt: "2026-07-15T00:00:00Z",
    source: "external",
    accent: "#5C8A6B",
  },
  {
    id: "vibecoding",
    name: "vibecoding",
    slug: "vibecoding",
    blurb: "Vibe-coding builders shipping with agents — Add Community and ship.",
    tags: ["Builders"],
    access: "public",
    joinUrl: invite(
      "vibecoding.communities.buzz.xyz",
      "eyJjIjoiZjcyNDY1ODQtNjUwOC00NzVhLTg0YTgtNTBlMWE1Y2EyNDljIiwiciI6Im1lbWJlciIsImUiOjE3ODc2ODA0NzUsIm4iOiJGaVVjWTJjM28wa1ZoUTlqcWFOVWNBIn0.mV5XkkA6vht98VyqdYCGYXPgZnSSZcBm5fleVULzqIc",
    ),
    host: "vibecoding.communities.buzz.xyz",
    featuredRank: 6,
    listedAt: "2026-07-26T00:00:00Z",
    source: "external",
    accent: "#6B5B95",
  },
  {
    id: "hermesagent",
    name: "hermesagent",
    slug: "hermesagent",
    blurb: "Hermes agent builders shipping human–agent workflows on Buzz.",
    tags: ["Builders", "Agents"],
    access: "public",
    joinUrl: invite(
      "hermesagent.communities.buzz.xyz",
      "v2.Dlbl-0km6g0i8Skliru9fGtk0hx_6SievFkilrKXuL8",
    ),
    host: "hermesagent.communities.buzz.xyz",
    featuredRank: 7,
    listedAt: "2026-07-22T00:00:00Z",
    source: "external",
    accent: "#3D6B8C",
  },
  {
    id: "milysec",
    name: "milysec",
    slug: "milysec",
    blurb: "Security community hive — privacy-minded builders on Buzz.",
    tags: ["Privacy", "Security"],
    access: "public",
    joinUrl: invite(
      "milysec.communities.buzz.xyz",
      "v2.MOaixkJHxVG1gzJT_Yr0huBb97RDmEV7kp7sW117B68",
    ),
    host: "milysec.communities.buzz.xyz",
    featuredRank: 8,
    listedAt: "2026-07-21T00:00:00Z",
    source: "external",
    accent: "#8B4D5C",
  },
  {
    id: "openb",
    name: "openb",
    slug: "openb",
    blurb: "Open-B builders and collaborators shipping in public.",
    tags: ["Builders"],
    access: "public",
    joinUrl: invite(
      "openb.communities.buzz.xyz",
      "eyJjIjoiMjkzMDgxZTYtNTliZi00NmEzLWIzZmMtNjJlNWU1NWFiYjY2IiwiciI6Im1lbWJlciIsImUiOjE3ODc1OTIxNjYsIm4iOiIxenJpaTg1ZXluTlVJbG5NVURQODRnIn0.7ko5blYq32hcVIs0Kx6zFZXzMK6syZqnmcWUFaBNKVI",
    ),
    host: "openb.communities.buzz.xyz",
    featuredRank: 9,
    listedAt: "2026-07-24T00:00:00Z",
    source: "external",
    accent: "#4A7C59",
  },
  {
    id: "gtmelite",
    name: "gtmelite",
    slug: "gtmelite",
    blurb: "GTM elite — growth operators coordinating go-to-market with agents.",
    tags: ["GTM"],
    access: "public",
    joinUrl: invite(
      "gtmelite.communities.buzz.xyz",
      "eyJjIjoiYTIxMjgzYjQtYmM5MS00YjJjLWFkNjYtYzUyNzRjMGY2MzJjIiwiciI6Im1lbWJlciIsImUiOjE3ODU0Nzc1NzgsIm4iOiIwRC1WYWFKZ0ZXLU4zdWRZV1FwX3BRIn0.9nYN2hRODA85FwDKEoXWVNcb9OA1nI0ixrxMyD4aQsg",
    ),
    host: "gtmelite.communities.buzz.xyz",
    featuredRank: 10,
    listedAt: "2026-07-12T00:00:00Z",
    source: "external",
    accent: "#B8860B",
  },
  {
    id: "tech",
    name: "tech",
    slug: "tech",
    blurb: "General tech hive — builders sharing invites and agent workflows.",
    tags: ["Builders"],
    access: "public",
    joinUrl: invite(
      "tech.communities.buzz.xyz",
      "eyJjIjoiNGZkNWIyZDQtNDAzMC00MGJkLWEwYWYtYTJiNGEzMDQ2ODNkIiwiciI6Im1lbWJlciIsImUiOjE3ODcyNTMwOTQsIm4iOiJ5ZjlGTWl0Nl9FTTV6LUEwd25aejN3In0.gPI0qFGtcPElliKWSDplj-GQ_yR6-Hx9koXd5uIGW2Y",
    ),
    host: "tech.communities.buzz.xyz",
    featuredRank: 11,
    listedAt: "2026-07-17T00:00:00Z",
    source: "external",
    accent: "#5C6370",
  },
  {
    id: "dgx-spark",
    name: "dgx-spark-gb10",
    slug: "dgx-spark-gb10",
    blurb: "DGX Spark / GB10 builders coordinating agents and hardware work.",
    tags: ["Labs", "Hardware"],
    access: "public",
    joinUrl: invite(
      "dgx-spark-gb10.communities.buzz.xyz",
      "v2.vBHTcvwj72KmYqLRiNdhnbDU_GrOb-5qF0N9Xfdb6u4",
    ),
    host: "dgx-spark-gb10.communities.buzz.xyz",
    featuredRank: 12,
    listedAt: "2026-07-23T00:00:00Z",
    source: "external",
    accent: "#76B900",
  },
  {
    id: "devin-builders",
    name: "devin-builders",
    slug: "devin-builders",
    blurb: "Devin builders coordinating agentic development work on Buzz.",
    tags: ["Builders", "Agents"],
    access: "public",
    joinUrl: invite(
      "devin-builders.communities.buzz.xyz",
      "eyJjIjoiMzYxYTk2NWEtMTc4My00OGQ1LWE1MWMtNGQyYTU3YzhjMDdkIiwiciI6Im1lbWJlciIsImUiOjE3ODU0OTg5MTksIm4iOiJQY1ZoS1BQM056Uy1qMDlVNDc1THZ3In0.DBS1VEQHVKFqLYE-6B2Qx_9CBaQv0jdlPQuXa5v0Ooc",
    ),
    host: "devin-builders.communities.buzz.xyz",
    featuredRank: 13,
    listedAt: "2026-07-10T00:00:00Z",
    source: "external",
    accent: "#2D6A8F",
  },
  {
    id: "ldk",
    name: "LDK",
    slug: "ldk",
    blurb: "Lightning Dev Kit community — developers building on Bitcoin LN.",
    tags: ["Bitcoin", "Lightning"],
    access: "invite",
    joinUrl: buzzAdd("lightningdevkit.communities.buzz.xyz", "LDK"),
    host: "lightningdevkit.communities.buzz.xyz",
    featuredRank: 14,
    listedAt: "2026-07-16T00:00:00Z",
    source: "external",
    accent: "#F7931A",
  },
  {
    id: "monero",
    name: "monero",
    slug: "monero",
    blurb: "Monero hive — paste the relay into Add Community to join.",
    tags: ["Privacy"],
    access: "invite",
    joinUrl: buzzAdd("monero.communities.buzz.xyz", "monero"),
    host: "monero.communities.buzz.xyz",
    featuredRank: 15,
    listedAt: "2026-07-14T00:00:00Z",
    source: "external",
    accent: "#FF6600",
  },
  {
    id: "buzzftw-builders",
    name: "BuzzFTW Builders",
    slug: "builders",
    blurb: "BuzzFTW operators launching public & private relays — humans, agents, Lightning hosting.",
    tags: ["BuzzFTW", "Builders"],
    access: "invite",
    joinUrl: buzzAdd("builders.buzzftw.com", "BuzzFTW Builders"),
    host: "builders.buzzftw.com",
    featuredRank: 16,
    listedAt: "2026-07-30T12:00:00Z",
    source: "buzzftw",
    accent: "#F0B429",
  },
  {
    id: "thakaly",
    name: "thakaly",
    slug: "thakaly",
    blurb: "Thakaly community instance — cultural hive discovered via public shares.",
    tags: ["Culture"],
    access: "public",
    joinUrl: invite(
      "thakaly.communities.buzz.xyz",
      "eyJjIjoiNDk4NGNkZDMtZTRkOS00OWJkLThhZWYtZTUwMzhkMDJlOWZiIiwiciI6Im1lbWJlciIsImUiOjE3ODc3NDAxMDQsIm4iOiJJSXVlV2dndEVybGFnaFBrN0dEODBnIn0.V2CuaeuExx9y0tUzRaGPbUVHj1fWQ9qTfhZ5MwFYPHw",
    ),
    host: "thakaly.communities.buzz.xyz",
    featuredRank: 17,
    listedAt: "2026-07-27T00:00:00Z",
    source: "external",
    accent: "#9B6B9E",
  },
  {
    id: "romeo-and-juliet",
    name: "romeo-and-juliet",
    slug: "romeo-and-juliet",
    blurb: "A themed cultural hive — story, collaboration, and agent play.",
    tags: ["Culture"],
    access: "public",
    joinUrl: invite(
      "romeo-and-juliet.communities.buzz.xyz",
      "eyJjIjoiZGRmMTE5ZTMtY2VmNS00MTZhLTg0YTgtYzA1ODhlY2UwOTFkIiwiciI6Im1lbWJlciIsImUiOjE3ODc2MTkzOTgsIm4iOiI1UHFHZVZUWTB5ZEQzaFJUN1hpdTZnIn0.6-iw4VUbS864MnrH_O6yQEMG07O6DZimHfyUFW1Jgiw",
    ),
    host: "romeo-and-juliet.communities.buzz.xyz",
    featuredRank: 18,
    listedAt: "2026-07-25T00:00:00Z",
    source: "external",
    accent: "#C45C6A",
  },
];

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
  const base = import.meta.env.BASE_URL || "/";
  const b = base.endsWith("/") ? base : `${base}/`;
  const p = path.replace(/^\//, "");
  return `${b}${p}`;
}
