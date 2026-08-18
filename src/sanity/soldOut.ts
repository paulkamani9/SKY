import {
  useClient,
  type DocumentActionComponent,
  type DocumentActionProps,
} from "sanity";

/**
 * "Ran out" / "Back on the menu" — one click, from the item itself.
 *
 * Marking something sold out is the one thing that happens mid-service, on a
 * phone, with a queue at the counter. By hand it is four steps: open the item,
 * find the switch, flip it, publish. This is one, and it publishes, so the
 * change reaches the tables within the minute.
 */
export function soldOutActions(
  actions: DocumentActionComponent[],
): DocumentActionComponent[] {
  const soldOut: DocumentActionComponent = (props: DocumentActionProps) => {
    const { draft, published, id, onComplete } = props;
    const client = useClient({ apiVersion: "2024-10-01" });

    const doc = (draft ?? published) as { available?: boolean } | null;
    if (!doc) return null;

    // Anything not explicitly switched off is on: items predate the field.
    const isAvailable = doc.available !== false;

    return {
      label: isAvailable ? "Ran out — take off the menu" : "Back on the menu",
      tone: isAvailable ? "critical" : "positive",
      onHandle: async () => {
        // Patch the published document and drop any draft, so one tap leaves
        // nothing half-applied waiting for someone to press Publish.
        await client.patch(id).set({ available: !isAvailable }).commit();
        await client.delete(`drafts.${id}`).catch(() => {
          // No draft to clear — the common case.
        });
        onComplete();
      },
    };
  };

  // First in the list: on an item, this is the action most likely to be wanted.
  return [soldOut, ...actions];
}
