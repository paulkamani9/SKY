"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DishSheet } from "@/components/DishSheet";
import { Wordmark } from "@/components/Wordmark";
import { isNumericPrice, pick, priceLabel, t } from "@/lib/i18n";
import type { Category, Dish, Lang, Settings } from "@/sanity/queries";

const LANG_KEY = "menu-lang";

type Props = {
  categories: Category[];
  settings: Settings | null;
};

/**
 * Items in section order, split into their sub-groups (if any).
 *
 * `sharedPrice` is set when every dish in the group carries the same price
 * label — the whole tropical sorbet range at Rs 125, both wellness shots at
 * Rs 150. That price is printed once on the group heading instead of being
 * repeated under every item.
 */
type Group = {
  key: string;
  title: string;
  dishes: Dish[];
  sharedPrice: string | null;
  sharedIsNumeric: boolean;
};

function groupDishes(category: Category, lang: Lang, currency: string): Group[] {
  const groups: Group[] = [];

  for (const dish of category.dishes) {
    const title = pick(lang, dish.groupEn, dish.groupFr);
    const key = dish.groupEn || dish.groupFr || "";
    const last = groups[groups.length - 1];

    if (last && last.key === key) last.dishes.push(dish);
    else
      groups.push({
        key,
        title,
        dishes: [dish],
        sharedPrice: null,
        sharedIsNumeric: false,
      });
  }

  for (const group of groups) {
    // With no heading there is nowhere to hoist the price to, and a group of
    // one has nothing to share it with.
    if (!group.title || group.dishes.length < 2) continue;

    const first = priceLabel(group.dishes[0], lang, currency);
    if (!first) continue;

    const uniform = group.dishes.every(
      (d) => priceLabel(d, lang, currency) === first,
    );
    if (!uniform) continue;

    group.sharedPrice = first;
    group.sharedIsNumeric = isNumericPrice(group.dishes[0]);
  }

  return groups;
}

export function MenuView({ categories, settings }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const [activeId, setActiveId] = useState<string>(categories[0]?._id ?? "");
  const [openDish, setOpenDish] = useState<Dish | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  // Set while a nav tap is scrolling, so the spy doesn't fight the jump.
  const lockedUntil = useRef(0);

  const currency = settings?.currency ?? "Rs";

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "fr") {
      setLang(stored);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = useCallback((next: Lang) => {
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
  }, []);

  // Scroll-spy: highlight the section the guest is currently reading.
  // Rect-based rather than IntersectionObserver — two tall sections can both
  // straddle an observer band, which makes the winner ambiguous, whereas
  // "last section whose heading has passed the line" always has one answer.
  useEffect(() => {
    if (categories.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      if (Date.now() < lockedUntil.current) return;

      const line = 150;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      // A short final section never reaches the line, so bottom-of-page
      // always selects the last section.
      if (atBottom) {
        setActiveId(categories[categories.length - 1]._id);
        return;
      }

      let current = categories[0]._id;
      for (const c of categories) {
        const el = document.getElementById(`section-${c._id}`);
        if (el && el.getBoundingClientRect().top <= line) current = c._id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [categories]);

  // Keep the active pill visible in the horizontal nav.
  //
  // This deliberately moves the strip's scrollLeft by hand rather than calling
  // scrollIntoView on the pill. The pill sits under the sticky header, inside
  // the `scroll-padding-top` reserved for anchor jumps, so the browser treats
  // it as obscured and scrolls the *document* vertically to uncover it — even
  // with block:"nearest". Since this effect fires on every section change, that
  // yanked the page a few dozen pixels at every section boundary and made
  // scrolling fight the guest.
  useEffect(() => {
    const nav = navRef.current;
    const pill = nav?.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`);
    if (!nav || !pill) return;

    const navRect = nav.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const delta =
      pillRect.left - navRect.left - (nav.clientWidth - pillRect.width) / 2;

    // Sub-pixel deltas would fire a scroll on every frame for no visible gain.
    if (Math.abs(delta) < 1) return;

    nav.scrollBy({ left: delta, behavior: "smooth" });
  }, [activeId]);

  const jumpTo = (id: string) => {
    setActiveId(id);
    lockedUntil.current = Date.now() + 800;
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tagline = pick(lang, settings?.taglineEn, settings?.taglineFr);
  const notice = pick(lang, settings?.noticeEn, settings?.noticeFr);

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--gold-line)",
          background: "color-mix(in srgb, var(--bg-top) 88%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-[max(0.7rem,env(safe-area-inset-top))] pb-2.5">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover"
              style={{ border: "1px solid var(--gold-line)" }}
            />
          ) : null}

          <div className="min-w-0 flex-1">
            {settings?.name === "SKY" || !settings?.name ? (
              <Wordmark className="text-2xl leading-none" />
            ) : (
              <h1 className="truncate text-xl leading-tight font-semibold">
                {settings.name}
              </h1>
            )}
            {tagline ? (
              <p
                className="mt-1 truncate text-[11px] tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                {tagline}
              </p>
            ) : null}
          </div>

          <div
            className="flex shrink-0 rounded-full p-0.5 text-[11px] font-semibold"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--gold-line)",
            }}
            role="group"
            aria-label="Language"
          >
            {(["en", "fr"] as const).map((code) => {
              const isActive = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => changeLang(code)}
                  aria-pressed={isActive}
                  className="rounded-full px-3 py-1.5 uppercase transition"
                  style={{
                    background: isActive
                      ? "linear-gradient(140deg, var(--blue) 0%, var(--green) 100%)"
                      : "transparent",
                    color: isActive ? "var(--ink)" : "var(--muted-dim)",
                    boxShadow: isActive
                      ? "inset 0 0 0 1px var(--gold-line)"
                      : "none",
                  }}
                >
                  {code}
                </button>
              );
            })}
          </div>
        </div>

        {categories.length > 1 ? (
          <nav aria-label={t(lang, "sections")}>
            <div
              ref={navRef}
              className="no-scrollbar mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-2.5"
            >
              {categories.map((c) => {
                const isActive = activeId === c._id;
                return (
                  <button
                    key={c._id}
                    type="button"
                    data-nav-id={c._id}
                    onClick={() => jumpTo(c._id)}
                    aria-current={isActive ? "true" : undefined}
                    className="shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition"
                    style={{
                      borderColor: isActive
                        ? "var(--gold)"
                        : "var(--gold-line-soft)",
                      background: isActive
                        ? "linear-gradient(140deg, var(--blue) 0%, var(--green) 100%)"
                        : "var(--surface)",
                      color: isActive ? "var(--ink)" : "var(--muted)",
                    }}
                  >
                    {pick(lang, c.titleEn, c.titleFr)}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
        {notice ? (
          <p
            className="mt-5 rounded-xl px-4 py-3 text-[13px] leading-relaxed"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--gold-line-soft)",
              color: "var(--muted)",
            }}
          >
            {notice}
          </p>
        ) : null}

        {categories.length === 0 ? (
          <p
            className="mt-20 text-center text-sm"
            style={{ color: "var(--muted)" }}
          >
            {t(lang, "empty")}
          </p>
        ) : null}

        {categories.map((c) => (
          <SectionBlock
            key={c._id}
            category={c}
            lang={lang}
            currency={currency}
            onOpen={setOpenDish}
          />
        ))}
      </main>

      {openDish ? (
        <DishSheet
          dish={openDish}
          lang={lang}
          currency={currency}
          onClose={() => setOpenDish(null)}
        />
      ) : null}
    </>
  );
}

/**
 * Photo behind a section's heading. The heading sits over the lower third,
 * where a scrim fades the picture into the page background — so the gold script
 * keeps its contrast no matter how bright the sky in the photo is, and the
 * banner reads as part of the page rather than a pasted-in rectangle.
 *
 * A fixed height rather than an aspect ratio: every section gets the same band
 * whatever shape its photo is, so scrolling the menu does not lurch.
 */
function SectionBanner({
  src,
  srcSet,
  alt,
  children,
}: {
  src: string;
  srcSet?: string | null;
  alt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-2xl">
      <img
        src={src}
        srcSet={srcSet ?? undefined}
        sizes="(min-width: 1024px) 1024px, 100vw"
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Opaque at the foot so the photo resolves into the page gradient, and
          only a light wash up top so the sea stays visible. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg) 6%, rgb(1 65 79 / 0.88) 34%, rgb(1 65 79 / 0.18) 100%)",
        }}
      />
      {/* The gold script can land on open sky or bright sea depending on the
          crop, where the scrim alone is not enough to hold it. */}
      <div
        className="relative px-4 pt-24 pb-4 sm:px-6 sm:pt-32"
        style={{ textShadow: "0 2px 12px rgb(1 32 39 / 0.75)" }}
      >
        {children}
      </div>
    </div>
  );
}

function SectionBlock({
  category,
  lang,
  currency,
  onOpen,
}: {
  category: Category;
  lang: Lang;
  currency: string;
  onOpen: (dish: Dish) => void;
}) {
  const groups = useMemo(
    () => groupDishes(category, lang, currency),
    [category, lang, currency],
  );

  const intro = pick(lang, category.introEn, category.introFr);
  const footnote = pick(lang, category.footnoteEn, category.footnoteFr);
  const isGrid = category.layout !== "list";
  const bannerUrl = category.bannerUrl;

  const heading = (
    <>
      <h2
        className="script-heading text-[30px] leading-tight font-semibold"
        style={{ color: "var(--gold)" }}
      >
        {pick(lang, category.titleEn, category.titleFr)}
      </h2>
      <div className="gold-rule mt-2 h-px w-full" />

      {intro ? (
        <p
          className="mt-2.5 text-[13px] leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          {intro}
        </p>
      ) : null}
    </>
  );

  return (
    <section id={`section-${category._id}`} className="scroll-mt-36 pt-9">
      {bannerUrl ? (
        <SectionBanner
          src={bannerUrl}
          srcSet={category.bannerSrcSet}
          // Decorative: the heading it sits behind already names the section.
          alt=""
        >
          {heading}
        </SectionBanner>
      ) : (
        heading
      )}

      {groups.map((group) => (
        <div key={group.key || "ungrouped"}>
          {group.title ? (
            <h3
              className="mt-5 mb-2 flex items-baseline gap-3 text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "var(--sky-1)" }}
            >
              <span className="min-w-0">{group.title}</span>
              {group.sharedPrice ? (
                <span
                  // normal-case so the currency stays "Rs", not "RS".
                  className={`ml-auto shrink-0 normal-case tracking-normal ${
                    group.sharedIsNumeric
                      ? "text-[12px] tabular-nums"
                      : "text-[11px] italic"
                  }`}
                  style={{ color: "var(--gold-strong)" }}
                >
                  {group.sharedPrice}
                </span>
              ) : null}
            </h3>
          ) : null}

          {isGrid ? (
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {group.dishes.map((dish) => (
                <DishCard
                  key={dish._id}
                  dish={dish}
                  lang={lang}
                  currency={currency}
                  hidePrice={group.sharedPrice !== null}
                />
              ))}
            </ul>
          ) : (
            <ul className="mt-2">
              {group.dishes.map((dish, i) => (
                <DishRow
                  key={dish._id}
                  dish={dish}
                  lang={lang}
                  currency={currency}
                  divided={i > 0}
                  hidePrice={group.sharedPrice !== null}
                  onOpen={() => onOpen(dish)}
                />
              ))}
            </ul>
          )}
        </div>
      ))}

      {footnote ? (
        <p
          className="mt-4 text-[12px] leading-relaxed italic"
          style={{ color: "var(--muted-dim)" }}
        >
          {footnote}
        </p>
      ) : null}
    </section>
  );
}

/**
 * A dish in a grid section: no card, no frame. The cut-out photo sits straight
 * on the navy ground with its price beneath it, and a tap flips the tile over
 * to reveal the name and description. Tapping again flips it back.
 */
function DishCard({
  dish,
  lang,
  currency,
  hidePrice,
}: {
  dish: Dish;
  lang: Lang;
  currency: string;
  hidePrice: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  // Measured on the server so the first paint is already the right size — see
  // lib/imageScale for why this is not done in the browser.
  const scale = dish.imageScale ?? 1;

  const name = pick(lang, dish.nameEn, dish.nameFr);
  const description = pick(lang, dish.descriptionEn, dish.descriptionFr);
  const price = hidePrice ? null : priceLabel(dish, lang, currency);
  const numeric = isNumericPrice(dish);
  const soldOut = dish.available === false;

  // Nothing to flip away from, so this one just reads as text. It keeps the
  // square footprint of its neighbours so the grid rows stay level.
  if (!dish.imageUrl) {
    return (
      <li>
        <div
          className="flex aspect-square w-full flex-col justify-center gap-1.5 px-1 text-center"
          style={{ opacity: soldOut ? 0.55 : 1 }}
        >
          <h4
            className="text-[14px] leading-snug font-medium"
            style={{ color: "var(--gold-strong)" }}
          >
            {name}
          </h4>
          {description ? (
            <p
              className="line-clamp-6 text-[11.5px] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {description}
            </p>
          ) : null}
          {soldOut ? (
            <p
              className="text-[10px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--muted-dim)" }}
            >
              {t(lang, "soldOut")}
            </p>
          ) : null}
        </div>

        {price ? (
          <p
            className={`mt-2.5 text-center text-[13px] font-semibold ${numeric ? "tabular-nums" : "italic"}`}
            style={{
              color: numeric ? "var(--gold-strong)" : "var(--muted)",
              opacity: soldOut ? 0.6 : 1,
            }}
          >
            {price}
          </p>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-expanded={flipped}
        // The visible face carries no name until it is flipped, so the button
        // has to name the dish itself for anyone not reading the picture.
        aria-label={name}
        className="block w-full text-left"
      >
        {/* Clips the transparent margin an upscaled cut-out pushes past the
            tile — without it the widest scale bled into the next column and
            gave the page 50px of horizontal scroll. On the wrapper rather than
            the rotating element, so preserve-3d is not flattened. */}
        <div className="relative aspect-square w-full overflow-hidden [perspective:900px]">
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
          >
            {/* Front — the picture, floating on the page background. */}
            <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
              <img
                src={dish.imageUrl}
                srcSet={dish.imageSrcSet ?? undefined}
                // The grid is 2 / 3 / 4 columns, so a tile is roughly 50 / 33 /
                // 25vw — but the cut-out is then magnified by `scale`, and CSS
                // scaling adds no pixels. Widening the hint by the same factor
                // is what makes an upscaled tile pick a source big enough to
                // stay sharp on a DPR-3 phone.
                sizes={`(min-width: 1024px) ${Math.ceil(25 * scale)}vw, (min-width: 640px) ${Math.ceil(33 * scale)}vw, ${Math.ceil(50 * scale)}vw`}
                alt=""
                loading="lazy"
                decoding="async"
                width={600}
                height={600}
                className="h-full w-full object-contain transition-transform duration-300"
                style={{
                  transform: scale === 1 ? undefined : `scale(${scale})`,
                  filter: soldOut
                    ? "grayscale(1)"
                    : "drop-shadow(0 14px 22px rgb(1 32 39 / 0.5))",
                  opacity: soldOut ? 0.45 : 1,
                }}
              />

              {soldOut ? (
                <span
                  className="absolute top-1 left-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                  style={{
                    background: "rgb(1 40 48 / 0.82)",
                    color: "var(--muted)",
                  }}
                >
                  {t(lang, "soldOut")}
                </span>
              ) : null}
            </div>

            {/* Back — the words the picture was standing in for. */}
            <div
              className="absolute inset-0 flex flex-col justify-center gap-1.5 px-1 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
              aria-hidden={!flipped}
            >
              <h4
                className="text-[14px] leading-snug font-medium"
                style={{ color: "var(--gold-strong)" }}
              >
                {name}
              </h4>
              {description ? (
                <p
                  className="line-clamp-6 text-[11.5px] leading-relaxed"
                  style={{ color: "var(--muted)" }}
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {price ? (
          <p
            className={`mt-2.5 text-center text-[13px] font-semibold ${numeric ? "tabular-nums" : "italic"}`}
            style={{
              color: numeric ? "var(--gold-strong)" : "var(--muted)",
              opacity: soldOut ? 0.6 : 1,
            }}
          >
            {price}
          </p>
        ) : null}
      </button>
    </li>
  );
}

function DishRow({
  dish,
  lang,
  currency,
  divided,
  hidePrice,
  onOpen,
}: {
  dish: Dish;
  lang: Lang;
  currency: string;
  divided: boolean;
  hidePrice: boolean;
  onOpen: () => void;
}) {
  const name = pick(lang, dish.nameEn, dish.nameFr);
  const description = pick(lang, dish.descriptionEn, dish.descriptionFr);
  const price = hidePrice ? null : priceLabel(dish, lang, currency);
  const numeric = isNumericPrice(dish);
  const soldOut = dish.available === false;

  return (
    <li
      style={
        divided ? { borderTop: "1px solid var(--gold-line-soft)" } : undefined
      }
      
    >
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-baseline gap-3 px-4 py-3 text-left transition active:opacity-60 ${
          soldOut ? "opacity-55" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h4 className="text-[14.5px] leading-snug font-medium">{name}</h4>
            {soldOut ? (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                {t(lang, "soldOut")}
              </span>
            ) : null}
          </div>
          {description ? (
            <p
              className="mt-0.5 text-[12px] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {price ? (
          <span
            className={`shrink-0 text-[14px] font-semibold ${numeric ? "tabular-nums" : "italic"}`}
            style={{ color: numeric ? "var(--gold-strong)" : "var(--muted)" }}
          >
            {price}
          </span>
        ) : null}
      </button>
    </li>
  );
}
