export interface ParsedImageEntry {
  url: string;
  thumb?: string;
  [key: string]: unknown;
}

/**
 * Parses a Salesforce "Image_URL__c"-style field into a list of image entries.
 * Confirmed live shape (2026-08-11, via Product2.gtherp__Image_URL__c): a
 * JSON-serialized object `{"images":[{"isDisplay":true,"isCover":true,"sortOrder":1,
 * "thumb":"...","url":"...","id":"..."}]}` — each entry's extra metadata (thumb,
 * isCover, etc.) is preserved, not just its `url`. Also handles a bare JSON array
 * (of strings or objects) and a plain/delimited URL string, for robustness against
 * a differently-shaped value on a given object.
 */
export function parseImageEntries(raw: unknown): ParsedImageEntry[] {
  if (Array.isArray(raw)) {
    return raw
      .map((entry): ParsedImageEntry | null => {
        if (typeof entry === "string" && entry.trim()) return { url: entry.trim() };
        if (entry && typeof entry === "object" && typeof (entry as any).url === "string" && (entry as any).url.trim()) {
          return entry as ParsedImageEntry;
        }
        return null;
      })
      .filter((entry): entry is ParsedImageEntry => entry !== null);
  }
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.images) ? parsed.images : null;
      if (arr) {
        return arr
          .map((entry: any): ParsedImageEntry | null => {
            if (typeof entry === "string" && entry.trim()) return { url: entry.trim() };
            if (entry && typeof entry === "object" && typeof entry.url === "string" && entry.url.trim()) return entry;
            return null;
          })
          .filter((entry: ParsedImageEntry | null): entry is ParsedImageEntry => entry !== null);
      }
    } catch {
      // Not valid JSON — fall through to delimiter parsing below.
    }
  }

  return trimmed
    .split(/[,;]\s*/)
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
}

/** Convenience wrapper for callers that only need a flat list of URLs (e.g. ProductGallery). */
export function parsePhotoUrls(raw: unknown): string[] {
  return parseImageEntries(raw).map((entry) => entry.url);
}
