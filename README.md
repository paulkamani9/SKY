# SKY — QR menu

The SKY Lounge menu for Flic en Flac. Guests scan a QR code at the table and land
straight on the menu. Staff edit items, prices, photos and availability at
`/studio`.

- **Framework:** Next.js (App Router) on Vercel
- **Content:** Sanity (free tier), Studio embedded at `/studio`
- **Languages:** English / French, toggled in the header and remembered per device
- **Layout:** sections choose their own presentation — a photo grid (2 columns on
  a phone, 3 on a tablet, 4 on desktop) for food, or a compact list for long
  drink sections like Coffee and Teas where photos would only slow the page.
  Tapping anything opens a sheet with the full photo, price and description.

There is no cart or ordering flow: guests read, then order with a member of staff.

## The menu content

The full menu — 11 sections, 85 items, transcribed from the master menu PDF and
translated into French — lives in
[`src/lib/menuContent.ts`](src/lib/menuContent.ts).

It renders directly until Sanity has its first published section, so the site
works the moment it is deployed. Run `npm run seed` (step 4) to push it into
Sanity, after which the Studio is the source of truth and that file is no longer
read.

> **The photos are stock images from Unsplash, not photographs of SKY's dishes.**
> They are there so the layout is testable before the real shoot. Replace them in
> the Studio before this goes live on the tables, and clear the "Photos are
> illustrative" line in Restaurant settings once you have.

### Structures the menu needed

- **Items with no fixed price** — "Build Your Own Tropical Bowl", the pastry
  showcase. Leave **Price** empty and fill in **Price note** instead
  ("Based on selection", "As priced"); the note renders where the price would.
- **Sub-groups inside a section** — "Premium Gelato", "Iced & Chilled Coffee".
  Set the **Sub-group** field; items sharing one are listed together under a
  heading. Items must be ordered so a group's items sit next to each other.
- **Section intros and footnotes** — "Served daily until 13:00", the milk
  alternatives note under Coffee.

## 1. Create the Sanity project

```bash
npx sanity@latest login
```

```bash
npx sanity@latest projects create "SKY Menu" --dataset production
```

Copy the project ID it prints.

## 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | The project ID from step 1 |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Leave as is |
| `SANITY_REVALIDATE_SECRET` | Any random string — generate with `openssl rand -hex 32` |
| `SANITY_WRITE_TOKEN` | Only for `npm run seed` — an Editor token from sanity.io/manage → API → Tokens |

## 3. Run it

```bash
npm run dev
```

- Menu: http://localhost:3000
- Studio: http://localhost:3000/studio

The menu renders immediately from the bundled content — Sanity is not required
to see it.

## 4. Load the menu into Sanity

```bash
npm run seed
```

This creates the 11 sections, 85 items and the settings document, and uploads the
placeholder photos so the Studio matches what is on screen. Add `-- --no-photos`
to seed text only.

Every document uses a fixed id, so re-running updates the same documents instead
of duplicating them — which also means it overwrites Studio edits. Run it to
initialise the dataset, then edit in the Studio from that point on.

## 5. Deploy to Vercel

```bash
npx vercel
```

Add the environment variables in the Vercel dashboard (Settings → Environment
Variables), then redeploy. `SANITY_WRITE_TOKEN` is only needed locally for
seeding — don't add it to Vercel.

Finally, tell Sanity that the deployed Studio is allowed to talk to the API:
in [sanity.io/manage](https://sanity.io/manage) → API → CORS origins, add your
Vercel URL (e.g. `https://sky-menu.vercel.app`) with credentials allowed.

## 6. Instant updates (optional but recommended)

Without this, edits appear within 60 seconds. With it, they appear immediately.

In [sanity.io/manage](https://sanity.io/manage) → API → Webhooks, create a webhook:

- **URL:** `https://your-app.vercel.app/api/revalidate`
- **Dataset:** `production`
- **Trigger on:** Create, Update, Delete
- **HTTP method:** POST
- **API version:** `v2021-03-25`
- **Secret:** the same value as `SANITY_REVALIDATE_SECRET`

## 7. The QR code

Point it at the plain site root — `https://your-app.vercel.app` — with no
parameters, so a single printed code works on every table. Any free QR generator
will do; print at least 3 cm square and test it from arm's length in the light
level of the dining area.

## Day-to-day for staff

| Task | Where |
| --- | --- |
| Change a price | Studio → Items → open item → Price |
| Mark something sold out | Studio → Items → toggle **Available today** off |
| Add or replace a photo | Studio → Items → Photo |
| Reorder the menu | Studio → **Order** field on sections and items |
| Switch a section to a list | Studio → Menu sections → **Layout** |
| Hide a whole section | Studio → Menu sections → **Hide this section** |
| Change the notice at the top | Studio → Restaurant settings → Notice |

Turning **Available today** off leaves the item visible but greyed out and
labelled *Sold out / Épuisé* — guests see it exists rather than wondering.

## Design

Daylight sky identity: a pale sky-blue ground washing from bright overhead to
sea light at the foot of the page, white cards, deep navy text, dark green and
gold accents, and the SKY wordmark in sky blue with a slow highlight drifting
across it. The page has a **fixed light appearance** — it deliberately does not
follow the device light/dark setting, so every table sees the same thing.

The palette lives in the `:root` block of
[`src/app/globals.css`](src/app/globals.css); the wordmark shine is
`.sky-wordmark` in the same file and stops under `prefers-reduced-motion`.

Gold and sky blue both lose contrast against a pale ground, so the accent tones
are deeper than their on-black equivalents — the section headings, sub-group
headings and prices are all tuned to clear 4.5:1 on the sky background. If you
lighten the background further, re-check those three.

Items without a photo render a SKY plate rather than an empty box, so a
half-photographed section still looks deliberate.

## Notes

- Photos are served straight from Sanity's CDN (resized and format-converted on
  their side), so they don't consume Vercel image-optimization quota.
- The menu page is `noindex` — it's a table utility, not a marketing page.
- If Sanity is unreachable the page falls back to the bundled menu rather than
  showing an error screen.
- Sections with no items are hidden automatically.
- French text falls back to English (and vice versa) when a translation is blank,
  so a half-filled item never renders an empty line.

## Adding the real photos

Each item has one optional **Photo**, shown as a 4:3 crop on the card and full
size in the detail sheet. Shoot or crop roughly 4:3 (landscape), upload at around
1400px wide, and Sanity handles the resizing. Use the **hotspot** control if an
automatic crop cuts the dish badly.

Photos can be replaced gradually — an item with none simply shows the SKY plate.
