// Name shown on a product card and product page title. Motors carry their KV next to the name ("AM-2207 / KV2700",
// director 2026-10-26) — taken from the product's "KV Value" spec row, so the number lives in one place.
export function displayName(category: string, data: { name: string; specs?: { key: string; value: string }[] }): string {
  if (category === 'motor') {
    const kv = data.specs?.find((s) => s.key === 'KV Value')?.value;
    if (kv) return `${data.name} / ${kv}`;
  }
  return data.name;
}
