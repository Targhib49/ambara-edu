import { DEFAULT_LANGUAGE, MESSAGES, type Language, type MessageKey } from "@/lib/i18n/messages";

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

/**
 * Looks a message up in the chosen language, filling `{placeholders}`. Falls
 * back to Indonesian, then to the key itself, so a missing translation shows
 * something readable instead of blanking the screen.
 */
export function makeT(language: Language): Translate {
  return (key, vars) => {
    const entry = MESSAGES[key];
    const text = entry ? entry[language] ?? entry[DEFAULT_LANGUAGE] : key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (whole, name: string) => String(vars[name] ?? whole));
  };
}
