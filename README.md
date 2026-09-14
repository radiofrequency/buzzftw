# Buzz (`radiofrequency/buzzftw`)

This repository is the **Buzz product** — control plane, launcher SPA, and Hetzner relay. It is not the Folstad marketing site.

| | |
|---|---|
| **Repo** | [github.com/radiofrequency/buzzftw](https://github.com/radiofrequency/buzzftw) |
| **Product** | https://buzzftw.com |
| **Relay** | https://relay.buzzftw.com |
| **Marketing** | Private [radiofrequency/folstad.ca](https://github.com/radiofrequency/folstad.ca) — not published from this repo |

`main` is the Buzz / platform branch.

The `folstad-pages` GitHub branch is a historical Pages snapshot (tag `folstad-v1`). **Do not delete it from GitHub** — that is a human/Ryan task. This repo must not deploy Folstad marketing or GitHub Pages.

## Rename (historical)

This repo was `radiofrequency/folstad-site` (Folstad AI marketing + Buzz in one tree). Marketing was split to `radiofrequency/folstad.ca`. The GitHub repo was renamed to `radiofrequency/buzzftw`.

## Stack

| Path | Role |
|------|------|
| `src/` | Astro SPA: Buzz launcher, auth, dashboard. Leftover Folstad marketing pages (`/`, `/restaurant`) are **not** the live marketing site. |
| `infra/` | AWS CDK — **`BuzzAuthStack`** (Cognito only). Fat `BuzzStack` is retired. |
| `packages/buzz-api` | Lambda handlers |
| `packages/buzz-runtime` | Fargate project runtime image |
| `packages/buzz-shared` | Shared types |
| `packages/buzz-platform` | Free relay on Hetzner (`relay.buzzftw.com`) |

## Develop

```bash
git clone https://github.com/radiofrequency/buzzftw.git
cd buzzftw
npm install
npm run dev
```

Open the URL Astro prints (usually `http://localhost:4321`).

Buzz app routes: `/signup` → verify email → `/login` → `/buzz` → `/dashboard`.

Auth talks to Cognito. Set `PUBLIC_COGNITO_*` from `BuzzAuthStack` outputs (see [`.env.example`](.env.example) and [`infra/README.md`](infra/README.md)). The deleted pool `us-west-2_MIDcSvkwq` is gone — do not hard-code it.

```bash
npm run build
npm run preview
```

Default `SITE_URL` is `https://buzzftw.com`. Override with `SITE_URL=...` if you need a different canonical host for a local build.

## Deploy

**Do not** publish this tree to GitHub Pages. The Pages workflow in `.github/workflows/deploy.yml` is disabled so `main` cannot overwrite Folstad marketing.

Buzz infra is **not** deployed by GitHub Actions from this repo:

- **Auth (intended):** [`infra/README.md`](infra/README.md) — `cd infra && npx cdk deploy BuzzAuthStack`. Then set `PUBLIC_COGNITO_*` from the outputs.
- **Do not** `cdk deploy BuzzStack` / `--all` against the fat stack. That would recreate VPC/ALB/ECS and a `folstad.ca` hosted zone pointing at github.io.
- Relay: [`packages/buzz-platform/MIGRATION.md`](packages/buzz-platform/MIGRATION.md) — `relay.buzzftw.com` on Hetzner.

Apex `buzzftw.com` / `www` stay on the existing CloudFront/S3 marketplace host. Community `*.buzzftw.com` already hits Hetzner. Do not touch `folstad.ca` DNS (separate Folstad Site CloudFront).

## Marketplace directory sync

The homepage catalog is the generated list from [buzz.directory](https://buzz.directory/) in [`src/data/marketplace-communities.generated.ts`](src/data/marketplace-communities.generated.ts). Editorial `featuredRank` / accent overrides for directory-sourced communities live in [`src/data/marketplace-communities.ts`](src/data/marketplace-communities.ts). Relays are read from each listing’s detail-page `buzz://` deep link — slugs are never guessed as hosts.

### Local

```bash
npm run sync:directory -- --dry-run   # fetch + merge, print counts, do not write
npm run sync:directory                # update src/data/marketplace-communities.generated.ts
```

The scraper uses native `fetch` (2 concurrent detail requests, 15s timeouts). It copies invite tokens only when the directory publishes them. Expired Buzz v1 invite tokens (payload `e` in the past) on **Public** listings are not copied; those rows use `buzz://add-community` (relay join) instead. Invite-only listings keep their published invite URL even if that token is expired, so sync does not imply open join. v2 tokens have no parseable expiry and are kept as published. Editorial `featuredRank` / accent overrides for directory-sourced communities are applied at merge time and are not written into the generated file.

### Weekday routine (Grok Bot box)

Do **not** run this from GitHub Actions. The catalog refresh is a weekday routine on Ryan's Grok Bot box (same command locally):

```bash
npm run sync:directory
```

That writes `src/data/marketplace-communities.generated.ts`. After the catalog changes, commit as usual. To publish the marketplace:

```bash
export MARKETING_BUCKET=buzzftw-com-marketing
export MARKETING_DISTRIBUTION_ID=EF2IOL0B900JI
./scripts/deploy-site.sh
```

## Brand assets

| File | Use |
|------|-----|
| `public/mark.svg` | Aperture mark |
| `public/logo.svg` | Mark + wordmark |
| `public/favicon.ico` | Favicon (matches [buzz.directory](https://buzz.directory/)) |
| `public/favicon-16x16.png` / `favicon-32x32.png` | Sized PNG favicons |
| `public/apple-touch-icon.png` | Apple touch icon |
| `public/site.webmanifest` | Web app manifest |
| `assets/brand/` | Logo explorations (not required at runtime) |
