// Sanity-check parseImageEntries/parsePhotoUrls logic against the real raw shape
// observed live in Algolia/Salesforce, without needing ts-node — plain JS port.
function parseImageEntries(raw) {
  if (typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.images) ? parsed.images : null;
      if (arr) {
        return arr
          .map((entry) => {
            if (typeof entry === 'string' && entry.trim()) return { url: entry.trim() };
            if (entry && typeof entry === 'object' && typeof entry.url === 'string' && entry.url.trim()) return entry;
            return null;
          })
          .filter((e) => e !== null);
      }
    } catch {}
  }
  return trimmed.split(/[,;]\s*/).map((u) => u.trim()).filter(Boolean).map((url) => ({ url }));
}

const raw = JSON.stringify({
  images: [{
    isDisplay: true, isCover: true, sortOrder: 1,
    thumb: "https://res.cloudinary.com/dnsh0vsky/image/upload/v1786433908/.../tqihve9vt3gfctauelaa.png",
    url: "https://res.cloudinary.com/dnsh0vsky/image/upload/v1786433905/.../lcak0ulmjtimyycryg7v.png",
    id: "a14Ei00002dFhGgIAK"
  }]
});

console.log('Input (truncated):', raw.slice(0, 80) + '...');
console.log('Parsed entries:', JSON.stringify(parseImageEntries(raw), null, 2));
