"use client";
import classNames from "classnames";

export type ButtonVariants = "primary" | "gray" | "primary-outline";

interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "prefix" | "suffix"
  > {
  children: React.ReactNode;
  variant?: ButtonVariants;
  size?: "lg" | "md" | "sm";
  className?: string;
  block?: boolean;
  onClick?: () => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  className,
  prefix,
  suffix,
  ...rest
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary hover:bg-red-1 text-white disabled:bg-gray-2 disabled:text-gray-4 font-bold",
    gray: "bg-white text-gray-5 border border-gray-3 disabled:border-gray-2 disabled:bg-gray-2 disabled:text-gray-4 font-regular",
    "primary-outline":
      "border border-primary text-primary hover:border-red-1 hover:text-red-1 disabled:border-gray-2 disabled:bg-gray-2 disabled:text-gray-4 font-regular",
  };
  const sizes = {
    lg: "text-[32px] h-[104px] px-10 gap-4",
    md: "text-md h-[72px] px-6 gap-3",
    sm: "text-sm h-[40px] px-4 gap-2",
  };

  const classes = classNames(
    "flex items-center justify-center rounded-full transition ease-linear focus:outline-none disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className,
    { "w-full": block }
  );
  return (
    <button className={classes} {...rest}>
      {prefix && <span>{prefix}</span>}
      <span>{children}</span>
      {suffix && <span>{suffix}</span>}
    </button>
  );
}
