import { promises as fs } from "fs";
import path from "path";
import { getManualDoc, type ManualDoc } from "./catalog";

export type LoadedManualPage = ManualDoc & {
  content: string;
};

export async function loadManualPage(
  slug: string
): Promise<LoadedManualPage | null> {
  const doc = getManualDoc(slug);
  if (!doc) return null;

  const full = path.join(process.cwd(), doc.file);
  try {
    let content = await fs.readFile(full, "utf8");
    // Drop leading H1 — page chrome already shows the title
    content = content.replace(/^#[^\n]*\n+/, "");
    return { ...doc, content };
  } catch {
    return {
      ...doc,
      content: `_Document file missing: \`${doc.file}\`._\n`,
    };
  }
}
