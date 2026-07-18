"use client";

import { useEffect, useState } from "react";

export function useCountdown(startedAt: string | undefined, timeLimitMinutes: number | undefined) {
  const deadlineMs =
    startedAt && timeLimitMinutes ? new Date(startedAt).getTime() + timeLimitMinutes * 60_000 : null;
  const [remainingMs, setRemainingMs] = useState(() => (deadlineMs ? deadlineMs - Date.now() : null));

  useEffect(() => {
    if (!deadlineMs) return;
    const tick = () => setRemainingMs(Math.max(0, deadlineMs - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineMs]);

  return remainingMs; // null when untimed, else clamped to >= 0
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
