import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Select, Stack, Text } from "@sanity/ui";
import {
  useClient,
  type DocumentActionComponent,
  type DocumentActionProps,
} from "sanity";

import { ranksBetween } from "./orderRank";

const API_VERSION = "2024-10-01";

/** A section, or one of its groups — all the picker needs to draw a row. */
type Option = { _id: string; title: string };

const NO_GROUP = "";

/**
 * "Move to another section" — the placement fields, as a control people find.
 *
 * Both fields were always editable, but Sanity draws a reference that already
 * has a value as a preview row whose only affordance is an unlabelled menu
 * button that appears on hover. On a tablet there is no hover, so the owner
 * concluded — reasonably — that an item simply could not be moved.
 *
 * This does the whole move in one place: pick the section, pick the group, and
 * the three fields that have to change together all change together. Doing it
 * by hand meant remembering that the old group has to be cleared too, and that
 * the drag-and-drop position does not reset itself.
 */
export function moveSectionActions(
  actions: DocumentActionComponent[],
): DocumentActionComponent[] {
  const move: DocumentActionComponent = (props: DocumentActionProps) => {
    const { draft, published, id, onComplete } = props;
    const client = useClient({ apiVersion: API_VERSION });

    const doc = (draft ?? published) as {
      category?: { _ref?: string };
      subcategory?: { _ref?: string };
    } | null;

    const [open, setOpen] = useState(false);
    const [sections, setSections] = useState<Option[]>([]);
    const [groups, setGroups] = useState<Option[]>([]);
    const [sectionId, setSectionId] = useState("");
    const [groupId, setGroupId] = useState(NO_GROUP);
    const [saving, setSaving] = useState(false);

    const currentSection = doc?.category?._ref ?? "";
    const currentGroup = doc?.subcategory?._ref ?? NO_GROUP;

    // Sections, once the dialog opens. Ordered as the menu orders them, so the
    // list reads the same way the menu does.
    useEffect(() => {
      if (!open) return;

      let live = true;
      client
        .fetch<Option[]>(
          `*[_type == "category"] | order(coalesce(orderRank, "9") asc, order asc){_id, "title": titleEn}`,
        )
        .then((rows) => {
          if (!live) return;
          setSections(rows);
          setSectionId((s) => s || currentSection || rows[0]?._id || "");
        })
        .catch(() => setSections([]));

      return () => {
        live = false;
      };
    }, [open, client, currentSection]);

    // Groups follow the chosen section. Changing section clears the group
    // rather than carrying the old one across — that mismatch is the bug this
    // whole control exists to prevent.
    useEffect(() => {
      if (!open || !sectionId) return;

      let live = true;
      client
        .fetch<Option[]>(
          `*[_type == "subcategory" && category._ref == $id] | order(order asc){_id, "title": titleEn}`,
          { id: sectionId },
        )
        .then((rows) => {
          if (!live) return;
          setGroups(rows);
          setGroupId(
            sectionId === currentSection && rows.some((r) => r._id === currentGroup)
              ? currentGroup
              : NO_GROUP,
          );
        })
        .catch(() => setGroups([]));

      return () => {
        live = false;
      };
    }, [open, sectionId, client, currentSection, currentGroup]);

    const close = useCallback(() => {
      setOpen(false);
      setSaving(false);
      onComplete();
    }, [onComplete]);

    const unchanged =
      sectionId === currentSection && groupId === currentGroup;

    const save = useCallback(async () => {
      if (!sectionId) return;
      setSaving(true);

      // Land at the end of the destination list. The drag-and-drop rank is
      // per-section, so a rank carried over from the old one drops the item at
      // an arbitrary point in its new home.
      const last = await client.fetch<string | null>(
        `*[_type == "dish" && category._ref == $id && _id != $self && defined(orderRank)]
           | order(orderRank desc)[0].orderRank`,
        { id: sectionId, self: id },
      );

      // Applied to the published document and any draft dropped, matching the
      // sold-out action: the move is done when the dialog closes, with nothing
      // left waiting for someone to notice a Publish button.
      await client
        .patch(id)
        .set({
          category: { _type: "reference", _ref: sectionId },
          orderRank: ranksBetween(last ?? undefined, undefined, 1)[0],
          ...(groupId
            ? { subcategory: { _type: "reference", _ref: groupId } }
            : {}),
        })
        .unset(groupId ? [] : ["subcategory"])
        .commit();
      await client.delete(`drafts.${id}`).catch(() => {
        // No draft to clear — the common case.
      });

      close();
    }, [client, id, sectionId, groupId, close]);

    const sectionName = useMemo(
      () => sections.find((s) => s._id === sectionId)?.title ?? "",
      [sections, sectionId],
    );

    if (!doc) return null;

    return {
      label: "Move to another section",
      onHandle: () => setOpen(true),
      dialog: open && {
        type: "dialog" as const,
        header: "Move to another section",
        onClose: close,
        content: (
          <Stack space={4}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Section
              </Text>
              <Select
                value={sectionId}
                onChange={(e) => setSectionId(e.currentTarget.value)}
              >
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </Select>
            </Stack>

            <Stack space={3}>
              <Text size={1} weight="semibold">
                Group inside the section
              </Text>
              <Select
                value={groupId}
                onChange={(e) => setGroupId(e.currentTarget.value)}
              >
                <option value={NO_GROUP}>
                  No group — sits directly under the section title
                </option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.title}
                  </option>
                ))}
              </Select>
              <Text size={1} muted>
                {groups.length === 0
                  ? `${sectionName || "This section"} has no groups, so the item will sit directly under the section title.`
                  : "Only groups belonging to the section above are listed."}
              </Text>
            </Stack>

            <Box>
              <Text size={1} muted>
                The item moves to the end of its new section. Drag it into place
                from the section list afterwards.
              </Text>
            </Box>

            <Flex gap={2} justify="flex-end">
              <Button mode="bleed" text="Cancel" onClick={close} disabled={saving} />
              <Button
                tone="primary"
                text={saving ? "Moving…" : "Move item"}
                onClick={save}
                disabled={saving || unchanged || !sectionId}
              />
            </Flex>
          </Stack>
        ),
      },
    };
  };

  return [move, ...actions];
}
