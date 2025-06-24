import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

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
    const isColored = variant !== "default";

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "transition-all duration-300 ease-in-out rounded-[20px]",
          // Default variant styling
          !isColored && "bg-[#f9f4da] border border-[#231f20]",
          // Colored variants: cartoony style with gap
          isColored && "p-2 border-4 border-[#231f20]",
          cardVariants[variant],
          className
        )}
        style={{
          boxShadow: "8px 8px 0px #7b5ea7",
          ...props.style
        }}
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
          isColored ? "p-6 rounded-[18px] bg-[#f9f4da]" : "p-6",
          className
        )}
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
    className={cn("text-xl font-bold leading-none tracking-tight text-[#231f20]", className)}
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
    className={cn("text-sm text-[#262522]", className)}
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
          isColored ? "p-6 pt-0 rounded-[18px] bg-[#f9f4da]" : "p-6 pt-0",
          className
        )}
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
          isColored ? "p-6 pt-0 rounded-[18px] bg-[#f9f4da]" : "p-6 pt-0",
          className
        )}
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
