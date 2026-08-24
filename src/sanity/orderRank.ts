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

/**
 * Sort keys for `count` documents slotted between two that are already ranked.
 *
 * What the plugin does when something is dragged, done from a script: an item
 * added to the middle of the menu gets a key its two neighbours bracket, and
 * nothing else in the list has to be rewritten. Either end may be missing —
 * appending after the last item, or inserting before the first.
 *
 * Used by scripts/new-items.ts.
 */
export function ranksBetween(
  before: string | undefined,
  after: string | undefined,
  count: number,
): string[] {
  const ranks: string[] = [];
  let low = before ? LexoRank.parse(before) : undefined;
  const high = after ? LexoRank.parse(after) : undefined;

  for (let i = 0; i < count; i += 1) {
    let next: LexoRank;

    if (low && high) {
      // between() throws if the two keys are in different buckets — which our
      // own ranks never are, but a key written by the plugin's "Reset Order"
      // could be. Stepping off the lower neighbour still lands in the right
      // place, so take that rather than failing the whole run.
      try {
        next = low.between(high);
      } catch {
        next = low.genNext();
      }
    } else if (low) {
      next = low.genNext();
    } else if (high) {
      next = high.genPrev();
    } else {
      next = LexoRank.middle();
    }

    ranks.push(next.toString());
    low = next;
  }

  return ranks;
}
