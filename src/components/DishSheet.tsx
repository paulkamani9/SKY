"use client";

import { useEffect, useRef } from "react";

import { Wordmark } from "@/components/Wordmark";
import { isNumericPrice, pick, priceLabel, t } from "@/lib/i18n";
import type { Dish, Lang } from "@/sanity/queries";

type Props = {
  dish: Dish;
  lang: Lang;
  currency: string;
  onClose: () => void;
};

export function DishSheet({ dish, lang, currency, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const name = pick(lang, dish.nameEn, dish.nameFr);
  const description = pick(lang, dish.descriptionEn, dish.descriptionFr);
  const group = pick(lang, dish.groupEn, dish.groupFr);
  const price = priceLabel(dish, lang, currency);
  const numeric = isNumericPrice(dish);
  const soldOut = dish.available === false;

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Stop the menu behind the sheet scrolling under the finger.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm sm:items-center sm:p-6"
      style={{ background: "rgb(1 40 48 / 0.62)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--gold-line)",
        }}
      >
        <div className="relative">
          {dish.imageUrlLarge ? (
            <img
              src={dish.imageUrlLarge}
              alt={name}
              className="aspect-[4/3] w-full object-cover"
              style={{ background: "var(--surface-2)" }}
            />
          ) : (
            <div
              className="flex aspect-[16/7] w-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(160deg, var(--surface-2) 0%, var(--surface-3) 100%)",
              }}
            >
              <Wordmark className="text-3xl opacity-60" />
            </div>
          )}

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t(lang, "close")}
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none transition active:scale-95"
            style={{
              background: "rgb(1 40 48 / 0.7)",
              border: "1px solid var(--gold-line)",
              color: "var(--ink)",
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {group ? (
            <p
              className="text-[10px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "var(--sky-1)" }}
            >
              {group}
            </p>
          ) : null}

          <div className="flex items-baseline gap-4">
            <h2 className="min-w-0 flex-1 text-xl leading-tight font-semibold">
              {name}
            </h2>
            {price ? (
              <span
                className={`shrink-0 text-lg font-semibold ${numeric ? "tabular-nums" : "text-sm italic"}`}
                style={{
                  color: numeric ? "var(--gold-strong)" : "var(--muted)",
                }}
              >
                {price}
              </span>
            ) : null}
          </div>

          {description ? (
            <p
              className="text-[14.5px] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {description}
            </p>
          ) : null}

          {soldOut ? (
            <span
              className="mt-1 inline-block self-start rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase"
              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
            >
              {t(lang, "soldOut")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
