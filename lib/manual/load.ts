import { getManualDoc, type ManualDoc } from "./catalog";
import { MANUAL_MD } from "./content.generated";

export type LoadedManualPage = ManualDoc & {
  content: string;
};

export async function loadManualPage(
  slug: string
): Promise<LoadedManualPage | null> {
  const doc = getManualDoc(slug);
  if (!doc) return null;

  const raw = MANUAL_MD[slug];
  if (raw === undefined) {
    return {
      ...doc,
      content: `_Document not bundled for slug \`${slug}\` (file: \`${doc.file}\`). Run \`node scripts/generate-manual-content.mjs\`._\n`,
    };
  }

  // Drop leading H1 — page chrome already shows the title
  const content = raw.replace(/^#[^\n]*\n+/, "");
  return { ...doc, content };
}
