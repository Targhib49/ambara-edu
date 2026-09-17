import { setFeatureFlag } from "@/lib/actions/flags";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { FEATURE_FLAG_NAMES, type FeatureFlag, type FlagState } from "@/lib/flags";

const CHOICES = [
  { value: "on", labelKey: "flags.on" },
  { value: "off", labelKey: "flags.off" },
  { value: "default", labelKey: "flags.useDefault" },
] as const satisfies readonly { value: string; labelKey: MessageKey }[];

function sourceNoteKey(state: FlagState): MessageKey {
  if (state.source === "cookie") return "flags.sourceCookie";
  if (state.source === "env") return "flags.sourceEnvOn";
  return "flags.sourceEnvOff";
}

/**
 * Tutor-only preview switches. Setting a flag here writes a cookie for this
 * browser alone, so v2 work can be checked against real content while students
 * keep seeing the finished app.
 */
export async function FeatureFlagPanel({ states }: { states: Record<FeatureFlag, FlagState> }) {
  const t = await getT();
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="font-medium text-zinc-900">{t("flags.title")}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t("flags.intro")}</p>

      <ul className="mt-5 space-y-5">
        {FEATURE_FLAG_NAMES.map((flag) => {
          const state = states[flag];
          const current = state.source === "cookie" ? (state.enabled ? "on" : "off") : "default";
          return (
            <li key={flag} className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">{t(`flag.${flag}.label` as MessageKey)}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{t(`flag.${flag}.description` as MessageKey)}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {t(state.enabled ? "flags.currentlyOn" : "flags.currentlyOff", { source: t(sourceNoteKey(state)) })}
                </p>
              </div>
              <div className="flex shrink-0 overflow-hidden rounded-md border border-zinc-300">
                {CHOICES.map((choice) => (
                  <form key={choice.value} action={setFeatureFlag}>
                    <input type="hidden" name="flag" value={flag} />
                    <input type="hidden" name="value" value={choice.value} />
                    <button
                      type="submit"
                      aria-pressed={current === choice.value}
                      className={`border-l border-zinc-300 px-3 py-1.5 text-xs first:border-l-0 ${
                        current === choice.value
                          ? "bg-blue-600 font-medium text-white"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {t(choice.labelKey)}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
