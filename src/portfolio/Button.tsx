import { Children, cloneElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";

type PortfolioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: "default" | "sm" | "icon";
  variant?: "default" | "outline" | "ghost";
  children: ReactNode;
};

export function Button({ asChild, size = "default", variant = "default", className = "", children, ...props }: PortfolioButtonProps) {
  const classes = ["portfolio-button", `portfolio-button-${variant}`, `portfolio-button-${size}`, className].filter(Boolean).join(" ");
  if (asChild) {
    const child = Children.only(children) as ReactElement<{ className?: string }>;
    return cloneElement(child, { className: [classes, child.props.className].filter(Boolean).join(" ") });
  }
  return <button className={classes} {...props}>{children}</button>;
}