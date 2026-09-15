"use client";

import { useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { inputCls } from "@/components/ui/styles";

export type ComboOption = { value: string; label: string; hint?: string };

const MAX_SHOWN = 50;

/**
 * A select you can type into — for lists that grow past what a dropdown can
 * scroll through (every student, every chapter of every course). Works inside a
 * plain form through `name`, or controlled through `value` and `onChange`.
 */
export function Combobox({
  options,
  name,
  value,
  defaultValue,
  onChange,
  placeholder = "Search…",
  required,
  disabled,
  emptyText = "No matches",
  "aria-label": ariaLabel,
  id,
}: {
  options: ComboOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  emptyText?: string;
  "aria-label"?: string;
  id?: string;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState(defaultValue ?? "");
  const selected = value !== undefined ? value : internal;
  const selectedOption = options.find((o) => o.value === selected) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(needle))
      : options;
    return list.slice(0, MAX_SHOWN);
  }, [options, query]);

  const choose = (option: ComboOption | null) => {
    const next = option?.value ?? "";
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      // Picking an option must never submit the surrounding form.
      if (open) {
        e.preventDefault();
        if (matches[active]) choose(matches[active]);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.stopPropagation();
        setOpen(false);
        setQuery("");
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        autoComplete="off"
        disabled={disabled}
        value={open ? query : selectedOption?.label ?? ""}
        placeholder={selectedOption ? selectedOption.label : placeholder}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => {
          setOpen(false);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={`${inputCls} pr-14`}
      />
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1">
        {selectedOption && !disabled && (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              choose(null);
              inputRef.current?.focus();
            }}
            className="pointer-events-auto rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
        <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
      </div>

      {/* Carries the value into a plain form. Not display:none, so `required`
          still blocks submission with the browser's own message. */}
      {name && (
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          value={selected}
          required={required}
          onChange={() => {}}
          onFocus={() => inputRef.current?.focus()}
          className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0"
        />
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          // Keep focus in the input while clicking an option.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-500">{emptyText}</li>
          ) : (
            matches.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                  i === active ? "bg-blue-50 text-blue-900" : "text-zinc-800"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{o.label}</span>
                  {o.hint && <span className="block truncate text-xs text-zinc-500">{o.hint}</span>}
                </span>
                {o.value === selected && <CheckIcon className="h-4 w-4 shrink-0 text-blue-600" />}
              </li>
            ))
          )}
          {matches.length === MAX_SHOWN && (
            <li className="border-t border-zinc-100 px-3 py-1.5 text-xs text-zinc-400">Keep typing to narrow the list</li>
          )}
        </ul>
      )}
    </div>
  );
}
