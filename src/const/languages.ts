// const/languages.ts
export const LANGUAGES = {
    English: "eng",
    Bengali: "ben",
    Arabic: "ara",
    Hindi: "hin",
    Spanish: "spa",
  } as const;
  
  export type LanguageCode = typeof LANGUAGES[keyof typeof LANGUAGES];
  
  export function buildLangString(codes: LanguageCode[]): string {
    return codes.join("+");
  }