export const COUNTRIES = [
  "Bangladesh", "USA", "Germany", "France", "Spain",
  "Brazil", "Italy", "Netherlands", "Poland", "India",
  "Canada", "Mexico", "Japan", "South Korea", "Australia",
  "Russia", "Turkey", "Saudi Arabia", "South Africa", "Nigeria",
  "Egypt", "Argentina", "Colombia", "Vietnam", "Thailand"
] as const;

export const LOCALES = [
  "bn_BD", "en_US", "de_DE", "fr_FR", "es_ES",
  "pt_BR", "it_IT", "nl_NL", "pl_PL", "hi_IN",
  "ja_JP", "zh_CN", "ru_RU", "ar_SA", "tr_TR", "ko_KR"
] as const;

// -------------------------------------------------------------------
// Helper: get display name for locale
// -------------------------------------------------------------------
export const LOCAL_NAMES: Record<string, string> = {
  bn_BD: 'Bengali (Bangladesh)',
  en_US: 'English (US)',
  de_DE: 'German',
  fr_FR: 'French',
  es_ES: 'Spanish',
  pt_BR: 'Portuguese (Brazil)',
  it_IT: 'Italian',
  nl_NL: 'Dutch',
  pl_PL: 'Polish',
  hi_IN: 'Hindi',
  ja_JP: 'Japanese',
  zh_CN: 'Chinese',
  ru_RU: 'Russian',
  ar_SA: 'Arabic',
  tr_TR: 'Turkish',
  ko_KR: 'Korean',
};