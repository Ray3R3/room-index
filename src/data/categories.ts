import type { Category, LondonRoom } from "./londonRooms";

export const CATEGORIES: { key: Category; label: string; short: string }[] = [
  { key: "view", label: "View", short: "View" },
  { key: "value", label: "Value", short: "Value" },
  { key: "sleep", label: "Sleep", short: "Sleep" },
  { key: "space", label: "Space", short: "Space" },
  { key: "bathroom", label: "Bathroom", short: "Bathroom" },
  { key: "foodDrink", label: "Food & Drink", short: "Food" },
  { key: "location", label: "Location", short: "Location" },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export function categoryLabel(key: Category): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function compositeScore(room: LondonRoom): number {
  const s = room.scores;
  const sum =
    s.view + s.value + s.sleep + s.space + s.bathroom + s.foodDrink + s.location;
  return sum / 7;
}

export function sortRooms(
  rooms: LondonRoom[],
  category: Category | "all"
): LondonRoom[] {
  const copy = [...rooms];
  if (category === "all") {
    copy.sort((a, b) => compositeScore(b) - compositeScore(a));
  } else {
    copy.sort((a, b) => b.scores[category] - a.scores[category]);
  }
  return copy;
}

export function parseSearchToParams(raw: string): {
  category?: Category;
  q: string;
} {
  const q = raw.trim();
  const lower = q.toLowerCase();
  const rules: { test: RegExp; cat: Category }[] = [
    { test: /\bview\b/, cat: "view" },
    { test: /\b(bath|bathroom)\b/, cat: "bathroom" },
    { test: /\b(value|cheap|budget|under|money|affordable)\b/, cat: "value" },
    { test: /\b(sleep|quiet|bed)\b/, cat: "sleep" },
    { test: /\b(space|big|large|suite|spacious)\b/, cat: "space" },
    { test: /\b(food|breakfast|bar|restaurant|drink|dining)\b/, cat: "foodDrink" },
    {
      test: /\b(location|central|shoreditch|mayfair|soho|marylebone|chelsea|belgravia|notting|covent|holborn|bloomsbury|westminster|southbank|place)\b/,
      cat: "location",
    },
  ];
  for (const r of rules) if (r.test.test(lower)) return { category: r.cat, q };
  return { q };
}
