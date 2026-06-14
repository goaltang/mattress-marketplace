import { ALL_CITIES, City } from "@/config/cities";

/**
 * 把任意中文城市名（可能带「市」或区县后缀）解析成项目内的 slug。
 * 优先级：精准名 > 名包含关系（如 "杭州市" → "杭州"）。
 * 命中 cities 列表即返回 slug，解析失败返回 null。
 */
export function resolveCitySlug(
  rawCity: unknown,
  cities: City[] = ALL_CITIES
): string | null {
  if (typeof rawCity !== "string" || !rawCity) return null;
  const cleaned = rawCity.replace(/市$/, "").trim();

  // 1. 精准匹配（去除「市」后等于配置中的汉字名）
  const exact = cities.find((c) => c.name === cleaned);
  if (exact) return exact.slug;

  // 2. 包含匹配（地理服务可能返回 "杭州市萧山区" 这种带区县的字符串）
  const contains = cities.find(
    (c) => cleaned.includes(c.name) || c.name.includes(cleaned)
  );
  if (contains) return contains.slug;

  // 3. 拼音 / slug 匹配
  const lower = cleaned.toLowerCase();
  const bySlugOrPinyin = cities.find(
    (c) => c.slug === lower || c.pinyin === lower || lower.startsWith(c.pinyin)
  );
  if (bySlugOrPinyin) return bySlugOrPinyin.slug;

  return null;
}

/**
 * 把地理服务返回的原始城市名标准化为项目内的汉字城市名。
 * 无法识别时返回去除「市」后的原始字符串。
 */
export function normalizeCityName(
  raw: unknown,
  cities: City[] = ALL_CITIES
): string {
  if (typeof raw !== "string" || !raw) return "";
  const slug = resolveCitySlug(raw, cities);
  if (slug) {
    const city = cities.find((c) => c.slug === slug);
    return city?.name || raw.replace(/市$/, "").trim();
  }
  return raw.replace(/市$/, "").trim();
}
