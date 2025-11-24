import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-(--color-positive) text-(--color-text) hover:bg-(--color-text) hover:text-(--color-positive)",
      secondary:
        "bg-(--color-surface) text-(--color-text) hover:bg-(--color-panel)",
      danger:
        "bg-(--color-danger) text-(--color-text) hover:bg-(--color-text) hover:text-(--color-danger)",
      ghost:
        "bg-transparent hover:bg-(--color-surface-muted) border-transparent hover:border-(--color-border)",
      outline:
        "bg-transparent border-(--color-border) hover:bg-(--color-surface-muted)",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "font-bold border-2 border-(--color-border) transition-none cursor-pointer flex items-center justify-center gap-2",
          "shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[3px_3px_0px_0px_var(--shadow-strong)]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
