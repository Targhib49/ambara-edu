import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { hintCls, inputCls, labelCls } from "./styles";

/** Label, control, then a hint or an error under it. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger-ink">{error}</p> : hint ? <p className={hintCls}>{hint}</p> : null}
    </div>
  );
}

const withClass = (className?: string) => (className ? `${inputCls} ${className}` : inputCls);

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={withClass(className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={withClass(className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={withClass(className)} {...props} />;
}
