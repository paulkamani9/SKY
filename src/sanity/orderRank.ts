import { LexoRank } from "lexorank";

/**
 * Sequential sort keys for the drag-and-drop ordering plugin.
 *
 * The plugin stores position as a LexoRank string on each document and, when
 * something is dragged, writes a value between its two new neighbours — one
 * document changes, not the whole list. That only works if the strings we
 * generate are the same dialect the plugin's arithmetic reads, so this uses the
 * plugin's own LexoRank implementation rather than inventing a format.
 *
 * Used by the seeder and by scripts/order-ranks.ts, so a re-seed and a
 * migration cannot disagree about what position 1 looks like.
 */
export function orderRanks(count: number): string[] {
  const ranks: string[] = [];
  let rank = LexoRank.middle();

  for (let i = 0; i < count; i += 1) {
    ranks.push(rank.toString());
    rank = rank.genNext();
  }

  return ranks;
}
