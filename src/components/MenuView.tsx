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

/** Items in section order, split into their sub-groups (if any). */
type Group = { key: string; title: string; dishes: Dish[] };

function groupDishes(category: Category, lang: Lang): Group[] {
  const groups: Group[] = [];

  for (const dish of category.dishes) {
    const title = pick(lang, dish.groupEn, dish.groupFr);
    const key = dish.groupEn || dish.groupFr || "";
    const last = groups[groups.length - 1];

    if (last && last.key === key) last.dishes.push(dish);
    else groups.push({ key, title, dishes: [dish] });
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
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center" });
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
                    color: isActive ? "#fdf6e3" : "var(--muted-dim)",
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
                      color: isActive ? "#fdf6e3" : "var(--muted)",
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
  const groups = useMemo(() => groupDishes(category, lang), [category, lang]);

  const intro = pick(lang, category.introEn, category.introFr);
  const footnote = pick(lang, category.footnoteEn, category.footnoteFr);
  const isGrid = category.layout !== "list";

  return (
    <section id={`section-${category._id}`} className="scroll-mt-36 pt-9">
      <h2
        className="text-[13px] font-semibold tracking-[0.22em] uppercase"
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

      {groups.map((group) => (
        <div key={group.key || "ungrouped"}>
          {group.title ? (
            <h3
              className="mt-5 mb-2 text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "var(--sky-1)" }}
            >
              {group.title}
            </h3>
          ) : null}

          {isGrid ? (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {group.dishes.map((dish) => (
                <DishCard
                  key={dish._id}
                  dish={dish}
                  lang={lang}
                  currency={currency}
                  onOpen={() => onOpen(dish)}
                />
              ))}
            </ul>
          ) : (
            <ul
              className="mt-2 overflow-hidden rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--gold-line-soft)",
              }}
            >
              {group.dishes.map((dish, i) => (
                <DishRow
                  key={dish._id}
                  dish={dish}
                  lang={lang}
                  currency={currency}
                  divided={i > 0}
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

function DishCard({
  dish,
  lang,
  currency,
  onOpen,
}: {
  dish: Dish;
  lang: Lang;
  currency: string;
  onOpen: () => void;
}) {
  const name = pick(lang, dish.nameEn, dish.nameFr);
  const description = pick(lang, dish.descriptionEn, dish.descriptionFr);
  const price = priceLabel(dish, lang, currency);
  const numeric = isNumericPrice(dish);
  const soldOut = dish.available === false;

  return (
    <li className="contents">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-full flex-col overflow-hidden rounded-xl text-left transition active:scale-[0.98]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--gold-line-soft)",
        }}
      >
        {dish.imageUrl ? (
          <div className="relative">
            <img
              src={dish.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              width={600}
              height={450}
              className="aspect-[4/3] w-full object-cover"
              style={{
                background: "var(--surface-2)",
                filter: soldOut ? "grayscale(1)" : undefined,
                opacity: soldOut ? 0.5 : 1,
              }}
            />
            {soldOut ? (
              <span
                className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase"
                style={{ background: "rgb(11 42 69 / 0.78)" }}
              >
                {t(lang, "soldOut")}
              </span>
            ) : null}
          </div>
        ) : (
          // Keeps photo-less cards from looking broken next to photo cards.
          <div
            className="flex aspect-[4/3] w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(160deg, var(--surface-2) 0%, var(--surface-3) 100%)",
            }}
          >
            <Wordmark className="text-lg opacity-55" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1 p-3">
          <h4
            className="text-[14px] leading-snug font-medium"
            style={{ opacity: soldOut ? 0.6 : 1 }}
          >
            {name}
          </h4>

          {description ? (
            <p
              className="line-clamp-2 text-[11.5px] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center gap-2 pt-2">
            {price ? (
              <span
                className={`text-[13px] font-semibold ${numeric ? "tabular-nums" : "italic"}`}
                style={{ color: numeric ? "var(--gold-strong)" : "var(--muted)" }}
              >
                {price}
              </span>
            ) : null}
            {soldOut && !dish.imageUrl ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                {t(lang, "soldOut")}
              </span>
            ) : null}
          </div>
        </div>
      </button>
    </li>
  );
}

function DishRow({
  dish,
  lang,
  currency,
  divided,
  onOpen,
}: {
  dish: Dish;
  lang: Lang;
  currency: string;
  divided: boolean;
  onOpen: () => void;
}) {
  const name = pick(lang, dish.nameEn, dish.nameFr);
  const description = pick(lang, dish.descriptionEn, dish.descriptionFr);
  const price = priceLabel(dish, lang, currency);
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
