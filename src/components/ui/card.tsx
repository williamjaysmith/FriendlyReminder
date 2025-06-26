import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/theme/theme-provider";

type CardVariant =
  | "default"
  | "purple"
  | "blue"
  | "green"
  | "yellow"
  | "pink"
  | "orange";

const cardVariants: Record<CardVariant, string> = {
  default: "",
  purple: "bg-[#7b5ea7]",
  blue: "bg-[#12b5e5]",
  green: "bg-[#0ba95b]",
  yellow: "bg-[#fcba28]",
  pink: "bg-[#f38ba3]",
  orange: "bg-[#fc7428]",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { actualTheme } = useTheme();
    const isColored = variant !== "default";

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "transition-all duration-300 ease-in-out rounded-[var(--outer-radius)]",
          // Default variant: no special classes needed (shadow handled in style)
          !isColored && [],
          // Colored variants: cartoony style with gap
          isColored && "p-[var(--card-gap)] border-4 border-[#231f20]",
          cardVariants[variant],
          className
        )}
        style={
          !isColored
            ? {
                backgroundColor: "var(--bg-card)",
                border: actualTheme === 'light' ? '1px solid #231f20' : 'none',
                boxShadow: actualTheme === 'light' 
                  ? '0 15px 35px rgba(123, 94, 167, 0.3), 0 8px 15px rgba(123, 94, 167, 0.2)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.04), 0 4px 10px rgba(0, 0, 0, 0.03)'
              }
            : undefined
        }
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const isColored = variant !== "default";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5",
          isColored ? "p-6 rounded-[var(--inner-radius)]" : "p-6",
          className
        )}
        style={
          isColored
            ? {
                backgroundColor: "var(--bg-card)",
              }
            : undefined
        }
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-bold leading-none tracking-tight", className)}
    style={{ color: "var(--text-primary)" }}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm", className)}
    style={{ color: "var(--text-secondary)" }}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const isColored = variant !== "default";

    return (
      <div
        ref={ref}
        className={cn(
          isColored ? "p-6 pt-0 rounded-[var(--inner-radius)]" : "p-6 pt-0",
          className
        )}
        style={
          isColored
            ? {
                backgroundColor: "var(--bg-card)",
              }
            : undefined
        }
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const isColored = variant !== "default";

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          isColored ? "p-6 pt-0 rounded-[var(--inner-radius)]" : "p-6 pt-0",
          className
        )}
        style={
          isColored
            ? {
                backgroundColor: "var(--bg-card)",
              }
            : undefined
        }
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
