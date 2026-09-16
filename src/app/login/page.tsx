import { LoginScreen } from "./LoginScreen";
import { LanguageProvider } from "@/lib/i18n/client";
import { getLanguage } from "@/lib/i18n/server";

/**
 * The login screen sits outside both shells, so it provides the language
 * itself — from the `lang` cookie the switch writes, since nobody is signed in
 * yet to have a saved choice.
 */
export default async function LoginPage() {
  const language = await getLanguage();
  return (
    <LanguageProvider language={language}>
      <LoginScreen />
    </LanguageProvider>
  );
}
