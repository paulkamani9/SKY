# SKY — QR menu

The SKY Lounge menu for Flic en Flac. Guests scan a QR code at the table and land
straight on the menu. Staff edit items, prices, photos and availability at
`/studio`.

- **Framework:** Next.js (App Router) on Vercel
- **Content:** Sanity (free tier), Studio embedded at `/studio`
- **Languages:** English, French, Italian, German and Russian, picked in the
  header and remembered per device. English and French are the master text; a
  blank translation falls back to English rather than showing a gap
- **Layout:** sections choose their own presentation — a photo grid (2 columns on
  a phone, 3 on a tablet, 4 on desktop) for food, or a compact list for long
  drink sections like Coffee and Teas where photos would only slow the page.
  Tapping anything opens a sheet with the full photo, price and description.

There is no cart or ordering flow: guests read, then order with a member of staff.

## The menu content

The full menu — 11 sections, 85 items, transcribed from the master menu PDF and
translated into French — lives in
[`src/lib/menuContent.ts`](src/lib/menuContent.ts).

The wording is the master menu's own, verbatim, with two deliberate departures:
British spelling throughout (flavours, savoury, chilli, yoghurt), and short
section names that fit the phone's nav pills — "Coffee" rather than "The Coffee
Station". Items keep the menu's prices, names and descriptions as printed.

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
  Set the **Group inside the section** field; items sharing one are listed
  together under a heading, which appears where the group's first item sits.
  Groups are collected by name, not by adjacency, so an item dragged out of its
  run rejoins its group rather than printing the heading twice.
- **Section intros and footnotes** — "Served daily until 13:00", the milk
  alternatives note under Coffee.
- **A fruit list under a section** — the fruits on the display table today,
  drawn as chips under Fruit Bowls and Smoothies so a guest composing their own
  bowl or blend can see what there is. It lives in one document —
  **Today → Today's fruit selection** — and sections opt in with **Show today's
  fruit list**, so a seasonal change is one edit in one box and the two sections
  cannot drift apart. The English line alone is enough; the other languages fall
  back to it. The query copies the list onto each opted-in section, so the
  rendering code reads it off the section either way.
- **One item per row on a phone** — the **wideTiles** switch on a section, for
  the two fruit bowls, whose photos are the point and were being shrunk to
  thumbnails by the standard two-up grid.
- **Names under the tile** — every photo grid but the first prints the item name
  under the picture, above the price. Gelato & Sorbets alone keeps its names on
  the back of the tile: eleven scoops that the pictures carry, where the flip is
  what tells a guest the menu is worth touching.

### The other three languages

Italian, German and Russian live in
[`src/lib/menuTranslations.ts`](src/lib/menuTranslations.ts), keyed by document
id, and are pushed into Sanity with:

```bash
npm run migrate:languages -- --dry-run
```

```bash
npm run migrate:languages
```

Unlike `npm run seed`, it only writes translation fields — never a price, photo,
order or availability — so it is safe to re-run against a live dataset. In the
Studio the three sit behind an **Other languages** tab on each item, section
and sub-section, beside the English and French fields.

> They are careful translations, not copy written by a native speaker. Worth a
> read-through by someone who speaks the language before this goes to print.

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

This creates the 11 sections, 85 items, the settings and fruit-selection
documents and the drag-ordering sort keys, and uploads the placeholder photos so
the Studio matches what is on screen. Add `-- --no-photos` to seed text only.
Follow it with `npm run migrate:languages` for Italian, German and Russian.

Two one-off migrations exist for datasets seeded before those features, both
with a `--dry-run` first: `npm run migrate:order` (numeric order → drag-and-drop
sort keys) and `npm run migrate:fruit` (per-section fruit lists → the single
document). `npm run menu:order` prints the menu in render order — run it before
and after any ordering change and diff the two.

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

The Studio is arranged by how often a job comes up, not by document type. Three
entries, in order: **Today**, **Sections & items**, **Setup**.

| Task | Where |
| --- | --- |
| Mark something sold out | Open the item → **Ran out — take off the menu** |
| Put it back | **Today → Sold out right now** → **Back on the menu** |
| Change the fruit selection | **Today → Today's fruit selection** — one box, one edit |
| Change a price | **Sections & items** → section → item → **Price** |
| Add or replace a photo | Same item → **Photo** (transparent-background PNG — see [docs/photo-briefs.md](docs/photo-briefs.md)) |
| Add an item | Section's **⋮** menu → **New item in this section** |
| Reorder items, or sections | Drag them — items inside a section, sections under **Setup → Menu sections** |
| Switch a section to a list | **Setup → Menu sections** → **Layout** |
| Hide a whole section | **Setup → Menu sections** → **Hide this section** |
| Change the notice at the top | **Setup → Restaurant settings** → **Notice** |

Turning an item off removes it from the menu rather than greying it out — a
guest never reads about something they cannot order. It stays in the Studio,
listed under **Today → Sold out right now**, until it goes back on.

Item forms have three tabs: **Item** (what the guest reads and pays), **Other
languages**, and **Where it sits** (section and group, set once at creation).

There is a plain-language guide written for the owner, with no Sanity
vocabulary in it, at [docs/editing-the-menu.md](docs/editing-the-menu.md).

### Ordering

Position is stored as a `orderRank` sort key written by
[@sanity/orderable-document-list](https://github.com/sanity-io/plugins/tree/main/plugins/@sanity/orderable-document-list),
so dragging one item rewrites one document rather than renumbering the list.
Sub-sections carry no order of their own: a group's heading appears where its
first item sits, which is what lets a whole section be dragged as one flat list.

The numeric `order` field it replaced is hidden but still in the data, and the
menu query still falls back to it for any document that has somehow not been
ranked.

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
- Text falls back to English (then French) when a translation is blank, so a
  half-filled item never renders an empty line.
- The fruit bowl photos still show fruit SKY does not stock. Prompts for their
  replacements are in [`docs/photo-briefs.md`](docs/photo-briefs.md).

## Adding the real photos

Each item has one optional **Photo**, shown as a 4:3 crop on the card and full
size in the detail sheet. Shoot or crop roughly 4:3 (landscape), upload at around
1400px wide, and Sanity handles the resizing. Use the **hotspot** control if an
automatic crop cuts the dish badly.

Photos can be replaced gradually — an item with none simply shows the SKY plate.
