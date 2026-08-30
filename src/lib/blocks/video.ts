/**
 * YouTube / Vimeo link parsing for the VIDEO_EMBED block.
 *
 * Tutors paste whatever URL they have in hand (watch page, share link, shorts,
 * an already-embedded URL); this normalizes it to the provider's player URL.
 * Returns null for anything we can't embed, which is what the Zod refine and
 * the editor's inline validation both key off.
 */
export type VideoProvider = "youtube" | "vimeo";

export type ParsedVideo = {
  provider: VideoProvider;
  embedUrl: string;
  /** Canonical link to the video on the provider's own site. */
  watchUrl: string;
};

/** Seconds offset from a `t=`/`start=` param — accepts `90`, `1m30s`, `1h2m3s`. */
function startSeconds(url: URL): number | null {
  const raw = url.searchParams.get("t") ?? url.searchParams.get("start");
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m || !m[0]) return null;
  const secs = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return secs > 0 ? secs : null;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function parseVideoUrl(raw: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const segments = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    let id: string | undefined;
    if (host === "youtu.be") {
      id = segments[0];
    } else if (segments[0] === "watch") {
      id = url.searchParams.get("v") ?? undefined;
    } else if (["embed", "shorts", "live", "v"].includes(segments[0] ?? "")) {
      id = segments[1];
    }
    if (!id || !YOUTUBE_ID.test(id)) return null;

    const start = startSeconds(url);
    // nocookie host: no tracking cookies until the student actually hits play.
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    embed.searchParams.set("rel", "0");
    if (start) embed.searchParams.set("start", String(start));
    return {
      provider: "youtube",
      embedUrl: embed.toString(),
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    // player.vimeo.com/video/ID — otherwise the id is the last all-digit
    // segment (vimeo.com/ID, /channels/name/ID, /groups/name/videos/ID).
    const fromPlayer = segments[0] === "video" ? segments[1] : undefined;
    const id = fromPlayer ?? [...segments].reverse().find((s) => /^\d+$/.test(s));
    if (!id || !/^\d+$/.test(id)) return null;

    // Unlisted videos carry a private hash, either as ?h= or as the segment
    // right after the id — without it the embed 403s.
    const hashSegment = segments[segments.indexOf(id) + 1];
    const hash =
      url.searchParams.get("h") ??
      (hashSegment && /^[A-Za-z0-9]+$/.test(hashSegment) && !/^\d+$/.test(hashSegment)
        ? hashSegment
        : null);

    const embed = new URL(`https://player.vimeo.com/video/${id}`);
    if (hash) embed.searchParams.set("h", hash);
    return {
      provider: "vimeo",
      embedUrl: embed.toString(),
      watchUrl: hash ? `https://vimeo.com/${id}/${hash}` : `https://vimeo.com/${id}`,
    };
  }

  return null;
}

export const VIDEO_URL_HINT = "Paste a YouTube or Vimeo link (watch page, share link, or embed URL).";
