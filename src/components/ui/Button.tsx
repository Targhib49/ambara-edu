import type { ButtonHTMLAttributes } from "react";
import { btnDanger, btnPrimary, btnSecondary, btnSmall } from "./styles";

export type ButtonVariant = "primary" | "secondary" | "danger" | "small";

const VARIANT: Record<ButtonVariant, string> = {
  primary: btnPrimary,
  secondary: btnSecondary,
  danger: btnDanger,
  small: btnSmall,
};

/** The class string for a button look, for links and other elements styled as buttons. */
export function buttonClass(variant: ButtonVariant = "primary", className = "") {
  return className ? `${VARIANT[variant]} ${className}` : VARIANT[variant];
}

/**
 * The app's button. Defaults to type="button" — a bare <button> inside a form
 * submits it, which is rarely what a secondary action wants; pass
 * type="submit" for the one that should.
 */
export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
