"use client";

import { memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

const BUTTON_BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = cva(BUTTON_BASE_CLASSES, {
  variants: {
    variant: {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type ButtonProps = {
  loading?: boolean;
  disabled?: boolean;
  submit?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof buttonVariants>;

const Button = memo(function Button({
  loading = false,
  disabled = false,
  submit = false,
  onClick,
  className,
  variant,
  size,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={submit ? "submit" : "button"}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={twMerge(buttonVariants({ variant, size }), className)}
    >
      {loading && (
        <Loader2
          className="animate-spin"
          size={16}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});

export { Button, buttonVariants };
