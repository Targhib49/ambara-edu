"use client";

import { useActionState, useState } from "react";
import { removeCourseCover, setCourseCover, type CoverState } from "@/lib/actions/courses";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useT } from "@/lib/i18n/client";

const MAX_BYTES = 3 * 1024 * 1024;

export function coverSrc(courseId: string, coverImagePath: string) {
  return `/api/courses/${courseId}/cover?v=${encodeURIComponent(coverImagePath)}`;
}

export function CourseCoverForm({ courseId, coverImagePath }: { courseId: string; coverImagePath: string | null }) {
  const t = useT();
  const [state, formAction] = useActionState<CoverState, FormData>(setCourseCover.bind(null, courseId), {});
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const current = preview ?? (coverImagePath ? coverSrc(courseId, coverImagePath) : null);

  return (
    <section className="max-w-xl rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-medium text-zinc-900">{t("courseEditor.coverImage")}</h2>
      <p className="mt-0.5 text-xs text-zinc-500">{t("cover.hint")}</p>

      <div className="mt-3 aspect-[16/9] w-full overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50">
        {current ? (
          // A signed, short-lived storage URL behind a redirect (or a local blob
          // preview) — not a static asset next/image can optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={t("cover.alt")} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-zinc-400">{t("cover.none")}</div>
        )}
      </div>

      <form
        action={formAction}
        onSubmit={(e) => {
          const file = (e.currentTarget.elements.namedItem("cover") as HTMLInputElement | null)?.files?.[0];
          if (file && file.size > MAX_BYTES) {
            e.preventDefault();
            setClientError(t("cover.tooBig"));
          }
        }}
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <input
          type="file"
          name="cover"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            setClientError(null);
            if (preview) URL.revokeObjectURL(preview);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="min-w-0 flex-1 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:text-zinc-700 hover:file:bg-zinc-200"
        />
        <SubmitButton
          pendingLabel={t("action.uploading")}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {t("cover.upload")}
        </SubmitButton>
      </form>

      {coverImagePath && !preview && (
        <form action={removeCourseCover.bind(null, courseId)} className="mt-2">
          <SubmitButton pendingLabel={t("cover.removing")} className="text-xs text-red-600 hover:underline disabled:opacity-50">
            {t("cover.remove")}
          </SubmitButton>
        </form>
      )}

      {(clientError || state.error) && <p className="mt-2 text-sm text-red-600">{clientError ?? state.error}</p>}
      {!clientError && state.success && <p className="mt-2 text-sm text-green-700">{state.success}</p>}
    </section>
  );
}
