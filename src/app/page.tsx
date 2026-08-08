import type { Metadata } from "next";

import { MenuView } from "@/components/MenuView";
import { menuCategories, menuSettings } from "@/lib/menuContent";
import { getMenu, getSettings } from "@/sanity/queries";

// The menu is rebuilt at most once a minute; the revalidate webhook makes
// edits appear immediately.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSettings()) ?? menuSettings;
  return {
    title: `${settings.name} — ${settings.taglineEn ?? "Menu"}`,
    description: settings.taglineEn ?? "Our menu",
  };
}

export default async function Page() {
  const [categories, settings] = await Promise.all([getMenu(), getSettings()]);

  // Falls back to the menu bundled in the repo until Sanity has its first
  // published section, so guests never scan into a blank page.
  const isEmpty = categories.length === 0;

  return (
    <MenuView
      categories={isEmpty ? menuCategories : categories}
      settings={settings ?? menuSettings}
    />
  );
}
