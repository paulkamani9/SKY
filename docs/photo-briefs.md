# Fruit bowl photos — regeneration brief

SKY's display table actually carries five fruits: **papaya, mango, shredded
coconut, red dragon fruit and bergamot**. The bowl photos on the menu show
kiwi, banana, blueberries, blackberries and strawberries — fruit a guest cannot
order. These prompts replace them.

## What the menu needs back

Both photos are rendered as **cut-outs on the page background**, not as
rectangular pictures: the tile draws them with `object-contain` and a drop
shadow, and the server measures how much of the frame the subject paints in
order to scale every tile to a consistent weight (see `src/lib/imageScale.ts`).
So:

- **PNG with a genuine transparent background.** A white background will be
  rendered as a white box floating on the teal page.
- **Square-ish framing, subject centred**, with a little air around it — no part
  of the bowl cropped by the frame edge.
- **At least 1200px** on the long side (tiles serve up to 1200w).
- **Top-down (90°)**, matching the two photos already on the menu.
- Soft, bright, single-source daylight from the upper left; soft shadow under
  the bowl only. No harsh specular highlights on the fruit.
- No props, no cutlery, no napkins, no table, no hands, no text.

Upload replacements in the Studio on the two items in **Fruit Bowls** — the
paths, ids and everything else stay as they are.

## Prompt 1 — Build Your Own Tropical Bowl

> Using the attached photo as the reference for camera angle, lighting, bowl and
> styling, regenerate it with a different fruit selection. Keep the same plain
> white round ceramic bowl, the same perfect top-down 90° overhead angle, the
> same soft bright daylight from the upper left, and the same clean editorial
> food-photography look.
>
> The bowl is filled with exactly five ingredients, arranged as neat concentric
> wedges radiating from the centre like a colour wheel: cubed ripe orange
> papaya, cubed golden-yellow mango, cubed magenta-pink red dragon fruit with
> its visible black seeds, thin bright-yellow bergamot segments, and a generous
> scatter of fine white shredded coconut across the centre. Every piece cut
> cleanly and evenly, glistening and fresh, no bruising, no juice pooling.
>
> Do not include any other fruit — no kiwi, banana, berries, strawberries,
> pineapple or citrus other than bergamot.
>
> Output a square PNG with a fully transparent background: only the bowl and its
> soft contact shadow, no table, surface, props or text.

## Prompt 2 — The SKY Superfood Bowl

> Using the attached photo as the reference for camera angle, lighting, bowl and
> styling, regenerate it with a different fruit selection. Keep the same plain
> white round ceramic bowl, the same perfect top-down 90° overhead angle, the
> same soft bright daylight from the upper left, and the same clean editorial
> food-photography look.
>
> A base of thick creamy white Greek yoghurt fills the bowl. Arranged over it in
> neat sections: cubed ripe orange papaya, cubed golden-yellow mango, cubed
> magenta-pink red dragon fruit with visible black seeds, and thin bright-yellow
> bergamot segments. A band of golden honey-baked granola clusters runs along one
> side, fine white shredded coconut is scattered over the centre, chia and flax
> seeds are sprinkled lightly across the yoghurt, and a thin thread of honey is
> drizzled over the top.
>
> Do not include any other fruit — no kiwi, banana, berries, strawberries,
> pineapple or citrus other than bergamot.
>
> Output a square PNG with a fully transparent background: only the bowl and its
> soft contact shadow, no table, surface, props or text.

## If the generator will not honour transparency

Generate on a pure white seamless background instead, then remove the
background and export PNG-24 with alpha. Check the edges of the bowl rim: a
grey halo left by a careless cut-out is visible against the teal page.

## Note for later

If the display table's fruit changes, the list under the section — the chips
reading "Today's fruit selection" — is edited in the Studio on the **Fruit
Bowls** and **Smoothies** sections (the "Fruit list" field, comma-separated).
That is text, and takes a second. The photos are the slow part, which is an
argument for keeping them a touch generic.
