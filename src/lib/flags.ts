import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

/**
 * Feature flags for v2 work in progress.
 *
 * Production shares this app with a real student, so unfinished features ship
 * to main dark and get switched on when they're actually done. A flag is
 * resolved from, in order:
 *
 *   1. a per-browser cookie override, set from the tutor profile page
 *   2. the FEATURE_<NAME> environment variable ("on" enables it everywhere)
 *   3. off
 *
 * Only a tutor can *set* the cookie, but it is honoured for whoever is signed
 * in afterwards in that browser. That asymmetry is deliberate: tutors can't
 * open student routes at all (requireStudent redirects them), so a tutor-only
 * override could never preview a student-facing feature — which is most of v2.
 * Setting it and then signing in as a test student is the whole point.
 *
 * These flags gate how finished a feature looks, never who may see data:
 * every page keeps its own authorization checks. The worst a hand-crafted
 * cookie buys someone is a half-built screen.
 *
 * Each flag is deleted from this file (and its call sites) once its phase
 * lands — they are scaffolding, not permanent configuration.
 */
export const FEATURE_FLAGS = {
  course_v2: {
    label: "New course experience",
    description:
      "Lesson completion tracking, progress on the course page, and resume-where-you-left-off.",
  },
  scheduling_v2: {
    label: "New scheduling",
    description:
      "Publish weekly availability, let students book open slots themselves, set up repeating sessions, and subscribe to a calendar feed.",
  },
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAG_NAMES = Object.keys(FEATURE_FLAGS) as FeatureFlag[];

export function isFeatureFlag(value: string): value is FeatureFlag {
  return (FEATURE_FLAG_NAMES as string[]).includes(value);
}

export function flagCookieName(flag: FeatureFlag) {
  return `ff_${flag}`;
}

/** Environment default: FEATURE_COURSE_V2=on turns course_v2 on for everyone. */
function envDefault(flag: FeatureFlag): boolean {
  const raw = process.env[`FEATURE_${flag.toUpperCase()}`]?.trim().toLowerCase();
  return raw === "on" || raw === "true" || raw === "1";
}

export type FlagState = { enabled: boolean; source: "cookie" | "env" | "default" };

/** Every flag with the value and the reason for it — the profile page shows both. */
export const getFlagStates = cache(async (): Promise<Record<FeatureFlag, FlagState>> => {
  const jar = await cookies();

  const states = {} as Record<FeatureFlag, FlagState>;
  for (const flag of FEATURE_FLAG_NAMES) {
    const override = jar.get(flagCookieName(flag))?.value;
    if (override === "on" || override === "off") {
      states[flag] = { enabled: override === "on", source: "cookie" };
    } else {
      const fromEnv = envDefault(flag);
      states[flag] = { enabled: fromEnv, source: fromEnv ? "env" : "default" };
    }
  }
  return states;
});

export async function isEnabled(flag: FeatureFlag): Promise<boolean> {
  return (await getFlagStates())[flag].enabled;
}
