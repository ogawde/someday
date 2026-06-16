export const WINGS = [
  {
    slug: "products",
    label: "Products",
    description: "Apps, websites, tools, side businesses, prototypes",
  },
  {
    slug: "art",
    label: "Art",
    description: "Visual art, music, photography, design work",
  },
  {
    slug: "scripts",
    label: "Scripts",
    description: "Novels, screenplays, poems, stories, lyrics",
  },
  {
    slug: "everything-else",
    label: "Everything Else",
    description: "Campaigns, hobbies, plans — anything unfinished",
  },
] as const;

export type WingSlug = (typeof WINGS)[number]["slug"];

export const WING_DB_VALUES = [
  "products",
  "art",
  "scripts",
  "everything_else",
] as const;

export type WingDbValue = (typeof WING_DB_VALUES)[number];

export function wingSlugToDb(slug: string): WingDbValue | null {
  if (slug === "everything-else") return "everything_else";
  if (WING_DB_VALUES.includes(slug as WingDbValue)) return slug as WingDbValue;
  return null;
}

export function wingDbToSlug(value: string): WingSlug | null {
  if (value === "everything_else") return "everything-else";
  if (WINGS.some((w) => w.slug === value)) return value as WingSlug;
  return null;
}

export function getWingLabel(slugOrDb: string) {
  const slug = wingDbToSlug(slugOrDb) ?? (slugOrDb as WingSlug);
  return WINGS.find((w) => w.slug === slug)?.label ?? slugOrDb;
}
