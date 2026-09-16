"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CloseIcon, PlusIcon, UploadIcon } from "@/components/ui/icons";
import { btnPrimary, btnSecondary, btnSmall } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

const SlideOverContext = createContext<{ close: () => void } | null>(null);

/** Lets a form inside a panel close it once it has done its job. */
export function useSlideOver() {
  return useContext(SlideOverContext);
}

const WIDTH = { md: "max-w-lg", lg: "max-w-3xl" } as const;

/**
 * A panel that slides in from the right for creating or editing something
 * without leaving the list behind it. Escape or a click outside closes it.
 */
export function SlideOver({
  open,
  onClose,
  title,
  description,
  width = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  width?: keyof typeof WIDTH;
  children: ReactNode;
}) {
  const t = useT();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the panel itself rather than its first field, so opening a panel
    // on a phone doesn't throw the keyboard up over the content.
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex h-full w-full ${WIDTH[width]} flex-col bg-white shadow-2xl outline-none`}
      >
        <div className="flex items-start gap-3 border-b border-zinc-200 px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-zinc-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label={t("slideOver.close")}
            className="-mr-2 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <SlideOverContext.Provider value={{ close: onClose }}>{children}</SlideOverContext.Provider>
        </div>
      </div>
    </div>
  );
}

/**
 * A page action that opens a panel. The panel's content can be rendered on the
 * server and handed in as children.
 */
export function SlideOverButton({
  label,
  title,
  description,
  width,
  variant = "primary",
  icon = "plus",
  children,
}: {
  label: string;
  title: string;
  description?: string;
  width?: keyof typeof WIDTH;
  variant?: "primary" | "secondary" | "small";
  icon?: "plus" | "upload" | "none";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button onClick={() => setOpen(true)} className={variant === "primary" ? btnPrimary : variant === "small" ? btnSmall : btnSecondary}>
        {icon === "plus" && <PlusIcon className={variant === "small" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
        {icon === "upload" && <UploadIcon className="h-4 w-4" />}
        {label}
      </button>
      <SlideOver open={open} onClose={close} title={title} description={description} width={width}>
        {children}
      </SlideOver>
    </>
  );
}
