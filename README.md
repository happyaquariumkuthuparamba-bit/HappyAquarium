# 🐠 Happy Aquarium

A premium, immersive website + full custom CMS for **Happy Aquarium** — an aquarium & imported-fish store near Eye Hospital, Kuthuparamba, Kerala.

Built **Cloudflare-native**: Next.js runs on Cloudflare Workers via OpenNext, data lives in Cloudflare D1 (serverless SQLite), media in R2. Editorial "nature-documentary" design — warm paper canvas, Fraunces serif, deep pine-teal + terracotta.

---

## ✨ Features

**Storefront**
- Cinematic editorial hero with GSAP scroll + mouse parallax, Lenis smooth scroll
- Live fish catalogue (35+ species) with search, category / difficulty filters & sorting
- Rich fish detail pages — every care attribute (temp, pH, tank size, diet, temperament…), gallery, varieties, related fish, Product JSON-LD
- Accessories catalogue + detail, blog, gallery with lightbox, contact form
- Interactive tools: **Fish Compatibility Checker** and **Aquarium Planner** (live recommendations)
- WhatsApp reserve / call CTAs everywhere, `today's offers` with live countdowns
- Fully responsive, `prefers-reduced-motion` aware, SEO metadata + JSON-LD

**Admin CMS** (`/admin`)
- Signed-cookie auth with role hierarchy (admin / manager / staff / viewer)
- Dashboard: live stats, recent enquiries, low-stock alerts
- **Fish** — full CRUD (30+ fields)
- **Enquiries** — inbox with status workflow
- **Site Settings** — store info, contact, address, map, socials, SEO defaults
- **Homepage Builder** — add / edit / delete / reorder / toggle sections
- **Offers** — CRUD with scheduled start/end & placement
- **Products / Blog / Gallery / Testimonials** — live list views (CRUD forms follow the Fish template)

---

## 🧱 Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, RSC, Server Actions) · React 19 · TypeScript strict |
| Styling | Tailwind CSS v4 (CSS `@theme`) · Fraunces + Inter |
| Motion | GSAP + ScrollTrigger · Lenis · Framer Motion |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Storage | Cloudflare R2 (media) |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` |
| Auth | Custom PBKDF2 + HMAC signed-cookie sessions (edge-compatible, Web Crypto) |

---

## 🚀 Local Development

```bash
npm install

# create the local D1 schema and seed all content
npm run db:migrate:local
npm run db:seed:local

npm run dev          # http://localhost:3000
```

**Admin:** http://localhost:3000/admin/login — `admin@happyaquarium.in` / `admin123` (change in production).

---

## 📜 Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next dev server (Turbopack) with local D1/R2 bindings |
| `npm run build` | Production Next build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate Drizzle SQL migrations from the schema |
| `npm run db:migrate:local` / `:remote` | Apply migrations to local / remote D1 |
| `npm run db:seed:local` | Seed all content into local D1 |
| `npm run preview` | Build with OpenNext + run the Workers preview |
| `npm run deploy` | Build with OpenNext + deploy to Cloudflare |

---

## ☁️ Deploying to Cloudflare Workers

This is an **OpenNext → Cloudflare Workers** app. Do **not** use plain `next build`,
GitHub Pages, or a Cloudflare **Pages** project — the deployable artifact is a Worker
(`.open-next/worker.js`) produced by `opennextjs-cloudflare build`.

### Option A — deploy from your machine (simplest)

```bash
npx wrangler login
npx wrangler d1 create happy-aquarium-db          # copy the returned database_id
# → paste that id into wrangler.jsonc (d1_databases[0].database_id)

# load schema + all seed data onto the remote DB (one shot):
npx wrangler d1 execute happy-aquarium-db --remote --file drizzle/seed-dump.sql

npx wrangler secret put AUTH_SECRET               # paste any long random string
npm run deploy                                    # opennextjs-cloudflare build && deploy
```

You get a free URL like `happy-aquarium.<you>.workers.dev`.

### Option B — Git-connected CI (Cloudflare **Workers** Builds)

Create a **Workers** project (not Pages) from the GitHub repo, then set:

| Setting | Value |
|---------|-------|
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Environment variable | `AUTH_SECRET` = *(a long random string)* |

Run the D1 `create` + `seed-dump.sql` execute steps once from your machine (or the
dashboard console) so the remote database exists and is seeded.

> Regenerating a fresh seed dump: `npx wrangler d1 export happy-aquarium-db --local --output drizzle/seed-dump.sql`

### Free tier

Workers (100k req/day) + D1 (5 GB) cover a local store at **₹0/month**, indefinitely.
R2 (media uploads) is not wired yet, so no R2 bucket or card is required to go live.


---

## 📁 Structure

```
src/
  app/
    (site)/        # public storefront (own chrome layout)
    admin/         # CMS — login + (dashboard) group
    api/           # route handlers (leads, health)
  components/      # ui, layout, cards, home, fish, tools, admin, effects
  db/              # Drizzle schema + seed data
  lib/             # queries, admin queries, auth, utils
drizzle/           # generated migrations
scripts/seed.ts    # seed runner (getPlatformProxy + Drizzle)
```

---

*Made with care in Kuthuparamba.*
