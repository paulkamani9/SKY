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
  // Drives the header's fade from transparent-over-hero to its solid bar.
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
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
      // Ahead of the nav lock: the header's own state should keep tracking the
      // scroll even while a section jump is animating.
      setScrolled(window.scrollY > 8);
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

  /*
   * Publish the header's height as --header-h.
   *
   * The hero banner is pulled up behind the header by exactly this much and
   * pads its heading down by the same amount, so the picture starts at the very
   * top of the page while the title still clears the bar. It cannot be a
   * constant: the header grows and shrinks with the logo, the tagline, and
   * whether the section nav wraps — and it changes again when the guest zooms,
   * which this menu explicitly allows.
   */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [categories.length, lang]);

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

  // The opening section's photo runs the full height of the page behind the
  // header. Without a banner there is nothing to show through, so the header
  // keeps its solid bar from the start.
  const hasHero = Boolean(categories[0]?.bannerUrl);
  const overHero = hasHero && !scrolled;

  return (
    <>
      {/* Scenery, behind everything, at the foot of the page only. The head of
          the page has the first section's banner for its sky; haze on top of
          that was noise stacked on noise. */}
      <div className="sky-veil sky-veil-bottom" aria-hidden="true">
        <div className="sky-cloud sky-cloud-a" />
        <div className="sky-cloud sky-cloud-b" />
      </div>

      <header
        ref={headerRef}
        className="sticky top-0 z-30 border-b transition-colors duration-300"
        style={{
          borderColor: overHero ? "transparent" : "var(--gold-line)",
          background: overHero
            ? "transparent"
            : "color-mix(in srgb, var(--bg-top) 88%, transparent)",
          // Blur would soften the hero photo directly under the bar, which is
          // the one part of it a guest looks at first.
          backdropFilter: overHero ? "none" : "blur(12px)",
          WebkitBackdropFilter: overHero ? "none" : "blur(12px)",
          // Over a bright sky the wordmark and pills need their own weight.
          textShadow: overHero ? "0 1px 10px rgb(1 32 39 / 0.55)" : undefined,
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
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 uppercase transition"
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
                  <Flag
                    code={code}
                    // Inactive flags sit back so the chosen one reads first.
                    className={isActive ? "opacity-100" : "opacity-60"}
                  />
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
        {categories.length === 0 ? (
          <p
            className="mt-20 text-center text-sm"
            style={{ color: "var(--muted)" }}
          >
            {t(lang, "empty")}
          </p>
        ) : null}

        {categories.map((c, i) => (
          <SectionBlock
            key={c._id}
            category={c}
            hero={i === 0 && hasHero}
            isFirst={i === 0}
            lang={lang}
            currency={currency}
            onOpen={setOpenDish}
          />
        ))}

        <footer className="mt-14 pb-2 text-center">
          <div className="gold-rule mx-auto h-px w-24 opacity-50" />
          <p className="mt-5 text-[12px]" style={{ color: "var(--muted-dim)" }}>
            {t(lang, "builtBy")}{" "}
            <a
              href="https://paulkamani9.github.io/paulkamani/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-80"
              style={{ color: "var(--gold)" }}
            >
              Paul Kamani
            </a>
          </p>
        </footer>
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
 * Flags for the language toggle, drawn rather than set as emoji: the flag
 * emoji render as bare "GB"/"FR" letters on Windows and on some Androids,
 * which is exactly the audience least likely to forgive it.
 */
function Flag({ code, className }: { code: "en" | "fr"; className?: string }) {
  const shared = `h-3 w-[18px] shrink-0 rounded-[2px] ${className ?? ""}`;
  const ring = { boxShadow: "0 0 0 1px rgb(1 32 39 / 0.35)" };

  if (code === "fr") {
    return (
      <svg viewBox="0 0 60 30" className={shared} style={ring} aria-hidden="true">
        <rect width="20" height="30" fill="#002395" />
        <rect x="20" width="20" height="30" fill="#ffffff" />
        <rect x="40" width="20" height="30" fill="#ED2939" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 60 30" className={shared} style={ring} aria-hidden="true">
      <clipPath id="flag-uk-quarters">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#flag-uk-quarters)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

/**
 * Photo behind a section's heading. The heading sits over the lower third,
 * where a scrim fades the picture into the page background — so the gold script
 * keeps its contrast no matter how bright the sky in the photo is, and the
 * banner reads as part of the page rather than a pasted-in rectangle.
 *
 * The band is sized by the heading it contains, not by the photo's aspect, so
 * a 3:2 upload and a 16:9 one produce the same shape. A minimum height keeps
 * sections with a one-line intro from sitting visibly shallower than sections
 * with three — measured across the eleven sections the spread was 190px to
 * 232px on a phone, enough to read as inconsistent while scrolling.
 */
function SectionBanner({
  src,
  srcSet,
  alt,
  hero,
  children,
}: {
  src: string;
  srcSet?: string | null;
  alt: string;
  hero?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      // Every banner runs the full width of the window rather than sitting in
      // the menu column: at the desk-width the column is narrow enough that a
      // boxed photo read as a thumbnail. Full bleed leaves no corners to round.
      className="relative mx-[calc(50%-50vw)] overflow-hidden"
    >
      <img
        src={src}
        srcSet={srcSet ?? undefined}
        sizes="100vw"
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
      {/* Hero only: the header sits directly on the photo with no bar of its
          own, so the top of the picture carries the contrast for it. */}
      {hero ? (
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "calc(var(--header-h, 8.5rem) + 2rem)",
            background:
              "linear-gradient(to bottom, rgb(1 32 39 / 0.6) 0%, rgb(1 32 39 / 0.28) 55%, transparent 100%)",
          }}
        />
      ) : null}
      {/* The gold script can land on open sky or bright sea depending on the
          crop, where the scrim alone is not enough to hold it. */}
      <div
        className="relative flex flex-col justify-end pt-24 pb-4 sm:pt-32"
        style={{
          textShadow: "0 2px 12px rgb(1 32 39 / 0.75)",
          // Now that the band spans the window it has to grow taller with it
          // too, or a wide screen crops the photo to a letterbox strip.
          minHeight: "clamp(15rem, 20vw, 24rem)",
          // Hero: give back the height the negative margin took, so the heading
          // still clears the header and the band keeps its usual proportions.
          ...(hero
            ? {
                minHeight:
                  "calc(var(--header-h, 8.5rem) + clamp(15rem, 20vw, 24rem))",
                paddingTop: "calc(var(--header-h, 8.5rem) + 6rem)",
              }
            : null),
        }}
      >
        {/* Full bleed for the photo, but the heading still lines up with the
            menu column underneath it. */}
        <div className="mx-auto w-full max-w-5xl px-4">{children}</div>
      </div>
    </div>
  );
}

function SectionBlock({
  category,
  lang,
  currency,
  onOpen,
  isFirst,
  hero,
}: {
  category: Category;
  /** The opening section runs flush to the header, so its banner is the first
      thing a guest sees instead of a strip of empty page above it. */
  isFirst?: boolean;
  /** ...and when it has a photo, that photo runs up behind the header too. */
  hero?: boolean;
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
    <section
      id={`section-${category._id}`}
      className={`scroll-mt-36 ${isFirst ? "" : "pt-9"}`}
      // Pulled up by the header's exact height so the photo starts at the top
      // of the page rather than below the bar.
      style={hero ? { marginTop: "calc(var(--header-h, 8.5rem) * -1)" } : undefined}
    >
      {bannerUrl ? (
        <SectionBanner
          hero={hero}
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
